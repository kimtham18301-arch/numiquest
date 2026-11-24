// Teacher classrooms: admin teacher management, student class badges, and nav/home/profile route hooks (split from teacher-classes.js in v2.7.0)
(() => {
  'use strict';

  const {
    levelShortBadge, gradesForLevel, loadClasses, getTeachersList, getClassesForStudent,
    createTeacherWithClass, deleteClassById, joinClassByCode, isCurrentUserTeacher, processPendingJoinForStudent,
  } = window.NumiClasses;

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
        openAccount(window.NumiClasses.getLastAuthMode() || 'login');
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

  if (typeof view !== 'undefined' && view === 'home') {
    injectStudentClassBadgeOnHome();
  }
})();
