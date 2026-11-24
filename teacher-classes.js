// Teacher Classrooms, Level/Grade Classification, Saved Class Codes & Student Quick-Join (v2.3.1)
(() => {
  'use strict';

  const CLASSES_KEY = 'numi-classes-v1';
  const CLASSES_SEEDED_KEY = 'numi-classes-seeded-v1';
  const PENDING_JOIN_KEY = 'numi-pending-join-class-v1';
  const DEFAULT_TEACHER_HASH = '77efd557dd7880dfc9b22f85c497f6b76682ed594bb6fe1ac87463a47179272c'; // SHA-256('numi_salt_v1:1234')

  let activeTeacherClassId = null;
  let activeTeacherLevelFilter = 'all'; // 'all' | 'primary' | 'secondary'
  let lastAuthMode = 'login';

  function levelOfGrade(grade) {
    return Number(grade) >= 6 ? 'secondary' : 'primary';
  }

  function levelLabel(levelOrGrade) {
    const lvl = levelOrGrade === 'primary' || levelOrGrade === 'secondary'
      ? levelOrGrade
      : levelOfGrade(levelOrGrade);
    return lvl === 'secondary'
      ? t('THCS (Lớp 6–9)', 'Secondary (Gr 6–9)')
      : t('Tiểu học (Lớp 1–5)', 'Primary (Gr 1–5)');
  }

  function levelShortBadge(levelOrGrade) {
    const lvl = levelOrGrade === 'primary' || levelOrGrade === 'secondary'
      ? levelOrGrade
      : levelOfGrade(levelOrGrade);
    return lvl === 'secondary' ? t('Cấp THCS', 'Secondary') : t('Cấp Tiểu học', 'Primary');
  }

  function gradesForLevel(level) {
    return level === 'secondary' ? [6, 7, 8, 9] : [1, 2, 3, 4, 5];
  }

  function genClassCode(grade) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let tail = '';
    for (let i = 0; i < 4; i++) tail += chars[Math.floor(Math.random() * chars.length)];
    return `${Number(grade) || 4}A${tail}`.slice(0, 6);
  }

  function slugifyVietnameseName(name) {
    const base = String(name || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 14);
    return base.length >= 2 ? base : 'hocsinh';
  }

  function toB64Url(str) {
    const utf8 = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)));
    return btoa(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function fromB64Url(b64) {
    let s = String(b64 || '').replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bin = atob(s);
    const escStr = Array.from(bin, ch => '%' + ch.charCodeAt(0).toString(16).padStart(2, '0')).join('');
    return decodeURIComponent(escStr);
  }

  function normalizeClass(c) {
    if (!c || typeof c !== 'object') return null;
    const grade = Math.min(9, Math.max(1, Number(c.grade) || 4));
    return {
      ...c,
      grade,
      level: c.level === 'secondary' || c.level === 'primary' ? c.level : levelOfGrade(grade),
      code: String(c.code || '').trim().toUpperCase(),
      students: Array.isArray(c.students) ? Array.from(new Set(c.students.map(s => String(s).trim().toLowerCase()).filter(Boolean))) : []
    };
  }

  function ensureDemoTeacherAndClass() {
    try {
      if (localStorage.getItem(CLASSES_SEEDED_KEY)) return;
      const users = typeof getLocalUsers === 'function' ? getLocalUsers() : {};
      let userChanged = false;
      if (!users.colan) {
        users.colan = {
          username: 'colan',
          name: 'Cô Lan',
          hash: DEFAULT_TEACHER_HASH,
          role: 'teacher',
          avatar: 'panda',
          grade: 4,
          createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
          lastLoginAt: null,
          loginCount: 0
        };
        userChanged = true;
      }
      if (userChanged && typeof saveLocalUsers === 'function') {
        saveLocalUsers(users);
      }

      const raw = JSON.parse(localStorage.getItem(CLASSES_KEY) || '[]');
      const list = Array.isArray(raw) ? raw : [];
      if (list.length === 0) {
        const defaultStudents = users.minhkhoi ? ['minhkhoi'] : [];
        list.push({
          id: 'cls_4a_demo',
          code: '4ANUMI',
          name: 'Lớp 4A',
          level: 'primary',
          grade: 4,
          teacherUsername: 'colan',
          teacherName: 'Cô Lan',
          students: defaultStudents,
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
        });
        localStorage.setItem(CLASSES_KEY, JSON.stringify(list));
      }
      localStorage.setItem(CLASSES_SEEDED_KEY, '1');
    } catch {}
  }

  function loadClasses() {
    ensureDemoTeacherAndClass();
    try {
      const parsed = JSON.parse(localStorage.getItem(CLASSES_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.map(normalizeClass).filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  function saveClasses(list) {
    try {
      const normalized = Array.isArray(list) ? list.map(normalizeClass).filter(Boolean) : [];
      localStorage.setItem(CLASSES_KEY, JSON.stringify(normalized));
    } catch {}
  }

  function findClassByCode(rawCode) {
    const code = String(rawCode || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!code) return null;
    return loadClasses().find(c => c.code === code) || null;
  }

  function isCurrentUserTeacher() {
    const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
    return Boolean(u && u.role === 'teacher');
  }

  function getTeachersList() {
    ensureDemoTeacherAndClass();
    const users = typeof getLocalUsers === 'function' ? getLocalUsers() : {};
    return Object.values(users).filter(u => u && u.role === 'teacher');
  }

  function getClassesForTeacher(teacherUsername, levelFilter = 'all') {
    const key = String(teacherUsername || '').trim().toLowerCase();
    return loadClasses().filter(c => {
      if (String(c.teacherUsername || '').toLowerCase() !== key) return false;
      if (levelFilter === 'primary' || levelFilter === 'secondary') {
        return c.level === levelFilter;
      }
      return true;
    });
  }

  function getClassesForStudent(studentUsername) {
    const key = String(studentUsername || '').trim().toLowerCase();
    return loadClasses().filter(c => Array.isArray(c.students) && c.students.includes(key));
  }

  function canTeacherManageStudent(teacherUsername, studentUsername) {
    const sKey = String(studentUsername || '').trim().toLowerCase();
    return getClassesForTeacher(teacherUsername).some(c => c.students.includes(sKey));
  }

  function getStudentsForTeacher(teacherUsername, classId = null) {
    const classes = getClassesForTeacher(teacherUsername);
    const targetClasses = classId ? classes.filter(c => c.id === classId) : classes;
    const unameSet = new Set();
    targetClasses.forEach(c => (c.students || []).forEach(u => unameSet.add(u)));
    const allSummary = typeof getStudentsSummary === 'function' ? getStudentsSummary() : [];
    return allSummary.filter(s => s.role !== 'admin' && s.role !== 'teacher' && unameSet.has(s.username));
  }

  async function createTeacherWithClass({ name, username, password, className, grade = 4, level, code = '', avatar = 'panda', autoSignIn = false } = {}) {
    const cleanName = String(name || '').trim().slice(0, 40);
    const cleanUser = String(username || '').trim().toLowerCase().replace(/\s+/g, '');
    const cleanPwd = String(password || '').trim();
    const cleanClass = String(className || '').trim().slice(0, 40);
    const g = Math.min(9, Math.max(1, Number(grade) || 4));
    const resolvedLevel = (level === 'primary' || level === 'secondary') ? level : levelOfGrade(g);

    if (!cleanName) throw new Error(t('Vui lòng nhập tên Thầy/Cô.', 'Please enter teacher name.'));
    if (cleanUser.length < 2 || !/^[a-z0-9_.-]+$/.test(cleanUser)) {
      throw new Error(t('Tên đăng nhập chỉ gồm chữ không dấu, số (ít nhất 2 ký tự).', 'Username must be at least 2 alphanumeric characters.'));
    }
    if (cleanPwd.length < NUMI_MIN_PIN) throw new Error(t('Mã PIN / Mật khẩu cần ít nhất 6 ký tự.', 'PIN / Password must be at least 6 characters.'));
    if (!cleanClass) throw new Error(t('Vui lòng nhập tên lớp học (VD: Lớp 5B).', 'Please enter a class name (e.g. Grade 5B).'));

    const users = getLocalUsers();
    if (users[cleanUser]) {
      throw new Error(t('Tên đăng nhập này đã tồn tại. Hãy chọn tên khác!', 'Username already exists!'));
    }
    const hash = await hashPassword(cleanPwd);
    users[cleanUser] = {
      username: cleanUser,
      name: cleanName,
      hash,
      role: 'teacher',
      avatar,
      grade: g,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
      loginCount: 0
    };
    saveLocalUsers(users);

    const cls = createClassForTeacher(cleanUser, { name: cleanClass, grade: g, level: resolvedLevel, code });
    if (autoSignIn && typeof localSignIn === 'function') {
      activeTeacherClassId = cls.id;
      await localSignIn(cleanUser, cleanPwd);
    }
    return { teacher: users[cleanUser], cls };
  }

  function createClassForTeacher(teacherUsername, { name, grade = 4, level, code = '' } = {}) {
    const key = String(teacherUsername || '').trim().toLowerCase();
    const users = getLocalUsers();
    const teacher = users[key];
    if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
      throw new Error(t('Không tìm thấy tài khoản giáo viên.', 'Teacher account not found.'));
    }
    const cleanName = String(name || '').trim().slice(0, 40);
    if (!cleanName) throw new Error(t('Vui lòng nhập tên lớp học.', 'Please enter a class name.'));
    const g = Math.min(9, Math.max(1, Number(grade) || 4));
    const resolvedLevel = (level === 'primary' || level === 'secondary') ? level : levelOfGrade(g);

    const classes = loadClasses();
    let finalCode = String(code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    if (finalCode && classes.some(c => c.code === finalCode)) {
      throw new Error(t(`Mã lớp "${finalCode}" đã được dùng. Hãy chọn mã khác hoặc để trống để tự tạo!`, `Class code "${finalCode}" is already taken!`));
    }
    if (!finalCode) {
      let tries = 0;
      do {
        finalCode = genClassCode(g);
        tries++;
      } while (classes.some(c => c.code === finalCode) && tries < 20);
    }

    const cls = {
      id: 'cls_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      code: finalCode,
      name: cleanName,
      level: resolvedLevel,
      grade: g,
      teacherUsername: key,
      teacherName: teacher.name,
      students: [],
      createdAt: new Date().toISOString()
    };
    classes.unshift(cls);
    saveClasses(classes);
    return cls;
  }

  function deleteClassById(classId) {
    const classes = loadClasses();
    const next = classes.filter(c => c.id !== classId);
    if (next.length === classes.length) return false;
    saveClasses(next);
    if (activeTeacherClassId === classId) activeTeacherClassId = null;
    return true;
  }

  function addStudentToClass(classId, studentUsername) {
    const key = String(studentUsername || '').trim().toLowerCase();
    const users = getLocalUsers();
    const u = users[key];
    if (!u || u.role === 'admin' || u.role === 'teacher') return false;
    const classes = loadClasses();
    const cls = classes.find(c => c.id === classId);
    if (!cls) return false;
    if (!Array.isArray(cls.students)) cls.students = [];
    if (!cls.students.includes(key)) {
      cls.students.push(key);
      saveClasses(classes);
    }
    return true;
  }

  function removeStudentFromClass(classId, studentUsername) {
    const key = String(studentUsername || '').trim().toLowerCase();
    const classes = loadClasses();
    const cls = classes.find(c => c.id === classId);
    if (!cls || !Array.isArray(cls.students)) return false;
    const before = cls.students.length;
    cls.students = cls.students.filter(s => s !== key);
    if (cls.students.length === before) return false;
    saveClasses(classes);
    return true;
  }

  function joinClassByCode(rawCode, studentUsername) {
    const cls = findClassByCode(rawCode);
    if (!cls) throw new Error(t('Không tìm thấy lớp học với mã này. Em kiểm tra lại mã Thầy/Cô phát nhé!', 'No class found with this code. Please double-check with your teacher!'));
    const u = studentUsername ? String(studentUsername).trim().toLowerCase() : (currentAuthUser()?.username || '');
    if (!u) throw new Error(t('Vui lòng đăng nhập tài khoản học sinh trước khi vào lớp.', 'Please sign in as a student first.'));
    const classes = loadClasses();
    const target = classes.find(c => c.id === cls.id);
    if (!target) throw new Error(t('Không tìm thấy lớp học.', 'Class not found.'));
    const already = target.students.includes(u);
    if (!already) {
      target.students.push(u);
      saveClasses(classes);
    }
    return { ok: true, cls: target, already };
  }

  // Student Quick-Join: Enter ONLY Class Code + Name -> auto-creates/re-enters account & joins class!
  async function studentQuickJoinByCode({ code, name, pin = '123456', avatar = 'bunny' } = {}) {
    const cleanName = String(name || '').trim().slice(0, 30);
    const cleanPin = String(pin || '123456').trim() || '123456';
    const cls = findClassByCode(code);
    if (!cls) {
      throw new Error(t('Mã lớp chưa đúng hoặc không tồn tại. Em kiểm tra lại mã Thầy/Cô phát nhé!', 'Invalid class code. Please check the code from your teacher!'));
    }
    if (!cleanName || cleanName.length < 2) {
      throw new Error(t('Em hãy điền họ và tên của mình (ít nhất 2 ký tự) nhé!', 'Please enter your name (at least 2 characters)!'));
    }
    if (cleanPin.length < NUMI_MIN_PIN) {
      throw new Error(t('Mã PIN cần ít nhất 6 số/ký tự (hoặc để mặc định 123456).', 'PIN must be at least 6 characters (or keep 123456).'));
    }

    const users = getLocalUsers();
    const normName = cleanName.toLowerCase().replace(/\s+/g, ' ');
    // If a student with the exact same name is already in this class, sign them back in seamlessly
    const existingInClass = (cls.students || [])
      .map(un => users[un])
      .find(u => u && u.role === 'student' && String(u.name || '').trim().toLowerCase().replace(/\s+/g, ' ') === normName);

    if (existingInClass) {
      const hash = await hashPassword(cleanPin);
      if (existingInClass.hash === hash) {
        await localSignIn(existingInClass.username, cleanPin);
        return { ok: true, cls, username: existingInClass.username, returning: true };
      }
    }

    // Create a fresh student account automatically enrolled in cls with cls.grade
    const baseSlug = slugifyVietnameseName(cleanName);
    let candidate = baseSlug;
    let suffix = 2;
    while (users[candidate]) {
      candidate = `${baseSlug}${suffix++}`;
    }

    const hash = await hashPassword(cleanPin);
    users[candidate] = {
      username: candidate,
      name: cleanName,
      hash,
      role: 'student',
      avatar: avatar || 'bunny',
      grade: cls.grade,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      loginCount: 1
    };
    saveLocalUsers(users);
    addStudentToClass(cls.id, candidate);

    const activeUser = {
      id: candidate,
      username: candidate,
      name: cleanName,
      avatar: avatar || 'bunny',
      grade: cls.grade,
      role: 'student',
      type: 'local'
    };
    localStorage.setItem('numi-current-user-v1', JSON.stringify(activeUser));
    try { localStorage.setItem('numi-buddy-profile-v1', JSON.stringify({ name: cleanName, avatar: avatar || 'bunny' })); } catch {}
    state = { ...fresh(), name: cleanName, buddy: avatar || 'bunny' };
    if (typeof window !== 'undefined') window.state = state;
    if (typeof global !== 'undefined') global.state = state;
    save();
    try { localStorage.setItem('numi-user-state-' + candidate, JSON.stringify(state)); } catch {}
    if (typeof NUMI_GRADES !== 'undefined' && NUMI_GRADES[cls.grade]) {
      const gDef = NUMI_GRADES[cls.grade];
      config = { ...defaults, ...gDef, grade: gDef.id, ops: [...gDef.ops], types: [...gDef.types], type: gDef.types[0], digits: [...gDef.digits] };
      if (typeof window !== 'undefined') window.config = config;
      if (typeof global !== 'undefined') global.config = config;
    }
    cloudBadge();
    nav('home');
    toast(t(
      `🎉 Chào mừng ${cleanName} đã vào ${cls.name} (${cls.teacherName})! Tài khoản: @${candidate}`,
      `🎉 Welcome ${cleanName} to ${cls.name} (${cls.teacherName})! Account: @${candidate}`
    ));
    return { ok: true, cls, username: candidate, returning: false };
  }

  // Share link carries class code + optional metadata payload so cross-device links also register the class code locally
  function buildClassJoinLink(cls) {
    const base = typeof location !== 'undefined' && location.href ? location.href.split('#')[0] : 'https://kimtham18301-arch.github.io/numiquest/';
    const meta = toB64Url(JSON.stringify({
      c: cls.code,
      n: cls.name,
      g: cls.grade,
      l: cls.level || levelOfGrade(cls.grade),
      tu: cls.teacherUsername,
      tn: cls.teacherName
    }));
    return `${base}#join=${encodeURIComponent(cls.code)}&cls=${meta}`;
  }

  function parseIncomingJoinHash(hashStr) {
    const h = String(hashStr || '');
    if (!h.startsWith('#join=')) return null;
    const raw = h.slice(1);
    const joinMatch = raw.match(/(?:^|&)join=([^&]+)/);
    const clsMatch = raw.match(/(?:^|&)cls=([^&]+)/);
    const code = String(joinMatch ? decodeURIComponent(joinMatch[1]) : '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!code) return null;
    const clsMeta = clsMatch ? decodeURIComponent(clsMatch[1]) : '';
    if (clsMeta && !findClassByCode(code)) {
      try {
        const obj = JSON.parse(fromB64Url(clsMeta));
        if (obj && obj.c && obj.n) {
          const list = loadClasses();
          list.unshift({
            id: 'cls_ext_' + Date.now().toString(36),
            code: String(obj.c).toUpperCase(),
            name: String(obj.n).slice(0, 40),
            grade: Math.min(9, Math.max(1, Number(obj.g) || 4)),
            level: obj.l === 'secondary' ? 'secondary' : levelOfGrade(obj.g || 4),
            teacherUsername: String(obj.tu || 'teacher').toLowerCase(),
            teacherName: String(obj.tn || t('Giáo viên', 'Teacher')).slice(0, 40),
            students: [],
            createdAt: new Date().toISOString()
          });
          saveClasses(list);
        }
      } catch {}
    }
    return code;
  }

  async function checkIncomingClassJoinHash() {
    if (typeof location === 'undefined') return;
    const code = parseIncomingJoinHash(location.hash);
    if (!code) return;
    if (window.numiCloudClasses) await window.numiCloudClasses.ensureClass(code);
    const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
    if (u && u.role !== 'admin' && u.role !== 'teacher') {
      try {
        const res = joinClassByCode(code, u.username);
        toast(res.already
          ? t(`Em đã có mặt trong ${res.cls.name} (${res.cls.teacherName})!`, `Already enrolled in ${res.cls.name}!`)
          : t(`🎉 Đã tham gia ${res.cls.name} của ${res.cls.teacherName}!`, `🎉 Joined ${res.cls.name}!`));
        try { history.replaceState(null, '', location.pathname + location.search); } catch {}
      } catch (err) {
        toast(err.message);
      }
    } else if (!u) {
      try { localStorage.setItem(PENDING_JOIN_KEY, code); } catch {}
      try { history.replaceState(null, '', location.pathname + location.search); } catch {}
      if (typeof openAccount === 'function') openAccount('join-class');
    }
  }

  async function processPendingJoinForStudent() {
    try {
      const code = localStorage.getItem(PENDING_JOIN_KEY);
      if (!code) return;
      const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
      if (!u || u.role === 'admin' || u.role === 'teacher') return;
      localStorage.removeItem(PENDING_JOIN_KEY);
      if (window.numiCloudClasses) await window.numiCloudClasses.ensureClass(code);
      const res = joinClassByCode(code, u.username);
      toast(t(`🎉 Đã tự động tham gia ${res.cls.name} (${res.cls.teacherName})!`, `🎉 Automatically joined ${res.cls.name}!`));
    } catch {}
  }

  // ---------------- Enhanced Auth Gate: Login | Student Join by Code | Teacher Setup | Student Signup ----------------
  const openAccountBeforeClassGate = typeof openAccount === 'function' ? openAccount : null;
  if (openAccountBeforeClassGate) {
    openAccount = function (mode = 'login') {
      const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
      if (u) {
        if (u.role === 'teacher') renderTeacherWorkspace();
        else if (u.role === 'admin' || u.username === 'admin') { if (typeof renderAdmin === 'function') renderAdmin(); }
        else renderProfile();
        return;
      }
      lastAuthMode = mode || 'login';

      if (mode === 'join-class') {
        renderStudentJoinByCodeGate();
        return;
      }
      if (mode === 'teacher-setup') {
        renderTeacherSetupGate();
        return;
      }

      // Standard login / signup -> inject quick tabs for Student Join by Code & Teacher Setup
      openAccountBeforeClassGate(mode);
      injectExtraAuthTabs(mode);
    };
    if (typeof window !== 'undefined') window.openAccount = openAccount;
    if (typeof global !== 'undefined') global.openAccount = openAccount;
  }

  function renderAuthTabBar(activeMode) {
    const icKey = '<svg class="auth-tab-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="4.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>';
    const icJoin = '<svg class="auth-tab-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>';
    const icTeacher = '<svg class="auth-tab-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>';
    const icSelf = '<svg class="auth-tab-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>';
    return `<div class="auth-tabs auth-tabs-v2" role="tablist">
      <button type="button" class="auth-tab ${activeMode === 'login' ? 'active' : ''}" id="tabLogin" role="tab" aria-selected="${activeMode === 'login'}">${icKey}<span>${t('Đăng nhập', 'Sign in')}</span></button>
      <button type="button" class="auth-tab ${activeMode === 'join-class' ? 'active' : ''}" id="tabJoinClass" role="tab" aria-selected="${activeMode === 'join-class'}">${icJoin}<span>${t('Vào lớp bằng Mã', 'Join by Code')}</span></button>
      <button type="button" class="auth-tab ${activeMode === 'teacher-setup' ? 'active' : ''}" id="tabTeacherSetup" role="tab" aria-selected="${activeMode === 'teacher-setup'}">${icTeacher}<span>${t('Giáo viên tạo lớp', 'Teacher Setup')}</span></button>
      <button type="button" class="auth-tab ${activeMode === 'signup' ? 'active' : ''}" id="tabSignup" role="tab" aria-selected="${activeMode === 'signup'}">${icSelf}<span>${t('Tạo TK tự học', 'Self-study')}</span></button>
    </div>`;
  }

  function bindAuthTabBar() {
    $('#tabLogin')?.addEventListener('click', () => openAccount('login'));
    $('#tabJoinClass')?.addEventListener('click', () => openAccount('join-class'));
    $('#tabTeacherSetup')?.addEventListener('click', () => openAccount('teacher-setup'));
    $('#tabSignup')?.addEventListener('click', () => openAccount('signup'));
  }

  function injectExtraAuthTabs(activeMode) {
    const oldTabs = $('.auth-gate-card .auth-tabs');
    if (oldTabs) {
      oldTabs.outerHTML = renderAuthTabBar(activeMode);
      bindAuthTabBar();
    }
  }

  function renderStudentJoinByCodeGate() {
    if (typeof stop === 'function') stop();
    view = 'account';
    if (typeof window !== 'undefined') window.view = 'account';
    if (typeof global !== 'undefined') global.view = 'account';
    if (document.body) document.body.dataset.view = 'account';

    let preCode = '';
    try { preCode = localStorage.getItem(PENDING_JOIN_KEY) || ''; } catch {}
    let chosenAvatar = 'bunny';

    $('#app').innerHTML = `<div class="narrow card account-card auth-gate-card">
      <div class="intro-animal">${animal('bunny')}</div>
      <span class="eyebrow">NUMIQUICK · ${t('HỌC SINH VÀO LỚP', 'STUDENT CLASS JOIN')}</span>
      <h1>${t('Nhập Mã lớp để vào học', 'Enter Class Code to Join')}</h1>
      <p class="muted">${t('Nhập Mã lớp Thầy/Cô phát và điền tên của em để tự động vào đúng lớp học.', 'Enter your teacher’s Class Code and your name to join automatically.')}</p>
      ${renderAuthTabBar('join-class')}
      <form id="quickJoinClassForm" class="auth-form">
        <label>${t('Mã lớp Thầy/Cô phát', 'Class Code from Teacher')}
          <input name="code" id="quickJoinCodeInput" maxlength="10" required autocomplete="off" value="${esc(preCode)}" placeholder="${t('Nhập mã lớp (VD: 4ANUMI)', 'Enter class code (e.g. 4ANUMI)')}" style="text-transform:uppercase;font-weight:800;letter-spacing:1.5px;font-size:16px">
        </label>
        <div id="quickJoinPreview" class="join-code-preview" hidden></div>
        <label>${t('Họ và tên của em', 'Your Full Name')}
          <input name="name" maxlength="30" required placeholder="${t('Ví dụ: Nguyễn Minh Anh', 'e.g. Minh Anh')}">
        </label>
        <label>${t('Mã PIN từ 6 ký tự của em (dùng để đăng nhập lại lần sau)', 'Your PIN, 6+ characters (for signing back in)')}
          <input name="pin" minlength="6" maxlength="20" value="123456" required placeholder="123456">
        </label>
        <div class="settings-hint" style="margin-top:8px">${t('Chọn bạn thú đồng hành:', 'Choose your study buddy:')}</div>
        <div class="buddy-choices">
          ${[['bunny', 'Thỏ'], ['panda', 'Gấu'], ['fox', 'Cáo'], ['lion', 'Sư tử']].map(([k, label]) => `<button type="button" data-join-avatar="${k}" class="${k === chosenAvatar ? 'chosen' : ''}">${(typeof numiAnimalOriginal === 'function' ? numiAnimalOriginal : animal)(k)}<span>${label}</span></button>`).join('')}
        </div>
        <p id="quickJoinErr" class="danger" role="status" style="margin:10px 0;font-weight:700"></p>
        <button type="submit" class="primary wide" id="quickJoinSubmitBtn">${t('Vào lớp & Bắt đầu học ngay →', 'Join Class & Start Learning →')}</button>
      </form>
    </div>`;

    bindAuthTabBar();

    const codeInput = $('#quickJoinCodeInput');
    const previewEl = $('#quickJoinPreview');
    const updatePreview = () => {
      if (!codeInput || !previewEl) return;
      const val = codeInput.value.trim().toUpperCase();
      if (!val) { previewEl.hidden = true; return; }
      const found = findClassByCode(val);
      previewEl.hidden = false;
      if (found) {
        previewEl.className = 'join-code-preview is-valid';
        previewEl.innerHTML = `✅ <b>${esc(found.name)}</b> · ${esc(levelShortBadge(found.level))} (${t('Khối', 'Grade')} ${found.grade}) · 👩‍🏫 ${esc(found.teacherName)}`;
      } else if (val.length >= 4) {
        previewEl.className = 'join-code-preview is-invalid';
        previewEl.innerHTML = `⚠️ ${t('Chưa tìm thấy mã lớp này. Em kiểm tra lại mã Thầy/Cô phát nhé!', 'Class code not found yet. Double-check the code!')}`;
      } else {
        previewEl.hidden = true;
      }
    };
    if (codeInput) {
      codeInput.addEventListener('input', updatePreview);
      updatePreview();
    }
    $$('[data-fill-code]').forEach(btn => {
      btn.onclick = () => {
        if (codeInput) {
          codeInput.value = btn.dataset.fillCode;
          updatePreview();
        }
      };
    });
    $$('[data-join-avatar]').forEach(btn => {
      btn.onclick = () => {
        chosenAvatar = btn.dataset.joinAvatar;
        $$('[data-join-avatar]').forEach(b => b.classList.toggle('chosen', b.dataset.joinAvatar === chosenAvatar));
      };
    });

    const form = $('#quickJoinClassForm');
    if (form) {
      form.onsubmit = async e => {
        e.preventDefault();
        const fd = new FormData(form);
        const btn = $('#quickJoinSubmitBtn');
        const errEl = $('#quickJoinErr');
        if (btn) btn.disabled = true;
        if (errEl) errEl.textContent = '';
        try {
          try { localStorage.removeItem(PENDING_JOIN_KEY); } catch {}
          const cloudCls = window.numiCloudClasses;
          if (cloudCls) await cloudCls.ensureClass(fd.get('code')); // class created on another device
          const joined = await studentQuickJoinByCode({
            code: fd.get('code'),
            name: fd.get('name'),
            pin: fd.get('pin'),
            avatar: chosenAvatar
          });
          if (cloudCls && joined && joined.username) await cloudCls.linkAccount(joined.username, String(fd.get('pin') || '123456').trim() || '123456');
        } catch (err) {
          if (errEl) errEl.textContent = err.message;
        } finally {
          if (btn && btn.isConnected) btn.disabled = false;
        }
      };
    }
    if (typeof translate === 'function') translate();
  }

  function renderTeacherSetupGate() {
    if (typeof stop === 'function') stop();
    view = 'account';
    if (typeof window !== 'undefined') window.view = 'account';
    if (typeof global !== 'undefined') global.view = 'account';
    if (document.body) document.body.dataset.view = 'account';

    $('#app').innerHTML = `<div class="narrow card account-card auth-gate-card">
      <div class="intro-animal">${animal('panda')}</div>
      <span class="eyebrow">NUMIQUICK · ${t('THIẾT LẬP TÀI KHOẢN GIÁO VIÊN', 'TEACHER ACCOUNT SETUP')}</span>
      <h1>${t('Tạo tài khoản Giáo viên & Lớp học', 'Set Up Teacher Account & Class')}</h1>
      <p class="muted">${t('Tài khoản riêng giúp Thầy/Cô tự tạo lớp theo cấp học, lưu mã lớp và chỉ quản lý học sinh của mình.', 'Dedicated teacher workspace scoped strictly to your own classes and students.')}</p>
      ${renderAuthTabBar('teacher-setup')}
      <form id="teacherSelfSetupForm" class="auth-form">
        <label>${t('Họ và tên Thầy/Cô', 'Teacher Name')}
          <input name="name" maxlength="40" required placeholder="${t('Ví dụ: Cô Hương / Thầy Minh', 'e.g. Ms. Huong')}">
        </label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <label>${t('Tên đăng nhập', 'Username')}
            <input name="username" minlength="2" maxlength="20" required autocomplete="username" placeholder="${t('VD: cohuong', 'e.g. mshuong')}">
          </label>
          <label>${t('Mật khẩu / Mã PIN (6+ ký tự)', 'Password / PIN (6+ chars)')}
            <input name="password" type="password" minlength="6" maxlength="24" required autocomplete="new-password" placeholder="••••••">
          </label>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <label>${t('Phân loại Cấp học', 'School Level')}
            <select name="level" id="tchSetupLevel">
              <option value="primary">${t('Tiểu học (Lớp 1–5)', 'Primary (Grades 1–5)')}</option>
              <option value="secondary">${t('THCS (Lớp 6–9)', 'Secondary (Grades 6–9)')}</option>
            </select>
          </label>
          <label>${t('Khối lớp', 'Grade')}
            <select name="grade" id="tchSetupGrade">
              ${[1, 2, 3, 4, 5].map(g => `<option value="${g}" ${g === 4 ? 'selected' : ''}>${t('Lớp', 'Grade')} ${g}</option>`).join('')}
            </select>
          </label>
        </div>
        <div style="display:grid;grid-template-columns:1.3fr 1fr;gap:10px">
          <label>${t('Tên lớp đầu tiên', 'First Class Name')}
            <input name="className" maxlength="40" required placeholder="${t('VD: Lớp 4B', 'e.g. Grade 4B')}">
          </label>
          <label>${t('Mã lớp (để trống để tự tạo)', 'Class Code (optional)')}
            <input name="code" maxlength="10" placeholder="${t('VD: 4BHUONG', 'Auto')}" style="text-transform:uppercase">
          </label>
        </div>
        <p id="teacherSetupErr" class="danger" role="status" style="margin:10px 0;font-weight:700"></p>
        <button type="submit" class="primary wide" id="teacherSetupBtn">👩‍🏫 ${t('Tạo tài khoản & Lưu mã lớp →', 'Create Account & Save Class Code →')}</button>
      </form>
    </div>`;

    bindAuthTabBar();

    const levelSel = $('#tchSetupLevel');
    const gradeSel = $('#tchSetupGrade');
    if (levelSel && gradeSel) {
      levelSel.onchange = () => {
        const list = gradesForLevel(levelSel.value);
        gradeSel.innerHTML = list.map(g => `<option value="${g}">${t('Lớp', 'Grade')} ${g}</option>`).join('');
      };
    }

    const form = $('#teacherSelfSetupForm');
    if (form) {
      form.onsubmit = async e => {
        e.preventDefault();
        const fd = new FormData(form);
        const btn = $('#teacherSetupBtn');
        const errEl = $('#teacherSetupErr');
        if (btn) btn.disabled = true;
        if (errEl) errEl.textContent = '';
        try {
          const { cls } = await createTeacherWithClass({
            name: fd.get('name'),
            username: fd.get('username'),
            password: fd.get('password'),
            level: fd.get('level'),
            grade: fd.get('grade'),
            className: fd.get('className'),
            code: fd.get('code'),
            autoSignIn: true
          });
          toast(t(`🎉 Đã tạo ${cls.name} · Mã lớp đã lưu: ${cls.code}!`, `🎉 Created ${cls.name} · Saved code: ${cls.code}!`));
        } catch (err) {
          if (errEl) errEl.textContent = err.message;
        } finally {
          if (btn && btn.isConnected) btn.disabled = false;
        }
      };
    }
    if (typeof translate === 'function') translate();
  }

  // Printable Progress Report Card (1-click Print / Save as PDF)
  function openClassPrintReport(cls, students) {
    const todayStr = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const avgAcc = students.length
      ? Math.round(students.reduce((s, x) => s + x.accuracy, 0) / students.length)
      : 0;
    const totalSessions = students.reduce((s, x) => s + x.totalSessions, 0);

    modal(`<div class="cls-report-sheet">
      <div class="cls-report-head">
        <span class="eyebrow">NUMIQUICK · ${t('PHIẾU BÁO CÁO TIẾN ĐỘ LỚP HỌC', 'CLASS PROGRESS REPORT')}</span>
        <h2 style="margin:4px 0">${esc(cls.name)} · ${esc(levelShortBadge(cls.level))} (${t('Khối', 'Grade')} ${cls.grade}) — ${esc(cls.teacherName)}</h2>
        <p class="muted" style="margin:0">${t('Ngày xuất:', 'Date:')} ${todayStr} · ${t('Mã lớp:', 'Class code:')} <b>${esc(cls.code)}</b> · ${students.length} ${t('học sinh', 'students')}</p>
      </div>
      <div class="cls-report-kpis">
        <div><small>${t('Sĩ số lớp', 'Students')}</small><strong>${students.length}</strong></div>
        <div><small>${t('Chính xác TB', 'Avg Accuracy')}</small><strong>${avgAcc}%</strong></div>
        <div><small>${t('Tổng lượt luyện', 'Total Sessions')}</small><strong>${totalSessions}</strong></div>
      </div>
      ${students.length === 0
        ? `<p class="muted">${t('Lớp chưa có học sinh nào.', 'No students enrolled yet.')}</p>`
        : `<table class="history" style="width:100%;margin-top:12px">
            <thead>
              <tr>
                <th>${t('Học sinh', 'Student')}</th>
                <th>${t('Lượt học', 'Sessions')}</th>
                <th>${t('Chính xác', 'Accuracy')}</th>
                <th>${t('TB/câu', 'Avg')}</th>
                <th>${t('Câu sai tồn', 'Mistakes')}</th>
                <th>${t('Nhận xét', 'Status')}</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(s => {
                const status = s.totalSessions === 0
                  ? t('Chưa làm bài', 'No activity')
                  : s.accuracy >= 85
                    ? t('Xuất sắc ⭐', 'Excellent ⭐')
                    : s.accuracy >= 70
                      ? t('Tiến bộ tốt', 'Good progress')
                      : t('Cần kèm thêm', 'Needs practice');
                return `<tr>
                  <td><b>${esc(s.name)}</b> <small>(@${esc(s.username)})</small></td>
                  <td>${s.totalSessions}</td>
                  <td><b>${s.accuracy}%</b></td>
                  <td>${s.avgSpeed === '-' ? '—' : s.avgSpeed + 's'}</td>
                  <td>${s.mistakesCount}</td>
                  <td>${status}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>`}
      <div class="actions no-print" style="margin-top:16px">
        <button type="button" class="primary" id="printClassReportBtn">🖨️ ${t('In / Lưu PDF', 'Print / Save PDF')}</button>
        <button type="button" onclick="$('#modal').close()">${t('Đóng', 'Close')}</button>
      </div>
    </div>`);
    $('#printClassReportBtn')?.addEventListener('click', () => {
      if (typeof window !== 'undefined' && typeof window.print === 'function') window.print();
    });
  }

  // Scoped Homework Assignment Modal for a Teacher's Class
  function openTeacherAssignModal(cls, preselected = []) {
    const students = getStudentsForTeacher(cls.teacherUsername, cls.id);
    if (!students.length) {
      toast(t('Lớp chưa có học sinh. Thầy/Cô hãy gửi Mã lớp để học sinh vào lớp trước nhé!', 'No students in this class yet. Share the Class Code first!'));
      return;
    }
    const preSet = new Set(preselected.length ? preselected : students.map(s => s.username));
    const defaultDue = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10);

    modal(`<h2>🎯 ${t(`Giao bài cho ${cls.name}`, `Assign Homework to ${cls.name}`)}</h2>
    <p class="muted" style="margin:4px 0 10px;font-size:13px">${t('Chọn cả lớp hoặc tích riêng từng học sinh trong lớp của Thầy/Cô.', 'Select the whole class or specific students in your class.')}</p>
    <form id="teacherAssignForm" style="display:grid;gap:12px">
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:6px">
          <b style="font-size:13px">${t('Học sinh nhận bài:', 'Target students:')}</b>
          <div style="display:flex;gap:4px">
            <button type="button" class="adm-quick-pick" id="tchPickAll">${t('Cả lớp', 'All class')}</button>
            <button type="button" class="adm-quick-pick" id="tchPickNone">${t('Bỏ chọn', 'Clear')}</button>
          </div>
        </div>
        <div class="adm-student-checklist">
          ${students.map(s => `<label class="adm-check-chip">
            <input type="checkbox" name="targetStudents" value="${esc(s.username)}" ${preSet.has(s.username) ? 'checked' : ''}>
            <span><b>${esc(s.name)}</b> <small>(${s.accuracy}%)</small></span>
          </label>`).join('')}
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:10px">
        <label>${t('Tên bài tập:', 'Title:')}
          <input name="title" maxlength="80" required value="${esc(t(`Bài luyện ${cls.name}`, `${cls.name} Practice`))}">
        </label>
        <label>${t('Hạn nộp:', 'Due date:')}
          <input name="dueDate" type="date" value="${defaultDue}">
        </label>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
        <label>${t('Khối lớp:', 'Grade:')}
          <select name="grade">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => `<option value="${g}" ${Number(cls.grade) === g ? 'selected' : ''}>${t('Lớp', 'Gr')} ${g}</option>`).join('')}</select>
        </label>
        <label>${t('Kiểu câu hỏi:', 'Style:')}
          <select name="questionStyle">
            <option value="normal">${t('Tính thường', 'Standard')}</option>
            <option value="missing">${t('Điền số (?)', 'Missing (?)')}</option>
            <option value="word">${t('Toán đố ngắn', 'Word Problem')}</option>
            <option value="convenient">${t('Tính thuận tiện', 'Regrouping')}</option>
            <option value="expression">${t('Biểu thức', 'Expression')}</option>
          </select>
        </label>
        <label>${t('Loại số:', 'Number type:')}
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

    $('#tchPickAll')?.addEventListener('click', () => {
      $$('#teacherAssignForm input[name="targetStudents"]').forEach(cb => { cb.checked = true; });
    });
    $('#tchPickNone')?.addEventListener('click', () => {
      $$('#teacherAssignForm input[name="targetStudents"]').forEach(cb => { cb.checked = false; });
    });

    const form = $('#teacherAssignForm');
    if (form) {
      form.onsubmit = e => {
        e.preventDefault();
        const fd = new FormData(form);
        const targets = fd.getAll('targetStudents');
        const ops = fd.getAll('ops');
        if (!targets.length) { toast(t('Vui lòng chọn ít nhất 1 học sinh!', 'Select at least 1 student!')); return; }
        if (!ops.length) { toast(t('Chọn ít nhất 1 phép tính!', 'Select at least 1 operation!')); return; }
        const grade = Number(fd.get('grade')) || cls.grade || 4;
        const type = fd.get('type') || 'natural';
        const gDef = typeof NUMI_GRADES !== 'undefined' && NUMI_GRADES[grade] ? NUMI_GRADES[grade] : null;
        if (typeof createTargetedAssignment === 'function') {
          const asg = createTargetedAssignment({
            title: fd.get('title'),
            dueDate: fd.get('dueDate'),
            targetStudents: targets,
            config: {
              grade,
              type,
              types: [type],
              ops,
              questionStyle: fd.get('questionStyle') || 'normal',
              digits: gDef ? [...gDef.digits] : [1, 2],
              count: Number(fd.get('count')) || 10,
              seconds: Number(fd.get('seconds')) || 20
            }
          });
          const allAsg = loadTargetedAssignments();
          const saved = allAsg.find(a => a.id === asg.id);
          if (saved) {
            saved.createdBy = cls.teacherUsername;
            saved.classId = cls.id;
            saved.className = cls.name;
            saveTargetedAssignments(allAsg);
          }
          $('#modal').close();
          toast(t(`Đã giao bài cho ${targets.length} học sinh lớp ${cls.name}!`, `Assigned to ${targets.length} students!`));
          renderTeacherWorkspace();
        }
      };
    }
  }

  // Modal: Teacher adds a NEW student account directly into their class
  function openTeacherCreateStudentModal(cls) {
    modal(`<h2>+ ${t(`Thêm học sinh mới vào ${cls.name}`, `Add New Student to ${cls.name}`)}</h2>
    <p class="muted" style="margin:4px 0 12px;font-size:13px">${t('Tạo tài khoản và tự động ghi danh em vào lớp của Thầy/Cô.', 'Create student account and enroll directly into your class.')}</p>
    <form id="teacherNewStudentForm" style="display:grid;gap:10px">
      <label>${t('Họ và tên học sinh:', 'Student Name:')}
        <input name="name" required maxlength="30" placeholder="${t('VD: Nguyễn Gia Hân', 'e.g. Alex Nguyen')}">
      </label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <label>${t('Tên đăng nhập:', 'Username:')}
          <input name="username" required minlength="2" maxlength="20" placeholder="giahan" autocomplete="off">
        </label>
        <label>${t('Mã PIN (6+ ký tự):', 'PIN (6+ chars):')}
          <input name="password" required minlength="6" maxlength="20" value="123456" autocomplete="off">
        </label>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <label>${t('Khối lớp:', 'Grade:')}
          <select name="grade">${gradesForLevel(cls.level).map(g => `<option value="${g}" ${Number(cls.grade) === g ? 'selected' : ''}>${t('Lớp', 'Grade')} ${g}</option>`).join('')}</select>
        </label>
        <label>${t('Bạn đồng hành:', 'Buddy:')}
          <select name="avatar">
            <option value="bunny">🐰 Thỏ Mimi</option>
            <option value="fox">🦊 Cáo Kiki</option>
            <option value="panda">🐼 Gấu Baobao</option>
            <option value="lion">🦁 Sư tử Leo</option>
          </select>
        </label>
      </div>
      <p id="tchNewStuErr" class="danger" style="margin:2px 0;font-weight:700"></p>
      <div class="actions">
        <button type="submit" class="primary">${t('Tạo & Thêm vào lớp', 'Create & Enroll')}</button>
        <button type="button" onclick="$('#modal').close()">${t('Hủy', 'Cancel')}</button>
      </div>
    </form>`);

    const form = $('#teacherNewStudentForm');
    if (form) {
      form.onsubmit = async e => {
        e.preventDefault();
        const fd = new FormData(form);
        const errEl = $('#tchNewStuErr');
        const name = String(fd.get('name') || '').trim().slice(0, 30);
        const username = String(fd.get('username') || '').trim().toLowerCase().replace(/\s+/g, '');
        const password = String(fd.get('password') || '').trim();
        const grade = Number(fd.get('grade')) || cls.grade || 4;
        const avatar = fd.get('avatar') || 'bunny';
        try {
          if (!name) throw new Error(t('Vui lòng nhập tên học sinh.', 'Enter student name.'));
          if (username.length < 2 || !/^[a-z0-9_.-]+$/.test(username)) {
            throw new Error(t('Tên đăng nhập chỉ gồm chữ không dấu và số.', 'Alphanumeric username only.'));
          }
          if (password.length < NUMI_MIN_PIN) throw new Error(t('Mã PIN cần ít nhất 6 ký tự.', 'PIN needs 6+ characters.'));
          const users = getLocalUsers();
          if (users[username]) throw new Error(t('Tên đăng nhập này đã tồn tại!', 'Username already exists!'));
          const hash = await hashPassword(password);
          users[username] = {
            username,
            name,
            hash,
            role: 'student',
            avatar,
            grade,
            createdAt: new Date().toISOString(),
            lastLoginAt: null,
            loginCount: 0
          };
          saveLocalUsers(users);
          addStudentToClass(cls.id, username);
          $('#modal').close();
          toast(t(`Đã tạo và thêm ${name} vào ${cls.name}!`, `Created and enrolled ${name} in ${cls.name}!`));
          renderTeacherWorkspace();
        } catch (err) {
          if (errEl) errEl.textContent = err.message;
        }
      };
    }
  }

  // Admin-only modal: Assign existing students on device into a class
  function openAdminEnrollStudentsModal(cls) {
    const allSummary = typeof getStudentsSummary === 'function' ? getStudentsSummary() : [];
    const available = allSummary.filter(s => s.role !== 'admin' && s.role !== 'teacher' && !(cls.students || []).includes(s.username));
    modal(`<h2>📥 ${t(`Xếp học sinh vào ${cls.name}`, `Assign Students to ${cls.name}`)}</h2>
    ${available.length === 0
      ? `<p class="muted" style="margin:10px 0">${t('Tất cả học sinh trên máy đã có trong lớp này.', 'All students on this device are already in this class.')}</p>
         <div class="actions"><button type="button" class="primary" onclick="$('#modal').close()">${t('Đóng', 'Close')}</button></div>`
      : `<form id="enrollExistingForm" style="display:grid;gap:12px;margin-top:8px">
          <div class="adm-student-checklist">
            ${available.map(s => `<label class="adm-check-chip">
              <input type="checkbox" name="pickStudent" value="${esc(s.username)}">
              <span><b>${esc(s.name)}</b> <small>(@${esc(s.username)} · ${t('Lớp', 'Gr')} ${s.grade})</small></span>
            </label>`).join('')}
          </div>
          <div class="actions">
            <button type="submit" class="primary">${t('Thêm vào lớp', 'Add to Class')}</button>
            <button type="button" onclick="$('#modal').close()">${t('Hủy', 'Cancel')}</button>
          </div>
        </form>`}`);

    const form = $('#enrollExistingForm');
    if (form) {
      form.onsubmit = e => {
        e.preventDefault();
        const picked = new FormData(form).getAll('pickStudent');
        if (!picked.length) { toast(t('Chọn ít nhất 1 học sinh nhé!', 'Pick at least 1 student!')); return; }
        picked.forEach(u => addStudentToClass(cls.id, u));
        $('#modal').close();
        toast(t(`Đã thêm ${picked.length} học sinh vào ${cls.name}!`, `Added ${picked.length} students to ${cls.name}!`));
        if (isCurrentUserTeacher()) renderTeacherWorkspace();
        else if (typeof renderAdmin === 'function') renderAdmin();
      };
    }
  }

  // Modal: Create new class with Level (Tiểu học / THCS) + Grade + Saved Code
  function openCreateClassModal(teacherUsername) {
    modal(`<h2>🏫 ${t('Tạo lớp học mới & Lưu Mã lớp', 'Create New Class & Save Code')}</h2>
    <p class="muted" style="margin:4px 0 10px;font-size:13px">${t('Phân loại rõ theo Cấp học và Khối lớp. Mã lớp sẽ được lưu tự động để phát cho học sinh vào lớp.', 'Classify by school level and grade. The class code is saved automatically for students to join.')}</p>
    <form id="createClassForm" style="display:grid;gap:10px;margin-top:6px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <label>${t('Cấp học:', 'School Level:')}
          <select name="level" id="newClsLevel">
            <option value="primary">${t('Tiểu học (Lớp 1–5)', 'Primary (Gr 1–5)')}</option>
            <option value="secondary">${t('THCS (Lớp 6–9)', 'Secondary (Gr 6–9)')}</option>
          </select>
        </label>
        <label>${t('Khối lớp:', 'Grade Level:')}
          <select name="grade" id="newClsGrade">
            ${[1, 2, 3, 4, 5].map(g => `<option value="${g}" ${g === 4 ? 'selected' : ''}>${t('Lớp', 'Grade')} ${g}</option>`).join('')}
          </select>
        </label>
      </div>
      <div style="display:grid;grid-template-columns:1.3fr 1fr;gap:10px">
        <label>${t('Tên lớp học:', 'Class Name:')}
          <input name="name" required maxlength="40" placeholder="${t('VD: Lớp 4B / Lớp 7A', 'e.g. Grade 4B')}">
        </label>
        <label>${t('Mã lớp (để trống để tự sinh):', 'Code (leave blank to auto):')}
          <input name="code" maxlength="10" placeholder="${t('VD: 4BLAN', 'Auto')}" style="text-transform:uppercase">
        </label>
      </div>
      <p id="createClsErr" class="danger" style="margin:2px 0;font-weight:700"></p>
      <div class="actions">
        <button type="submit" class="primary">💾 ${t('Tạo lớp & Lưu Mã lớp', 'Create & Save Code')}</button>
        <button type="button" onclick="$('#modal').close()">${t('Hủy', 'Cancel')}</button>
      </div>
    </form>`);

    const levelSel = $('#newClsLevel');
    const gradeSel = $('#newClsGrade');
    if (levelSel && gradeSel) {
      levelSel.onchange = () => {
        const list = gradesForLevel(levelSel.value);
        gradeSel.innerHTML = list.map(g => `<option value="${g}">${t('Lớp', 'Grade')} ${g}</option>`).join('');
      };
    }

    const form = $('#createClassForm');
    if (form) {
      form.onsubmit = e => {
        e.preventDefault();
        const fd = new FormData(form);
        const errEl = $('#createClsErr');
        try {
          const cls = createClassForTeacher(teacherUsername, {
            level: fd.get('level'),
            grade: fd.get('grade'),
            name: fd.get('name'),
            code: fd.get('code')
          });
          activeTeacherLevelFilter = 'all';
          activeTeacherClassId = cls.id;
          $('#modal').close();
          toast(t(`✅ Đã tạo ${cls.name} (${levelShortBadge(cls.level)}) · Mã lớp đã lưu: ${cls.code}!`, `✅ Created ${cls.name} · Saved code: ${cls.code}!`));
          renderTeacherWorkspace();
        } catch (err) {
          if (errEl) errEl.textContent = err.message;
        }
      };
    }
  }

  // Dedicated Isolated Teacher Workspace (`view === 'teacher'`)
  function renderTeacherWorkspace() {
    if (typeof stop === 'function') stop();
    view = 'teacher';
    if (typeof window !== 'undefined') window.view = 'teacher';
    if (typeof global !== 'undefined') global.view = 'teacher';
    if (typeof document !== 'undefined' && document.body) {
      document.body.dataset.view = 'teacher';
    }

    const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
    if (!u || (u.role !== 'teacher' && u.role !== 'admin')) {
      $('#app').innerHTML = `<div class="narrow card admin-gate-card">
        <h2>👩‍🏫 ${t('Không gian Lớp học Giáo viên', 'Teacher Classroom Space')}</h2>
        <p class="muted">${t('Vui lòng đăng nhập bằng tài khoản Giáo viên hoặc bấm "Giáo viên tạo lớp" để thiết lập lớp học riêng của Thầy/Cô.', 'Please sign in as a Teacher or click "Teacher Setup" to create your own classes.')}</p>
        <div class="actions">
          <button class="primary wide" onclick="openAccount('login')">${t('Đăng nhập Giáo viên', 'Sign in as Teacher')}</button>
          <button class="wide" onclick="openAccount('teacher-setup')">👩‍🏫 ${t('Thiết lập tài khoản Giáo viên mới', 'Set up New Teacher Account')}</button>
        </div>
      </div>`;
      return;
    }

    const allMyClasses = getClassesForTeacher(u.username);
    const primaryCount = allMyClasses.filter(c => c.level === 'primary').length;
    const secondaryCount = allMyClasses.filter(c => c.level === 'secondary').length;
    const myClasses = getClassesForTeacher(u.username, activeTeacherLevelFilter);

    if (!activeTeacherClassId || !myClasses.some(c => c.id === activeTeacherClassId)) {
      activeTeacherClassId = myClasses[0]?.id || null;
    }
    const activeCls = myClasses.find(c => c.id === activeTeacherClassId) || null;
    const students = activeCls ? getStudentsForTeacher(u.username, activeCls.id) : [];
    const analytics = typeof computeAdminAnalytics === 'function' ? computeAdminAnalytics(students) : { days: [], atRiskStudents: [] };
    const maxCount = Math.max(1, ...(analytics.days || []).map(d => d.questions || 0));

    const totalQuestions = students.reduce((s, x) => s + x.totalAnswered, 0);
    const totalCorrect = students.reduce((s, x) => s + x.totalCorrect, 0);
    const avgAcc = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const totalSessions = students.reduce((s, x) => s + x.totalSessions, 0);

    const studentSet = new Set(students.map(s => s.username));
    const allAsgs = typeof loadTargetedAssignments === 'function' ? loadTargetedAssignments() : [];
    const classAsgs = activeCls
      ? allAsgs.filter(a => a.classId === activeCls.id || (a.createdBy === u.username && Array.isArray(a.targetStudents) && a.targetStudents.some(un => studentSet.has(un))))
      : [];
    const usersMap = getLocalUsers();

    $('#app').innerHTML = `<section class="admin-view teacher-workspace">
      <div class="card admin-header-card teacher-header-card">
        <div class="admin-title-row">
          <div>
            <span class="eyebrow">NUMIQUICK · ${t('KHÔNG GIAN GIÁO VIÊN (RIÊNG BIỆT)', 'PRIVATE TEACHER WORKSPACE')}</span>
            <h1 class="admin-main-title">👩‍🏫 ${t('Lớp học của', 'Classes of')} ${esc(u.name)}</h1>
            <p class="muted">${t('Tài khoản riêng — chỉ hiển thị và quản lý đúng các lớp cùng học sinh của Thầy/Cô.', 'Private workspace — strictly scoped to your own classes and enrolled students.')}</p>
          </div>
          <div class="admin-top-actions">
            <button type="button" class="primary admin-btn" id="tchCreateClassBtn">+ ${t('Tạo lớp mới', 'New Class')}</button>
            <button type="button" class="admin-btn" id="tchProfileBtn">👤 ${t('Hồ sơ & Đổi PIN', 'Profile & PIN')}</button>
            <button type="button" class="admin-btn" id="tchSignOutBtn">${t('Đăng xuất', 'Sign out')}</button>
          </div>
        </div>

        <div class="teacher-level-filters">
          <button type="button" class="admin-grade-chip ${activeTeacherLevelFilter === 'all' ? 'active' : ''}" data-tch-lvl="all">${t('Tất cả cấp', 'All Levels')} (${allMyClasses.length})</button>
          <button type="button" class="admin-grade-chip ${activeTeacherLevelFilter === 'primary' ? 'active' : ''}" data-tch-lvl="primary">🌱 ${t('Tiểu học (Lớp 1–5)', 'Primary (1–5)')} (${primaryCount})</button>
          <button type="button" class="admin-grade-chip ${activeTeacherLevelFilter === 'secondary' ? 'active' : ''}" data-tch-lvl="secondary">📘 ${t('THCS (Lớp 6–9)', 'Secondary (6–9)')} (${secondaryCount})</button>
        </div>

        <div class="teacher-class-tabs">
          ${myClasses.map(c => `<button type="button" class="teacher-class-tab ${c.id === activeCls?.id ? 'active' : ''}" data-tch-class="${esc(c.id)}">
            🏫 <b>${esc(c.name)}</b> <span class="tch-lvl-tag">${esc(levelShortBadge(c.level))} · K${c.grade}</span> <small>(${(c.students || []).length} HS)</small>
          </button>`).join('')}
        </div>
      </div>

      ${!activeCls ? `<div class="card" style="text-align:center;padding:30px">
        <h3>${activeTeacherLevelFilter === 'all' ? t('Thầy/Cô chưa có lớp học nào', 'No classes created yet') : t('Chưa có lớp nào thuộc cấp học này', 'No classes in this level yet')}</h3>
        <p class="muted">${t('Bấm "+ Tạo lớp mới" để chọn Cấp học, Khối lớp và nhận Mã lớp đã lưu phát cho học sinh.', 'Click "+ New Class" to choose level, grade, and save a class code for students.')}</p>
        <button type="button" class="primary" id="tchEmptyCreateBtn">+ ${t('Tạo lớp mới ngay', 'Create New Class')}</button>
      </div>` : `
      <div class="card teacher-class-banner">
        <div class="teacher-banner-info">
          <div class="teacher-banner-title">
            <h2>${esc(activeCls.name)}</h2>
            <span class="badge-level ${activeCls.level}">${esc(levelShortBadge(activeCls.level))}</span>
            <span class="badge-grade">${t('Khối', 'Grade')} ${activeCls.grade}</span>
          </div>
          <div class="saved-code-box">
            <div>
              <small>${t('MÃ LỚP ĐÃ LƯU (PHÁT CHO HỌC SINH)', 'SAVED CLASS CODE (SHARE WITH STUDENTS)')}</small>
              <strong class="saved-code-value">${esc(activeCls.code)}</strong>
            </div>
            <div class="saved-code-btns">
              <button type="button" class="primary" id="tchCopyCodeBtn">📋 ${t('Copy Mã lớp', 'Copy Code')}</button>
              <button type="button" id="tchCopyJoinBtn">🔗 ${t('Copy Link mời', 'Copy Link')}</button>
            </div>
          </div>
          <p class="muted" style="margin:6px 0 0;font-size:12.5px">💡 ${t(`Học sinh mở web → chọn "Vào lớp bằng Mã" → nhập mã ${activeCls.code} và điền tên là tự động vào lớp!`, `Students open the app → tap "Join Class" → enter ${activeCls.code} + their name to join automatically!`)}</p>
        </div>
        <div class="teacher-banner-actions">
          <button type="button" class="primary" id="tchAssignHwBtn">🎯 ${t('Giao bài cho lớp', 'Assign Homework')}</button>
          <button type="button" id="tchPrintReportBtn">🖨️ ${t('In / PDF báo cáo', 'Print / PDF')}</button>
          <button type="button" id="tchExportCsvBtn">↓ ${t('Xuất CSV', 'Export CSV')}</button>
        </div>
      </div>

      <div class="admin-kpi-grid" style="margin-bottom:18px">
        <div class="admin-kpi-card"><div class="kpi-body"><small>${t('Sĩ số lớp', 'Class Size')}</small><strong>${students.length}</strong><span class="kpi-subtext">${esc(activeCls.name)} · ${esc(levelShortBadge(activeCls.level))}</span></div></div>
        <div class="admin-kpi-card"><div class="kpi-body"><small>${t('Độ chính xác TB', 'Avg Accuracy')}</small><strong>${avgAcc}%</strong><span class="kpi-subtext">${totalCorrect}/${totalQuestions} ${t('câu đúng', 'correct')}</span></div></div>
        <div class="admin-kpi-card"><div class="kpi-body"><small>${t('Tổng lượt luyện', 'Total Sessions')}</small><strong>${totalSessions}</strong><span class="kpi-subtext">${t('Trong lớp này', 'In this class')}</span></div></div>
        <div class="admin-kpi-card"><div class="kpi-body"><small>${t('Cần chú ý kèm', 'Needs Attention')}</small><strong>${(analytics.atRiskStudents || []).length}</strong><span class="kpi-subtext">${t('Chính xác < 75% hoặc nhiều lỗi', 'Accuracy < 75% or mistakes')}</span></div></div>
      </div>

      <div class="adm-insights-grid">
        <div class="card adm-chart-card">
          <h3>📊 ${t('Hoạt động 7 ngày của lớp', 'Class 7-Day Activity')}</h3>
          <div class="adm-bar-chart">
            ${(analytics.days || []).map(d => {
              const qCount = d.questions || 0;
              const pct = Math.round((qCount / maxCount) * 100);
              return `<div class="adm-bar-col">
                <span class="adm-bar-val">${qCount || ''}</span>
                <div class="adm-bar-track"><div class="adm-bar-fill" style="height:${Math.max(qCount ? 14 : 4, pct)}%"></div></div>
                <small>${esc(d.label)}</small>
              </div>`;
            }).join('')}
          </div>
        </div>

        <div class="card adm-risk-card">
          <h3>🩺 ${t('Học sinh cần kèm (Phụ đạo 1 chạm)', 'Students Needing Support')}</h3>
          ${(analytics.atRiskStudents || []).length === 0
            ? `<p class="muted" style="padding:18px 0;text-align:center">🎉 ${t('Các em trong lớp đều đang có phong độ rất tốt!', 'All students in this class are doing great!')}</p>`
            : `<div class="adm-risk-list">${analytics.atRiskStudents.slice(0, 5).map(s => `<div class="adm-risk-row">
                <div>
                  <b>${esc(s.name)}</b> <small>(Lớp ${s.grade})</small>
                  <div class="adm-risk-meta">${t('Đúng', 'Acc')}: <b>${s.accuracy}%</b> · ${s.mistakesCount} ${t('câu sai tồn', 'mistakes')}</div>
                </div>
                <button type="button" class="primary adm-remedial-btn" data-tch-remedial="${esc(s.username)}">🎯 ${t('Phụ đạo', 'Remedial')}</button>
              </div>`).join('')}</div>`}
        </div>
      </div>

      <div class="card admin-table-card" style="margin-bottom:18px">
        <div class="row" style="flex-wrap:wrap;margin-bottom:14px">
          <div>
            <h3 style="margin:0">👥 ${t(`Học sinh lớp ${activeCls.name} (${students.length})`, `Students in ${activeCls.name} (${students.length})`)}</h3>
            <p class="muted" style="margin:2px 0 0;font-size:13px">${t('Học sinh tự vào bằng Mã lớp sẽ hiện ngay tại đây, hoặc Thầy/Cô có thể tạo tài khoản mới trực tiếp cho em.', 'Students joining with your Class Code appear here automatically, or add a new student directly.')}</p>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button type="button" class="primary" id="tchAddNewStuBtn">+ ${t('Tạo học sinh mới vào lớp', 'Add New Student')}</button>
          </div>
        </div>
        ${students.length === 0
          ? `<div class="empty" style="padding:20px;text-align:center">${t('Lớp chưa có học sinh nào. Hãy phát Mã lớp', 'No students yet. Share Class Code')} <b>${esc(activeCls.code)}</b> ${t('để các em nhập tên và tự vào lớp nhé!', 'so students can enter their name and join automatically!')}</div>`
          : `<div class="admin-table-responsive">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>${t('Học sinh', 'Student')}</th>
                    <th>${t('Khối', 'Grade')}</th>
                    <th>${t('Hoạt động gần nhất', 'Last Active')}</th>
                    <th>${t('Tiến độ', 'Progress')}</th>
                    <th>${t('Chính xác', 'Accuracy')}</th>
                    <th>${t('Điều phối', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  ${students.map(s => `<tr>
                    <td>
                      <div class="student-cell">
                        <div class="student-avatar-sm">${(typeof numiAnimalOriginal === 'function' ? numiAnimalOriginal : animal)(s.avatar)}</div>
                        <div>
                          <div class="student-name-line"><b>${esc(s.name)}</b></div>
                          <small class="student-uname">@${esc(s.username)}</small>
                        </div>
                      </div>
                    </td>
                    <td><span class="badge-grade">${t('Lớp', 'Gr')} ${s.grade}</span></td>
                    <td>${typeof formatAdminTime === 'function' ? formatAdminTime(s.lastLogin) : esc(s.lastLogin || '—')}</td>
                    <td><b>${s.totalSessions}</b> ${t('lượt', 'runs')} · ${s.xp} XP</td>
                    <td><span class="acc-pill ${s.accuracy >= 80 ? 'good' : s.accuracy >= 60 ? 'mid' : 'low'}">${s.accuracy}%</span></td>
                    <td>
                      <div style="display:flex;gap:6px;flex-wrap:wrap">
                        <button type="button" class="action-btn-sm" data-tch-assign-one="${esc(s.username)}">🎯 ${t('Giao bài', 'Assign')}</button>
                        <button type="button" class="action-btn-sm" data-tch-detail="${esc(s.username)}">📋 ${t('Chi tiết', 'Details')}</button>
                        <button type="button" class="action-btn-sm" data-tch-edit="${esc(s.username)}">✏️ ${t('Sửa', 'Edit')}</button>
                        <button type="button" class="action-btn-sm btn-del" data-tch-remove="${esc(s.username)}" title="${t('Gỡ khỏi lớp', 'Remove from class')}">✕</button>
                      </div>
                    </td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>`}
      </div>

      <div class="card adm-homework-card">
        <div class="adm-hw-head">
          <div>
            <h3>📚 ${t(`Bài tập đã giao cho ${activeCls.name} (${classAsgs.length})`, `Assignments for ${activeCls.name} (${classAsgs.length})`)}</h3>
            <p class="muted" style="margin:2px 0 0;font-size:13px">${t('Theo dõi trạng thái nộp bài của riêng học sinh trong lớp này.', 'Track completion status for students in this class.')}</p>
          </div>
          <button type="button" class="primary" id="tchAssignHwBtn2">+ ${t('Giao bài mới', 'New Assignment')}</button>
        </div>
        ${classAsgs.length === 0
          ? `<p class="muted" style="margin:12px 0 0">${t('Chưa có bài tập nào giao cho lớp này.', 'No assignments created for this class yet.')}</p>`
          : `<div class="adm-asg-list">${classAsgs.map(asg => {
              const targets = (asg.targetStudents || []).filter(un => studentSet.has(un));
              const subs = asg.submissions || {};
              return `<div class="adm-asg-item">
                <div class="adm-asg-top">
                  <div>
                    <b>${esc(asg.title)}</b>
                    <small>${t('Lớp', 'Gr')} ${asg.config?.grade || activeCls.grade} · ${asg.config?.count || 10} ${t('câu', 'qs')} · ${asg.config?.seconds || 20}s/${t('câu', 'q')}${asg.due_date ? ` · ${t('Hạn:', 'Due:')} ${esc(asg.due_date)}` : ''}</small>
                  </div>
                  <div class="adm-asg-btns">
                    <button type="button" class="ghost" data-tch-copy-hw="${esc(asg.id)}">🔗 ${t('Copy Link', 'Copy Link')}</button>
                    <button type="button" class="ghost btn-del" data-tch-del-hw="${esc(asg.id)}">🗑️</button>
                  </div>
                </div>
                <div class="adm-asg-targets">
                  ${(targets.length ? targets : (asg.targetStudents || [])).map(uname => {
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
      `}
    </section>`;

    // Bind Teacher Workspace events
    $('#tchCreateClassBtn')?.addEventListener('click', () => openCreateClassModal(u.username));
    $('#tchEmptyCreateBtn')?.addEventListener('click', () => openCreateClassModal(u.username));
    $('#tchProfileBtn')?.addEventListener('click', () => renderProfile());
    $('#tchSignOutBtn')?.addEventListener('click', () => {
      if (confirm(t('Thầy/Cô có chắc muốn đăng xuất?', 'Are you sure you want to sign out?'))) localSignOut();
    });
    $$('[data-tch-lvl]').forEach(btn => {
      btn.onclick = () => {
        activeTeacherLevelFilter = btn.dataset.tchLvl;
        renderTeacherWorkspace();
      };
    });
    $$('[data-tch-class]').forEach(btn => {
      btn.onclick = () => {
        activeTeacherClassId = btn.dataset.tchClass;
        renderTeacherWorkspace();
      };
    });

    if (activeCls) {
      $('#tchAssignHwBtn')?.addEventListener('click', () => openTeacherAssignModal(activeCls, []));
      $('#tchAssignHwBtn2')?.addEventListener('click', () => openTeacherAssignModal(activeCls, []));
      $('#tchAddNewStuBtn')?.addEventListener('click', () => openTeacherCreateStudentModal(activeCls));
      $('#tchPrintReportBtn')?.addEventListener('click', () => openClassPrintReport(activeCls, students));
      $('#tchExportCsvBtn')?.addEventListener('click', () => {
        if (typeof adminExportCSV === 'function') adminExportCSV(students);
      });
      $('#tchCopyCodeBtn')?.addEventListener('click', () => {
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(activeCls.code)
            .then(() => toast(t(`Đã copy Mã lớp "${activeCls.code}"! Gửi mã này cho học sinh nhé.`, `Copied Class Code "${activeCls.code}"!`)))
            .catch(() => modal(`<h3>📋 ${t('Mã lớp học', 'Class Code')}</h3><input readonly value="${esc(activeCls.code)}" style="width:100%;padding:10px;font-size:20px;font-weight:800;text-align:center" onclick="this.select()">`));
        } else {
          modal(`<h3>📋 ${t('Mã lớp học', 'Class Code')}</h3><input readonly value="${esc(activeCls.code)}" style="width:100%;padding:10px;font-size:20px;font-weight:800;text-align:center" onclick="this.select()">`);
        }
      });
      $('#tchCopyJoinBtn')?.addEventListener('click', () => {
        const url = buildClassJoinLink(activeCls);
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(url)
            .then(() => toast(t(`Đã copy Link mời vào ${activeCls.name} (Mã: ${activeCls.code})!`, `Copied class invite link!`)))
            .catch(() => modal(`<h3>🔗 ${t('Link mời vào lớp', 'Class Invite Link')}</h3><p>${t('Mã lớp:', 'Code:')} <b>${esc(activeCls.code)}</b></p><input readonly value="${esc(url)}" style="width:100%;padding:8px" onclick="this.select()">`));
        } else {
          modal(`<h3>🔗 ${t('Link mời vào lớp', 'Class Invite Link')}</h3><p>${t('Mã lớp:', 'Code:')} <b>${esc(activeCls.code)}</b></p><input readonly value="${esc(url)}" style="width:100%;padding:8px" onclick="this.select()">`);
        }
      });

      $$('[data-tch-assign-one]').forEach(btn => {
        btn.onclick = () => openTeacherAssignModal(activeCls, [btn.dataset.tchAssignOne]);
      });
      $$('[data-tch-detail]').forEach(btn => {
        btn.onclick = () => {
          const uname = btn.dataset.tchDetail;
          if (!canTeacherManageStudent(u.username, uname)) return;
          if (typeof adminViewDetailModal === 'function') adminViewDetailModal(uname);
        };
      });
      $$('[data-tch-edit]').forEach(btn => {
        btn.onclick = () => {
          const uname = btn.dataset.tchEdit;
          if (!canTeacherManageStudent(u.username, uname)) return;
          if (typeof editStudentProfileModal === 'function') editStudentProfileModal(uname);
        };
      });
      $$('[data-tch-remove]').forEach(btn => {
        btn.onclick = () => {
          const uname = btn.dataset.tchRemove;
          if (!confirm(t(`Gỡ học sinh @${uname} khỏi ${activeCls.name}? (Tài khoản học sinh vẫn được giữ nguyên)`, `Remove @${uname} from ${activeCls.name}?`))) return;
          removeStudentFromClass(activeCls.id, uname);
          toast(t('Đã gỡ học sinh khỏi lớp.', 'Removed student from class.'));
          renderTeacherWorkspace();
        };
      });
      $$('[data-tch-remedial]').forEach(btn => {
        btn.onclick = async () => {
          const uname = btn.dataset.tchRemedial;
          if (!canTeacherManageStudent(u.username, uname)) return;
          try {
            const res = await assignRemedialForStudent(uname);
            const allAsg = loadTargetedAssignments();
            const saved = allAsg.find(a => a.id === res.assignment.id);
            if (saved) {
              saved.createdBy = activeCls.teacherUsername;
              saved.classId = activeCls.id;
              saved.className = activeCls.name;
              saveTargetedAssignments(allAsg);
            }
            toast(t('Đã giao bài phụ đạo riêng cho học sinh!', 'Remedial homework assigned!'));
            renderTeacherWorkspace();
          } catch (err) {
            toast(err.message);
          }
        };
      });
      $$('[data-tch-copy-hw]').forEach(btn => {
        btn.onclick = () => {
          const asg = classAsgs.find(a => a.id === btn.dataset.tchCopyHw);
          if (!asg || typeof buildHomeworkShareLink !== 'function') return;
          const url = buildHomeworkShareLink(asg);
          if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(url)
              .then(() => toast(t('Đã sao chép link bài tập!', 'Copied homework link!')))
              .catch(() => modal(`<h3>🔗 ${t('Link bài tập', 'Homework Link')}</h3><input readonly value="${esc(url)}" style="width:100%;padding:8px" onclick="this.select()">`));
          }
        };
      });
      $$('[data-tch-del-hw]').forEach(btn => {
        btn.onclick = () => {
          if (!confirm(t('Xóa bài tập đã giao này?', 'Delete this assignment?'))) return;
          if (typeof deleteTargetedAssignment === 'function') deleteTargetedAssignment(btn.dataset.tchDelHw);
          renderTeacherWorkspace();
        };
      });
    }

    if (typeof translate === 'function') translate();
    if (typeof window !== 'undefined' && window.scrollTo) window.scrollTo(0, 0);
  }

  // ---------------- Admin Dashboard: Manage Teachers & Classes ----------------
  function openAdminCreateTeacherModal() {
    modal(`<h2>👩‍🏫 ${t('Tạo tài khoản Thầy/Cô & Lớp học', 'Create Teacher Account & Class')}</h2>
    <p class="muted" style="margin:4px 0 12px;font-size:13px">${t('Thầy/Cô đăng nhập bằng tài khoản này sẽ chỉ quản lý và điều phối riêng học sinh trong lớp của mình.', 'This teacher will log into a private workspace managing only their own classes and students.')}</p>
    <form id="adminCreateTeacherForm" style="display:grid;gap:10px">
      <label>${t('Họ tên Thầy/Cô:', 'Teacher Name:')}
        <input name="name" required maxlength="40" placeholder="${t('VD: Thầy Hùng / Cô Mai', 'e.g. Ms. Mai')}">
      </label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <label>${t('Tên đăng nhập:', 'Username:')}
          <input name="username" required minlength="2" maxlength="20" placeholder="thayhung" autocomplete="off">
        </label>
        <label>${t('Mã PIN / Mật khẩu:', 'PIN / Password:')}
          <input name="password" required minlength="6" maxlength="20" value="123456" autocomplete="off">
        </label>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <label>${t('Cấp học:', 'School Level:')}
          <select name="level" id="admTchLevel">
            <option value="primary">${t('Tiểu học (Lớp 1–5)', 'Primary (Gr 1–5)')}</option>
            <option value="secondary">${t('THCS (Lớp 6–9)', 'Secondary (Gr 6–9)')}</option>
          </select>
        </label>
        <label>${t('Khối lớp:', 'Grade:')}
          <select name="grade" id="admTchGrade">${[1, 2, 3, 4, 5].map(g => `<option value="${g}" ${g === 4 ? 'selected' : ''}>${t('Lớp', 'Grade')} ${g}</option>`).join('')}</select>
        </label>
      </div>
      <div style="display:grid;grid-template-columns:1.3fr 1fr;gap:10px">
        <label>${t('Tên lớp phụ trách:', 'Class Name:')}
          <input name="className" required maxlength="40" placeholder="${t('VD: Lớp 5A', 'e.g. Grade 5A')}">
        </label>
        <label>${t('Mã lớp (để trống để tự sinh):', 'Code (optional):')}
          <input name="code" maxlength="10" placeholder="Auto" style="text-transform:uppercase">
        </label>
      </div>
      <p id="admNewTchErr" class="danger" style="margin:2px 0;font-weight:700"></p>
      <div class="actions">
        <button type="submit" class="primary">${t('Tạo Giáo viên & Lưu mã lớp', 'Create Teacher & Save Code')}</button>
        <button type="button" onclick="$('#modal').close()">${t('Hủy', 'Cancel')}</button>
      </div>
    </form>`);

    const levelSel = $('#admTchLevel');
    const gradeSel = $('#admTchGrade');
    if (levelSel && gradeSel) {
      levelSel.onchange = () => {
        const list = gradesForLevel(levelSel.value);
        gradeSel.innerHTML = list.map(g => `<option value="${g}">${t('Lớp', 'Grade')} ${g}</option>`).join('');
      };
    }

    const form = $('#adminCreateTeacherForm');
    if (form) {
      form.onsubmit = async e => {
        e.preventDefault();
        const fd = new FormData(form);
        const errEl = $('#admNewTchErr');
        try {
          const { teacher, cls } = await createTeacherWithClass({
            name: fd.get('name'),
            username: fd.get('username'),
            password: fd.get('password'),
            level: fd.get('level'),
            grade: fd.get('grade'),
            className: fd.get('className'),
            code: fd.get('code')
          });
          $('#modal').close();
          toast(t(`Đã tạo ${teacher.name} (@${teacher.username}) & ${cls.name} (Mã: ${cls.code})!`, `Created ${teacher.name} & ${cls.name}!`));
          if (typeof renderAdmin === 'function') renderAdmin();
        } catch (err) {
          if (errEl) errEl.textContent = err.message;
        }
      };
    }
  }

  const renderAdminBeforeClasses = typeof renderAdmin === 'function' ? renderAdmin : null;
  if (renderAdminBeforeClasses) {
    renderAdmin = function () {
      renderAdminBeforeClasses();
      const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
      if (!u || (u.role !== 'admin' && u.username !== 'admin')) return;
      const root = $('.admin-view');
      if (!root || $('#admTeachersClassesCard')) return;

      const classes = loadClasses();
      const teachers = getTeachersList();
      const cardHtml = `<div class="card adm-homework-card" id="admTeachersClassesCard" style="margin-bottom:18px">
        <div class="adm-hw-head">
          <div>
            <h3>🏫 ${t(`Quản lý Thầy/Cô & Lớp học (${classes.length} lớp · ${teachers.length} GV)`, `Teachers & Classes (${classes.length} classes · ${teachers.length} teachers)`)}</h3>
            <p class="muted" style="margin:2px 0 0;font-size:13px">${t('Phân lớp theo Cấp học (Tiểu học / THCS) cho từng Thầy/Cô và lưu sẵn Mã lớp cho học sinh tự vào.', 'Organize classes by school level for each teacher with saved join codes.')}</p>
          </div>
          <button type="button" class="primary" id="admCreateTeacherBtn">+ ${t('Tạo Thầy/Cô & Lớp', 'Add Teacher & Class')}</button>
        </div>
        ${classes.length === 0
          ? `<p class="muted" style="margin:10px 0 0">${t('Chưa có lớp học nào.', 'No classes yet.')}</p>`
          : `<div class="teacher-admin-grid">${classes.map(c => `<div class="teacher-admin-item">
              <div class="teacher-admin-top">
                <div>
                  <b>🏫 ${esc(c.name)}</b> <span class="badge-level ${c.level}">${esc(levelShortBadge(c.level))}</span> <span class="badge-grade">${t('Khối', 'Gr')} ${c.grade}</span>
                  <div class="muted" style="font-size:12.5px;margin-top:3px">👩‍🏫 ${esc(c.teacherName)} (@${esc(c.teacherUsername)}) · ${t('Mã lớp:', 'Code:')} <b>${esc(c.code)}</b></div>
                </div>
                <span class="adm-target-pill is-done">${(c.students || []).length} ${t('học sinh', 'students')}</span>
              </div>
              <div class="teacher-admin-actions">
                <button type="button" class="action-btn-sm" data-adm-enroll-cls="${esc(c.id)}">📥 ${t('Xếp học sinh', 'Assign Students')}</button>
                <button type="button" class="action-btn-sm btn-del" data-adm-del-cls="${esc(c.id)}">🗑️ ${t('Xóa lớp', 'Delete')}</button>
              </div>
            </div>`).join('')}</div>`}
      </div>`;

      const tableCard = $('#adminTableCard');
      if (tableCard) tableCard.insertAdjacentHTML('beforebegin', cardHtml);
      else root.insertAdjacentHTML('beforeend', cardHtml);

      $('#admCreateTeacherBtn')?.addEventListener('click', openAdminCreateTeacherModal);
      $$('[data-adm-enroll-cls]').forEach(btn => {
        btn.onclick = () => {
          const cls = loadClasses().find(c => c.id === btn.dataset.admEnrollCls);
          if (cls) openAdminEnrollStudentsModal(cls);
        };
      });
      $$('[data-adm-del-cls]').forEach(btn => {
        btn.onclick = () => {
          if (!confirm(t('Xóa lớp học này? (Tài khoản giáo viên và học sinh vẫn được giữ nguyên)', 'Delete this class?'))) return;
          deleteClassById(btn.dataset.admDelCls);
          toast(t('Đã xóa lớp học.', 'Class deleted.'));
          renderAdmin();
        };
      });
    };
    if (typeof window !== 'undefined') window.renderAdmin = renderAdmin;
    if (typeof global !== 'undefined') global.renderAdmin = renderAdmin;
  }

  // ---------------- Student Home & Profile Class Integration ----------------
  function injectStudentClassBadgeOnHome() {
    if (typeof view === 'undefined' || view !== 'home') return;
    const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
    if (!u || u.role === 'admin' || u.role === 'teacher') return;
    const classes = getClassesForStudent(u.username);
    if (!classes.length) return;
    const topBar = $('.home-v2-top');
    if (!topBar || $('#studentClassHomeBadge')) return;
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.id = 'studentClassHomeBadge';
    pill.className = 'student-class-pill';
    pill.onclick = () => nav('profile');
    pill.innerHTML = `🏫 ${classes.map(c => `${esc(c.name)} · ${esc(c.teacherName)}`).join(' · ')}`;
    topBar.append(pill);
  }

  function injectStudentJoinClassCardInProfile() {
    if (typeof view === 'undefined' || view !== 'profile') return;
    const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
    if (!u || u.role === 'admin' || u.role === 'teacher') return;
    const leftCol = $('.profile-bento-col-left');
    if (!leftCol || $('#studentClassJoinCard')) return;

    const myClasses = getClassesForStudent(u.username);
    const card = document.createElement('div');
    card.id = 'studentClassJoinCard';
    card.className = 'card profile-class-card';
    card.innerHTML = `
      <h3>🏫 ${t('Lớp học của em', 'My Classroom')}</h3>
      ${myClasses.length
        ? `<div class="student-enrolled-list">${myClasses.map(c => `<div class="student-enrolled-item">
            <div><b>${esc(c.name)}</b> <small>(${esc(levelShortBadge(c.level))} · ${t('Khối', 'Gr')} ${c.grade})</small><div class="muted" style="font-size:12px">👩‍🏫 ${esc(c.teacherName)} · ${t('Mã lớp:', 'Code:')} <b>${esc(c.code)}</b></div></div>
            <span class="adm-target-pill is-done">✓ ${t('Đang học', 'Enrolled')}</span>
          </div>`).join('')}</div>`
        : `<p class="muted" style="margin:4px 0 10px;font-size:13px">${t('Em chưa tham gia lớp nào. Nhập mã lớp do Thầy/Cô phát để vào lớp ngay nhé!', 'Not in a class yet. Enter your teacher’s class code to join!')}</p>`}
      <form id="studentJoinClassForm" class="join-class-row">
        <input name="code" maxlength="10" placeholder="${t('Nhập mã lớp (VD: 4ANUMI)', 'Class code (e.g. 4ANUMI)')}" style="text-transform:uppercase">
        <button type="submit" class="primary">${t('Vào lớp', 'Join')}</button>
      </form>
    `;
    const pwdCard = leftCol.querySelector('.profile-password-card');
    if (pwdCard) pwdCard.before(card);
    else leftCol.append(card);

    const form = $('#studentJoinClassForm');
    if (form) {
      form.onsubmit = async e => {
        e.preventDefault();
        const code = new FormData(form).get('code');
        try {
          if (window.numiCloudClasses) await window.numiCloudClasses.ensureClass(code);
          const res = joinClassByCode(code, u.username);
          toast(res.already
            ? t(`Em đã ở trong ${res.cls.name} rồi!`, `Already in ${res.cls.name}!`)
            : t(`🎉 Đã tham gia ${res.cls.name} của ${res.cls.teacherName}!`, `🎉 Joined ${res.cls.name}!`));
          renderProfile();
        } catch (err) {
          toast(err.message);
        }
      };
    }
  }

  // ---------------- Route & Backup Hooks ----------------
  const navBeforeTeacher = typeof nav === 'function' ? nav : null;
  if (navBeforeTeacher) {
    nav = function (dest) {
      if (dest === 'account' && typeof currentAuthUser === 'function' && !currentAuthUser()) {
        openAccount(lastAuthMode || 'login');
        return;
      }
      if (dest === 'teacher') {
        renderTeacherWorkspace();
        return;
      }
      if (isCurrentUserTeacher()) {
        if (dest === 'profile' || dest === 'account') {
          renderProfile();
          return;
        }
        renderTeacherWorkspace();
        return;
      }
      navBeforeTeacher(dest);
    };
    if (typeof window !== 'undefined') window.nav = nav;
    if (typeof global !== 'undefined') global.nav = nav;
  }

  const homeBeforeTeacher = typeof home === 'function' ? home : null;
  if (homeBeforeTeacher) {
    home = function () {
      if (isCurrentUserTeacher()) {
        renderTeacherWorkspace();
        return;
      }
      homeBeforeTeacher();
      processPendingJoinForStudent();
      injectStudentClassBadgeOnHome();
    };
    if (typeof window !== 'undefined') window.home = home;
    if (typeof global !== 'undefined') global.home = home;
  }

  const renderProfileBeforeTeacher = typeof renderProfile === 'function' ? renderProfile : null;
  if (renderProfileBeforeTeacher) {
    renderProfile = function () {
      renderProfileBeforeTeacher();
      injectStudentJoinClassCardInProfile();
    };
    if (typeof window !== 'undefined') window.renderProfile = renderProfile;
    if (typeof global !== 'undefined') global.renderProfile = renderProfile;
  }

  // Extend full system backup to preserve classes
  const backupBeforeClasses = typeof buildFullSystemBackup === 'function' ? buildFullSystemBackup : null;
  if (backupBeforeClasses) {
    buildFullSystemBackup = function () {
      const payload = backupBeforeClasses();
      payload.classes = loadClasses();
      return payload;
    };
    if (typeof window !== 'undefined') window.buildFullSystemBackup = buildFullSystemBackup;
    if (typeof global !== 'undefined') global.buildFullSystemBackup = buildFullSystemBackup;
  }

  const restoreBeforeClasses = typeof restoreFullSystemBackup === 'function' ? restoreFullSystemBackup : null;
  if (restoreBeforeClasses) {
    restoreFullSystemBackup = function (payload) {
      const ok = restoreBeforeClasses(payload);
      if (ok && Array.isArray(payload.classes)) {
        saveClasses(payload.classes);
      }
      return ok;
    };
    if (typeof window !== 'undefined') window.restoreFullSystemBackup = restoreFullSystemBackup;
    if (typeof global !== 'undefined') global.restoreFullSystemBackup = restoreFullSystemBackup;
  }

  // Inject styles
  if (typeof document !== 'undefined' && document.head) {
    const style = document.createElement('style');
    style.textContent = `
      body.is-teacher-mode header nav,
      body.is-teacher-mode #navMoreBtn,
      body.is-teacher-mode #moreSheet,
      body.is-teacher-mode #moreSheetBackdrop { display: none !important; }
      body.is-teacher-mode header .brand { margin-right: auto; }
      .auth-gate-card{max-width:520px!important;width:100%;margin:18px auto 32px!important;padding:30px 26px 28px!important;border-radius:26px!important;border:1.5px solid #dce8d6!important;box-shadow:0 16px 40px rgba(30,68,47,.08)!important;overflow:hidden}
      .auth-gate-card .intro-animal{width:76px;height:76px;margin:0 auto 14px;border-radius:50%;background:linear-gradient(145deg,#eef7ea,#fff6e6);border:2px solid #d7e8cf;display:flex;align-items:center;justify-content:center;padding:8px}
      .auth-gate-card .intro-animal .animal{width:56px;height:56px}
      .auth-gate-card .eyebrow{display:block!important;text-align:center!important;margin:0 auto 6px!important;letter-spacing:1.2px}
      .auth-gate-card h1{margin:4px 0 8px!important;font-size:26px!important;line-height:1.25!important;text-align:center!important}
      .auth-gate-card>p.muted{margin:0 auto 18px!important;max-width:420px;font-size:13.5px!important;line-height:1.55!important;text-align:center!important}
      .auth-tabs-v2{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;margin:0 0 20px!important;padding:6px!important;border-radius:16px!important;background:#f2f7ef!important;border:1px solid #e1ecdc!important;width:100%!important;box-sizing:border-box!important}
      .auth-tabs-v2 .auth-tab{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;width:100%!important;min-width:0!important;padding:10px 10px!important;min-height:44px!important;border-radius:12px!important;border:1.5px solid transparent!important;background:transparent!important;color:#4a6553!important;font-size:13px!important;font-weight:800!important;line-height:1.2!important;text-align:center!important;white-space:normal!important;transition:all .16s ease!important}
      .auth-tabs-v2 .auth-tab:hover:not(.active){background:rgba(255,255,255,.65)!important;color:#244b36!important}
      .auth-tabs-v2 .auth-tab.active{background:#ffffff!important;border-color:#b8d7c0!important;color:var(--green,#2d6a51)!important;box-shadow:0 3px 10px rgba(34,74,52,.10)!important}
      .auth-tab-ic{width:16px;height:16px;flex-shrink:0}
      .auth-gate-card .auth-form{margin-top:4px!important;display:grid;gap:14px}
      .auth-gate-card .auth-form label{margin:0!important;font-size:13.5px;font-weight:700;color:#2b4736}
      .auth-gate-card .auth-form input,.auth-gate-card .auth-form select{margin-top:6px!important;border-radius:13px!important;border:1.5px solid #d5e2ce!important;padding:12px 14px!important;font-size:14.5px!important;transition:border-color .15s ease,box-shadow .15s ease!important}
      .auth-gate-card .auth-form input:focus,.auth-gate-card .auth-form select:focus{border-color:#34765c!important;box-shadow:0 0 0 3px rgba(52,118,92,.14)!important;outline:none!important}
      .auth-gate-card #authSubmitBtn,.auth-gate-card #quickJoinSubmitBtn,.auth-gate-card #teacherSetupBtn{min-height:50px!important;border-radius:14px!important;font-size:15.5px!important;margin-top:4px!important;box-shadow:0 6px 16px rgba(52,118,92,.22)}
      body.dark-mode .auth-gate-card{border-color:#2a4536!important;box-shadow:0 16px 40px rgba(0,0,0,.35)!important}
      body.dark-mode .auth-gate-card .intro-animal{background:linear-gradient(145deg,#1d3327,#27291c);border-color:#335442}
      body.dark-mode .auth-tabs-v2{background:#121e18!important;border-color:#263f31!important}
      body.dark-mode .auth-tabs-v2 .auth-tab{color:#9eb9a8!important}
      body.dark-mode .auth-tabs-v2 .auth-tab:hover:not(.active){background:rgba(255,255,255,.05)!important;color:#dff3e7!important}
      body.dark-mode .auth-tabs-v2 .auth-tab.active{background:#1d3327!important;border-color:#3d7a5b!important;color:#dff7ea!important}
      body.dark-mode .auth-gate-card .auth-form label{color:#cfe6d8}
      @media(max-width:480px){.auth-gate-card{padding:22px 16px!important}.auth-tabs-v2 .auth-tab{font-size:12px!important;padding:9px 6px!important;gap:5px!important}}
      .join-code-preview{margin:8px 0 4px;padding:10px 12px;border-radius:12px;font-size:13px;line-height:1.45}
      .join-code-preview.is-valid{background:#e8f8ee;border:1.5px solid #96d8ad;color:#185532}
      .join-code-preview.is-invalid{background:#fff4e6;border:1.5px solid #f0c27b;color:#7a4b0b}
      .saved-codes-hint{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin:6px 0 10px;font-size:12px;color:#5a7262}
      .saved-code-pill{min-height:28px;padding:3px 9px;border-radius:999px;font-size:11.5px;font-weight:800;background:#eef6ec;border:1px solid #c9dec4;color:#27523a;cursor:pointer}
      .saved-code-pill:hover{background:#dff0dc}
      .teacher-level-filters{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
      .adm-bar-chart{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;align-items:end;height:140px;padding-top:12px}
      .adm-bar-col{display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end}
      .adm-bar-val{font-size:11px;font-weight:800;color:#2e5b41;min-height:14px}
      .adm-bar-track{width:100%;max-width:30px;height:86px;border-radius:8px;background:#edf5ec;display:flex;align-items:flex-end;overflow:hidden}
      .adm-bar-fill{width:100%;border-radius:8px;background:linear-gradient(180deg,#3f8f6b,#2b6a50);transition:height .25s ease}
      .adm-bar-col small{font-size:11px;color:#5a7262;white-space:nowrap}
      .teacher-class-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
      .teacher-class-tab{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;min-height:40px;border-radius:12px;border:1.5px solid #d5e4cc;background:#f7fbf4;color:#274833;font-size:13.5px;cursor:pointer}
      .teacher-class-tab.active,.teacher-class-tab.active:hover{background:#2d6a51!important;border-color:#1f4f3c!important;color:#fff!important;box-shadow:0 3px 10px rgba(45,106,81,.22)}
      .teacher-class-tab.active small,.teacher-class-tab.active .tch-lvl-tag{color:#d9f5e6;background:rgba(255,255,255,.16)}
      .tch-lvl-tag{font-size:11px;font-weight:800;padding:2px 7px;border-radius:999px;background:#e5f2e4;color:#2b593d}
      .badge-level{display:inline-flex;align-items:center;padding:3px 9px;border-radius:999px;font-size:11.5px;font-weight:800}
      .badge-level.primary{background:#e7f6ea;color:#1e623a;border:1px solid #b8dfc3}
      .badge-level.secondary{background:#e8f0fe;color:#1e4d8f;border:1px solid #bdd4f8}
      .teacher-class-banner{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:14px;padding:18px 20px;margin-bottom:18px;border:2px solid #cfe3c8;background:linear-gradient(135deg,#f4fbf5,#fffdf5)}
      .teacher-banner-title{display:flex;align-items:center;flex-wrap:wrap;gap:8px}
      .teacher-banner-title h2{margin:0;font-size:22px}
      .saved-code-box{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-top:10px;padding:11px 14px;border-radius:14px;background:#fff9e8;border:1.5px dashed #e0b857}
      .saved-code-box small{display:block;font-size:10.5px;font-weight:800;letter-spacing:.6px;color:#7a5610}
      .saved-code-value{display:block;font-size:24px;font-weight:900;letter-spacing:2.5px;color:#4f3504;line-height:1.2}
      .saved-code-btns{display:flex;gap:8px;flex-wrap:wrap}
      .teacher-banner-actions{display:flex;gap:8px;flex-wrap:wrap}
      .teacher-admin-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:12px;margin-top:12px}
      .teacher-admin-item{padding:14px;border-radius:14px;border:1.5px solid #dce8d6;background:#fbfdf9;display:grid;gap:10px}
      .teacher-admin-top{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
      .teacher-admin-actions{display:flex;gap:8px;flex-wrap:wrap}
      .student-class-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;min-height:34px;border-radius:999px;background:#ebf7ee;border:1.5px solid #c3e2cc;color:#24593d;font-size:12.5px;font-weight:800;cursor:pointer}
      .student-enrolled-list{display:grid;gap:8px;margin-bottom:10px}
      .student-enrolled-item{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 12px;border-radius:12px;background:#f5faf4;border:1px solid #d9e9d6}
      .join-class-row{display:flex;gap:8px;align-items:center}
      .join-class-row input{margin-top:0 !important;flex:1}
      .join-class-row button{flex-shrink:0}
      .cls-report-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}
      .cls-report-kpis>div{padding:10px;border-radius:12px;background:#f4f9f3;border:1px solid #d9e7d6;text-align:center}
      .cls-report-kpis small{display:block;font-size:11.5px;color:#58705e}
      .cls-report-kpis strong{font-size:22px;color:#234e37}
      body.dark-mode .adm-bar-val{color:#b9e8cd}
      body.dark-mode .adm-bar-track{background:#1c2d23}
      body.dark-mode .adm-bar-col small{color:#9ab6a5}
      body.dark-mode .join-code-preview.is-valid{background:#153423;border-color:#2f6b47;color:#c8f4d9}
      body.dark-mode .join-code-preview.is-invalid{background:#352512;border-color:#785322;color:#f7d59c}
      body.dark-mode .saved-code-pill{background:#1a2e23;border-color:#2e4e3d;color:#cde8d8}
      body.dark-mode .saved-code-box{background:#2d2514;border-color:#6b5422}
      body.dark-mode .saved-code-box small{color:#e7c878}
      body.dark-mode .saved-code-value{color:#fff0c2}
      body.dark-mode .teacher-class-tab{background:#18271f;border-color:#2d4a3a;color:#d6ebe0}
      body.dark-mode .teacher-class-tab.active{background:#2d6a51;border-color:#4ba880;color:#fff}
      body.dark-mode .tch-lvl-tag{background:#22382c;color:#bee6cf}
      body.dark-mode .badge-level.primary{background:#183625;color:#b2ebd0;border-color:#2f6346}
      body.dark-mode .badge-level.secondary{background:#192c47;color:#b4d2ff;border-color:#325280}
      body.dark-mode .teacher-class-banner{background:linear-gradient(135deg,#18281f,#20271e);border-color:#2f4c3c}
      body.dark-mode .teacher-admin-item,body.dark-mode .student-enrolled-item,body.dark-mode .cls-report-kpis>div{background:#17251d;border-color:#2b4637}
      body.dark-mode .student-class-pill{background:#193024;border-color:#315943;color:#bfead2}
      body.dark-mode .cls-report-kpis strong{color:#daf2e4}
    `;
    document.head.append(style);
  }

  // Export APIs
  const exportsMap = {
    levelOfGrade,
    levelLabel,
    gradesForLevel,
    loadClasses,
    saveClasses,
    findClassByCode,
    getTeachersList,
    getClassesForTeacher,
    getClassesForStudent,
    canTeacherManageStudent,
    getStudentsForTeacher,
    createTeacherWithClass,
    createClassForTeacher,
    deleteClassById,
    addStudentToClass,
    removeStudentFromClass,
    joinClassByCode,
    studentQuickJoinByCode,
    buildClassJoinLink,
    parseIncomingJoinHash,
    checkIncomingClassJoinHash,
    renderTeacherWorkspace,
    isCurrentUserTeacher
  };
  if (typeof window !== 'undefined') Object.assign(window, exportsMap);
  if (typeof global !== 'undefined') Object.assign(global, exportsMap);

  ensureDemoTeacherAndClass();
  // If we are currently on the unauthenticated login gate, upgrade tabs immediately
  if (typeof view !== 'undefined' && view === 'account' && typeof currentAuthUser === 'function' && !currentAuthUser()) {
    injectExtraAuthTabs('login');
  }
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('hashchange', checkIncomingClassJoinHash);
    setTimeout(checkIncomingClassJoinHash, 120);
  }
  if (typeof view !== 'undefined' && view === 'home') {
    injectStudentClassBadgeOnHome();
  }
})();
