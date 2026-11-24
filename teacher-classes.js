// Teacher classrooms: data layer (classes, codes, quick-join, join links, backup). UI lives in teacher-*.js.
(() => {
  'use strict';

  const CLASSES_KEY = 'numi-classes-v1';
  const CLASSES_SEEDED_KEY = 'numi-classes-seeded-v1';
  const PENDING_JOIN_KEY = 'numi-pending-join-class-v1';
  // UI state shared with teacher-workspace.js (which class tab is open).
  const ui = { activeTeacherClassId: null };
  const DEFAULT_TEACHER_HASH = '77efd557dd7880dfc9b22f85c497f6b76682ed594bb6fe1ac87463a47179272c'; // SHA-256('numi_salt_v1:1234')


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
      ui.activeTeacherClassId = cls.id;
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
    if (ui.activeTeacherClassId === classId) ui.activeTeacherClassId = null;
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
    isCurrentUserTeacher
  };
  if (typeof window !== 'undefined') Object.assign(window, exportsMap);
  // Shared with the teacher UI files (teacher-auth-gate.js, teacher-workspace.js, teacher-integration.js).
  const shared = { ...exportsMap, PENDING_JOIN_KEY, levelShortBadge, processPendingJoinForStudent, ui };
  if (typeof window !== 'undefined') window.NumiClasses = shared;
  if (typeof global !== 'undefined') global.NumiClasses = shared;
  if (typeof global !== 'undefined') Object.assign(global, exportsMap);

  ensureDemoTeacherAndClass();
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('hashchange', checkIncomingClassJoinHash);
    setTimeout(checkIncomingClassJoinHash, 120);
  }
})();
