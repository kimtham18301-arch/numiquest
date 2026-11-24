'use strict';
// End-to-end test of cloud-classes.js against an in-memory fake of the Supabase REST API.
// Each "device" is its own vm context (own localStorage + session) sharing one fake backend.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SRC = fs.readFileSync(path.resolve(__dirname, '..', 'cloud-classes.js'), 'utf8');

function makeBackend() {
  const db = { numi_classrooms: [], numi_enrollments: [], numi_profiles: [], numi_student_stats: [], numi_assignments: [], numi_submissions: [] };
  const calls = [];
  let seq = 0;
  const keyOf = { numi_classrooms: ['teacher_id', 'local_id'], numi_profiles: ['user_id'], numi_student_stats: ['user_id'],
    numi_assignments: ['classroom_id', 'local_id'], numi_submissions: ['assignment_id', 'student_id'] };
  function matches(row, params) {
    for (const [k, v] of params) {
      if (k === 'select' || k === 'on_conflict') continue;
      if (v.startsWith('eq.') && String(row[k]) !== v.slice(3)) return false;
      if (v.startsWith('in.(') && !v.slice(4, -1).split(',').includes(String(row[k]))) return false;
    }
    return true;
  }
  // `uid` is the signed-in user, used to emulate the few RLS rules the client relies on.
  function request(uid, pathStr, method, body) {
    calls.push({ path: pathStr, method, body });
    const [route, query = ''] = pathStr.replace('/rest/v1/', '').split('?');
    const params = [...new URLSearchParams(query)];
    if (route === 'rpc/numi_lookup_class' || route === 'rpc/numi_join_class') {
      const c = db.numi_classrooms.find(x => x.join_code.toUpperCase() === String(body.p_code).toUpperCase());
      if (!c) { if (route.endsWith('lookup_class')) return null; throw Object.assign(Error('not found'), { status: 400 }); }
      if (route.endsWith('join_class') && !db.numi_enrollments.some(e => e.classroom_id === c.id && e.student_id === uid)) {
        db.numi_enrollments.push({ classroom_id: c.id, student_id: uid });
      }
      return { id: c.id, name: c.name, grade: c.grade, level: c.level, teacher_name: c.teacher_name, teacher_username: c.teacher_username, code: c.join_code };
    }
    const table = db[route];
    if (!table) throw Object.assign(Error('no table ' + route), { status: 404 });
    if (method === 'GET') {
      let rows = table.filter(r => matches(r, params));
      // RLS-ish visibility
      if (route === 'numi_classrooms') {
        rows = rows.filter(c => c.teacher_id === uid || db.numi_enrollments.some(e => e.classroom_id === c.id && e.student_id === uid));
      }
      if (route === 'numi_assignments') {
        rows = rows.filter(a => db.numi_enrollments.some(e => e.classroom_id === a.classroom_id && e.student_id === uid)
          || db.numi_classrooms.some(c => c.id === a.classroom_id && c.teacher_id === uid));
      }
      return rows.map(r => ({ ...r }));
    }
    if (method === 'DELETE') {
      db[route] = table.filter(r => !matches(r, params));
      return null;
    }
    if (method === 'POST') {
      const out = [];
      for (const row of [].concat(body)) {
        const keys = keyOf[route];
        let ex = keys && table.find(r => keys.every(k => r[k] === row[k]));
        if (ex) Object.assign(ex, row);
        else { ex = { id: route === 'numi_enrollments' ? undefined : 'id' + (++seq), created_at: new Date().toISOString(), ...row }; table.push(ex); }
        out.push({ ...ex });
      }
      return out;
    }
    throw Error('unsupported ' + method);
  }
  return { db, calls, request };
}

