'use strict';
// Cloud mirror for classes (v2.5.0).
// localStorage stays the working copy (the whole teacher/student UI is synchronous); this file mirrors it to Supabase
// in the background and merges what other devices wrote. Tables: see cloud-setup.sql.
(() => {
  const CLASSES_KEY = 'numi-classes-v1';
  const PUSHED_KEY = 'numi-cloud-pushed-classes-v1'; // local class ids this device has pushed (so deletes are intentional)
  const JOINED_KEY = 'numi-cloud-joined-v1';          // { username: [codes already enrolled in cloud] }
  const ASG_KEY = 'numi-targeted-assignments-v1';
  const ASG_PUSHED_KEY = 'numi-cloud-pushed-asg-v1';   // local assignment ids already pushed (so deletes are intentional)
  const SUB_PUSHED_KEY = 'numi-cloud-pushed-subs-v1';  // "username:assignmentId" submissions already pushed
  const uidToUser = new Map();                          // cloud user id -> username (filled while pulling the roster)
  const STATS_MS = 4000;

  let busy = false, again = false, mirroring = false, statsTimer = null, syncTimer = null;
  let lastRosterSig = '';

  const j = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } };
  const setJ = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

  function me() {
    if (typeof cloudConfigured !== 'function' || !cloudConfigured()) return null;
    if (typeof cloudSession === 'undefined' || !cloudSession || !cloudSession.user) return null;
    let u = null;
    try { u = JSON.parse(localStorage.getItem('numi-current-user-v1') || 'null'); } catch {}
    if (!u || !u.username || u.role === 'admin') return null;
    if (String(cloudSession.user.email || '').toLowerCase() !== u.username + '@numiquick.app') return null;
    return { ...u, role: u.role === 'teacher' ? 'teacher' : 'student', uid: cloudSession.user.id };
  }

  async function rest(path, method = 'GET', body = null, prefer = '') {
    await cloudRefresh();
    return cloudRequest('/rest/v1/' + path, method, body, true, prefer ? { Prefer: prefer } : {});
  }

  function readClasses() { return typeof loadClasses === 'function' ? loadClasses() : []; }
  function writeClasses(list) { mirroring = true; try { saveClasses(list); } finally { mirroring = false; } }

  function remoteToLocal(r, extra = {}) {
    return {
      id: r.local_id || ('cls_cloud_' + String(r.id || r.code).slice(0, 8)),
      code: String(r.join_code || r.code || '').toUpperCase(),
      name: r.name,
      level: r.level === 'secondary' ? 'secondary' : 'primary',
      grade: Number(r.grade) || 4,
      teacherUsername: String(r.teacher_username || '').toLowerCase(),
      teacherName: r.teacher_name || '',
      students: [],
      createdAt: r.created_at || new Date().toISOString(),
      cloudId: r.id || undefined,
      ...extra
    };
  }

  // ---------- Anonymous code lookup (new device / quick-join) ----------
  async function ensureClass(rawCode) {
    const code = String(rawCode || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!code || typeof cloudConfigured !== 'function' || !cloudConfigured()) return null;
    const have = readClasses().find(c => c.code === code);
    if (have) return have;
    try {
      const r = await cloudRequest('/rest/v1/rpc/numi_lookup_class', 'POST', { p_code: code }, false);
      if (!r || !r.name) return null;
      const list = readClasses();
      const cls = remoteToLocal({ ...r, join_code: r.code }, { cloudMirror: true });
      list.unshift(cls);
      writeClasses(list);
      return cls;
    } catch { return null; }
  }

  // ---------- Teacher ----------
  async function pullTeacherClasses(u) {
    const remote = await rest('numi_classrooms?teacher_id=eq.' + u.uid + '&select=*') || [];
    const local = readClasses();
    let changed = false;
    for (const r of remote) {
      let cls = local.find(c => (r.local_id && c.id === r.local_id) || c.code === String(r.join_code).toUpperCase());
      if (!cls) {
        local.unshift(remoteToLocal(r, { teacherUsername: u.username }));
        changed = true;
      } else if (cls.cloudId !== r.id) { cls.cloudId = r.id; changed = true; }
    }
    if (changed) writeClasses(local);
    return remote;
  }

  async function pushTeacherClasses(u, remote) {
    const local = readClasses();
    const mine = local.filter(c => c.teacherUsername === u.username && !c.cloudMirror);
    const pushed = new Set(j(PUSHED_KEY, []));
    const rows = mine.map(c => ({
      teacher_id: u.uid, local_id: c.id, name: c.name, grade: c.grade, level: c.level,
      join_code: c.code, teacher_name: u.name || c.teacherName || '', teacher_username: u.username
    }));
    if (rows.length) {
      const res = await rest('numi_classrooms?on_conflict=teacher_id,local_id', 'POST', rows, 'resolution=merge-duplicates,return=representation') || [];
      let changed = false;
      for (const r of res) {
        const c = mine.find(x => x.id === r.local_id);
        if (c && c.cloudId !== r.id) { c.cloudId = r.id; changed = true; }
        pushed.add(r.local_id);
      }
      if (changed) writeClasses(local);
    }
    // Deletions: only classes this device pushed earlier and that are now gone locally.
    const keep = new Set(mine.map(c => c.id));
    for (const r of remote || []) {
      if (r.local_id && pushed.has(r.local_id) && !keep.has(r.local_id)) {
        await rest('numi_classrooms?id=eq.' + r.id, 'DELETE');
        pushed.delete(r.local_id);
      }
    }
    setJ(PUSHED_KEY, [...pushed]);
  }

  function synthState(stats, prev) {
    const s = stats.summary || {};
    return {
      ...(prev || {}),
      name: stats.display_name,
      xp: Number(s.xp) || 0,
      streak: { count: Number(s.streak) || 0 },
      history: Array.isArray(s.history) ? s.history : [],
      mistakes: new Array(Math.max(0, Number(s.mistakes) || 0)).fill(0),
      cloudSynth: true
    };
  }

  async function pullRoster(u) {
    const classes = readClasses().filter(c => c.teacherUsername === u.username && c.cloudId);
    if (!classes.length) return false;
    const ids = classes.map(c => c.cloudId).join(',');
    const enr = await rest('numi_enrollments?classroom_id=in.(' + ids + ')&select=classroom_id,student_id') || [];
    if (!enr.length) return false;
    const sids = [...new Set(enr.map(e => e.student_id))].join(',');
    const [profiles, stats] = await Promise.all([
      rest('numi_profiles?user_id=in.(' + sids + ')&select=user_id,username,display_name,grade,avatar') || [],
      rest('numi_student_stats?user_id=in.(' + sids + ')&select=user_id,username,display_name,grade,summary,updated_at') || []
    ]);
    profiles.forEach(p => { if (p.username) uidToUser.set(p.user_id, String(p.username).toLowerCase()); });
    const sig = JSON.stringify([enr, profiles, stats.map(s => s.updated_at)]);
    if (sig === lastRosterSig) return false;
    lastRosterSig = sig;

    const byUid = new Map(profiles.map(p => [p.user_id, p]));
    const statByUid = new Map(stats.map(s => [s.user_id, s]));
    const users = getLocalUsers();
    let usersChanged = false;
    const local = readClasses();
    for (const e of enr) {
      const p = byUid.get(e.student_id);
      const cls = local.find(c => c.cloudId === e.classroom_id);
      if (!p || !p.username || !cls) continue;
      const un = String(p.username).toLowerCase();
      if (!cls.students.includes(un)) cls.students.push(un);
      if (!users[un]) {
        users[un] = {
          username: un, name: p.display_name, hash: '', role: 'student', avatar: p.avatar || 'bunny',
          grade: p.grade || cls.grade, createdAt: new Date().toISOString(), lastLoginAt: null, loginCount: 0, cloudStub: true
        };
        usersChanged = true;
      }
      const st = statByUid.get(e.student_id);
      if (st && (users[un].cloudStub || !localStorage.getItem('numi-user-state-' + un))) {
        const prev = j('numi-user-state-' + un, null);
        setJ('numi-user-state-' + un, synthState(st, prev));
        if (st.summary && st.summary.lastActive) users[un].lastLoginAt = st.summary.lastActive;
        usersChanged = true;
      }
    }
    writeClasses(local);
    if (usersChanged) saveLocalUsers(users);
    return true;
  }

  // ---------- Student ----------
  async function pullStudentClasses(u) {
    const enr = await rest('numi_enrollments?student_id=eq.' + u.uid + '&select=classroom_id') || [];
    if (!enr.length) return;
    const ids = enr.map(e => e.classroom_id).join(',');
    const remote = await rest('numi_classrooms?id=in.(' + ids + ')&select=*') || [];
    const local = readClasses();
    const joined = j(JOINED_KEY, {});
    const mine = new Set(joined[u.username] || []);
    let changed = false;
    for (const r of remote) {
      const code = String(r.join_code).toUpperCase();
      let cls = local.find(c => c.code === code);
      if (!cls) { cls = remoteToLocal(r, { cloudMirror: true }); local.unshift(cls); changed = true; }
      if (!cls.students.includes(u.username)) { cls.students.push(u.username); changed = true; }
      mine.add(code);
    }
    joined[u.username] = [...mine];
    setJ(JOINED_KEY, joined);
    if (changed) writeClasses(local);
  }

  async function joinPending(u) {
    const joined = j(JOINED_KEY, {});
    const mine = new Set(joined[u.username] || []);
    for (const c of readClasses()) {
      if (!c.students.includes(u.username) || mine.has(c.code)) continue;
      try {
        await rest('rpc/numi_join_class', 'POST', { p_code: c.code });
        mine.add(c.code);
      } catch { /* local-only class (not in cloud): ignore */ }
    }
    joined[u.username] = [...mine];
    setJ(JOINED_KEY, joined);
  }

  async function pushMyStats(u) {
    if (u.role !== 'student') return;
    const joined = (j(JOINED_KEY, {})[u.username] || []).length;
    if (!joined) return; // only share stats once the student belongs to a cloud class
    const st = typeof state !== 'undefined' ? state : null;
    if (!st) return;
    await rest('numi_profiles?on_conflict=user_id', 'POST', {
      user_id: u.uid, username: u.username, display_name: u.name, role: 'student',
      grade: Math.min(9, Math.max(1, Number(u.grade) || 1)), avatar: u.avatar || 'bunny', updated_at: new Date().toISOString()
    }, 'resolution=merge-duplicates');
    const history = (Array.isArray(st.history) ? st.history : []).slice(-40)
      .map(h => ({ date: h.date, total: h.total || 0, correct: h.correct || 0, time: h.time || 0 }));
    await rest('numi_student_stats?on_conflict=user_id', 'POST', {
      user_id: u.uid, username: u.username, display_name: u.name,
      grade: Math.min(9, Math.max(1, Number(u.grade) || 1)),
      summary: {
        xp: st.xp || 0, streak: st.streak?.count || 0, mistakes: st.mistakes?.length || 0,
        sessions: (st.history || []).length, history, lastActive: new Date().toISOString()
      },
      updated_at: new Date().toISOString()
    }, 'resolution=merge-duplicates');
  }

  // ---------- Assignments (teacher -> students) and submissions (student -> teacher) ----------
  const readAsg = () => { const a = j(ASG_KEY, []); return Array.isArray(a) ? a : []; };
  function writeAsg(list) { mirroring = true; try { setJ(ASG_KEY, list); } finally { mirroring = false; } }

  async function syncTeacherAssignments(u) {
    const classes = readClasses().filter(c => c.teacherUsername === u.username && c.cloudId);
    if (!classes.length) return false;
    const ids = classes.map(c => c.cloudId).join(',');
    let list = readAsg();
    const pushed = new Set(j(ASG_PUSHED_KEY, []));
    let changed = false;

    // 1) Remote rows this device deleted locally -> delete; unknown rows (made on another device) -> import.
    let remote = await rest('numi_assignments?classroom_id=in.(' + ids + ')&select=*') || [];
    const localIds = new Set(list.map(a => a.id));
    for (const r of remote) {
      if (pushed.has(r.local_id) && !localIds.has(r.local_id)) {
        await rest('numi_assignments?id=eq.' + r.id, 'DELETE');
      } else if (!localIds.has(r.local_id) && !pushed.has(r.local_id) && r.local_id) {
        list.unshift({ id: r.local_id, title: r.title, due_date: r.due_date || '', targetStudents: r.target_students || [],
          config: r.config || {}, created_at: r.created_at, submissions: {} });
        localIds.add(r.local_id); changed = true;
      }
    }

    // 2) Push local assignments, one row per class that holds at least one target student.
    const rows = [];
    for (const a of list) {
      const t = Array.isArray(a.targetStudents) ? a.targetStudents : [];
      for (const c of classes) {
        if (t.some(s => c.students.includes(s))) {
          rows.push({ classroom_id: c.cloudId, local_id: a.id, title: String(a.title || '').slice(0, 120) || '—',
            due_date: a.due_date || null, config: a.config || {}, target_students: t });
        }
      }
    }
    if (rows.length) {
      await rest('numi_assignments?on_conflict=classroom_id,local_id', 'POST', rows, 'resolution=merge-duplicates');
      rows.forEach(r => pushed.add(r.local_id));
    }
    setJ(ASG_PUSHED_KEY, [...pushed]);

    // 3) Pull submissions into local assignment objects (teacher dashboards read them from there).
    remote = await rest('numi_assignments?classroom_id=in.(' + ids + ')&select=id,local_id') || [];
    const aidToLocal = new Map(remote.map(r => [r.id, r.local_id]));
    if (aidToLocal.size) {
      const subs = await rest('numi_submissions?assignment_id=in.(' + [...aidToLocal.keys()].join(',') + ')&select=assignment_id,student_id,correct,total,avg_time,completed_at') || [];
      for (const s of subs) {
        const a = list.find(x => x.id === aidToLocal.get(s.assignment_id));
        const uname = uidToUser.get(s.student_id);
        if (!a || !uname) continue;
        a.submissions = a.submissions || {};
        const prev = a.submissions[uname];
        if (!prev || prev.correct !== s.correct || prev.total !== s.total) {
          a.submissions[uname] = { correct: s.correct, total: s.total, avg_time: Number(s.avg_time) || 0, submitted_at: s.completed_at };
          changed = true;
        }
      }
    }
    if (changed) writeAsg(list);
    return changed;
  }

  async function syncStudentAssignments(u) {
    const rem = await rest('numi_assignments?select=*') || []; // RLS: only classes the student is enrolled in
    const mine = rem.filter(r => (r.target_students || []).includes(u.username));
    const list = readAsg();
    let changed = false;
    for (const r of mine) {
      const a = list.find(x => x.id === r.local_id);
      if (!a) {
        list.unshift({ id: r.local_id, title: r.title, due_date: r.due_date || '', targetStudents: r.target_students,
          config: r.config || {}, created_at: r.created_at, submissions: {} });
        changed = true;
      }
    }
    const subs = await rest('numi_submissions?student_id=eq.' + u.uid + '&select=assignment_id,correct,total,avg_time,completed_at') || [];
    for (const s of subs) {
      const r = mine.find(x => x.id === s.assignment_id);
      const a = r && list.find(x => x.id === r.local_id);
      if (a && !(a.submissions && a.submissions[u.username])) {
        a.submissions = a.submissions || {};
        a.submissions[u.username] = { correct: s.correct, total: s.total, avg_time: Number(s.avg_time) || 0, submitted_at: s.completed_at };
        changed = true;
      }
    }
    const pushed = new Set(j(SUB_PUSHED_KEY, []));
    const up = [];
    for (const a of list) {
      const sub = a.submissions && a.submissions[u.username];
      const r = mine.find(x => x.local_id === a.id);
      const key = u.username + ':' + a.id;
      if (sub && r && !pushed.has(key)) {
        up.push({ key, row: { assignment_id: r.id, student_id: u.uid, correct: Math.max(0, sub.correct | 0),
          total: Math.max(1, sub.total | 0), avg_time: Number(sub.avg_time) || 0, completed_at: sub.submitted_at || new Date().toISOString() } });
      }
    }
    if (up.length) {
      await rest('numi_submissions?on_conflict=assignment_id,student_id', 'POST', up.map(x => x.row), 'resolution=merge-duplicates');
      up.forEach(x => pushed.add(x.key));
      setJ(SUB_PUSHED_KEY, [...pushed]);
    }
    if (changed) writeAsg(list);
    return changed;
  }

  // ---------- Orchestration ----------
  async function sync() {
    if (busy) { again = true; return; }
    const u = me();
    if (!u) return;
    busy = true;
    let rosterChanged = false;
    try {
      if (u.role === 'teacher') {
        const remote = await pullTeacherClasses(u);
        await pushTeacherClasses(u, remote);
        rosterChanged = await pullRoster(u);
        if (await syncTeacherAssignments(u)) rosterChanged = true;
      } else {
        await pullStudentClasses(u);
        await joinPending(u);
        await pushMyStats(u);
        if (await syncStudentAssignments(u) && typeof view !== 'undefined' && view === 'home' && typeof window.home === 'function') {
          try { window.home(); } catch {}
        }
      }
    } catch (e) {
      console.log('Cloud class sync skipped:', e && e.message);
    } finally {
      busy = false;
      if (rosterChanged && typeof view !== 'undefined' && view === 'teacher' && typeof window.renderTeacherWorkspace === 'function') {
        try { window.renderTeacherWorkspace(); } catch {}
      }
      if (again) { again = false; schedule(500); }
    }
  }
  function schedule(ms = 1200) { clearTimeout(syncTimer); syncTimer = setTimeout(sync, ms); }
  function scheduleStats() { if (statsTimer) return; statsTimer = setTimeout(() => { statsTimer = null; sync(); }, STATS_MS); }

  // Mirror whenever the classes list is written by the existing UI code.
  const origSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    const r = origSetItem.apply(this, arguments);
    if ((k === CLASSES_KEY || k === ASG_KEY) && !mirroring) schedule();
    return r;
  };

  // Sign-in / sign-out signal: cloud.js stores the session through cloudStoreSession.
  if (typeof cloudStoreSession === 'function') {
    const orig = cloudStoreSession;
    cloudStoreSession = function (s) { const r = orig.apply(this, arguments); if (s) schedule(800); return r; };
  }
  // Progress saves refresh the student's stats row.
  window.addEventListener('numi-saved', scheduleStats);
  window.addEventListener('online', () => schedule(500));

  // Teacher workspace opens -> refresh roster too.
  if (typeof window.renderTeacherWorkspace === 'function') {
    const origRender = window.renderTeacherWorkspace;
    window.renderTeacherWorkspace = function () { const r = origRender.apply(this, arguments); schedule(300); return r; };
  }

  // After a quick-join created/entered a local student, tie it to a cloud account (same name + PIN => same cloud user).
  async function linkAccount(username, pin, hadLocal = false) {
    if (typeof cloudConfigured !== 'function' || !cloudConfigured()) return false;
    const key = String(username || '').toLowerCase();
    if (typeof cloudSession !== 'undefined' && cloudSession && cloudSession.user && cloudSession.user.email === key + '@numiquick.app') return true;
    try {
      await cloudSignInUser(key, pin);
      await cloudAfterSignIn(key, hadLocal); // no local progress => adopt the online save; otherwise ask which one to keep
      schedule(300);
      return true;
    } catch { /* not an existing cloud account */ }
    try {
      const user = getLocalUsers()[key];
      if (!user) return false;
      await cloudSignUpUser(user, pin);
      schedule(300);
      return true;
    } catch (e) {
      if (typeof toast === 'function') toast(t('Tên này đã dùng trên mạng nên tài khoản chỉ lưu trên máy này.', 'This name is already used online; the account stays on this device only.'));
      return false;
    }
  }

  // Every successful local sign-in (form, teacher setup, quick-join) also links the account to the cloud.
  if (typeof localSignIn === 'function') {
    const origSignIn = localSignIn;
    localSignIn = async function (username, password) {
      const key = String(username || '').trim().toLowerCase();
      const had = !!localStorage.getItem('numi-user-state-' + key);
      const r = await origSignIn.apply(this, arguments);
      if (key && key !== 'admin') linkAccount(key, String(password || ''), had).catch(() => {});
      return r;
    };
  }

  window.numiCloudClasses = { sync, ensureClass, linkAccount, me };
  schedule(1500);
})();
