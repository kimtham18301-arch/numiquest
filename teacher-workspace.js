// Teacher classrooms: teacher workspace, class report, assign / create-student / enroll / create-class modals (split from teacher-classes.js in v2.7.0)
(() => {
  'use strict';

  const {
    levelShortBadge, gradesForLevel, isCurrentUserTeacher, getClassesForTeacher, canTeacherManageStudent,
    getStudentsForTeacher, createClassForTeacher, addStudentToClass, removeStudentFromClass, buildClassJoinLink, ui,
  } = window.NumiClasses;
  let activeTeacherLevelFilter = 'all'; // 'all' | 'primary' | 'secondary'
  const rerenderTeacherWorkspace = () => (typeof window !== 'undefined' && typeof window.renderTeacherWorkspace === 'function' ? window.renderTeacherWorkspace() : renderTeacherWorkspace());
  const formatClassTitle = name => {
    const s = String(name || '').trim();
    return /^lớp\b/i.test(s) ? s : `lớp ${s}`;
  };

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

  // Scoped Homework Assignment Modal for a Teacher's Class (matches student web exercise picker)
  function openTeacherAssignModal(cls, preselected = []) {
    const students = getStudentsForTeacher(cls.teacherUsername, cls.id);
    if (!students.length) {
      toast(t('Lớp chưa có học sinh. Thầy/Cô hãy gửi Mã lớp để học sinh vào lớp trước nhé!', 'No students in this class yet. Share the Class Code first!'));
      return;
    }
    const preSet = new Set(preselected.length ? preselected : students.map(s => s.username));
    const defaultDue = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10);
    const defaultTitle = t(`Bài luyện ${cls.name}`, `${cls.name} Practice`);

    modal(`<h2>🎯 ${t(`Giao bài cho ${cls.name}`, `Assign Homework to ${cls.name}`)}</h2>
    <p class="muted" style="margin:4px 0 10px;font-size:13px">${t('Chọn cả lớp hoặc từng học sinh, rồi chọn chuyên đề GDPT 2018 hoặc Tự chỉnh tính nhẩm giống hệt giao diện học sinh.', 'Select students and configure GDPT 2018 topics or Custom mental math just like the student app.')}</p>
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
          <input name="title" id="tchAssignTitleInput" maxlength="80" required value="${esc(defaultTitle)}">
        </label>
        <label>${t('Hạn nộp:', 'Due date:')}
          <input name="dueDate" type="date" value="${defaultDue}">
        </label>
      </div>

      <div id="tchAssignExerciseMount"></div>

      <div class="actions" style="margin-top:4px">
        <button type="submit" class="primary">📤 ${t('Giao bài ngay', 'Assign Now')}</button>
        <button type="button" onclick="$('#modal').close()">${t('Hủy', 'Cancel')}</button>
      </div>
    </form>`);

    const modalEl = $('#modal');
    if (modalEl) {
      modalEl.classList.add('tch-assign-wide-modal');
      modalEl.addEventListener('close', () => modalEl.classList.remove('tch-assign-wide-modal'), { once: true });
    }

    const titleInput = $('#tchAssignTitleInput');
    let titleTouched = false;
    titleInput?.addEventListener('input', () => { titleTouched = true; });

    const mountEl = $('#tchAssignExerciseMount');
    const picker = typeof mountAssignmentExercisePicker === 'function'
      ? mountAssignmentExercisePicker(mountEl, { grade: Number(cls.grade) || 4, inputMode: 'choices' }, {
          onChange: (_cfg, suggested) => {
            if (titleInput && !titleTouched && suggested) {
              titleInput.value = `${suggested} (${cls.name})`.slice(0, 80);
            }
          }
        })
      : null;

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
        if (!targets.length) { toast(t('Vui lòng chọn ít nhất 1 học sinh!', 'Select at least 1 student!')); return; }
        const asgCfg = picker ? picker.getConfig() : { grade: Number(cls.grade) || 4, count: 10, seconds: 20 };
        if (typeof createTargetedAssignment === 'function') {
          const asg = createTargetedAssignment({
            title: fd.get('title'),
            dueDate: fd.get('dueDate'),
            targetStudents: targets,
            config: asgCfg
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
          toast(t(`Đã giao bài cho ${targets.length} học sinh ${formatClassTitle(cls.name)}!`, `Assigned to ${targets.length} students!`));
          rerenderTeacherWorkspace();
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
          rerenderTeacherWorkspace();
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
        if (isCurrentUserTeacher()) rerenderTeacherWorkspace();
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
          ui.activeTeacherClassId = cls.id;
          $('#modal').close();
          toast(t(`✅ Đã tạo ${cls.name} (${levelShortBadge(cls.level)}) · Mã lớp đã lưu: ${cls.code}!`, `✅ Created ${cls.name} · Saved code: ${cls.code}!`));
          rerenderTeacherWorkspace();
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

    if (!ui.activeTeacherClassId || !myClasses.some(c => c.id === ui.activeTeacherClassId)) {
      ui.activeTeacherClassId = myClasses[0]?.id || null;
    }
    const activeCls = myClasses.find(c => c.id === ui.activeTeacherClassId) || null;
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
            <button type="button" class="admin-btn" id="tchProfileBtn">${t('Hồ sơ & Đổi PIN', 'Profile & PIN')}</button>
            <button type="button" class="admin-btn btn-del tch-signout-btn" id="tchSignOutBtn">${t('Đăng xuất', 'Sign out')}</button>
          </div>
        </div>

        <div class="teacher-level-filters">
          <button type="button" class="admin-grade-chip ${activeTeacherLevelFilter === 'all' ? 'active' : ''}" data-tch-lvl="all">${t('Tất cả cấp', 'All Levels')} (${allMyClasses.length})</button>
          <button type="button" class="admin-grade-chip ${activeTeacherLevelFilter === 'primary' ? 'active' : ''}" data-tch-lvl="primary">${t('Tiểu học (Lớp 1–5)', 'Primary (1–5)')} (${primaryCount})</button>
          <button type="button" class="admin-grade-chip ${activeTeacherLevelFilter === 'secondary' ? 'active' : ''}" data-tch-lvl="secondary">${t('THCS (Lớp 6–9)', 'Secondary (6–9)')} (${secondaryCount})</button>
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
            <h3 style="margin:0">👥 ${t(`Học sinh ${formatClassTitle(activeCls.name)} (${students.length})`, `Students in ${activeCls.name} (${students.length})`)}</h3>
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
                    <small>${esc(typeof formatAssignmentSummary === 'function' ? formatAssignmentSummary(asg) : `${t('Lớp', 'Gr')} ${asg.config?.grade || activeCls.grade} · ${asg.config?.count || 10} ${t('câu', 'qs')} · ${asg.config?.seconds || 20}s/${t('câu', 'q')}`)}${asg.due_date ? ` · ${t('Hạn:', 'Due:')} ${esc(asg.due_date)}` : ''}</small>
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
      if (confirm(t('Thầy/Cô có chắc muốn đăng xuất?', 'Are you sure you want to sign out?'))) {
        if (typeof cloudSession !== 'undefined' && cloudSession && typeof cloudSignOut === 'function') cloudSignOut();
        else if (typeof localSignOut === 'function') localSignOut();
      }
    });
    $$('[data-tch-lvl]').forEach(btn => {
      btn.onclick = () => {
        activeTeacherLevelFilter = btn.dataset.tchLvl;
        rerenderTeacherWorkspace();
      };
    });
    $$('[data-tch-class]').forEach(btn => {
      btn.onclick = () => {
        ui.activeTeacherClassId = btn.dataset.tchClass;
        rerenderTeacherWorkspace();
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
          rerenderTeacherWorkspace();
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
            rerenderTeacherWorkspace();
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
          rerenderTeacherWorkspace();
        };
      });
    }

    if (typeof translate === 'function') translate();
    if (typeof window !== 'undefined' && window.scrollTo) window.scrollTo(0, 0);
  }


  const exportsMap = { renderTeacherWorkspace, openAdminEnrollStudentsModal };
  if (typeof window !== 'undefined') Object.assign(window, exportsMap);
  if (typeof global !== 'undefined') Object.assign(global, exportsMap);
})();
