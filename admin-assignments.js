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
    const rawGrade = assignCfg?.grade;
    const resolvedGrade = rawGrade === 'custom' ? 'custom' : (Number(rawGrade) >= 1 && Number(rawGrade) <= 9 ? Number(rawGrade) : (base.grade || 1));
    const resolvedSec = Number(assignCfg?.customPresetSeconds) > 0
      ? Number(assignCfg.customPresetSeconds)
      : (Number(assignCfg?.seconds) || 20);
    const cfg = {
      ...base,
      ...(assignCfg || {}),
      grade: resolvedGrade,
      ops: Array.isArray(assignCfg?.ops) && assignCfg.ops.length ? [...assignCfg.ops] : [...(base.ops || ['+'])],
      types: Array.isArray(assignCfg?.types) && assignCfg.types.length ? [...assignCfg.types] : [assignCfg?.type || base.type || 'natural'],
      digits: Array.isArray(assignCfg?.digits) && assignCfg.digits.length ? assignCfg.digits.map(Number).filter(Boolean) : [...(base.digits || [1])],
      count: Math.max(1, Math.min(50, Number(assignCfg?.count) || 10)),
      seconds: Math.max(5, Math.min(120, resolvedSec)),
      customPresetSeconds: Number(assignCfg?.customPresetSeconds) > 0 ? Math.max(5, Math.min(120, Number(assignCfg.customPresetSeconds))) : null,
      untimed: Boolean(assignCfg?.untimed),
      difficultyMode: ['progressive', 'easy', 'medium', 'hard'].includes(assignCfg?.difficultyMode) ? assignCfg.difficultyMode : 'progressive',
      domainFilter: ['all', 'number', 'geometry'].includes(assignCfg?.domainFilter) ? assignCfg.domainFilter : 'all',
      topic: assignCfg?.topic || 'all',
      topics: Array.isArray(assignCfg?.topics) ? assignCfg.topics.filter(id => id && id !== 'all') : [],
      questionStyle: assignCfg?.questionStyle || 'normal',
      termCount: Math.max(2, Math.min(6, Number(assignCfg?.termCount) || 3)),
      inputMode: assignCfg?.inputMode === 'numpad' ? 'numpad' : 'choices'
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
      <p class="muted">${esc(formatAssignmentSummary(asg))}${asg.due_date ? ` · ${t('Hạn:', 'Due:')} ${esc(asg.due_date)}` : ''}</p>
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
    const ac = assignment.config;
    config = {
      ...base,
      ...ac,
      grade: ac.grade === 'custom' ? 'custom' : (Number(ac.grade) || base.grade || 1),
      ops: Array.isArray(ac.ops) && ac.ops.length ? [...ac.ops] : ['+'],
      types: Array.isArray(ac.types) && ac.types.length ? [...ac.types] : [ac.type || 'natural'],
      digits: Array.isArray(ac.digits) && ac.digits.length ? ac.digits.map(Number).filter(Boolean) : [1],
      topic: ac.topic || 'all',
      topics: Array.isArray(ac.topics) ? [...ac.topics] : [],
      domainFilter: ac.domainFilter || 'all',
      difficultyMode: ac.difficultyMode || 'progressive',
      termCount: Number(ac.termCount) || 3,
      customPresetSeconds: Number(ac.customPresetSeconds) > 0 ? Number(ac.customPresetSeconds) : null,
      untimed: Boolean(ac.untimed)
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

  function formatAssignmentSummary(asg) {
    const cfg = asg?.config || {};
    const count = Number(cfg.count) || 10;
    const isCustom = cfg.grade === 'custom';
    const g = isCustom ? null : (Number(cfg.grade) || 1);
    const isSec = Boolean(g && g >= 6);
    const modeLabel = cfg.inputMode === 'numpad' ? t('Tự luận', 'Free Input') : t('Trắc nghiệm', 'MCQ');
    const customSec = Number(cfg.customPresetSeconds) > 0 ? Number(cfg.customPresetSeconds) : null;
    const autoUntimed = Boolean(isSec && cfg.inputMode === 'numpad' && !customSec);
    const isUntimed = Boolean(cfg.untimed) || autoUntimed;
    const timeStr = isUntimed
      ? t('Không giới hạn giờ', 'Untimed')
      : `${customSec || Number(cfg.seconds) || 20}s/${t('câu', 'q')}`;

    if (isCustom) {
      const symMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };
      const opsStr = (Array.isArray(cfg.ops) && cfg.ops.length ? cfg.ops : ['+']).map(o => symMap[o] || o).join(' ');
      const styleMap = {
        normal: t('Tính nhẩm', 'Calculation'),
        convenient: t('Tính thuận tiện', 'Regrouping'),
        expression: t('Biểu thức', 'Expressions'),
        missing: t('Tìm số (?)', 'Missing (?)'),
        word: t('Toán đố', 'Word Problem')
      };
      const styleStr = styleMap[cfg.questionStyle] || styleMap.normal;
      return `${t('Tùy chỉnh', 'Custom')} (${opsStr} · ${styleStr}) · ${count} ${t('câu', 'qs')} · ${timeStr} · ${modeLabel}`;
    }

    const topicList = typeof NUMI_GRADE_TOPICS !== 'undefined' && Array.isArray(NUMI_GRADE_TOPICS[g]) ? NUMI_GRADE_TOPICS[g] : [];
    const selectedIds = Array.isArray(cfg.topics) && cfg.topics.length
      ? cfg.topics.filter(id => id && id !== 'all')
      : (cfg.topic && cfg.topic !== 'all' ? [cfg.topic] : []);
    let scopeStr = '';
    if (selectedIds.length) {
      const names = selectedIds.slice(0, 2).map(id => {
        const hit = topicList.find(x => x.id === id);
        return hit ? (typeof lang !== 'undefined' && lang === 'en' ? hit.en : hit.vi) : id;
      });
      scopeStr = names.join(' · ') + (selectedIds.length > 2 ? ` +${selectedIds.length - 2}` : '');
    } else if (isSec && cfg.domainFilter === 'number') {
      scopeStr = t('Số học', 'Numbers & Algebra');
    } else if (isSec && cfg.domainFilter === 'geometry') {
      scopeStr = t('Hình học', 'Geometry');
    } else {
      scopeStr = t('Tổng hợp', 'Mixed');
    }
    const diffShort = {
      progressive: t('Dễ→Khó', 'Easy→Hard'),
      easy: t('Nhận biết', 'Easy'),
      medium: t('Thông hiểu', 'Medium'),
      hard: t('Vận dụng', 'Hard')
    }[cfg.difficultyMode || 'progressive'] || '';
    return `${t('Lớp', 'Gr')} ${g} (${scopeStr}${diffShort ? ` · ${diffShort}` : ''}) · ${count} ${t('câu', 'qs')} · ${timeStr} · ${modeLabel}`;
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


  function mountAssignmentExercisePicker(container, initialCfg = {}, opts = {}) {
    if (!container) return null;
    const initG = initialCfg.grade === 'custom' ? 'custom' : (Number(initialCfg.grade) >= 1 && Number(initialCfg.grade) <= 9 ? Number(initialCfg.grade) : 4);
    const topicsMap = typeof NUMI_GRADE_TOPICS !== 'undefined' ? NUMI_GRADE_TOPICS : {};
    const gradesMap = typeof NUMI_GRADES !== 'undefined' ? NUMI_GRADES : {};
    const getRec = (g, ids) => (typeof getRecommendedTiming === 'function' ? getRecommendedTiming(g, ids) : { count: 10, seconds: 25, minSeconds: 25, maxSeconds: 25 });

    const st = {
      grade: initG,
      domainFilter: ['all', 'number', 'geometry'].includes(initialCfg.domainFilter) ? initialCfg.domainFilter : 'all',
      topics: Array.isArray(initialCfg.topics) ? initialCfg.topics.filter(id => id && id !== 'all') : (initialCfg.topic && initialCfg.topic !== 'all' ? [initialCfg.topic] : []),
      difficultyMode: ['progressive', 'easy', 'medium', 'hard'].includes(initialCfg.difficultyMode) ? initialCfg.difficultyMode : 'progressive',
      count: Number(initialCfg.count) || (initG === 'custom' ? 10 : getRec(initG, []).count),
      manualCount: Number(initialCfg.count) > 0,
      untimed: Boolean(initialCfg.untimed),
      customPresetSeconds: Number(initialCfg.customPresetSeconds) > 0 ? Number(initialCfg.customPresetSeconds) : null,
      inputMode: initialCfg.inputMode === 'numpad' ? 'numpad' : 'choices',
      // Custom mental math fields (matching setup + advanced.js + pedagogy.js)
      ops: Array.isArray(initialCfg.ops) && initialCfg.ops.length ? [...initialCfg.ops] : ['+', '-'],
      types: Array.isArray(initialCfg.types) && initialCfg.types.length ? [...initialCfg.types] : [initialCfg.type || 'natural'],
      digits: Array.isArray(initialCfg.digits) && initialCfg.digits.length ? initialCfg.digits.map(Number).filter(Boolean) : [1, 2],
      questionStyle: ['normal', 'convenient', 'expression', 'missing'].includes(initialCfg.questionStyle) ? initialCfg.questionStyle : 'normal',
      termCount: Math.max(2, Math.min(6, Number(initialCfg.termCount) || 3)),
      customSeconds: Number(initialCfg.seconds) || 20,
      showKnowledge: false,
      previewQuestions: null
    };

    const getConfig = () => {
      if (st.grade === 'custom') {
        let effTypes = [...st.types];
        if (st.questionStyle === 'convenient') effTypes = ['natural'];
        else if (st.questionStyle === 'expression') {
          effTypes = effTypes.filter(x => x === 'natural' || x === 'fraction');
          if (!effTypes.length) effTypes = ['natural'];
        }
        return {
          ...(typeof defaults !== 'undefined' ? defaults : {}),
          grade: 'custom',
          ops: [...st.ops],
          types: effTypes,
          type: effTypes[0] || 'natural',
          digits: [...st.digits],
          questionStyle: st.questionStyle,
          termCount: st.termCount,
          count: Math.max(1, Math.min(50, Number(st.count) || 10)),
          seconds: Math.max(5, Math.min(120, Number(st.customSeconds) || 20)),
          customPresetSeconds: st.untimed ? null : Math.max(5, Math.min(120, Number(st.customSeconds) || 20)),
          untimed: Boolean(st.untimed),
          inputMode: st.inputMode,
          topic: 'all',
          topics: [],
          domainFilter: 'all'
        };
      }
      const g = Number(st.grade) || 4;
      const gDef = gradesMap[g] || { ops: ['+', '-', '*', '/'], types: ['natural'], digits: [1, 2], seconds: 20 };
      const list = Array.isArray(topicsMap[g]) ? topicsMap[g] : [];
      const allSpec = list.filter(x => x.id !== 'all');
      const domIds = g >= 6 && st.domainFilter !== 'all'
        ? allSpec.filter(x => x.domain === st.domainFilter).map(x => x.id)
        : [];
      const rec = getRec(g, st.topics.length ? st.topics : domIds);
      const secVal = st.customPresetSeconds ? st.customPresetSeconds : (rec.seconds || gDef.seconds || 20);
      const autoUntimed = Boolean(g >= 6 && st.inputMode === 'numpad' && !st.customPresetSeconds);
      return {
        ...(typeof defaults !== 'undefined' ? defaults : {}),
        grade: g,
        ops: gDef.ops ? [...gDef.ops] : ['+', '-', '*', '/'],
        types: gDef.types ? [...gDef.types] : ['natural'],
        type: (gDef.types && gDef.types[0]) || 'natural',
        digits: gDef.digits ? [...gDef.digits] : [1, 2],
        questionStyle: 'normal',
        count: Math.max(1, Math.min(50, Number(st.count) || rec.count || 10)),
        seconds: Math.max(5, Math.min(120, secVal)),
        customPresetSeconds: st.customPresetSeconds || null,
        untimed: Boolean(st.untimed) || autoUntimed,
        difficultyMode: st.difficultyMode,
        domainFilter: g >= 6 ? st.domainFilter : 'all',
        inputMode: st.inputMode,
        topic: st.topics.length === 1 ? st.topics[0] : 'all',
        topics: [...st.topics]
      };
    };

    const getSuggestedTitle = () => {
      if (st.grade === 'custom') {
        const sym = { '+': '+', '-': '−', '*': '×', '/': '÷' };
        return t(`Luyện tính nhẩm (${st.ops.map(o => sym[o] || o).join(' ')})`, `Mental Math (${st.ops.map(o => sym[o] || o).join(' ')})`);
      }
      const g = Number(st.grade) || 4;
      const list = Array.isArray(topicsMap[g]) ? topicsMap[g] : [];
      if (st.topics.length === 1) {
        const hit = list.find(x => x.id === st.topics[0]);
        if (hit) return t(`Lớp ${g}: ${hit.vi}`, `Gr ${g}: ${hit.en}`).slice(0, 80);
      }
      if (st.topics.length > 1) {
        return t(`Ôn tập ${st.topics.length} chuyên đề Lớp ${g}`, `Gr ${g} ${st.topics.length}-Topic Practice`);
      }
      if (g >= 6 && st.domainFilter === 'number') return t(`Ôn tập Số học Lớp ${g}`, `Gr ${g} Numbers & Algebra`);
      if (g >= 6 && st.domainFilter === 'geometry') return t(`Ôn tập Hình học Lớp ${g}`, `Gr ${g} Geometry`);
      return t(`Ôn tập tổng hợp Lớp ${g}`, `Grade ${g} Mixed Practice`);
    };

    const toggleArr = (arr, val, allowEmpty = false) => {
      const cur = Array.isArray(arr) ? arr : [];
      if (cur.includes(val)) {
        if (!allowEmpty && cur.length <= 1) return cur;
        return cur.filter(x => x !== val);
      }
      return [...cur, val];
    };

    const fmtRange = rec => (rec && rec.minSeconds && rec.maxSeconds && rec.minSeconds !== rec.maxSeconds)
      ? `${rec.minSeconds}s–${rec.maxSeconds}s`
      : `${rec?.seconds || 25}s`;

    const notify = () => {
      if (typeof opts.onChange === 'function') opts.onChange(getConfig(), getSuggestedTitle());
    };

    const render = () => {
      const isCustom = st.grade === 'custom';
      const activeLvl = isCustom ? 'custom' : (Number(st.grade) >= 6 ? 'secondary' : 'primary');
      const g = isCustom ? null : (Number(st.grade) || 4);
      const gradeInfo = g ? gradesMap[g] : null;
      const isSec = Boolean(g && g >= 6);
      const list = g && Array.isArray(topicsMap[g]) ? topicsMap[g] : [];
      const allSpec = list.filter(x => x.id !== 'all');
      const validIds = new Set(allSpec.map(x => x.id));
      st.topics = st.topics.filter(id => validIds.has(id));
      const numberTopics = allSpec.filter(x => x.domain !== 'geometry');
      const geomTopics = allSpec.filter(x => x.domain === 'geometry');
      const domIds = isSec && st.domainFilter !== 'all'
        ? allSpec.filter(x => x.domain === st.domainFilter).map(x => x.id)
        : allSpec.map(x => x.id);
      const isAllMode = st.topics.length === 0;
      const effTimingIds = st.topics.length ? st.topics : (isSec && st.domainFilter !== 'all' ? domIds : []);
      const curRec = g ? getRec(g, effTimingIds) : { count: st.count, seconds: st.customSeconds, minSeconds: st.customSeconds, maxSeconds: st.customSeconds };
      const activeTopicCnt = isAllMode ? Math.max(1, domIds.length) : st.topics.length;
      const splitStr = typeof formatSplitHint === 'function' ? formatSplitHint(st.count, activeTopicCnt) : '';
      const timeRangeText = fmtRange(curRec);
      const isUntimedActive = isCustom
        ? Boolean(st.untimed)
        : Boolean(st.untimed) || (!st.customPresetSeconds && isSec && st.inputMode === 'numpad');
      const isDefaultTimer = !st.untimed && !st.customPresetSeconds;
      const sameSet = (a, b) => a.length > 0 && a.length === b.length && a.every(x => b.includes(x));
      const mentalIds = list.filter(x => x.kind === 'mental').map(x => x.id);
      const colIds = list.filter(x => x.col).map(x => x.id);
      const knowledgeIds = list.filter(x => x.kind === 'knowledge').map(x => x.id);
      const quickCounts = [5, 8, 10, 12, 15, 20];
      const quickSecs = [20, 30, 45, 60, 90];

      const renderTopicPill = tp => {
        const active = tp.id === 'all' ? (isAllMode && st.domainFilter === 'all') : st.topics.includes(tp.id);
        const shownSec = st.customPresetSeconds || tp.seconds;
        const secTag = !isUntimedActive && shownSec ? ` <small class="tp-sec-tag">${shownSec}s</small>` : '';
        return `<button type="button" class="grade-topic-pill ${tp.domain === 'geometry' && isSec ? 'is-geom-pill' : ''} ${active ? 'active' : ''}" data-asg-topic="${esc(tp.id)}">${esc(typeof lang !== 'undefined' && lang === 'en' ? tp.en : tp.vi)}${secTag}</button>`;
      };

      const renderGradeTopicsSection = () => {
        if (isCustom) return '';
        const allBtn = list.find(x => x.id === 'all');
        const topicsBody = isSec
          ? (st.domainFilter === 'number'
              ? `<div class="grade-topics-list">${numberTopics.map(renderTopicPill).join('')}</div>`
              : st.domainFilter === 'geometry'
                ? `<div class="grade-topics-list">${geomTopics.map(renderTopicPill).join('')}</div>`
                : `<div class="grade-topics-list" style="margin-bottom:8px">${allBtn ? renderTopicPill(allBtn) : ''}</div>
                   <div class="sec-stream-group">
                     <div class="sec-stream-lbl">${t(`Số học (${numberTopics.length} chuyên đề)`, `Numbers & Algebra (${numberTopics.length} topics)`)}</div>
                     <div class="grade-topics-list">${numberTopics.map(renderTopicPill).join('')}</div>
                   </div>
                   <div class="sec-stream-group" style="margin-top:8px">
                     <div class="sec-stream-lbl is-geom">${t(`Hình học (${geomTopics.length} chuyên đề)`, `Geometry (${geomTopics.length} topics)`)}</div>
                     <div class="grade-topics-list">${geomTopics.map(renderTopicPill).join('')}</div>
                   </div>`)
          : `<div class="grade-topics-list">${list.map(renderTopicPill).join('')}</div>`;

        const statusBadge = isAllMode
          ? (isSec && st.domainFilter === 'number'
              ? t(`Đang chọn Số học (${numberTopics.length} chuyên đề)`, `Numbers & Algebra (${numberTopics.length})`)
              : isSec && st.domainFilter === 'geometry'
                ? t(`Đang chọn Hình học (${geomTopics.length} chuyên đề)`, `Geometry (${geomTopics.length})`)
                : t(`Đề tổng hợp (${validIds.size} dạng trộn đều)`, `Full Mixed (${validIds.size} topics)`))
          : t(`Đã chọn ${st.topics.length}/${validIds.size} chuyên đề (chạm thêm để ghép)`, `${st.topics.length}/${validIds.size} selected (tap more to mix)`);

        const knowledgeHtml = st.showKnowledge && typeof buildKnowledgeCardHtml === 'function'
          ? `<div class="asg-knowledge-drawer">${buildKnowledgeCardHtml(g, isSec ? st.domainFilter : 'all', true)}</div>`
          : '';

        return `
          <div class="grade-topics-wrap" style="margin-top:10px">
            <div class="grade-topics-head">
              <div class="grade-topics-title">
                <span>${t(`Chuyên đề Lớp ${g} (Chuẩn GDPT 2018):`, `Grade ${g} Topics (GDPT 2018):`)}</span>
                <span class="grade-topics-status">${statusBadge} · <strong class="grade-timing-chip ${isUntimedActive ? 'is-untimed' : ''}">${isUntimedActive ? t('Không giới hạn giờ', 'Untimed') : (st.customPresetSeconds ? `${st.customPresetSeconds}s/${t('câu', 'q')}` : `${timeRangeText}/${t('câu', 'q')}`)}</strong></span>
              </div>
              <div class="grade-topics-quick-row">
                ${typeof buildKnowledgeCardHtml === 'function' ? `<button type="button" class="grade-topics-quick-btn kh-open-btn ${st.showKnowledge ? 'is-on' : ''}" id="asgToggleKnowledgeBtn">${st.showKnowledge ? t('Ẩn công thức', 'Hide Notes') : t(`Lý thuyết & Công thức Lớp ${g}`, `Gr ${g} Notes`)}</button>` : ''}
                ${!isSec && mentalIds.length ? `<button type="button" class="grade-topics-quick-btn ${sameSet(st.topics, mentalIds) ? 'is-on' : ''}" id="asgQuickMentalBtn">${t('Tính nhẩm nhanh', 'Mental Math')}</button>` : ''}
                ${!isSec && colIds.length ? `<button type="button" class="grade-topics-quick-btn ${sameSet(st.topics, colIds) ? 'is-on' : ''}" id="asgQuickColBtn">${t('Đặt tính', 'Column')}</button>` : ''}
                ${!isSec && knowledgeIds.length ? `<button type="button" class="grade-topics-quick-btn ${sameSet(st.topics, knowledgeIds) ? 'is-on' : ''}" id="asgQuickKnowBtn">${t('Toán giải & Ôn tập', 'Word & Review')}</button>` : ''}
              </div>
            </div>
            ${knowledgeHtml}
            ${isSec ? `
              <div class="sec-domain-bar" role="tablist">
                <button type="button" class="sec-dom-tab ${st.domainFilter === 'all' && isAllMode ? 'active' : ''}" data-asg-dom="all">${t(`Tất cả (${allSpec.length})`, `All (${allSpec.length})`)}</button>
                <button type="button" class="sec-dom-tab ${st.domainFilter === 'number' ? 'active' : ''}" data-asg-dom="number">${t(`Số học (${numberTopics.length})`, `Numbers & Algebra (${numberTopics.length})`)}</button>
                <button type="button" class="sec-dom-tab is-geom ${st.domainFilter === 'geometry' ? 'active' : ''}" data-asg-dom="geometry">${t(`Hình học (${geomTopics.length})`, `Geometry (${geomTopics.length})`)}</button>
              </div>` : ''}
            ${topicsBody}
            <div class="preset-diff-bar">
              <span class="preset-count-lbl">${t('Mức độ bài tập:', 'Difficulty:')}</span>
              <div class="preset-diff-chips">
                <button type="button" class="preset-diff-chip ${st.difficultyMode === 'progressive' ? 'active' : ''}" data-asg-diff="progressive">${t('Lộ trình Dễ → Khó (Chuẩn đề thi)', 'Progressive (Easy → Hard)')}</button>
                <button type="button" class="preset-diff-chip ${st.difficultyMode === 'easy' ? 'active' : ''}" data-asg-diff="easy">${t('Nhận biết (Dễ)', 'Lv1 Easy')}</button>
                <button type="button" class="preset-diff-chip ${st.difficultyMode === 'medium' ? 'active' : ''}" data-asg-diff="medium">${t('Thông hiểu (Vừa)', 'Lv2 Medium')}</button>
                <button type="button" class="preset-diff-chip ${st.difficultyMode === 'hard' ? 'active' : ''}" data-asg-diff="hard">${t('Vận dụng & Bài giải (Khó)', 'Lv3 Hard & Word')}</button>
              </div>
            </div>
          </div>
        `;
      };

      const renderCustomSection = () => {
        if (!isCustom) return '';
        const hideNonNat = st.questionStyle === 'convenient';
        const onlyNatFrac = st.questionStyle === 'expression';
        return `
          <div class="asg-custom-grid">
            <div class="asg-custom-block">
              <span class="preset-count-lbl">1. ${t('Phép tính cần luyện:', 'Operations:')}</span>
              <div class="grade-topics-list">
                ${[['+', '+'], ['-', '−'], ['*', '×'], ['/', '÷']].map(([v, sym]) => `<button type="button" class="grade-topic-pill ${st.ops.includes(v) ? 'active' : ''}" data-asg-op="${v}">${sym}</button>`).join('')}
              </div>
            </div>
            <div class="asg-custom-block">
              <span class="preset-count-lbl">2. ${t('Loại số:', 'Number types:')}</span>
              <div class="grade-topics-list">
                ${[['natural', 'Số tự nhiên', 'Whole'], ['negative', 'Số âm', 'Negative'], ['decimal', 'Số thập phân', 'Decimal'], ['fraction', 'Phân số', 'Fraction'], ['remainder', 'Chia có dư', 'Remainder']].map(([k, vi, en]) => {
                  const dis = (hideNonNat && k !== 'natural') || (onlyNatFrac && k !== 'natural' && k !== 'fraction');
                  return `<button type="button" class="grade-topic-pill ${st.types.includes(k) && !dis ? 'active' : ''}" data-asg-type="${k}" ${dis ? 'disabled style="opacity:.45;cursor:not-allowed"' : ''}>${t(vi, en)}</button>`;
                }).join('')}
              </div>
            </div>
            <div class="asg-custom-block">
              <span class="preset-count-lbl">3. ${t('Số có mấy chữ số:', 'Digits:')}</span>
              <div class="grade-topics-list">
                ${[1, 2, 3, 4, 5, 6].map(d => `<button type="button" class="preset-cnt-chip ${st.digits.includes(d) ? 'active' : ''}" data-asg-digit="${d}">${d}</button>`).join('')}
                <button type="button" class="grade-topics-quick-btn ${st.digits.length === 6 ? 'is-on' : ''}" id="asgRandDigitsBtn">${t('Ngẫu nhiên 1–6', 'Random 1–6')}</button>
              </div>
            </div>
            <div class="asg-custom-block asg-custom-style-row">
              <label>${t('4. Kiểu bài tính nhẩm:', '4. Calculation style:')}
                <select id="asgCustomStyleSel">
                  <option value="normal" ${st.questionStyle === 'normal' ? 'selected' : ''}>${t('Tính từng phép tính', 'One calculation at a time')}</option>
                  <option value="convenient" ${st.questionStyle === 'convenient' ? 'selected' : ''}>${t('Tính thuận tiện · gộp số tròn', 'Regroup to make round numbers')}</option>
                  <option value="expression" ${st.questionStyle === 'expression' ? 'selected' : ''}>${t('Biểu thức nhiều phép tính', 'Multi-operation expressions')}</option>
                  <option value="missing" ${st.questionStyle === 'missing' ? 'selected' : ''}>${t('Tìm thành phần phép tính còn thiếu (?)', 'Missing number in calculation (?)')}</option>
                </select>
              </label>
              <label>${t('Số phép tính:', 'Number of terms:')}
                <select id="asgCustomTermSel" ${st.questionStyle === 'normal' || st.questionStyle === 'missing' ? 'disabled' : ''}>
                  ${[2, 3, 4, 5, 6].map(n => `<option value="${n}" ${st.termCount === n ? 'selected' : ''}>${n}</option>`).join('')}
                </select>
              </label>
            </div>
          </div>
        `;
      };

      const previewHtml = Array.isArray(st.previewQuestions) && st.previewQuestions.length
        ? `<div class="asg-preview-list">
            ${st.previewQuestions.map((q, idx) => {
              const promptHtml = typeof formatQuestionPrompt === 'function' ? formatQuestionPrompt(q.q) : esc(q.q);
              const figHtml = typeof buildQuestionFigureSvg === 'function' ? buildQuestionFigureSvg(q, { forPrint: false }) : '';
              const ansHtml = typeof mathMarkup === 'function' ? mathMarkup(q.answer) : esc(q.answer);
              return `<div class="asg-preview-item">
                <div class="asg-preview-q"><b>${t('Câu', 'Q')} ${idx + 1}:</b> <span>${promptHtml}</span></div>
                ${figHtml}
                <div class="asg-preview-meta">
                  ${q.topicLabel ? `<span class="asg-preview-tag">${esc(q.topicLabel)}</span>` : ''}
                  ${q.difficultyLabel ? `<span class="asg-preview-tag">${esc(q.difficultyLabel)}</span>` : ''}
                  <span class="asg-preview-ans">${t('Đáp án:', 'Ans:')} <b>${ansHtml}</b></span>
                </div>
              </div>`;
            }).join('')}
          </div>`
        : '';

      const summaryTxt = formatAssignmentSummary({ config: getConfig() });

      container.innerHTML = `
        <div class="asg-picker-box">
          <div class="grade-header" style="margin-bottom:8px">
            <span class="grade-title">${t('Chọn bài tập (Chuẩn như giao diện học sinh):', 'Choose Practice Content (Matches Student App):')}</span>
            <span class="grade-badge">${isCustom ? t('Tùy chỉnh · Tính nhẩm', 'Custom · Mental Math') : (gradeInfo ? (typeof lang !== 'undefined' && lang === 'en' ? gradeInfo.enName : gradeInfo.name) : `${t('Lớp', 'Gr')} ${g}`)}</span>
          </div>
          <div class="level-seg-control" role="tablist">
            <button type="button" class="level-seg-btn ${activeLvl === 'primary' ? 'active' : ''}" data-asg-lvl="primary">${t('Tiểu học <span class="seg-sub">(Lớp 1–5)</span>', 'Primary <span class="seg-sub">(Gr 1–5)</span>')}</button>
            <button type="button" class="level-seg-btn ${activeLvl === 'secondary' ? 'active' : ''}" data-asg-lvl="secondary">${t('THCS <span class="seg-sub">(Lớp 6–9)</span>', 'Secondary <span class="seg-sub">(Gr 6–9)</span>')}</button>
            <button type="button" class="level-seg-btn ${activeLvl === 'custom' ? 'active' : ''}" data-asg-lvl="custom">${t('Tùy chỉnh <span class="seg-sub">(Tính nhẩm)</span>', 'Custom <span class="seg-sub">(Mental Math)</span>')}</button>
          </div>
          ${!isCustom ? `
            <div class="grade-subgrid" style="margin-bottom:6px">
              ${(activeLvl === 'secondary' ? [6, 7, 8, 9] : [1, 2, 3, 4, 5]).map(gr => `<button type="button" class="grade-tab ${g === gr ? 'active' : ''}" data-asg-grade="${gr}">${t('Lớp', 'Gr')} ${gr}</button>`).join('')}
            </div>
            <p class="grade-desc" style="margin:4px 0 0;font-size:12px">${gradeInfo ? esc(typeof lang !== 'undefined' && lang === 'en' ? gradeInfo.descEn : gradeInfo.descVi) : ''}</p>
          ` : `
            <div class="grade-custom-banner" style="margin-bottom:8px"><b>${t('Chế độ Tùy chỉnh — Bài tập tính nhẩm & Phản xạ phép tính', 'Custom Mode — Mental Math & Calculation Practice')}</b><p>${t('Luyện tính nhẩm thuần túy theo đúng phép tính, loại số và số chữ số bạn chọn.', 'Pure arithmetic calculation drills with custom operations, number types, and digits.')}</p></div>
          `}

          ${renderGradeTopicsSection()}
          ${renderCustomSection()}

          <div class="preset-count-bar">
            <span class="preset-count-lbl">${t('Số câu luyện:', 'Questions:')}</span>
            <div class="preset-count-chips">
              ${quickCounts.map(n => `<button type="button" class="preset-cnt-chip ${st.count === n ? 'active' : ''}" data-asg-cnt="${n}">${n}</button>`).join('')}
            </div>
            <input type="number" id="asgCountInput" class="preset-cnt-input" min="1" max="50" value="${st.count}" inputmode="numeric">
            ${!isCustom && splitStr ? `<span class="preset-split-badge">${activeTopicCnt > 1 ? t(`Chia đều ${activeTopicCnt} dạng`, `Even split (${activeTopicCnt})`) + ` (${splitStr})` : (isUntimedActive ? t('Không giới hạn giờ', 'Untimed') : (st.customPresetSeconds ? `${st.customPresetSeconds}s/${t('câu', 'q')}` : `${timeRangeText}/${t('câu', 'q')}`))}</span>` : ''}
          </div>

          <div class="preset-count-bar">
            <span class="preset-count-lbl">${t('Thời gian mỗi câu:', 'Time per question:')}</span>
            <div class="preset-count-chips">
              ${!isCustom ? `<button type="button" class="preset-cnt-chip ${isDefaultTimer ? 'active' : ''}" data-asg-timer="auto">${t('Mặc định từng dạng', 'Per-topic default')} (${timeRangeText})</button>` : ''}
              ${quickSecs.map(s => `<button type="button" class="preset-cnt-chip ${!st.untimed && (isCustom ? st.customSeconds === s : st.customPresetSeconds === s) ? 'active' : ''}" data-asg-timer="${s}">${s}s</button>`).join('')}
              <button type="button" class="preset-cnt-chip ${st.untimed ? 'active' : ''}" data-asg-timer="untimed">${t('Không giới hạn', 'Untimed')}</button>
            </div>
          </div>

          <div class="preset-count-bar">
            <span class="preset-count-lbl">${t('Cách trả lời:', 'Answer mode:')}</span>
            <div class="preset-count-chips">
              <button type="button" class="preset-cnt-chip ${st.inputMode === 'choices' ? 'active' : ''}" data-asg-mode="choices">${t('Trắc nghiệm (4 đáp án)', 'Multiple Choice')}</button>
              <button type="button" class="preset-cnt-chip ${st.inputMode === 'numpad' ? 'active' : ''}" data-asg-mode="numpad">${t('Tự luận (Gõ/Bấm số · THCS tự bỏ giới hạn giờ)', 'Free Input (Untimed in Gr 6–9)')}</button>
            </div>
          </div>

          <div class="asg-summary-bar">
            <div class="lesson-summary" style="margin:0;flex:1">${esc(summaryTxt)}</div>
            <button type="button" class="grade-topics-quick-btn" id="asgPreviewSampleBtn">👁️ ${t('Xem thử 3 câu mẫu', 'Preview 3 Questions')}</button>
          </div>
          ${previewHtml}
        </div>
      `;

      // Bind events
      container.querySelectorAll('[data-asg-lvl]').forEach(btn => {
        btn.onclick = () => {
          const lvl = btn.dataset.asgLvl;
          st.previewQuestions = null;
          st.showKnowledge = false;
          if (lvl === 'custom') {
            st.grade = 'custom';
            st.untimed = false;
            st.customPresetSeconds = null;
          } else if (lvl === 'secondary') {
            st.grade = (g && g >= 6) ? g : 6;
            st.topics = [];
            st.domainFilter = 'all';
            st.customPresetSeconds = null;
            st.untimed = false;
            if (!st.manualCount) st.count = getRec(st.grade, []).count;
          } else {
            st.grade = (g && g >= 1 && g <= 5) ? g : 4;
            st.topics = [];
            st.domainFilter = 'all';
            st.customPresetSeconds = null;
            st.untimed = false;
            if (!st.manualCount) st.count = getRec(st.grade, []).count;
          }
          render();
          notify();
        };
      });

      container.querySelectorAll('[data-asg-grade]').forEach(btn => {
        btn.onclick = () => {
          st.grade = Number(btn.dataset.asgGrade) || 4;
          st.topics = [];
          st.domainFilter = 'all';
          st.customPresetSeconds = null;
          st.untimed = false;
          st.showKnowledge = false;
          st.previewQuestions = null;
          if (!st.manualCount) st.count = getRec(st.grade, []).count;
          render();
          notify();
        };
      });

      container.querySelectorAll('[data-asg-dom]').forEach(btn => {
        btn.onclick = () => {
          st.domainFilter = btn.dataset.asgDom || 'all';
          st.topics = [];
          st.previewQuestions = null;
          if (!st.manualCount) {
            const ids = st.domainFilter === 'all' ? [] : allSpec.filter(x => x.domain === st.domainFilter).map(x => x.id);
            st.count = getRec(g, ids).count;
          }
          render();
          notify();
        };
      });

      const applyTopicSelection = nextIds => {
        const clean = nextIds.filter(id => validIds.has(id));
        st.topics = (clean.length === 0 || clean.length >= validIds.size) ? [] : clean;
        st.previewQuestions = null;
        if (!st.manualCount) {
          const domOnly = isSec && st.domainFilter !== 'all' ? domIds : [];
          st.count = getRec(g, st.topics.length ? st.topics : domOnly).count;
        }
        render();
        notify();
      };

      container.querySelectorAll('[data-asg-topic]').forEach(btn => {
        btn.onclick = () => {
          const chosen = btn.dataset.asgTopic;
          if (chosen === 'all') {
            st.domainFilter = 'all';
            applyTopicSelection([]);
            return;
          }
          const next = st.topics.includes(chosen)
            ? st.topics.filter(id => id !== chosen)
            : [...st.topics, chosen];
          applyTopicSelection(next);
        };
      });

      container.querySelector('#asgQuickMentalBtn')?.addEventListener('click', () => applyTopicSelection(mentalIds));
      container.querySelector('#asgQuickColBtn')?.addEventListener('click', () => applyTopicSelection(colIds));
      container.querySelector('#asgQuickKnowBtn')?.addEventListener('click', () => applyTopicSelection(knowledgeIds));
      container.querySelector('#asgToggleKnowledgeBtn')?.addEventListener('click', () => {
        st.showKnowledge = !st.showKnowledge;
        render();
      });

      container.querySelectorAll('[data-asg-diff]').forEach(btn => {
        btn.onclick = () => {
          st.difficultyMode = btn.dataset.asgDiff || 'progressive';
          st.previewQuestions = null;
          render();
          notify();
        };
      });

      container.querySelectorAll('[data-asg-op]').forEach(btn => {
        btn.onclick = () => {
          st.ops = toggleArr(st.ops, btn.dataset.asgOp);
          st.previewQuestions = null;
          render();
          notify();
        };
      });
      container.querySelectorAll('[data-asg-type]').forEach(btn => {
        btn.onclick = () => {
          if (btn.disabled) return;
          st.types = toggleArr(st.types, btn.dataset.asgType);
          st.previewQuestions = null;
          render();
          notify();
        };
      });
      container.querySelectorAll('[data-asg-digit]').forEach(btn => {
        btn.onclick = () => {
          st.digits = toggleArr(st.digits, Number(btn.dataset.asgDigit));
          st.previewQuestions = null;
          render();
          notify();
        };
      });
      container.querySelector('#asgRandDigitsBtn')?.addEventListener('click', () => {
        st.digits = [1, 2, 3, 4, 5, 6];
        st.previewQuestions = null;
        render();
        notify();
      });
      container.querySelector('#asgCustomStyleSel')?.addEventListener('change', e => {
        st.questionStyle = e.target.value || 'normal';
        st.previewQuestions = null;
        render();
        notify();
      });
      container.querySelector('#asgCustomTermSel')?.addEventListener('change', e => {
        st.termCount = Math.max(2, Math.min(6, Number(e.target.value) || 3));
        st.previewQuestions = null;
        render();
        notify();
      });

      container.querySelectorAll('[data-asg-cnt]').forEach(btn => {
        btn.onclick = () => {
          st.manualCount = true;
          st.count = Math.max(1, Math.min(50, Number(btn.dataset.asgCnt) || 10));
          render();
          notify();
        };
      });
      container.querySelector('#asgCountInput')?.addEventListener('change', e => {
        st.manualCount = true;
        st.count = Math.max(1, Math.min(50, Math.round(Number(e.target.value) || 10)));
        render();
        notify();
      });

      container.querySelectorAll('[data-asg-timer]').forEach(btn => {
        btn.onclick = () => {
          const val = btn.dataset.asgTimer;
          if (val === 'untimed') {
            st.untimed = true;
            st.customPresetSeconds = null;
          } else if (val === 'auto') {
            st.untimed = false;
            st.customPresetSeconds = null;
          } else {
            const s = Number(val) || 30;
            st.untimed = false;
            st.customPresetSeconds = s;
            st.customSeconds = s;
          }
          render();
          notify();
        };
      });

      container.querySelectorAll('[data-asg-mode]').forEach(btn => {
        btn.onclick = () => {
          st.inputMode = btn.dataset.asgMode === 'numpad' ? 'numpad' : 'choices';
          render();
          notify();
        };
      });

      container.querySelector('#asgPreviewSampleBtn')?.addEventListener('click', () => {
        const cfg = getConfig();
        let sample = [];
        if (typeof generateUniqueQuestions === 'function') {
          sample = generateUniqueQuestions(3, cfg) || [];
        } else if (typeof generate === 'function') {
          sample = [generate(cfg), generate(cfg), generate(cfg)].filter(Boolean);
        }
        st.previewQuestions = sample;
        render();
      });
    };

    render();
    return { getConfig, getSuggestedTitle, rerender: render };
  }

  if (typeof document !== 'undefined' && document.head && !(typeof document.getElementById === 'function' && document.getElementById('asgPickerStyle'))) {
    const pickerStyle = document.createElement('style');
    pickerStyle.id = 'asgPickerStyle';
    pickerStyle.textContent = `
      dialog#modal.tch-assign-wide-modal{width:min(95vw,860px)!important;max-width:860px!important;max-height:92vh!important;overflow-y:auto!important}
      .asg-picker-box{padding:12px 14px;border-radius:16px;background:#f8fbf6;border:1.5px solid #d9e9d6;display:grid;gap:8px}
      .asg-custom-grid{display:grid;gap:10px;padding-top:6px}
      .asg-custom-block{display:grid;gap:6px}
      .asg-custom-style-row{display:grid;grid-template-columns:1.4fr .8fr;gap:10px}
      .asg-summary-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:4px;padding-top:8px;border-top:1.5px dashed #dce8d6}
      .asg-preview-list{display:grid;gap:8px;margin-top:4px}
      .asg-preview-item{padding:9px 11px;border-radius:12px;background:#fff;border:1px solid #d5e5d4;display:grid;gap:5px}
      .asg-preview-q{font-size:14px;line-height:1.5;color:#1b3b28}
      .asg-preview-meta{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;font-size:12px}
      .asg-preview-tag{padding:2px 8px;border-radius:999px;background:#eef6ef;color:#27593e;font-weight:700}
      .asg-preview-ans{color:#155e36;font-weight:800}
      .asg-knowledge-drawer{max-height:280px;overflow-y:auto;padding:8px;border-radius:12px;background:#fff;border:1px solid #d4e6d6;margin:4px 0 8px}
      body.dark-mode .asg-picker-box{background:#15231b;border-color:#2b4637}
      body.dark-mode .asg-preview-item,body.dark-mode .asg-knowledge-drawer{background:#1a2b22;border-color:#2e4c3b}
      body.dark-mode .asg-preview-q{color:#e2f3e8}
      body.dark-mode .asg-preview-tag{background:#213a2c;color:#9ee3bc}
      body.dark-mode .asg-preview-ans{color:#86efac}
      @media(max-width:640px){.asg-custom-style-row{grid-template-columns:1fr}}
    `;
    document.head.append(pickerStyle);
  }

  const exportsMap = { loadTargetedAssignments, saveTargetedAssignments, createTargetedAssignment, deleteTargetedAssignment, getAssignmentsForStudent, submitTargetedAssignment, buildHomeworkShareLink, parseHomeworkShareHash, startTargetedAssignment, formatAssignmentSummary, mountAssignmentExercisePicker, computeAdminAnalytics, updateStudentByAdmin, batchPromoteGrade, assignRemedialForStudent, buildFullSystemBackup, restoreFullSystemBackup };
  if (typeof window !== 'undefined') Object.assign(window, exportsMap);
  if (typeof global !== 'undefined') Object.assign(global, exportsMap);
  // Everything the Admin Center UI needs, including helpers that are not global.
  const shared = { ...exportsMap, PENDING_HW_KEY, localDateKey, upsertAssignmentFromSharePayload, handleIncomingHomeworkHash };
  if (typeof window !== 'undefined') window.NumiAdminData = shared;
  if (typeof global !== 'undefined') global.NumiAdminData = shared;
})();
