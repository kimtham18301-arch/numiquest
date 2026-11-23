'use strict';
// Comprehensive Admin Center: 7-Day Activity Analytics, Learning Tiers, 1-Click Remedial,
// Direct Targeted Assignments for Specific Students, Student Editor, Batch Promotion, and Full Backup/Restore.
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

  // ---------------- Modals: Assign to Specific Students & Edit Student ----------------
  function openAssignToStudentsModal(preselectedUsers = []) {
    const students = typeof getStudentsSummary === 'function'
      ? getStudentsSummary().filter(s => s.role !== 'admin' && s.username !== 'admin')
      : [];
    if (!students.length) {
      toast(t('Chưa có học sinh nào. Hãy tạo tài khoản học sinh trước nhé.', 'No students available yet.'));
      return;
    }
    const preSet = new Set((preselectedUsers || []).map(x => String(x).toLowerCase()));
    const defaultDue = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10);
    const firstSelected = students.find(s => preSet.has(s.username)) || students[0];
    const defaultGrade = firstSelected?.grade || 1;
    const gradesInList = [...new Set(students.map(s => Number(s.grade) || 1))].sort((a, b) => a - b);

    modal(`<h2>📝 ${t('Giao bài cho học sinh cụ thể', 'Assign Homework to Specific Students')}</h2>
    <p class="muted">${t('Tích chọn 1 hoặc nhiều học sinh nhận bài tập này. Chỉ các bạn được chọn mới thấy bài trên trang chủ.', 'Select one or more students. Only selected students will see this task on their home screen.')}</p>
    <form id="targetedAssignForm" style="display:grid;gap:12px;margin-top:10px">
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:6px">
          <b style="font-size:13px">${t('Chọn học sinh nhận bài:', 'Select students:')}</b>
          <div style="display:flex;gap:4px;flex-wrap:wrap">
            <button type="button" class="adm-quick-pick" data-pick-grade="all">${t('Tất cả', 'All')}</button>
            ${gradesInList.map(g => `<button type="button" class="adm-quick-pick" data-pick-grade="${g}">${t('Lớp', 'Gr')} ${g}</button>`).join('')}
            <button type="button" class="adm-quick-pick" data-pick-grade="none">${t('Bỏ chọn', 'Clear')}</button>
          </div>
        </div>
        <div class="adm-student-checklist">
          ${students.map(s => `<label class="adm-check-chip">
            <input type="checkbox" name="targetStudents" value="${esc(s.username)}" data-grade="${s.grade}" ${preSet.has(s.username) ? 'checked' : ''}>
            <span><b>${esc(s.name)}</b> <small>(Lớp ${s.grade})</small></span>
          </label>`).join('')}
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:10px">
        <label>${t('Tên bài tập:', 'Assignment Title:')}
          <input name="title" maxlength="80" required placeholder="${t('VD: Ôn phép nhân 2 chữ số', 'e.g. 2-digit multiplication')}" value="${preSet.size === 1 && firstSelected ? esc(t(`Bài tập riêng cho ${firstSelected.name}`, `Practice for ${firstSelected.name}`)) : ''}">
        </label>
        <label>${t('Hạn nộp:', 'Due Date:')}
          <input name="dueDate" type="date" value="${defaultDue}">
        </label>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
        <label>${t('Khối lớp:', 'Grade:')}
          <select name="grade">${[1,2,3,4,5,6,7,8,9].map(g => `<option value="${g}" ${Number(defaultGrade) === g ? 'selected' : ''}>${t('Lớp', 'Grade')} ${g}</option>`).join('')}</select>
        </label>
        <label>${t('Kiểu câu hỏi:', 'Question Style:')}
          <select name="questionStyle">
            <option value="normal">${t('Tính thường', 'Standard')}</option>
            <option value="missing">${t('Điền số (?)', 'Missing (?)')}</option>
            <option value="word">${t('Toán đố ngắn', 'Word Problem')}</option>
            <option value="convenient">${t('Tính thuận tiện', 'Regrouping')}</option>
            <option value="expression">${t('Biểu thức', 'Expression')}</option>
          </select>
        </label>
        <label>${t('Loại số:', 'Number Type:')}
          <select name="type">
            <option value="natural">${t('Số tự nhiên', 'Whole')}</option>
            <option value="fraction">${t('Phân số', 'Fractions')}</option>
            <option value="decimal">${t('Thập phân', 'Decimals')}</option>
            <option value="negative">${t('Số nguyên âm', 'Integers')}</option>
            <option value="remainder">${t('Chia có dư', 'Remainder')}</option>
          </select>
        </label>
      </div>

      <div style="display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:8px;align-items:end">
        <div>
          <span style="display:block;font-size:12px;font-weight:700;margin-bottom:6px">${t('Phép tính:', 'Operations:')}</span>
          <div class="adm-ops-row" style="display:flex;gap:10px;flex-wrap:nowrap;align-items:center;min-height:47px">
            ${[['+', '+'], ['-', '−'], ['*', '×'], ['/', '÷']].map(([v, lbl]) => `<label style="display:inline-flex;align-items:center;gap:4px;font-size:14px;white-space:nowrap;cursor:pointer"><input type="checkbox" name="ops" value="${v}" style="width:16px;height:16px;min-height:16px;margin:0" ${v === '+' || v === '-' ? 'checked' : ''}>${lbl}</label>`).join('')}
          </div>
        </div>
        <label>${t('Số câu:', 'Questions:')}
          <select name="count">${[5, 10, 15, 20].map(c => `<option value="${c}" ${c === 10 ? 'selected' : ''}>${c} ${t('câu', 'qs')}</option>`).join('')}</select>
        </label>
        <label>${t('Giây/câu:', 'Sec/Q:')}
          <select name="seconds">${[15, 20, 30, 45].map(s => `<option value="${s}" ${s === 20 ? 'selected' : ''}>${s}s</option>`).join('')}</select>
        </label>
      </div>

      <div class="actions" style="margin-top:6px">
        <button type="submit" class="primary">📤 ${t('Giao bài ngay', 'Assign Now')}</button>
        <button type="button" onclick="$('#modal').close()">${t('Hủy', 'Cancel')}</button>
      </div>
    </form>`);

    $$('[data-pick-grade]').forEach(btn => {
      btn.onclick = () => {
        const g = btn.dataset.pickGrade;
        $$('#targetedAssignForm input[name="targetStudents"]').forEach(cb => {
          if (g === 'all') cb.checked = true;
          else if (g === 'none') cb.checked = false;
          else cb.checked = String(cb.dataset.grade) === String(g);
        });
      };
    });

    $('#targetedAssignForm').onsubmit = e => {
      e.preventDefault();
      const f = new FormData(e.target);
      const targets = f.getAll('targetStudents');
      const ops = f.getAll('ops');
      const grade = Number(f.get('grade')) || 1;
      const type = String(f.get('type') || 'natural');
      try {
        createTargetedAssignment({
          title: f.get('title'),
          dueDate: f.get('dueDate'),
          targetStudents: targets,
          config: {
            ...(typeof defaults !== 'undefined' ? defaults : {}),
            grade,
            ops: ops.length ? ops : ['+'],
            types: [type],
            type,
            digits: grade >= 4 ? [1, 2] : [1],
            questionStyle: String(f.get('questionStyle') || 'normal'),
            count: Number(f.get('count')) || 10,
            seconds: Number(f.get('seconds')) || 20
          }
        });
        $('#modal').close();
        toast(t(`Đã giao bài cho ${targets.length} học sinh!`, `Assigned homework to ${targets.length} student(s)!`));
        if (typeof renderAdmin === 'function') renderAdmin();
      } catch (err) {
        toast(err.message);
      }
    };
  }

  function editStudentProfileModal(username) {
    const users = typeof getLocalUsers === 'function' ? getLocalUsers() : {};
    const user = users[username];
    if (!user || username === 'admin') return;

    modal(`<h2>✏️ ${t('Sửa thông tin học sinh', 'Edit Student Profile')}</h2>
    <p class="muted">@${esc(username)}</p>
    <form id="adminEditStudentForm" style="display:grid;gap:12px;margin-top:12px">
      <label>${t('Họ và tên:', 'Full Name:')}
        <input name="name" maxlength="30" required value="${esc(user.name)}">
      </label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <label>${t('Khối lớp:', 'Grade:')}
          <select name="grade">${[1,2,3,4,5,6,7,8,9].map(g => `<option value="${g}" ${Number(user.grade) === g ? 'selected' : ''}>${t('Lớp', 'Grade')} ${g}</option>`).join('')}</select>
        </label>
        <label>${t('Thưởng thêm XP:', 'Bonus XP:')}
          <input name="bonusXp" type="number" min="0" max="500" value="0">
        </label>
      </div>
      <label>${t('Bạn đồng hành:', 'Buddy Avatar:')}
        <select name="avatar">
          <option value="bunny" ${user.avatar === 'bunny' ? 'selected' : ''}>🐰 ${t('Thỏ Mimi', 'Bunny')}</option>
          <option value="panda" ${user.avatar === 'panda' ? 'selected' : ''}>🐼 ${t('Gấu Baobao', 'Panda')}</option>
          <option value="fox" ${user.avatar === 'fox' ? 'selected' : ''}>🦊 ${t('Cáo Kiki', 'Fox')}</option>
          <option value="lion" ${user.avatar === 'lion' ? 'selected' : ''}>🦁 ${t('Sư tử Leo', 'Lion')}</option>
        </select>
      </label>
      <div class="actions">
        <button type="submit" class="primary">${t('Lưu thay đổi', 'Save Changes')}</button>
        <button type="button" onclick="$('#modal').close()">${t('Hủy', 'Cancel')}</button>
      </div>
    </form>`);

    $('#adminEditStudentForm').onsubmit = e => {
      e.preventDefault();
      const f = new FormData(e.target);
      updateStudentByAdmin(username, {
        name: f.get('name'),
        grade: f.get('grade'),
        avatar: f.get('avatar'),
        bonusXp: f.get('bonusXp')
      });
      $('#modal').close();
      toast(t('Đã cập nhật thông tin học sinh!', 'Student profile updated!'));
      if (typeof isCurrentUserTeacher === 'function' && isCurrentUserTeacher() && typeof renderTeacherWorkspace === 'function') {
        renderTeacherWorkspace();
      } else {
        renderAdmin();
      }
    };
  }

  function openBatchPromoteModal() {
    modal(`<h2>⬆️ ${t('Chuyển khối lớp hàng loạt', 'Batch Grade Promotion')}</h2>
    <p class="muted">${t('Chuyển toàn bộ học sinh từ một khối sang khối mới (dùng khi lên năm học mới):', 'Move all students from one grade level to another:')}</p>
    <form id="batchPromoteForm" style="display:grid;gap:12px;margin-top:12px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <label>${t('Từ khối:', 'From grade:')}
          <select name="fromGrade">${[1,2,3,4,5,6,7,8,9].map(g => `<option value="${g}">${t('Lớp', 'Grade')} ${g}</option>`).join('')}</select>
        </label>
        <label>${t('Sang khối:', 'To grade:')}
          <select name="toGrade">${[1,2,3,4,5,6,7,8,9].map(g => `<option value="${g}" ${g === 2 ? 'selected' : ''}>${t('Lớp', 'Grade')} ${g}</option>`).join('')}</select>
        </label>
      </div>
      <div class="actions">
        <button type="submit" class="primary">${t('Xác nhận chuyển khối', 'Promote Students')}</button>
        <button type="button" onclick="$('#modal').close()">${t('Hủy', 'Cancel')}</button>
      </div>
    </form>`);

    $('#batchPromoteForm').onsubmit = e => {
      e.preventDefault();
      const f = new FormData(e.target);
      const count = batchPromoteGrade(f.get('fromGrade'), f.get('toGrade'));
      $('#modal').close();
      toast(t(`Đã chuyển ${count} học sinh sang khối mới!`, `Promoted ${count} students!`));
      renderAdmin();
    };
  }

  function buildActivityChartSvg(days) {
    const maxQ = Math.max(10, ...days.map(d => d.questions));
    const bars = days.map((d, i) => {
      const x = 32 + i * 50;
      const barH = d.questions > 0 ? Math.max(6, Math.round((d.questions / maxQ) * 90)) : 2;
      const y = 112 - barH;
      const fill = d.questions > 0 ? (d.accuracy >= 80 ? '#2b8a3e' : d.accuracy >= 60 ? '#f08c00' : '#e03131') : '#dce8dc';
      return `<g>
        <rect x="${x}" y="${y}" width="26" height="${barH}" rx="6" fill="${fill}"><title>${d.label}: ${d.questions} ${t('câu', 'qs')} (${d.accuracy}%)</title></rect>
        ${d.questions > 0 ? `<text x="${x + 13}" y="${y - 5}" font-size="10" font-weight="700" text-anchor="middle" fill="#355240">${d.questions}</text>` : ''}
        <text x="${x + 13}" y="130" font-size="10.5" text-anchor="middle" fill="#5f7466">${esc(d.label)}</text>
      </g>`;
    }).join('');
    return `<svg viewBox="0 0 385 142" class="adm-chart-svg" role="img" aria-label="${t('Biểu đồ hoạt động 7 ngày', '7-day activity chart')}">
      <line x1="20" y1="112" x2="372" y2="112" stroke="#cde2d3" stroke-width="1.5"/>
      ${bars}
    </svg>`;
  }

  function injectEditButtonsIntoStudentTable() {
    $$('#adminTableCard [data-action="pin"]').forEach(pinBtn => {
      const parent = pinBtn.parentElement;
      const uname = pinBtn.dataset.user;
      if (!parent || !uname || uname === 'admin') return;
      if (!parent.querySelector('[data-action="assign-student"]')) {
        const assignBtn = document.createElement('button');
        assignBtn.type = 'button';
        assignBtn.className = 'admin-act-btn btn-assign';
        assignBtn.dataset.action = 'assign-student';
        assignBtn.dataset.user = uname;
        assignBtn.textContent = `📝 ${t('Giao bài', 'Assign')}`;
        assignBtn.onclick = () => openAssignToStudentsModal([uname]);
        pinBtn.before(assignBtn);
      }
      if (!parent.querySelector('[data-action="edit-student"]')) {
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'admin-act-btn btn-edit';
        editBtn.dataset.action = 'edit-student';
        editBtn.dataset.user = uname;
        editBtn.textContent = `✏️ ${t('Sửa', 'Edit')}`;
        editBtn.onclick = () => editStudentProfileModal(uname);
        pinBtn.before(editBtn);
      }
    });
  }

  // ---------------- Wrap renderAdmin() ----------------
  const renderAdminBeforeDash = typeof renderAdmin === 'function' ? renderAdmin : null;
  if (renderAdminBeforeDash) {
    renderAdmin = function () {
      renderAdminBeforeDash();
      const adminView = $('.admin-view');
      const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
      const isAdmin = Boolean(u && (u.role === 'admin' || u.username === 'admin'));
      if (!adminView || !isAdmin) return;

      // 1. Add Batch Promote, System Backup, Restore, Admin PIN, and Sign Out buttons
      const topActions = $('.admin-top-actions');
      if (topActions && !$('#adminBatchPromoteBtn')) {
        topActions.insertAdjacentHTML('beforeend', `
          <button type="button" class="admin-btn" id="adminBatchPromoteBtn">⬆️ ${t('Chuyển khối', 'Promote')}</button>
          <button type="button" class="admin-btn" id="adminSysBackupBtn">💾 ${t('Sao lưu HT', 'Backup All')}</button>
          <button type="button" class="admin-btn" id="adminSysRestoreBtn">📂 ${t('Khôi phục HT', 'Restore All')}</button>
          <button type="button" class="admin-btn" id="adminSelfPinBtn">🔑 ${t('Đổi MK Admin', 'Admin PIN')}</button>
          <button type="button" class="admin-btn btn-del" id="adminSignOutBtn">🚪 ${t('Đăng xuất', 'Sign out')}</button>
          <input type="file" id="adminSysRestoreInput" accept="application/json" hidden style="display:none">
        `);
        $('#adminBatchPromoteBtn').onclick = openBatchPromoteModal;
        $('#adminSelfPinBtn').onclick = () => {
          if (typeof adminResetPinModal === 'function') adminResetPinModal('admin');
        };
        $('#adminSignOutBtn').onclick = () => {
          if (confirm(t('Đăng xuất khỏi tài khoản Quản trị viên?', 'Sign out from Administrator account?'))) {
            if (typeof cloudSession !== 'undefined' && cloudSession && typeof cloudSignOut === 'function') cloudSignOut();
            else if (typeof localSignOut === 'function') localSignOut();
          }
        };
        $('#adminSysBackupBtn').onclick = () => {
          const data = buildFullSystemBackup();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `NumiQuick-System-Backup-${localDateKey()}.json`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1500);
          toast(t('Đã xuất bản sao lưu toàn hệ thống!', 'Exported full system backup!'));
        };
        $('#adminSysRestoreBtn').onclick = () => $('#adminSysRestoreInput')?.click();
        $('#adminSysRestoreInput').onchange = async e => {
          const f = e.target.files?.[0];
          if (!f) return;
          try {
            const parsed = JSON.parse(await f.text());
            if (!restoreFullSystemBackup(parsed)) throw Error();
            toast(t('Đã khôi phục toàn bộ dữ liệu hệ thống!', 'System backup restored!'));
            renderAdmin();
          } catch {
            toast(t('File sao lưu hệ thống không hợp lệ.', 'Invalid system backup file.'));
          } finally {
            e.target.value = '';
          }
        };
      }

      // 2. Compute analytics & render 2-column Insights + Targeted Assignments Panel
      const allStudents = typeof getStudentsSummary === 'function'
        ? getStudentsSummary().filter(s => s.role !== 'admin' && s.username !== 'admin')
        : [];
      const usersMap = typeof getLocalUsers === 'function' ? getLocalUsers() : {};
      const analytics = computeAdminAnalytics(allStudents);
      const totalTier = Math.max(1, analytics.tiers.excellent + analytics.tiers.good + analytics.tiers.average + analytics.tiers.needsWork);
      const assignments = loadTargetedAssignments();

      const headerCard = $('.admin-header-card');
      if (headerCard && !$('#adminInsightsGrid')) {
        const insightsHtml = `
          <div id="adminInsightsGrid" class="adm-insights-grid">
            <div class="card adm-panel">
              <div class="adm-panel-head">
                <h3>📈 ${t('Hoạt động 7 ngày gần nhất', '7-Day Student Activity')}</h3>
                <small class="muted">${t('Số câu giải & độ chính xác theo ngày', 'Questions solved & daily accuracy')}</small>
              </div>
              ${buildActivityChartSvg(analytics.days)}
              <div class="adm-tiers-bar">
                <div class="adm-tier-legend">
                  <span>🌟 ≥85%: <b>${analytics.tiers.excellent}</b></span>
                  <span>🔵 70–84%: <b>${analytics.tiers.good}</b></span>
                  <span>🟡 50–69%: <b>${analytics.tiers.average}</b></span>
                  <span>🔴 &lt;50%: <b>${analytics.tiers.needsWork}</b></span>
                </div>
                <div class="adm-stacked">
                  <i style="width:${Math.round(analytics.tiers.excellent / totalTier * 100)}%;background:#2b8a3e"></i>
                  <i style="width:${Math.round(analytics.tiers.good / totalTier * 100)}%;background:#1971c2"></i>
                  <i style="width:${Math.round(analytics.tiers.average / totalTier * 100)}%;background:#f08c00"></i>
                  <i style="width:${Math.round(analytics.tiers.needsWork / totalTier * 100)}%;background:#e03131"></i>
                </div>
              </div>
            </div>

            <div class="card adm-panel">
              <div class="adm-panel-head">
                <h3>⚠️ ${t('Học sinh cần chú ý', 'Students Needing Support')} (${analytics.atRiskStudents.length})</h3>
                <small class="muted">${t('Giao bài ôn đúng kỹ năng còn yếu cho từng bé chỉ với 1 bấm', '1-click remedial homework for the specific student')}</small>
              </div>
              ${analytics.atRiskStudents.length === 0
                ? `<p class="muted" style="padding:18px 0;text-align:center">🎉 ${t('Tất cả học sinh đều đang có phong độ tốt!', 'All students are performing well!')}</p>`
                : `<div class="adm-risk-list">${analytics.atRiskStudents.slice(0, 4).map(st => `<div class="adm-risk-row">
                    <div>
                      <b>${esc(st.name)} <small>(Lớp ${st.grade})</small></b>
                      <small>${st.mistakesCount > 0 ? `${st.mistakesCount} ${t('câu sai', 'mistakes')} · ` : ''}${t('Yếu:', 'Weak:')} ${esc(st.weakestLabel)}${st.inactiveLong ? ` · ${t('Ít hoạt động', 'Inactive')}` : ''}</small>
                    </div>
                    <button type="button" class="adm-remedial-btn" data-remedial-user="${esc(st.username)}">⚡ ${t('Phụ đạo', 'Assign')}</button>
                  </div>`).join('')}</div>`}
            </div>
          </div>

          <div id="adminAssignmentsCard" class="card adm-panel adm-class-hub">
            <div class="adm-panel-head" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
              <div>
                <h3>📝 ${t('Giao bài & Theo dõi Bài tập Cá nhân', 'Targeted Student Assignments')} (${assignments.length})</h3>
                <small class="muted">${t('Chọn 1 hoặc vài học sinh cụ thể để giao bài và copy link gửi nhanh qua Zalo/Messenger', 'Assign tailored practice to specific students and share via 1-click link')}</small>
              </div>
              <button type="button" class="primary" id="openAssignStudentsBtn">+ ${t('Giao bài cho học sinh', 'Assign to Students')}</button>
            </div>
            ${assignments.length === 0
              ? `<p class="muted">${t('Chưa có bài tập nào được giao. Bấm “+ Giao bài cho học sinh” để bắt đầu.', 'No assignments yet.')}</p>`
              : `<div class="adm-asg-list">${assignments.slice(0, 8).map(asg => {
                  const targets = Array.isArray(asg.targetStudents) ? asg.targetStudents : [];
                  const subs = asg.submissions || {};
                  return `<div class="adm-asg-card">
                    <div class="adm-asg-top">
                      <div>
                        <b>${esc(asg.title)}</b>
                        <small>${t('Lớp', 'Gr')} ${asg.config?.grade || 1} · ${asg.config?.count || 10} ${t('câu', 'qs')} · ${asg.config?.seconds || 20}s/${t('câu', 'q')}${asg.due_date ? ` · ${t('Hạn:', 'Due:')} ${esc(asg.due_date)}` : ''}</small>
                      </div>
                      <div class="adm-asg-btns">
                        <button type="button" class="ghost" data-copy-hw-link="${esc(asg.id)}">🔗 ${t('Copy Link', 'Copy Link')}</button>
                        <button type="button" class="ghost btn-del" data-del-hw="${esc(asg.id)}">🗑️</button>
                      </div>
                    </div>
                    <div class="adm-asg-targets">
                      ${targets.map(uname => {
                        const sName = usersMap[uname]?.name || uname;
                        const sub = subs[uname];
                        const pct = sub && sub.total > 0 ? Math.round((sub.correct / sub.total) * 100) : 0;
                        return sub
                          ? `<span class="adm-target-pill is-done">✅ ${esc(sName)}: ${sub.correct}/${sub.total} (${pct}%)</span>`
                          : `<span class="adm-target-pill">⏳ ${esc(sName)}: ${t('Chưa làm', 'Pending')}</span>`;
                      }).join('')}
                    </div>
                  </div>`;
                }).join('')}</div>`}
          </div>
        `;
        headerCard.insertAdjacentHTML('afterend', insightsHtml);

        $('#openAssignStudentsBtn')?.addEventListener('click', () => openAssignToStudentsModal([]));

        $$('[data-remedial-user]').forEach(btn => {
          btn.onclick = async () => {
            try {
              const res = await assignRemedialForStudent(btn.dataset.remedialUser);
              toast(t(`Đã giao bài phụ đạo riêng cho ${res.assignment.targetStudents.join(', ')}!`, `Assigned remedial homework!`));
              renderAdmin();
            } catch (err) {
              toast(err.message);
            }
          };
        });

        $$('[data-copy-hw-link]').forEach(btn => {
          btn.onclick = () => {
            const asg = assignments.find(a => a.id === btn.dataset.copyHwLink);
            if (!asg) return;
            const url = buildHomeworkShareLink(asg);
            if (navigator.clipboard?.writeText) {
              navigator.clipboard.writeText(url)
                .then(() => toast(t('Đã sao chép link bài tập! Gửi qua Zalo cho phụ huynh/HS nhé.', 'Copied homework link!')))
                .catch(() => modal(`<h3>🔗 ${t('Link bài tập', 'Homework Link')}</h3><input readonly value="${esc(url)}" style="width:100%;padding:8px" onclick="this.select()">`));
            } else {
              modal(`<h3>🔗 ${t('Link bài tập', 'Homework Link')}</h3><input readonly value="${esc(url)}" style="width:100%;padding:8px" onclick="this.select()">`);
            }
          };
        });

        $$('[data-del-hw]').forEach(btn => {
          btn.onclick = () => {
            if (!confirm(t('Xóa bài tập đã giao này?', 'Delete this assignment?'))) return;
            deleteTargetedAssignment(btn.dataset.delHw);
            renderAdmin();
          };
        });
      }

      // 3. Inject Assign & Edit buttons & keep synced after search filtering
      injectEditButtonsIntoStudentTable();
      const tableCard = $('#adminTableCard');
      if (tableCard && !tableCard.dataset.editObserver && typeof MutationObserver !== 'undefined') {
        tableCard.dataset.editObserver = '1';
        const obs = new MutationObserver(() => injectEditButtonsIntoStudentTable());
        obs.observe(tableCard, { childList: true, subtree: true });
      }
    };
    if (typeof window !== 'undefined') window.renderAdmin = renderAdmin;
    if (typeof global !== 'undefined') global.renderAdmin = renderAdmin;
  }

  // ---------------- Student Home Integration & Auto-Submission ----------------
  function injectStudentTargetedAssignmentsBox() {
    if (typeof view === 'undefined' || view !== 'home') return;
    const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
    if (!u || u.role === 'admin' || u.username === 'admin') return;

    // Absorb any pending shared homework link opened before login
    try {
      const pendingRaw = localStorage.getItem(PENDING_HW_KEY);
      if (pendingRaw) {
        const payload = JSON.parse(pendingRaw);
        localStorage.removeItem(PENDING_HW_KEY);
        upsertAssignmentFromSharePayload(payload, u.username);
      }
    } catch {}

    const host = $('.home-v2');
    if (!host || host.querySelector('.targeted-hw-card')) return;

    const { pending, completed } = getAssignmentsForStudent(u.username);
    if (!pending.length && !completed.length) return;

    const box = document.createElement('section');
    box.className = 'targeted-hw-card';
    box.innerHTML = `
      <div class="targeted-hw-head">
        <div>
          <span class="eyebrow">${t('BÀI TẬP RIÊNG CỦA EM', 'YOUR PERSONAL ASSIGNMENTS')}</span>
          <h3>📬 ${t('Bài thầy cô / bố mẹ giao', 'Assigned Practice')} ${pending.length ? `(${pending.length} ${t('cần làm', 'pending')})` : ''}</h3>
        </div>
      </div>
      ${pending.length ? `<div class="targeted-hw-list">
        ${pending.map(a => `<div class="targeted-hw-row">
          <div>
            <b>${esc(a.title)}</b>
            <small>${a.config?.count || 10} ${t('câu', 'qs')} · ${a.config?.seconds || 20}s/${t('câu', 'q')}${a.due_date ? ` · ${t('Hạn:', 'Due:')} ${esc(a.due_date)}` : ''}</small>
          </div>
          <button type="button" class="cls-3d-btn" data-start-targeted="${esc(a.id)}">${t('Làm bài ngay', 'Start')} →</button>
        </div>`).join('')}
      </div>` : ''}
      ${completed.length ? `<div class="targeted-hw-done-list">
        ${completed.slice(0, 3).map(a => {
          const sub = a.mySubmission;
          const pct = sub && sub.total > 0 ? Math.round((sub.correct / sub.total) * 100) : 0;
          return `<div class="targeted-hw-done-row">
            <span>✅ <b>${esc(a.title)}</b> · ${sub.correct}/${sub.total} (${pct}%)</span>
            <button type="button" class="ghost" data-redo-targeted="${esc(a.id)}">${t('Làm lại', 'Redo')}</button>
          </div>`;
        }).join('')}
      </div>` : ''}
    `;

    const anchor = host.querySelector('.home-v2-goal') || host.querySelector('.midterm-hub') || host.querySelector('.home-v2-links');
    if (anchor) anchor.before(box);
    else host.append(box);

    $$('[data-start-targeted]').forEach(btn => {
      btn.onclick = () => {
        const asg = pending.find(x => x.id === btn.dataset.startTargeted);
        if (asg) startTargetedAssignment(asg);
      };
    });
    $$('[data-redo-targeted]').forEach(btn => {
      btn.onclick = () => {
        const asg = completed.find(x => x.id === btn.dataset.redoTargeted);
        if (asg) startTargetedAssignment(asg);
      };
    });
  }

  const homeBeforeTargeted = typeof home === 'function' ? home : null;
  if (homeBeforeTargeted) {
    home = function () {
      homeBeforeTargeted();
      injectStudentTargetedAssignmentsBox();
      handleIncomingHomeworkHash();
    };
    if (typeof window !== 'undefined') window.home = home;
    if (typeof global !== 'undefined') global.home = home;
  }

  const finishBeforeTargeted = typeof finishPractice === 'function' ? finishPractice : null;
  if (finishBeforeTargeted) {
    finishPractice = function () {
      const activeSession = typeof session !== 'undefined' ? session : null;
      const asgId = activeSession?.targetedAssignmentId;
      const asgTitle = activeSession?.targetedAssignmentTitle;
      finishBeforeTargeted();
      if (!asgId || !activeSession) return;

      const results = activeSession.results || [];
      const correct = results.filter(x => x.correct).length;
      const total = results.length;
      const avgTime = total > 0 ? results.reduce((a, b) => a + (b.elapsed || 0), 0) / total : 0;
      if (Array.isArray(state?.history) && state.history.length) {
        state.history[state.history.length - 1].mode = 'assigned';
      }
      submitTargetedAssignment(asgId, correct, total, avgTime);
      const card = $('.quiz-finish-card');
      if (card && !card.querySelector('.targeted-done-pill')) {
        card.insertAdjacentHTML('afterbegin', `<div class="targeted-done-pill">📬 ${t('Đã hoàn thành bài được giao:', 'Completed assignment:')} <b>${esc(asgTitle || '')}</b></div>`);
      }
    };
  }

  const style = document.createElement('style');
  style.textContent = `
    .adm-insights-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:14px;margin:14px 0}
    .adm-panel h3{margin:0 0 2px;font-size:16px}
    .adm-panel-head{margin-bottom:10px}
    .adm-chart-svg{width:100%;height:auto;display:block}
    .adm-tiers-bar{margin-top:8px;display:grid;gap:6px}
    .adm-tier-legend{display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px;font-size:11.5px;color:#4f685a}
    .adm-stacked{display:flex;height:9px;border-radius:999px;overflow:hidden;background:#e6efe8}
    .adm-stacked i{display:block;height:100%}
    .adm-risk-list,.adm-asg-list{display:grid;gap:8px}
    .adm-risk-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 12px;border-radius:12px;background:#f7faf7;border:1px solid #e4efe4}
    .adm-risk-row b{display:block;font-size:13.5px}
    .adm-risk-row small{color:#5f7466;font-size:12px}
    .adm-remedial-btn{padding:6px 11px;border-radius:10px;border:0;background:#f08c00;color:#fff;font-weight:800;font-size:12px;cursor:pointer;white-space:nowrap}
    .adm-class-hub{margin-bottom:14px}
    .btn-edit{background:#edf2ff;color:#364fc7}
    .btn-assign{background:#e6fcf5;color:#0ca678}
    .adm-asg-card{padding:11px 13px;border-radius:14px;background:#f7faf7;border:1px solid #dce9de;display:grid;gap:8px}
    .adm-asg-top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap}
    .adm-asg-top b{display:block;font-size:14px}
    .adm-asg-top small{color:#5f7466;font-size:12px}
    .adm-asg-btns{display:flex;gap:6px;align-items:center}
    .adm-asg-targets{display:flex;flex-wrap:wrap;gap:6px}
    .adm-target-pill{padding:3px 9px;border-radius:999px;font-size:12px;font-weight:700;background:#fff4e6;color:#b45309;border:1px solid #ffe8cc}
    .adm-target-pill.is-done{background:#ebfbee;color:#2b8a3e;border-color:#c3fae8}
    .adm-student-checklist{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:6px;max-height:150px;overflow-y:auto;padding:8px;border-radius:12px;background:#f7faf7;border:1px solid #dce9de}
    .adm-check-chip{display:flex;align-items:center;gap:6px;font-size:13px;padding:4px 6px;border-radius:8px;cursor:pointer}
    .adm-quick-pick{padding:3px 8px;border-radius:8px;border:1px solid #cde2d3;background:#fff;font-size:11.5px;font-weight:700;cursor:pointer}
    .targeted-hw-card{padding:15px 18px;border-radius:22px;background:linear-gradient(135deg,#fff9ec,#eefbf3);border:2px solid #cbe4d3;box-shadow:0 5px 0 #d7ebdd;margin:14px 0;display:grid;gap:10px}
    .targeted-hw-head h3{margin:2px 0 0;font-size:16px;color:#234633}
    .targeted-hw-list,.targeted-hw-done-list{display:grid;gap:8px}
    .targeted-hw-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:14px;background:#fff;border:1.5px solid #d4e8da;flex-wrap:wrap}
    .targeted-hw-row b{display:block;font-size:14.5px;color:#234633}
    .targeted-hw-row small{display:block;font-size:12px;color:#5f7466}
    .targeted-hw-done-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 10px;border-radius:10px;background:rgba(255,255,255,.7);font-size:13px}
    .targeted-done-pill{display:inline-block;margin:0 auto 10px;padding:5px 14px;border-radius:999px;background:#e6f6ec;color:#1b6e3c;font-size:13px;font-weight:700}
    .cls-3d-btn{padding:8px 15px;border-radius:14px;border:0;background:#34765c;color:#fff;font-weight:800;font-size:13px;cursor:pointer;box-shadow:0 4px 0 #21513e;white-space:nowrap}
    @media(max-width:860px){.adm-insights-grid{grid-template-columns:1fr}}
    body.dark-mode .adm-risk-row,body.dark-mode .adm-asg-card,body.dark-mode .adm-student-checklist,body.dark-mode .targeted-hw-row{background:#1c2620;border-color:#2f4036}
    body.dark-mode .targeted-hw-card{background:#192821;border-color:#2f4d3d;box-shadow:0 5px 0 #121d17}
    body.dark-mode .targeted-hw-head h3,body.dark-mode .targeted-hw-row b{color:#e2f3e8}
    body.dark-mode .adm-tier-legend{color:#a8bfb0}
  `;
  document.head.append(style);

  if (typeof window !== 'undefined') {
    window.loadTargetedAssignments = loadTargetedAssignments;
    window.saveTargetedAssignments = saveTargetedAssignments;
    window.createTargetedAssignment = createTargetedAssignment;
    window.deleteTargetedAssignment = deleteTargetedAssignment;
    window.getAssignmentsForStudent = getAssignmentsForStudent;
    window.submitTargetedAssignment = submitTargetedAssignment;
    window.buildHomeworkShareLink = buildHomeworkShareLink;
    window.parseHomeworkShareHash = parseHomeworkShareHash;
    window.startTargetedAssignment = startTargetedAssignment;
    window.openAssignToStudentsModal = openAssignToStudentsModal;
    window.computeAdminAnalytics = computeAdminAnalytics;
    window.updateStudentByAdmin = updateStudentByAdmin;
    window.batchPromoteGrade = batchPromoteGrade;
    window.assignRemedialForStudent = assignRemedialForStudent;
    window.buildFullSystemBackup = buildFullSystemBackup;
    window.restoreFullSystemBackup = restoreFullSystemBackup;
    window.editStudentProfileModal = editStudentProfileModal;
  }
  if (typeof global !== 'undefined') {
    global.loadTargetedAssignments = loadTargetedAssignments;
    global.saveTargetedAssignments = saveTargetedAssignments;
    global.createTargetedAssignment = createTargetedAssignment;
    global.deleteTargetedAssignment = deleteTargetedAssignment;
    global.getAssignmentsForStudent = getAssignmentsForStudent;
    global.submitTargetedAssignment = submitTargetedAssignment;
    global.buildHomeworkShareLink = buildHomeworkShareLink;
    global.parseHomeworkShareHash = parseHomeworkShareHash;
    global.startTargetedAssignment = startTargetedAssignment;
    global.openAssignToStudentsModal = openAssignToStudentsModal;
    global.computeAdminAnalytics = computeAdminAnalytics;
    global.updateStudentByAdmin = updateStudentByAdmin;
    global.batchPromoteGrade = batchPromoteGrade;
    global.assignRemedialForStudent = assignRemedialForStudent;
    global.buildFullSystemBackup = buildFullSystemBackup;
    global.restoreFullSystemBackup = restoreFullSystemBackup;
    global.editStudentProfileModal = editStudentProfileModal;
  }

  if ((typeof view !== 'undefined' && view === 'admin') || (typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin())) {
    renderAdmin();
  } else if (typeof view !== 'undefined' && view === 'home') {
    injectStudentTargetedAssignmentsBox();
    handleIncomingHomeworkHash();
  }
  if (typeof numiSyncBuddyIdentity === 'function') numiSyncBuddyIdentity();
})();
