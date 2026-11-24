'use strict';
// cloud.js against an in-memory fake of Supabase Auth + the numi_progress table.
// Each "device" is its own app context; devices share one fake backend. No real network is used.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadAppContext } = require('./helpers/app-context');

function makeSupabase() {
  const users = new Map();    // email -> { id, password, user_metadata }
  const progress = new Map(); // user_id -> { user_id, payload, revision, updated_at }
  const calls = [];
  let failWith = null;        // (call) => 'network' | { status } | null, to simulate outages

  const reply = (status, body) => ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body == null ? '' : JSON.stringify(body)),
    json: async () => body,
  });
  const userView = u => ({ id: u.id, email: u.email, user_metadata: u.user_metadata });

  async function fetch(url, opts = {}) {
    const u = new URL(url);
    const method = opts.method || 'GET';
    const body = opts.body ? JSON.parse(opts.body) : null;
    const token = String((opts.headers || {}).Authorization || '').replace('Bearer ', '');
    const call = { path: u.pathname, query: u.search, method, body, token };
    calls.push(call);
    const failure = failWith && failWith(call);
    if (failure === 'network') throw new TypeError('Failed to fetch');
    if (failure) return reply(failure.status, { error: 'simulated' });

    const me = [...users.values()].find(x => 'tok-' + x.id === token);
    const q = Object.fromEntries(u.searchParams);
    if (u.pathname === '/auth/v1/token' && q.grant_type === 'password') {
      const found = users.get(body.email);
      if (!found || found.password !== body.password) return reply(400, { error: 'invalid_grant' });
      return reply(200, { access_token: 'tok-' + found.id, refresh_token: 'ref-' + found.id, expires_in: 3600, user: userView(found) });
    }
    if (u.pathname === '/auth/v1/user' && method === 'PUT') {
      if (!me) return reply(401, {});
      me.password = body.password;
      return reply(200, userView(me));
    }
    if (u.pathname === '/auth/v1/logout') return reply(204, null);
    if (u.pathname === '/rest/v1/numi_progress') {
      if (!me) return reply(401, {});
      const row = progress.get(me.id);
      if (method === 'GET') return reply(200, row ? [{ ...row }] : []);
      if (method === 'POST') {
        if (row) return reply(409, { error: 'duplicate key' });
        const created = { ...body, updated_at: new Date().toISOString() };
        progress.set(me.id, created);
        return reply(201, [{ ...created }]);
      }
      if (method === 'PATCH') {
        // RLS + the revision filter: only the owner's row, and only if nobody saved in between.
        if (!row || q.revision !== 'eq.' + row.revision) return reply(200, []);
        Object.assign(row, body);
        return reply(200, [{ ...row }]);
      }
    }
    return reply(404, { error: 'not faked: ' + method + ' ' + u.pathname });
  }

  function addUser(username, pin, meta = {}) {
    const id = 'uid-' + username;
    users.set(username + '@numiquick.app', {
      id, email: username + '@numiquick.app', password: 'nq-' + pin,
      user_metadata: { username, name: meta.name || username, grade: meta.grade || 3, avatar: 'bunny', role: 'student' },
    });
    return id;
  }
  return { fetch, addUser, users, progress, calls, setFailure: fn => { failWith = fn; } };
}

function device(sb) {
  const ctx = loadAppContext({ fetch: sb.fetch, timers: false });
  ctx.NUMI_CLOUD_CONFIG = { url: 'https://unit-test.supabase.co', publishableKey: 'sb_publishable_unit_test' };
  return ctx;
}

// The real username sign-in path: cloud session first, then the local account, then pick the save.
async function signIn(ctx, username, pin) {
  const hadLocal = !!ctx.localStorage.getItem('numi-user-state-' + username);
  await ctx.cloudSignInUser(username, pin);
  await ctx.localSignIn(username, pin);
  await ctx.cloudAfterSignIn(username, hadLocal);
}

test('progress sync: first save creates revision 1, later saves patch only that revision', async () => {
  const sb = makeSupabase();
  const uid = sb.addUser('bean', '123456', { name: 'Bé An' });
  const a = device(sb);
  await signIn(a, 'bean', '123456');
  assert.equal(sb.progress.get(uid).revision, 1);
  assert.equal(a.run('cloudStatus'), 'saved');

  a.run('state.xp = 77');
  a.save();
  await a.cloudPush();
  const patch = sb.calls.filter(c => c.method === 'PATCH').pop();
  assert.match(patch.query, /revision=eq\.1/);
  assert.equal(sb.progress.get(uid).revision, 2);
  assert.equal(sb.progress.get(uid).payload.xp, 77);
  assert.equal(a.run('cloudDirty'), false);
});