function makeDevice(backend, user, session, extra = {}) {
  const storage = new Map();
  const toasts = [];
  const sandbox = {
    console, JSON, Set, Map, Date, Promise, String, Array, Object, Number, Math, Error,
    setTimeout: () => 0, clearTimeout() {}, // we call sync() ourselves
    localStorage: {
      getItem: k => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => { storage.set(k, String(v)); },
      removeItem: k => { storage.delete(k); }
    },
    addEventListener() {},
    toast: m => toasts.push(m), t: (vi) => vi, view: 'home',
    cloudConfigured: () => true,
    cloudSession: { user: { id: session.id, email: user.username + '@numiquick.app' } },
    cloudRefresh: async () => {},
    cloudRequest: async (p, method, body) => backend.request(session.id, p, method, body),
    state: { xp: 0, history: [], mistakes: [], streak: { count: 0 } },
    ...extra
  };
  sandbox.window = sandbox;
  sandbox.toasts = toasts;
  storage.set('numi-current-user-v1', JSON.stringify(user));
  // Same shape as the real helpers in teacher-classes.js / cloud.js
  sandbox.loadClasses = () => JSON.parse(storage.get('numi-classes-v1') || '[]');
  sandbox.saveClasses = list => storage.set('numi-classes-v1', JSON.stringify(list));
  sandbox.getLocalUsers = () => JSON.parse(storage.get('numi-local-users-v1') || '{}');
  sandbox.saveLocalUsers = u => storage.set('numi-local-users-v1', JSON.stringify(u));
  sandbox.cloudSignInUser = async () => {};
  sandbox.cloudAfterSignIn = async () => {};
  sandbox.cloudSignUpUser = async () => {};
  vm.createContext(sandbox);
  vm.runInContext(SRC, sandbox, { filename: 'cloud-classes.js' });
  return { ctx: sandbox, storage, sync: () => sandbox.window.numiCloudClasses.sync() };
}

const teacher = { username: 'cota', name: 'Co Ta', role: 'teacher', grade: 4 };
const student = { username: 'behoa', name: 'Be Hoa', role: 'student', grade: 4, avatar: 'fox' };

async function setupClass() {
  const backend = makeBackend();
  const T = makeDevice(backend, teacher, { id: 'tid' });
  T.storage.set('numi-classes-v1', JSON.stringify([{ id: 'cls_1', code: '4ABCDE', name: 'Lop 4A', level: 'primary', grade: 4,
    teacherUsername: 'cota', teacherName: 'Co Ta', students: [], createdAt: new Date().toISOString() }]));
  await T.sync();
  return { backend, T };
}

test('teacher class is pushed once with a cloudId and stable local id', async () => {
  const { backend, T } = await setupClass();
  assert.equal(backend.db.numi_classrooms.length, 1);
  assert.equal(backend.db.numi_classrooms[0].local_id, 'cls_1');
  assert.equal(backend.db.numi_classrooms[0].teacher_username, 'cota');
  assert.ok(T.ctx.loadClasses()[0].cloudId, 'local class stores cloudId');
  await T.sync(); // idempotent
  assert.equal(backend.db.numi_classrooms.length, 1);
});

test('a student on an empty device can look up a class by code and join it', async () => {
  const { backend } = await setupClass();
  const S = makeDevice(backend, student, { id: 'sid' });
  const cls = await S.ctx.window.numiCloudClasses.ensureClass('4abcde');
  assert.equal(cls.name, 'Lop 4A');
  assert.equal(cls.cloudMirror, true);
  assert.equal(S.ctx.loadClasses().length, 1);
  // the UI (studentQuickJoinByCode) would now add the student to the local class:
  const list = S.ctx.loadClasses(); list[0].students.push('behoa'); S.ctx.saveClasses(list);
  await S.sync();
  assert.equal(backend.db.numi_enrollments.length, 1);
  assert.equal(backend.db.numi_enrollments[0].student_id, 'sid');
});

test('unknown codes are ignored instead of throwing', async () => {
  const S = makeDevice(makeBackend(), student, { id: 'sid' });
  assert.equal(await S.ctx.window.numiCloudClasses.ensureClass('ZZZZZZ'), null);
});

