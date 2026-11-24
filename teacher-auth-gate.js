// Teacher classrooms: login gate tabs, join-by-code and teacher setup screens (split from teacher-classes.js in v2.7.0)
(() => {
  'use strict';

  const {
    PENDING_JOIN_KEY, levelShortBadge, gradesForLevel, findClassByCode, createTeacherWithClass,
    studentQuickJoinByCode,
  } = window.NumiClasses;
  let lastAuthMode = 'login';

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

  const exportsMap = { injectExtraAuthTabs };
  if (typeof window !== 'undefined') Object.assign(window, exportsMap);
  if (typeof global !== 'undefined') Object.assign(global, exportsMap);
  window.NumiClasses.getLastAuthMode = () => lastAuthMode;

  // If we are currently on the unauthenticated login gate, upgrade tabs immediately
  if (typeof view !== 'undefined' && view === 'account' && typeof currentAuthUser === 'function' && !currentAuthUser()) {
    injectExtraAuthTabs('login');
  }
})();