test('a newer save from another device is reported as a conflict and never overwritten', async () => {
  const sb = makeSupabase();
  const uid = sb.addUser('bean', '123456');
  const a = device(sb), b = device(sb);
  await signIn(a, 'bean', '123456');
  await signIn(b, 'bean', '123456');       // B loads revision 1 from the cloud
  assert.equal(b.run('cloudRevision'), 1);

  a.run('state.xp = 300'); a.save(); await a.cloudPush();   // A moves the cloud to revision 2
  b.run('state.xp = 5'); b.save(); await b.cloudPush();     // B still thinks it is on revision 1

  assert.equal(b.run('cloudStatus'), 'conflict');
  assert.equal(b.run('cloudReady'), false);
  assert.equal(b.run('cloudDirty'), true, 'B keeps its unsaved progress');
  assert.equal(sb.progress.get(uid).payload.xp, 300, "A's save is untouched");
  assert.equal(sb.progress.get(uid).revision, 2);
});

test('when the network drops, progress stays on the device and is marked not yet saved', async () => {
  const sb = makeSupabase();
  sb.addUser('bean', '123456');
  const a = device(sb);
  await signIn(a, 'bean', '123456');
  sb.setFailure(c => (c.path === '/rest/v1/numi_progress' ? 'network' : null));
  a.run('state.xp = 42'); a.save(); await a.cloudPush();
  assert.equal(a.run('cloudStatus'), 'offline');
  assert.equal(a.run('cloudDirty'), true);
  assert.equal(a.run('state.xp'), 42);

  sb.setFailure(null);                     // back online: the same push goes through
  await a.cloudPush();
  assert.equal(a.run('cloudStatus'), 'saved');
});

test('changing the PIN updates the Supabase password; if that fails the old PIN stays everywhere', async () => {
  const sb = makeSupabase();
  sb.addUser('bean', '123456');
  const a = device(sb);
  await signIn(a, 'bean', '123456');
  const oldHash = a.getLocalUsers().bean.hash;

  sb.setFailure(c => (c.path === '/auth/v1/user' && c.method === 'PUT' ? { status: 500 } : null));
  await assert.rejects(() => a.updateUserPassword('bonghoa1'));
  assert.equal(a.getLocalUsers().bean.hash, oldHash, 'local PIN unchanged when the cloud refused');
  assert.equal(sb.users.get('bean@numiquick.app').password, 'nq-123456');

  sb.setFailure(null);
  await a.updateUserPassword('bonghoa1');
  assert.equal(sb.users.get('bean@numiquick.app').password, 'nq-bonghoa1');
  assert.equal(a.getLocalUsers().bean.hash, await a.hashPassword('bonghoa1'));

  // a second device can now sign in with the new PIN only
  const b = device(sb);
  await assert.rejects(() => b.cloudSignInUser('bean', '123456'));
  await signIn(b, 'bean', 'bonghoa1');
  assert.equal(b.currentAuthUser().username, 'bean');
});

test('changing the PIN of a local-only account sends nothing to the cloud', async () => {
  const sb = makeSupabase();
  const a = device(sb);
  await a.localSignUp('Bé Lan', 'belan', '123456', 'fox', 2);
  const before = sb.calls.length;
  await a.updateUserPassword('654321');
  assert.equal(sb.calls.length, before);
});

test('signing out saves pending progress, keeps an account copy and clears the session', async () => {
  const sb = makeSupabase();
  const uid = sb.addUser('bean', '123456');
  const a = device(sb);
  await signIn(a, 'bean', '123456');
  a.run('state.xp = 99'); a.save();         // queued, not pushed yet
  await a.cloudSignOut();
  assert.equal(sb.progress.get(uid).payload.xp, 99, 'pending progress pushed before leaving');
  assert.equal(JSON.parse(a.localStorage.getItem('numi-account-cache-' + uid)).xp, 99);
  assert.equal(a.run('cloudSession'), null);
  assert.equal(a.localStorage.getItem('numi-cloud-session-v1'), null);
  assert.equal(a.run('cloudStatus'), 'local');
});