test('student stats reach a teacher on another device as a synthesized local state', async () => {
  const { backend, T } = await setupClass();
  const S = makeDevice(backend, student, { id: 'sid' });
  await S.ctx.window.numiCloudClasses.ensureClass('4ABCDE');
  const list = S.ctx.loadClasses(); list[0].students.push('behoa'); S.ctx.saveClasses(list);
  S.ctx.state.xp = 120; S.ctx.state.streak = { count: 3 };
  S.ctx.state.history = [{ date: '2026-11-24', total: 10, correct: 8, time: 2.5, junk: 'x' }];
  await S.sync(); // enroll
  await S.sync(); // stats (needs joined flag)
  const stat = backend.db.numi_student_stats[0];
  assert.equal(stat.summary.xp, 120);
  assert.equal(stat.summary.history[0].junk, undefined, 'only whitelisted history fields are shared');

  await T.sync();
  const cls = T.ctx.loadClasses().find(c => c.id === 'cls_1');
  assert.deepEqual(cls.students, ['behoa']);
  const users = T.ctx.getLocalUsers();
  assert.equal(users.behoa.cloudStub, true);
  const st = JSON.parse(T.storage.get('numi-user-state-behoa'));
  assert.equal(st.xp, 120);
  assert.equal(st.history.length, 1);
});

test('assignments flow teacher -> student and the submission flows back exactly once', async () => {
  const { backend, T } = await setupClass();
  const S = makeDevice(backend, student, { id: 'sid' });
  await S.ctx.window.numiCloudClasses.ensureClass('4ABCDE');
  const list = S.ctx.loadClasses(); list[0].students.push('behoa'); S.ctx.saveClasses(list);
  await S.sync();
  await T.sync(); // roster: behoa joins cota's local class

  T.storage.set('numi-targeted-assignments-v1', JSON.stringify([{ id: 'a-1', title: 'Bai 1', due_date: '', targetStudents: ['behoa'],
    config: { count: 5 }, created_at: new Date().toISOString(), submissions: {} }]));
  await T.sync();
  assert.equal(backend.db.numi_assignments.length, 1);
  assert.equal(backend.db.numi_assignments[0].due_date, null);

  await S.sync();
  const mine = JSON.parse(S.storage.get('numi-targeted-assignments-v1'));
  assert.equal(mine.length, 1);
  assert.equal(mine[0].title, 'Bai 1');

  mine[0].submissions = { behoa: { correct: 4, total: 5, avg_time: 3.2, submitted_at: new Date().toISOString() } };
  S.storage.set('numi-targeted-assignments-v1', JSON.stringify(mine));
  await S.sync();
  await S.sync();
  assert.equal(backend.db.numi_submissions.length, 1);
  assert.equal(backend.calls.filter(c => c.path.startsWith('/rest/v1/numi_submissions') && c.method === 'POST').length, 1, 'pushed only once');

  await T.sync();
  const asg = JSON.parse(T.storage.get('numi-targeted-assignments-v1'));
  assert.equal(asg[0].submissions.behoa.correct, 4);

  // The same teacher on a brand-new device gets the assignment tagged so the workspace lists it under the class.
  const T2 = makeDevice(backend, teacher, { id: 'tid' });
  await T2.sync();
  await T2.sync();
  const imported = JSON.parse(T2.storage.get('numi-targeted-assignments-v1'));
  assert.equal(imported.length, 1);
  assert.equal(imported[0].createdBy, 'cota');
  assert.equal(imported[0].classId, 'cls_1');
  assert.equal(imported[0].submissions.behoa.correct, 4);
});

test('a fresh teacher device never deletes cloud classes it has not pushed itself', async () => {
  const { backend } = await setupClass();
  const T2 = makeDevice(backend, teacher, { id: 'tid' }); // new device: empty local classes
  await T2.sync();
  assert.equal(backend.db.numi_classrooms.length, 1, 'class survives');
  assert.equal(T2.ctx.loadClasses().length, 1, 'class is pulled into the new device');
});

test('deleting a pushed class locally removes it in the cloud', async () => {
  const { backend, T } = await setupClass();
  T.ctx.saveClasses([]);
  await T.sync();
  assert.equal(backend.db.numi_classrooms.length, 0);
});

test('seeded demo accounts are never linked to the cloud', async () => {
  const D = makeDevice(makeBackend(), { username: 'colan', name: 'Co Lan', role: 'teacher' }, { id: 'x' });
  assert.equal(await D.ctx.window.numiCloudClasses.linkAccount('colan', '1234'), false);
});

test('no sync happens when the signed-in cloud user does not match the local user', async () => {
  const backend = makeBackend();
  const D = makeDevice(backend, student, { id: 'sid' });
  D.ctx.cloudSession = { user: { id: 'sid', email: 'someoneelse@numiquick.app' } };
  await D.sync();
  assert.equal(backend.calls.length, 0);
});
