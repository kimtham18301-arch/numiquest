'use strict';
// Admin Center data layer: targeted assignments, #hw= share links, analytics, student edits, full backup.
// The Admin Center screens live in admin-dashboard.js.
(() => {
  const TARGETED_ASSIGN_KEY = 'numi-targeted-assignments-v1';
  const TARGETED_SEED_FLAG = 'numi-targeted-seeded-v1';
  const PENDING_HW_KEY = 'numi-pending-hw-v1';

  function localDateKey(d = new Date()) {
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  }

  // ---------------- Targeted Student Assignments Storage & API ----------------
  function loadTargetedAssignments() {
    let list = [];
    try {
      const raw = JSON.parse(localStorage.getItem(TARGETED_ASSIGN_KEY) || '[]');
      if (Array.isArray(raw)) list = raw;
    } catch {}

    try {
      if (!list.length && !localStorage.getItem(TARGETED_SEED_FLAG)) {
        const usersRaw = localStorage.getItem('numi-local-users-v1');
        if (usersRaw && usersRaw.includes('minhkhoi')) {
          const due = new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10);
          list = [{
            id: 'asg-sample-1',
            title: 'Ôn luyện tính nhẩm tuần này',
            due_date: due,
            targetStudents: ['minhkhoi', 'baoan'],
            config: {
              ...(typeof defaults !== 'undefined' ? defaults : {}),
              grade: 4,
              ops: ['+', '-', '*'],
              types: ['natural'],
              type: 'natural',
              digits: [1, 2],
              questionStyle: 'normal',
              count: 10,
              seconds: 20,
              inputMode: 'choices'
            },
            created_at: new Date().toISOString(),
            submissions: {}
          }];
          localStorage.setItem(TARGETED_ASSIGN_KEY, JSON.stringify(list));
          localStorage.setItem(TARGETED_SEED_FLAG, '1');
        }
      }
    } catch {}

    return list;
  }

  function saveTargetedAssignments(list) {
    try {
      localStorage.setItem(TARGETED_ASSIGN_KEY, JSON.stringify(Array.isArray(list) ? list : []));
    } catch {}
  }

  function createTargetedAssignment({ title, dueDate = '', targetStudents = [], config: assignCfg = {} } = {}) {
    const cleanTitle = String(title || '').trim().slice(0, 80);
    if (!cleanTitle) throw Error(t('Vui lòng nhập tiêu đề bài tập.', 'Please enter an assignment title.'));
    const targets = Array.isArray(targetStudents)
      ? [...new Set(targetStudents.map(x => String(x || '').trim().toLowerCase()).filter(Boolean))]
      : [];
    if (!targets.length) {
      throw Error(t('Vui lòng chọn ít nhất 1 học sinh để giao bài.', 'Please select at least 1 student.'));
    }

    const base = typeof defaults !== 'undefined' ? defaults : { ops: ['+'], types: ['natural'], digits: [1], count: 10, seconds: 20, inputMode: 'choices' };
    const cfg = {
      ...base,
      ...(assignCfg || {}),
      ops: Array.isArray(assignCfg?.ops) && assignCfg.ops.length ? [...assignCfg.ops] : [...(base.ops || ['+'])],
      types: Array.isArray(assignCfg?.types) && assignCfg.types.length ? [...assignCfg.types] : [assignCfg?.type || base.type || 'natural'],
      digits: Array.isArray(assignCfg?.digits) && assignCfg.digits.length ? assignCfg.digits.map(Number).filter(Boolean) : [...(base.digits || [1])],
      count: Math.max(3, Math.min(50, Number(assignCfg?.count) || 10)),
      seconds: Math.max(5, Math.min(120, Number(assignCfg?.seconds) || 20)),
      questionStyle: assignCfg?.questionStyle || 'normal',
      inputMode: assignCfg?.inputMode || 'choices'
    };
    cfg.type = cfg.types[0] || 'natural';

    const item = {
      id: typeof uid === 'function' ? uid() : 'asg-' + Date.now().toString(36),
      title: cleanTitle,
      due_date: String(dueDate || '').trim(),
      targetStudents: targets,
      config: cfg,
      created_at: new Date().toISOString(),
      submissions: {}
    };

    const list = loadTargetedAssignments();
    list.unshift(item);
    saveTargetedAssignments(list);
    try { localStorage.setItem(TARGETED_SEED_FLAG, '1'); } catch {}
    return item;
  }

  function deleteTargetedAssignment(assignmentId) {
    if (!assignmentId) return false;
    const list = loadTargetedAssignments();
    const next = list.filter(a => a.id !== assignmentId);
    if (next.length === list.length) return false;
    saveTargetedAssignments(next);
    return true;
  }

  function getAssignmentsForStudent(username) {
    const uname = String(username || '').trim().toLowerCase();
    if (!uname) return { pending: [], completed: [] };
    const all = loadTargetedAssignments().filter(a =>
      Array.isArray(a.targetStudents) && a.targetStudents.includes(uname)
    );
    const pending = [];
    const completed = [];
    for (const asg of all) {
      const sub = asg.submissions && asg.submissions[uname];
      if (sub) completed.push({ ...asg, mySubmission: sub });
      else pending.push(asg);
    }
    return { pending, completed };
  }

  function submitTargetedAssignment(assignmentId, correct, total, avgTime = 0, studentUsername = null) {
    if (!assignmentId || !(total > 0)) return null;
    const currentU = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
    const uname = String(studentUsername || currentU?.username || '').trim().toLowerCase();
    if (!uname) return null;

    const list = loadTargetedAssignments();
    const asg = list.find(a => a.id === assignmentId);
    if (!asg) return null;

    if (!Array.isArray(asg.targetStudents)) asg.targetStudents = [];
    if (!asg.targetStudents.includes(uname)) asg.targetStudents.push(uname);
    if (!asg.submissions || typeof asg.submissions !== 'object') asg.submissions = {};

    const firstTime = !asg.submissions[uname];
    const sub = {
      correct: Number(correct) || 0,
      total: Number(total) || 1,
      avg_time: Number(avgTime) || 0,
      submitted_at: new Date().toISOString()
    };
    asg.submissions[uname] = sub;
    saveTargetedAssignments(list);

    if (firstTime && typeof state !== 'undefined' && currentU && currentU.username === uname) {
      state.xp = (state.xp || 0) + 15;
      if (typeof save === 'function') save();
    }
    return sub;
  }

  // ---------------- 1-Click Shareable Homework Link (#hw=...) ----------------
  function toBase64Url(str) {
    const utf8 = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)));
    return btoa(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function fromBase64Url(b64) {
    let s = String(b64 || '').replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bin = atob(s);
    const escStr = Array.from(bin, ch => '%' + ch.charCodeAt(0).toString(16).padStart(2, '0')).join('');
    return decodeURIComponent(escStr);
  }

  function buildHomeworkShareLink(assignment) {
    if (!assignment) return '';
    const payload = {
      id: assignment.id,
      t: assignment.title,
      d: assignment.due_date || '',
      u: Array.isArray(assignment.targetStudents) ? assignment.targetStudents : [],
      cfg: assignment.config || {}
    };
    const encoded = toBase64Url(JSON.stringify(payload));
    const base = typeof location !== 'undefined' && location.origin && location.origin !== 'null'
      ? (location.origin + location.pathname)
      : 'https://kimtham18301-arch.github.io/numiquest/';
    return `${base}#hw=${encoded}`;
  }

  function parseHomeworkShareHash(hashStr) {
    const m = String(hashStr || '').match(/#hw=([A-Za-z0-9\-_]+)/);
    if (!m) return null;
    try {
      const obj = JSON.parse(fromBase64Url(m[1]));
      if (!obj || !obj.t) return null;
      return obj;
    } catch {
      return null;
    }
  }

  function upsertAssignmentFromSharePayload(payload, studentUsername) {
    if (!payload || !payload.t) return null;
    const uname = String(studentUsername || '').trim().toLowerCase();
    const list = loadTargetedAssignments();
    let asg = list.find(a => a.id === payload.id);
    if (!asg) {
      const targets = Array.isArray(payload.u) ? payload.u.map(x => String(x).trim().toLowerCase()).filter(Boolean) : [];
      if (uname && !targets.includes(uname)) targets.push(uname);
      asg = {
        id: payload.id || ('hw-' + Date.now().toString(36)),
        title: String(payload.t).slice(0, 80),
        due_date: String(payload.d || ''),
        targetStudents: targets,
        config: { ...(typeof defaults !== 'undefined' ? defaults : {}), ...(payload.cfg || {}) },
        created_at: new Date().toISOString(),
        submissions: {}
      };
      list.unshift(asg);
    } else if (uname && Array.isArray(asg.targetStudents) && !asg.targetStudents.includes(uname)) {
      asg.targetStudents.push(uname);
    }
    saveTargetedAssignments(list);
    return asg;
  }

  function handleIncomingHomeworkHash() {
    if (typeof location === 'undefined' || !location.hash || !location.hash.includes('#hw=')) return;
    const payload = parseHomeworkShareHash(location.hash);
    if (!payload) return;
    try { history.replaceState(null, '', location.pathname + location.search); } catch {}

    const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
    if (!u || u.role === 'admin' || u.username === 'admin') {
      try { localStorage.setItem(PENDING_HW_KEY, JSON.stringify(payload)); } catch {}
      if (!u) {
        toast(t('Hãy đăng nhập tài khoản học sinh để làm bài tập vừa nhận nhé!', 'Sign in as a student to start this homework!'));
      }
      return;
    }

    const asg = upsertAssignmentFromSharePayload(payload, u.username);
    if (!asg) return;
    modal(`<h2>📬 ${t('Nhận bài tập từ Thầy/Cô', 'Homework Received')}</h2>
      <p><b>${esc(asg.title)}</b></p>
      <p class="muted">${asg.config?.count || 10} ${t('câu hỏi', 'questions')} · ${asg.config?.seconds || 20}s/${t('câu', 'question')}${asg.due_date ? ` · ${t('Hạn:', 'Due:')} ${esc(asg.due_date)}` : ''}</p>
      <div class="actions" style="margin-top:14px">
        <button type="button" class="primary" id="startSharedHwBtn">${t('Làm bài ngay', 'Start Homework')} →</button>
        <button type="button" onclick="$('#modal').close(); if(typeof home==='function')home();">${t('Để sau', 'Later')}</button>
      </div>`);
    const btn = $('#startSharedHwBtn');
    if (btn) {
      btn.onclick = () => {
        $('#modal').close();
        startTargetedAssignment(asg);
      };
    }
  }

  function startTargetedAssignment(assignment) {
    if (!assignment?.config) return;
    const base = typeof defaults !== 'undefined' ? defaults : {};
    config = {
      ...base,
      ...assignment.config,
      ops: Array.isArray(assignment.config.ops) && assignment.config.ops.length ? [...assignment.config.ops] : ['+'],
      types: Array.isArray(assignment.config.types) && assignment.config.types.length ? [...assignment.config.types] : [assignment.config.type || 'natural'],
      digits: Array.isArray(assignment.config.digits) && assignment.config.digits.length ? [...assignment.config.digits] : [1]
    };
    config.type = config.types[0] || 'natural';
    if (typeof window !== 'undefined') window.config = config;
    if (typeof global !== 'undefined') global.config = config;
    if (typeof startQuiz === 'function') startQuiz();
    if (typeof session !== 'undefined' && session) {
      session.targetedAssignmentId = assignment.id;
      session.targetedAssignmentTitle = assignment.title;
    }
  }

  // ---------------- Analytics, Student Management & Remedial ----------------
  function computeAdminAnalytics(students = []) {
    const list = (students || []).filter(s => s && s.role !== 'admin' && s.username !== 'admin');
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const days = [];
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(today);
      d.setDate(today.getDate() - offset);
      days.push({
        key: localDateKey(d),
        label: d.toLocaleDateString(typeof lang !== 'undefined' && lang === 'en' ? 'en-US' : 'vi-VN', { weekday: 'short' }),
        sessions: 0,
        questions: 0,
        correct: 0,
        accuracy: 0
      });
    }
    const byKey = new Map(days.map(x => [x.key, x]));

    const tiers = { excellent: 0, good: 0, average: 0, needsWork: 0 };
    const atRiskStudents = [];
    const now = Date.now();

    for (const s of list) {
      if (s.totalAnswered > 0) {
        if (s.accuracy >= 85) tiers.excellent++;
        else if (s.accuracy >= 70) tiers.good++;
        else if (s.accuracy >= 50) tiers.average++;
        else tiers.needsWork++;
      }

      for (const h of (s.history || [])) {
        if (!h || !h.date) continue;
        const hd = new Date(h.date);
        if (Number.isNaN(hd.getTime())) continue;
        const bucket = byKey.get(localDateKey(hd));
        if (bucket) {
          bucket.sessions++;
          bucket.questions += Number(h.total) || 0;
          bucket.correct += Number(h.correct) || 0;
        }
      }

      const lastMs = s.lastLogin ? new Date(s.lastLogin).getTime() : 0;
      const inactiveLong = !lastMs || (now - lastMs) > 86400000 * 2;
      const lowAcc = s.totalAnswered > 0 && s.accuracy < 75;
      const hasMistakes = (s.mistakesCount || 0) > 0;

      if (lowAcc || hasMistakes || inactiveLong) {
        const counts = new Map();
        for (const m of (s.uState?.mistakes || [])) {
          const sk = String(m?.skill || 'natural:+');
          counts.set(sk, (counts.get(sk) || 0) + 1);
        }
        let weakestSkill = 'natural:+';
        let maxCount = 0;
        for (const [sk, cnt] of counts.entries()) {
          if (cnt > maxCount) { maxCount = cnt; weakestSkill = sk; }
        }
        atRiskStudents.push({
          username: s.username,
          name: s.name,
          grade: s.grade,
          accuracy: s.accuracy,
          mistakesCount: s.mistakesCount || 0,
          inactiveLong,
          lowAcc,
          weakestSkill,
          weakestLabel: typeof skillName === 'function' ? skillName(weakestSkill) : weakestSkill
        });
      }
    }

    for (const day of days) {
      day.accuracy = day.questions > 0 ? Math.round((day.correct / day.questions) * 100) : 0;
    }

    atRiskStudents.sort((a, b) => (b.mistakesCount - a.mistakesCount) || (a.accuracy - b.accuracy));
    return { days, tiers, atRiskStudents };
  }

  function updateStudentByAdmin(username, updates = {}) {
    const users = typeof getLocalUsers === 'function' ? getLocalUsers() : {};
    const user = users[username];
    if (!user || username === 'admin') return false;

    if (updates.name !== undefined) {
      const cleanName = String(updates.name).trim().slice(0, 30);
      if (cleanName) user.name = cleanName;
    }
    if (updates.grade !== undefined) {
      user.grade = Math.max(1, Math.min(9, Number(updates.grade) || 1));
    }
    if (updates.avatar !== undefined && ['bunny', 'panda', 'fox', 'lion'].includes(updates.avatar)) {
      user.avatar = updates.avatar;
    }
    if (typeof saveLocalUsers === 'function') saveLocalUsers(users);

    try {
      const stateKey = 'numi-user-state-' + username;
      const uState = JSON.parse(localStorage.getItem(stateKey) || 'null') || {
        version: 1, lang: 'vi', name: user.name, buddy: user.avatar || 'bunny',
        xp: 0, best: 0, pieces: {}, streak: { count: 0, lastDate: '' },
        history: [], mistakes: [], mastery: {}
      };
      uState.name = user.name;
      uState.buddy = user.avatar || uState.buddy || 'bunny';
      if (Number(updates.bonusXp) > 0) {
        uState.xp = (Number(uState.xp) || 0) + Math.round(Number(updates.bonusXp));
      }
      localStorage.setItem(stateKey, JSON.stringify(uState));
    } catch {}

    return true;
  }

  function batchPromoteGrade(fromGrade, toGrade) {
    const fromG = Number(fromGrade), toG = Math.max(1, Math.min(9, Number(toGrade) || 1));
    const users = typeof getLocalUsers === 'function' ? getLocalUsers() : {};
    let count = 0;
    for (const u of Object.values(users)) {
      if (!u || u.role === 'admin' || u.username === 'admin') continue;
      if (Number(u.grade) === fromG) {
        u.grade = toG;
        count++;
      }
    }
    if (count > 0 && typeof saveLocalUsers === 'function') saveLocalUsers(users);
    return count;
  }

  async function assignRemedialForStudent(username) {
    const users = typeof getLocalUsers === 'function' ? getLocalUsers() : {};
    const user = users[username];
    if (!user) throw Error(t('Không tìm thấy học sinh.', 'Student not found.'));

    let uState = null;
    try { uState = JSON.parse(localStorage.getItem('numi-user-state-' + username) || 'null'); } catch {}
    const counts = new Map();
    for (const m of (uState?.mistakes || [])) {
      const sk = String(m?.skill || 'natural:+');
      counts.set(sk, (counts.get(sk) || 0) + 1);
    }
    let weakestSkill = 'natural:+';
    let bestCnt = 0;
    for (const [sk, cnt] of counts.entries()) {
      if (cnt > bestCnt) { bestCnt = cnt; weakestSkill = sk; }
    }
    if (bestCnt === 0 && uState?.mastery && typeof uState.mastery === 'object') {
      let lowestRate = 1.1;
      for (const [sk, arr] of Object.entries(uState.mastery)) {
        if (Array.isArray(arr) && arr.length >= 3) {
          const rate = arr.reduce((a, b) => a + b, 0) / arr.length;
          if (rate < lowestRate) { lowestRate = rate; weakestSkill = sk; }
        }
      }
    }

    const [rawType, rawOp] = weakestSkill.split(':');
    const type = ['natural', 'fraction', 'decimal', 'negative', 'remainder'].includes(rawType) ? rawType : 'natural';
    const op = ['+', '-', '*', '/'].includes(rawOp) ? rawOp : '+';
    const questionStyle = rawOp === 'missing' ? 'missing' : rawOp === 'word' ? 'word' : rawOp === 'convenient' ? 'convenient' : rawOp === 'expression' ? 'expression' : 'normal';

    const skillText = typeof skillName === 'function' ? skillName(weakestSkill) : weakestSkill;
    const due = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10);
    const asg = createTargetedAssignment({
      title: t(`Phụ đạo (${user.name}): ${skillText}`, `Remedial (${user.name}): ${skillText}`),
      dueDate: due,
      targetStudents: [username],
      config: {
        ...(typeof defaults !== 'undefined' ? defaults : {}),
        grade: user.grade || 1,
        type,
        types: [type],
        ops: [op],
        questionStyle,
        digits: (user.grade || 1) >= 4 ? [1, 2] : [1],
        count: 10,
        seconds: 25
      }
    });
    return { assignment: asg, weakestSkill };
  }

  function buildFullSystemBackup() {
    const users = typeof getLocalUsers === 'function' ? getLocalUsers() : {};
    const states = {};
    for (const uname of Object.keys(users)) {
      try {
        const raw = localStorage.getItem('numi-user-state-' + uname);
        if (raw) states[uname] = JSON.parse(raw);
      } catch {}
    }
    return {
      format: 'numiquick-system-v1',
      exportedAt: new Date().toISOString(),
      users,
      states,
      targetedAssignments: loadTargetedAssignments()
    };
  }

  function restoreFullSystemBackup(payload) {
    if (!payload || payload.format !== 'numiquick-system-v1' || !payload.users || typeof payload.users !== 'object') {
      return false;
    }
    if (typeof saveLocalUsers === 'function') saveLocalUsers(payload.users);
    if (payload.states && typeof payload.states === 'object') {
      for (const [uname, st] of Object.entries(payload.states)) {
        try { localStorage.setItem('numi-user-state-' + uname, JSON.stringify(st)); } catch {}
      }
    }
    if (Array.isArray(payload.targetedAssignments)) {
      saveTargetedAssignments(payload.targetedAssignments);
    }
    return true;
  }


  const exportsMap = { loadTargetedAssignments, saveTargetedAssignments, createTargetedAssignment, deleteTargetedAssignment, getAssignmentsForStudent, submitTargetedAssignment, buildHomeworkShareLink, parseHomeworkShareHash, startTargetedAssignment, computeAdminAnalytics, updateStudentByAdmin, batchPromoteGrade, assignRemedialForStudent, buildFullSystemBackup, restoreFullSystemBackup };
  if (typeof window !== 'undefined') Object.assign(window, exportsMap);
  if (typeof global !== 'undefined') Object.assign(global, exportsMap);
  // Everything the Admin Center UI needs, including helpers that are not global.
  const shared = { ...exportsMap, PENDING_HW_KEY, localDateKey, upsertAssignmentFromSharePayload, handleIncomingHomeworkHash };
  if (typeof window !== 'undefined') window.NumiAdminData = shared;
  if (typeof global !== 'undefined') global.NumiAdminData = shared;
})();
