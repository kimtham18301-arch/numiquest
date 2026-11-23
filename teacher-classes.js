// Teacher Classrooms & Autonomous Student Coordination (v2.3.0)
(() => {
  'use strict';

  const CLASSES_KEY = 'numi-classes-v1';
  const CLASSES_SEEDED_KEY = 'numi-classes-seeded-v1';
  const PENDING_JOIN_KEY = 'numi-pending-join-class-v1';
  const DEFAULT_TEACHER_HASH = '77efd557dd7880dfc9b22f85c497f6b76682ed594bb6fe1ac87463a47179272c'; // SHA-256('numi_salt_v1:1234')

  let activeTeacherClassId = null;

  function genClassCode(grade) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let tail = '';
    for (let i = 0; i < 4; i++) tail += chars[Math.floor(Math.random() * chars.length)];
    return `${Number(grade) || 4}A${tail}`.slice(0, 6);
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
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveClasses(list) {
    try {
      localStorage.setItem(CLASSES_KEY, JSON.stringify(Array.isArray(list) ? list : []));
    } catch {}
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

  function getClassesForTeacher(teacherUsername) {
    const key = String(teacherUsername || '').trim().toLowerCase();
    return loadClasses().filter(c => String(c.teacherUsername || '').toLowerCase() === key);
  }

  function getClassesForStudent(studentUsername) {
    const key = String(studentUsername || '').trim().toLowerCase();
    return loadClasses().filter(c => Array.isArray(c.students) && c.students.includes(key));
  }

  function getStudentsForTeacher(teacherUsername, classId = null) {
    const classes = getClassesForTeacher(teacherUsername);
    const targetClasses = classId ? classes.filter(c => c.id === classId) : classes;
    const unameSet = new Set();
    targetClasses.forEach(c => (c.students || []).forEach(u => unameSet.add(u)));
    const allSummary = typeof getStudentsSummary === 'function' ? getStudentsSummary() : [];
    return allSummary.filter(s => s.role !== 'admin' && s.role !== 'teacher' && unameSet.has(s.username));
  }

  async function createTeacherWithClass({ name, username, password, className, grade = 4, avatar = 'panda' } = {}) {
    const cleanName = String(name || '').trim().slice(0, 40);
    const cleanUser = String(username || '').trim().toLowerCase().replace(/\s+/g, '');
    const cleanPwd = String(password || '').trim();
    const cleanClass = String(className || '').trim().slice(0, 40);
    const g = Math.min(9, Math.max(1, Number(grade) || 4));

    if (!cleanName) throw new Error(t('Vui lòng nhập tên Thầy/Cô.', 'Please enter teacher name.'));
    if (cleanUser.length < 2 || !/^[a-z0-9_.-]+$/.test(cleanUser)) {
      throw new Error(t('Tên đăng nhập chỉ gồm chữ không dấu, số (ít nhất 2 ký tự).', 'Username must be at least 2 alphanumeric characters.'));
    }
    if (cleanPwd.length < 4) throw new Error(t('Mã PIN / Mật khẩu cần ít nhất 4 ký tự.', 'PIN / Password must be at least 4 characters.'));
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

    const cls = createClassForTeacher(cleanUser, { name: cleanClass, grade: g });
    return { teacher: users[cleanUser], cls };
  }

  function createClassForTeacher(teacherUsername, { name, grade = 4, code = '' } = {}) {
    const key = String(teacherUsername || '').trim().toLowerCase();
    const users = getLocalUsers();
    const teacher = users[key];
    if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
      throw new Error(t('Không tìm thấy tài khoản giáo viên.', 'Teacher account not found.'));
    }
    const cleanName = String(name || '').trim().slice(0, 40);
    if (!cleanName) throw new Error(t('Vui lòng nhập tên lớp học.', 'Please enter a class name.'));
    const g = Math.min(9, Math.max(1, Number(grade) || 4));

    const classes = loadClasses();
    let finalCode = String(code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    if (!finalCode || classes.some(c => c.code === finalCode)) {
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
    const code = String(rawCode || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!code) throw new Error(t('Vui lòng nhập mã lớp hợp lệ.', 'Please enter a valid class code.'));
    const classes = loadClasses();
    const cls = classes.find(c => String(c.code || '').toUpperCase() === code);
    if (!cls) throw new Error(t('Không tìm thấy lớp học với mã này. Em kiểm tra lại nhé!', 'No class found with this code. Please double-check!'));
    const u = studentUsername ? String(studentUsername).trim().toLowerCase() : (currentAuthUser()?.username || '');
    if (!u) throw new Error(t('Vui lòng đăng nhập tài khoản học sinh trước khi vào lớp.', 'Please sign in as a student first.'));
    if (!Array.isArray(cls.students)) cls.students = [];
    const already = cls.students.includes(u);
    if (!already) {
      cls.students.push(u);
      saveClasses(classes);
    }
    return { ok: true, cls, already };
  }

  function buildClassJoinLink(cls) {
    const base = typeof location !== 'undefined' && location.href ? location.href.split('#')[0] : 'https://kimtham18301-arch.github.io/numiquest/';
    return `${base}#join=${encodeURIComponent(cls.code)}`;
  }

  function checkIncomingClassJoinHash() {
    if (typeof location === 'undefined') return;
    const h = String(location.hash || '');
    if (!h.startsWith('#join=')) return;
    const code = decodeURIComponent(h.slice(6)).trim().toUpperCase();
    if (!code) return;
    const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
    if (u && u.role !== 'admin' && u.role !== 'teacher') {
      try {
        const res = joinClassByCode(code, u.username);
        toast(res.already
          ? t(`Em đã có mặt trong ${res.cls.name} (${res.cls.teacherName})!`, `Already enrolled in ${res.cls.name}!`)
          : t(`🎉 Đã tham gia ${res.cls.name} của ${res.cls.teacherName}!`, `🎉 Joined ${res.cls.name} (${res.cls.teacherName})!`));
        try { history.replaceState(null, '', location.pathname + location.search); } catch {}
      } catch (err) {
        toast(err.message);
      }
    } else if (!u) {
      try { localStorage.setItem(PENDING_JOIN_KEY, code); } catch {}
      toast(t(`Đã nhận mã lớp ${code}. Đăng nhập để tự động vào lớp nhé!`, `Class code ${code} saved. Sign in to join automatically!`));
    }
  }

  function processPendingJoinForStudent() {
    try {
      const code = localStorage.getItem(PENDING_JOIN_KEY);
      if (!code) return;
      const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
      if (!u || u.role === 'admin' || u.role === 'teacher') return;
      localStorage.removeItem(PENDING_JOIN_KEY);
      const res = joinClassByCode(code, u.username);
      toast(t(`🎉 Đã tự động tham gia ${res.cls.name} (${res.cls.teacherName})!`, `🎉 Automatically joined ${res.cls.name}!`));
    } catch {}
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
        <h2 style="margin:4px 0">${esc(cls.name)} (${t('Lớp', 'Grade')} ${cls.grade}) — ${esc(cls.teacherName)}</h2>
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
      toast(t('Lớp chưa có học sinh. Thầy/Cô hãy thêm học sinh vào lớp trước nhé!', 'No students in this class yet. Add students first!'));
      return;
    }
    const preSet = new Set(preselected.length ? preselected : students.map(s => s.username));
    const defaultDue = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10);

    modal(`<h2>🎯 ${t(`Giao bài cho ${cls.name}`, `Assign Homework to ${cls.name}`)}</h2>
    <p class="muted" style="margin:4px 0 10px;font-size:13px">${t('Chọn cả lớp hoặc tích riêng từng học sinh cần giao bài. Bài tập sẽ xuất hiện ngay trên Trang chủ của các em.', 'Select the whole class or specific students. Assigned homework appears right on their Home screen.')}</p>
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
          <select name="grade">${[1,2,3,4,5,6,7,8,9].map(g => `<option value="${g}" ${Number(cls.grade) === g ? 'selected' : ''}>${t('Lớp', 'Gr')} ${g}</option>`).join('')}</select>
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
          // Tag assignment with teacher/class metadata for scoping
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
        <label>${t('Mã PIN (4+ số):', 'PIN (4+ chars):')}
          <input name="password" required minlength="4" maxlength="20" value="1234" autocomplete="off">
        </label>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <label>${t('Khối lớp:', 'Grade:')}
          <select name="grade">${[1,2,3,4,5,6,7,8,9].map(g => `<option value="${g}" ${Number(cls.grade) === g ? 'selected' : ''}>${t('Lớp', 'Grade')} ${g}</option>`).join('')}</select>
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
          if (password.length < 4) throw new Error(t('Mã PIN cần ít nhất 4 ký tự.', 'PIN needs 4+ characters.'));
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

  // Modal: Enroll existing students on device into this class
  function openEnrollExistingModal(cls) {
    const allSummary = typeof getStudentsSummary === 'function' ? getStudentsSummary() : [];
    const available = allSummary.filter(s => s.role !== 'admin' && s.role !== 'teacher' && !(cls.students || []).includes(s.username));
    modal(`<h2>📥 ${t(`Nhận học sinh có sẵn vào ${cls.name}`, `Enroll Existing Students in ${cls.name}`)}</h2>
    ${available.length === 0
      ? `<p class="muted" style="margin:10px 0">${t('Tất cả học sinh trên máy đã có trong lớp này. Thầy/Cô có thể bấm "+ Tạo học sinh mới" hoặc gửi Mã lớp để học sinh tự vào.', 'All students on this device are already in this class.')}</p>
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

  // Modal: Create another class for the signed-in teacher
  function openCreateClassModal(teacherUsername) {
    modal(`<h2>🏫 ${t('Tạo lớp học mới', 'Create New Class')}</h2>
    <form id="createClassForm" style="display:grid;gap:10px;margin-top:10px">
      <label>${t('Tên lớp học:', 'Class Name:')}
        <input name="name" required maxlength="40" placeholder="${t('VD: Lớp 4B - Tăng cường', 'e.g. Grade 4B')}">
      </label>
      <label>${t('Khối lớp:', 'Grade Level:')}
        <select name="grade">${[1,2,3,4,5,6,7,8,9].map(g => `<option value="${g}" ${g === 4 ? 'selected' : ''}>${t('Lớp', 'Grade')} ${g}</option>`).join('')}</select>
      </label>
      <div class="actions">
        <button type="submit" class="primary">${t('Tạo lớp ngay', 'Create Class')}</button>
        <button type="button" onclick="$('#modal').close()">${t('Hủy', 'Cancel')}</button>
      </div>
    </form>`);
    const form = $('#createClassForm');
    if (form) {
      form.onsubmit = e => {
        e.preventDefault();
        const fd = new FormData(form);
        try {
          const cls = createClassForTeacher(teacherUsername, { name: fd.get('name'), grade: fd.get('grade') });
          activeTeacherClassId = cls.id;
          $('#modal').close();
          toast(t(`Đã tạo ${cls.name} (Mã lớp: ${cls.code})!`, `Created ${cls.name} (Code: ${cls.code})!`));
          renderTeacherWorkspace();
        } catch (err) {
          toast(err.message);
        }
      };
    }
  }

  // Dedicated Teacher Workspace (`view === 'teacher'`)
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
        <p class="muted">${t('Vui lòng đăng nhập bằng tài khoản Giáo viên (VD: colan / 1234) để tự quản lý lớp và điều phối học sinh.', 'Please sign in with a Teacher account (e.g. colan / 1234) to manage your classes.')}</p>
        <div class="actions">
          <button class="primary wide" onclick="openAccount('login')">${t('Đăng nhập Giáo viên', 'Sign in as Teacher')}</button>
          <button class="wide" onclick="nav('home')">${t('Về trang chủ', 'Back to Home')}</button>
        </div>
      </div>`;
      return;
    }

    const myClasses = getClassesForTeacher(u.username);
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
      ? allAsgs.filter(a => a.classId === activeCls.id || (Array.isArray(a.targetStudents) && a.targetStudents.some(un => studentSet.has(un))))
      : [];
    const usersMap = getLocalUsers();

    $('#app').innerHTML = `<section class="admin-view teacher-workspace">
      <div class="card admin-header-card teacher-header-card">
        <div class="admin-title-row">
          <div>
            <span class="eyebrow">NUMIQUICK · ${t('KHÔNG GIAN GIÁO VIÊN', 'TEACHER WORKSPACE')}</span>
            <h1 class="admin-main-title">👩‍🏫 ${t('Lớp học của', 'Classes of')} ${esc(u.name)}</h1>
            <p class="muted">${t('Tự điều phối học sinh lớp phụ trách, giao bài tập riêng, theo dõi tiến độ 7 ngày và xuất báo cáo.', 'Manage your enrolled students, assign targeted practice, track 7-day progress, and print reports.')}</p>
          </div>
          <div class="admin-top-actions">
            <button type="button" class="primary admin-btn" id="tchCreateClassBtn">+ ${t('Tạo lớp mới', 'New Class')}</button>
            <button type="button" class="admin-btn" id="tchProfileBtn">👤 ${t('Hồ sơ & Đổi PIN', 'Profile & PIN')}</button>
            <button type="button" class="admin-btn" id="tchSignOutBtn">${t('Đăng xuất', 'Sign out')}</button>
          </div>
        </div>

        <div class="teacher-class-tabs">
          ${myClasses.map(c => `<button type="button" class="teacher-class-tab ${c.id === activeCls?.id ? 'active' : ''}" data-tch-class="${esc(c.id)}">
            🏫 <b>${esc(c.name)}</b> <small>(${(c.students || []).length} HS)</small>
          </button>`).join('')}
        </div>
      </div>

      ${!activeCls ? `<div class="card" style="text-align:center;padding:30px">
        <h3>${t('Thầy/Cô chưa có lớp học nào', 'No classes created yet')}</h3>
        <p class="muted">${t('Bấm "+ Tạo lớp mới" để khởi tạo lớp học đầu tiên và nhận Mã lớp mời học sinh.', 'Click "+ New Class" to create your first class and get a join code.')}</p>
        <button type="button" class="primary" id="tchEmptyCreateBtn">+ ${t('Tạo lớp đầu tiên', 'Create First Class')}</button>
      </div>` : `
      <div class="card teacher-class-banner">
        <div class="teacher-banner-info">
          <div class="teacher-banner-title">
            <h2>${esc(activeCls.name)}</h2>
            <span class="badge-grade">${t('Khối', 'Grade')} ${activeCls.grade}</span>
            <span class="teacher-code-pill" title="${t('Mã mời học sinh vào lớp', 'Student class join code')}">${t('Mã lớp:', 'Code:')} <b>${esc(activeCls.code)}</b></span>
          </div>
          <p class="muted" style="margin:4px 0 0;font-size:13px">${t('Gửi Mã lớp hoặc Link mời cho học sinh để các em tự tham gia lớp của Thầy/Cô.', 'Share the Class Code or Invite Link so students can join automatically.')}</p>
        </div>
        <div class="teacher-banner-actions">
          <button type="button" class="primary" id="tchAssignHwBtn">🎯 ${t('Giao bài cho lớp', 'Assign Homework')}</button>
          <button type="button" id="tchCopyJoinBtn">🔗 ${t('Copy Link mời HS', 'Copy Invite Link')}</button>
          <button type="button" id="tchPrintReportBtn">🖨️ ${t('In / PDF báo cáo', 'Print / PDF')}</button>
          <button type="button" id="tchExportCsvBtn">↓ ${t('Xuất CSV', 'Export CSV')}</button>
        </div>
      </div>

      <div class="admin-kpi-grid" style="margin-bottom:18px">
        <div class="admin-kpi-card"><div class="kpi-body"><small>${t('Sĩ số lớp', 'Class Size')}</small><strong>${students.length}</strong><span class="kpi-subtext">${esc(activeCls.name)}</span></div></div>
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
            <h3 style="margin:0">👥 ${t(`Danh sách & Điều phối học sinh (${students.length})`, `Class Roster & Coordination (${students.length})`)}</h3>
            <p class="muted" style="margin:2px 0 0;font-size:13px">${t('Thầy/Cô tự thêm học sinh mới, nhận học sinh có sẵn, giao bài riêng hoặc chỉnh sửa thông tin.', 'Add new students, enroll existing ones, assign targeted homework, or edit student info.')}</p>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button type="button" class="primary" id="tchAddNewStuBtn">+ ${t('Tạo học sinh mới', 'New Student')}</button>
            <button type="button" id="tchEnrollExistBtn">📥 ${t('Nhận HS có sẵn', 'Enroll Existing')}</button>
          </div>
        </div>
        ${students.length === 0
          ? `<div class="empty" style="padding:20px;text-align:center">${t('Lớp chưa có học sinh nào. Hãy thêm học sinh mới hoặc chia sẻ Mã lớp', 'No students yet. Add students or share class code')} <b>${esc(activeCls.code)}</b>.</div>`
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
            <p class="muted" style="margin:2px 0 0;font-size:13px">${t('Theo dõi trạng thái nộp bài theo từng học sinh trong lớp.', 'Track per-student completion status.')}</p>
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
      $('#tchEnrollExistBtn')?.addEventListener('click', () => openEnrollExistingModal(activeCls));
      $('#tchPrintReportBtn')?.addEventListener('click', () => openClassPrintReport(activeCls, students));
      $('#tchExportCsvBtn')?.addEventListener('click', () => {
        if (typeof adminExportCSV === 'function') adminExportCSV(students);
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
          if (typeof adminViewDetailModal === 'function') adminViewDetailModal(btn.dataset.tchDetail);
        };
      });
      $$('[data-tch-edit]').forEach(btn => {
        btn.onclick = () => {
          if (typeof editStudentProfileModal === 'function') editStudentProfileModal(btn.dataset.tchEdit);
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
          try {
            const res = await assignRemedialForStudent(btn.dataset.tchRemedial);
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
    <p class="muted" style="margin:4px 0 12px;font-size:13px">${t('Thầy/Cô đăng nhập bằng tài khoản này sẽ chỉ quản lý và điều phối riêng học sinh trong lớp của mình.', 'This teacher will log into a dedicated workspace managing only their own classes and students.')}</p>
    <form id="adminCreateTeacherForm" style="display:grid;gap:10px">
      <label>${t('Họ tên Thầy/Cô:', 'Teacher Name:')}
        <input name="name" required maxlength="40" placeholder="${t('VD: Thầy Hùng / Cô Mai', 'e.g. Ms. Mai')}">
      </label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <label>${t('Tên đăng nhập:', 'Username:')}
          <input name="username" required minlength="2" maxlength="20" placeholder="thayhung" autocomplete="off">
        </label>
        <label>${t('Mã PIN / Mật khẩu:', 'PIN / Password:')}
          <input name="password" required minlength="4" maxlength="20" value="1234" autocomplete="off">
        </label>
      </div>
      <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:10px">
        <label>${t('Tên lớp phụ trách:', 'Class Name:')}
          <input name="className" required maxlength="40" placeholder="${t('VD: Lớp 5A', 'e.g. Grade 5A')}">
        </label>
        <label>${t('Khối lớp:', 'Grade:')}
          <select name="grade">${[1,2,3,4,5,6,7,8,9].map(g => `<option value="${g}" ${g === 4 ? 'selected' : ''}>${t('Lớp', 'Grade')} ${g}</option>`).join('')}</select>
        </label>
      </div>
      <p id="admNewTchErr" class="danger" style="margin:2px 0;font-weight:700"></p>
      <div class="actions">
        <button type="submit" class="primary">${t('Tạo Giáo viên & Lớp', 'Create Teacher & Class')}</button>
        <button type="button" onclick="$('#modal').close()">${t('Hủy', 'Cancel')}</button>
      </div>
    </form>`);

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
            className: fd.get('className'),
            grade: fd.get('grade')
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
            <p class="muted" style="margin:2px 0 0;font-size:13px">${t('Phân lớp cho từng Thầy/Cô để mỗi giáo viên tự quản lý học sinh và giao bài cho lớp mình.', 'Assign classes to teachers so each teacher coordinates their own students independently.')}</p>
          </div>
          <button type="button" class="primary" id="admCreateTeacherBtn">+ ${t('Tạo Thầy/Cô & Lớp', 'Add Teacher & Class')}</button>
        </div>
        ${classes.length === 0
          ? `<p class="muted" style="margin:10px 0 0">${t('Chưa có lớp học nào.', 'No classes yet.')}</p>`
          : `<div class="teacher-admin-grid">${classes.map(c => `<div class="teacher-admin-item">
              <div class="teacher-admin-top">
                <div>
                  <b>🏫 ${esc(c.name)}</b> <span class="badge-grade">${t('Lớp', 'Gr')} ${c.grade}</span>
                  <div class="muted" style="font-size:12.5px;margin-top:2px">👩‍🏫 ${esc(c.teacherName)} (@${esc(c.teacherUsername)}) · ${t('Mã lớp:', 'Code:')} <b>${esc(c.code)}</b></div>
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
          if (cls) openEnrollExistingModal(cls);
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
            <div><b>${esc(c.name)}</b> <small>(${t('Khối', 'Gr')} ${c.grade})</small><div class="muted" style="font-size:12px">👩‍🏫 ${esc(c.teacherName)} · ${t('Mã:', 'Code:')} ${esc(c.code)}</div></div>
            <span class="adm-target-pill is-done">✓ ${t('Đang học', 'Enrolled')}</span>
          </div>`).join('')}</div>`
        : `<p class="muted" style="margin:4px 0 10px;font-size:13px">${t('Em chưa tham gia lớp nào. Nhập mã lớp do Thầy/Cô gửi để nhận bài tập trực tiếp nhé!', 'Not in a class yet. Enter your teacher’s class code to receive homework!')}</p>`}
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
      form.onsubmit = e => {
        e.preventDefault();
        const code = new FormData(form).get('code');
        try {
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
      .adm-bar-chart{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;align-items:end;height:140px;padding-top:12px}
      .adm-bar-col{display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end}
      .adm-bar-val{font-size:11px;font-weight:800;color:#2e5b41;min-height:14px}
      .adm-bar-track{width:100%;max-width:30px;height:86px;border-radius:8px;background:#edf5ec;display:flex;align-items:flex-end;overflow:hidden}
      .adm-bar-fill{width:100%;border-radius:8px;background:linear-gradient(180deg,#3f8f6b,#2b6a50);transition:height .25s ease}
      .adm-bar-col small{font-size:11px;color:#5a7262;white-space:nowrap}
      body.dark-mode .adm-bar-val{color:#b9e8cd}
      body.dark-mode .adm-bar-track{background:#1c2d23}
      body.dark-mode .adm-bar-col small{color:#9ab6a5}
      .teacher-class-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
      .teacher-class-tab{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;min-height:40px;border-radius:12px;border:1.5px solid #d5e4cc;background:#f7fbf4;color:#274833;font-size:13.5px;cursor:pointer}
      .teacher-class-tab.active{background:#2d6a51;border-color:#1f4f3c;color:#fff;box-shadow:0 3px 10px rgba(45,106,81,.22)}
      .teacher-class-tab.active small{color:#d5f2e3}
      .teacher-class-banner{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;padding:18px 20px;margin-bottom:18px;border:2px solid #cfe3c8;background:linear-gradient(135deg,#f4fbf5,#fffdf5)}
      .teacher-banner-title{display:flex;align-items:center;flex-wrap:wrap;gap:8px}
      .teacher-banner-title h2{margin:0;font-size:22px}
      .teacher-code-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;background:#fff4d6;border:1px solid #ecc97a;color:#6e4b08;font-size:12.5px}
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
      body.dark-mode .teacher-class-tab{background:#18271f;border-color:#2d4a3a;color:#d6ebe0}
      body.dark-mode .teacher-class-tab.active{background:#2d6a51;border-color:#4ba880;color:#fff}
      body.dark-mode .teacher-class-banner{background:linear-gradient(135deg,#18281f,#20271e);border-color:#2f4c3c}
      body.dark-mode .teacher-code-pill{background:#342a15;border-color:#6e5624;color:#f7d88b}
      body.dark-mode .teacher-admin-item,body.dark-mode .student-enrolled-item,body.dark-mode .cls-report-kpis>div{background:#17251d;border-color:#2b4637}
      body.dark-mode .student-class-pill{background:#193024;border-color:#315943;color:#bfead2}
      body.dark-mode .cls-report-kpis strong{color:#daf2e4}
    `;
    document.head.append(style);
  }

  // Export APIs
  const exportsMap = {
    loadClasses,
    saveClasses,
    getTeachersList,
    getClassesForTeacher,
    getClassesForStudent,
    getStudentsForTeacher,
    createTeacherWithClass,
    createClassForTeacher,
    deleteClassById,
    addStudentToClass,
    removeStudentFromClass,
    joinClassByCode,
    buildClassJoinLink,
    checkIncomingClassJoinHash,
    renderTeacherWorkspace,
    isCurrentUserTeacher
  };
  if (typeof window !== 'undefined') Object.assign(window, exportsMap);
  if (typeof global !== 'undefined') Object.assign(global, exportsMap);

  ensureDemoTeacherAndClass();
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('hashchange', checkIncomingClassJoinHash);
    setTimeout(checkIncomingClassJoinHash, 120);
  }
  if (typeof view !== 'undefined' && view === 'home') {
    injectStudentClassBadgeOnHome();
  }
})();
