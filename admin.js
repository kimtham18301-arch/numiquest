'use strict';

let adminSearchQuery = '';
let adminGradeFilter = 'all';
let adminSortBy = 'lastLogin';
const currentLang = () => (typeof lang !== 'undefined' ? lang : (typeof state !== 'undefined' && state?.lang ? state.lang : 'vi'));

function formatAdminTime(iso) {
  if (!iso) return t('Chưa đăng nhập', 'Never');
  const d = new Date(iso);
  if (isNaN(d.getTime())) return t('Chưa xác định', 'Unknown');
  const now = Date.now();
  const diffSec = Math.floor((now - d.getTime()) / 1000);
  if (diffSec < 60) return t('Vừa xong', 'Just now');
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} ${t('phút trước', 'mins ago')}`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} ${t('giờ trước', 'hours ago')}`;
  if (diffSec < 86400 * 3) return `${Math.floor(diffSec / 86400)} ${t('ngày trước', 'days ago')}`;
  return d.toLocaleDateString(currentLang() === 'vi' ? 'vi-VN' : 'en-US', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function getStudentsSummary() {
  const users = getLocalUsers();
  return Object.values(users).map(user => {
    let uState = null;
    try {
      uState = JSON.parse(localStorage.getItem('numi-user-state-' + user.username) || 'null');
    } catch {}
    if (!uState && typeof currentAuthUser === 'function' && currentAuthUser()?.username === user.username) {
      uState = typeof state !== 'undefined' ? state : null;
    }
    const history = uState?.history || [];
    const totalSessions = history.length;
    const totalAnswered = history.reduce((a, b) => a + (b.total || 0), 0);
    const totalCorrect = history.reduce((a, b) => a + (b.correct || 0), 0);
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : (totalSessions > 0 ? 100 : 0);
    const avgSpeed = history.length > 0 ? (history.reduce((a, b) => a + (b.time || 0), 0) / history.length).toFixed(1) : '-';
    const xp = uState?.xp || 0;
    const userLevel = 1 + Math.floor(xp / 100);
    const mistakesCount = uState?.mistakes?.length || 0;
    const streak = uState?.streak?.count || 0;
    const role = user.role || (user.username === 'admin' ? 'admin' : 'student');
    const lastSession = history.length > 0 ? history[history.length - 1].date : '';
    const lastLogin = user.lastLoginAt || lastSession || user.createdAt || '';

    return {
      username: user.username,
      name: user.name,
      password: user.password || '',
      avatar: user.avatar || 'bunny',
      grade: user.grade || 1,
      role,
      createdAt: user.createdAt || '',
      lastLogin,
      loginCount: user.loginCount || (user.lastLoginAt ? 1 : 0),
      totalSessions,
      totalAnswered,
      totalCorrect,
      accuracy,
      avgSpeed,
      xp,
      userLevel,
      mistakesCount,
      streak,
      history,
      uState
    };
  });
}

function getFilteredStudents() {
  let list = getStudentsSummary().filter(s => s.role !== 'admin' && s.username !== 'admin' && s.role !== 'teacher');
  if (adminGradeFilter !== 'all') {
    const g = Number(adminGradeFilter);
    list = list.filter(s => s.grade === g);
  }
  if (adminSearchQuery.trim()) {
    const q = adminSearchQuery.trim().toLowerCase();
    list = list.filter(s =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.username || '').toLowerCase().includes(q)
    );
  }
  list.sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (b.role === 'admin' && a.role !== 'admin') return 1;

    if (adminSortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    if (adminSortBy === 'grade') return a.grade - b.grade;
    if (adminSortBy === 'accuracy') return b.accuracy - a.accuracy;
    if (adminSortBy === 'xp') return b.xp - a.xp;
    if (adminSortBy === 'sessions') return b.totalSessions - a.totalSessions;
    // Default: 'lastLogin'
    const tA = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
    const tB = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
    return tB - tA;
  });
  return list;
}

function renderAdmin() {
  if (typeof stop === 'function') stop();
  if (typeof view !== 'undefined') view = 'admin';
  if (typeof window !== 'undefined') window.view = 'admin';
  if (typeof global !== 'undefined') global.view = 'admin';
  if (document.body) document.body.dataset.view = 'admin';
  $$('nav button').forEach(b => b.classList.toggle('active', b.dataset.view === 'admin'));

  const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
  const isAdmin = u && (u.role === 'admin' || u.username === 'admin');
  if (document.body && document.body.classList) {
    document.body.classList.toggle('is-admin-mode', Boolean(isAdmin));
  }

  if (!isAdmin) {
    $('#app').innerHTML = `<div class="narrow card admin-gate-card">
      <h2>${t('Yêu cầu quyền Quản trị viên','Administrator Access Required')}</h2>
      <p class="muted">${t('Vui lòng đăng nhập bằng tài khoản Quản trị viên (admin) để quản lý danh sách học sinh và theo dõi tiến độ.','Please sign in with an Administrator account (admin) to monitor student activity.')}</p>
      <div class="actions">
        <button class="primary wide" onclick="openAccount('login')">${t('Đăng nhập Quản trị viên (admin)','Sign in as Admin')}</button>
        <button class="wide" onclick="nav('home')">${t('Về trang chủ','Back to Home')}</button>
      </div>
    </div>`;
    return;
  }

  const allSummary = getStudentsSummary();
  const studentOnly = allSummary.filter(s => s.role !== 'admin' && s.role !== 'teacher');
  const filteredList = getFilteredStudents();

  const totalStudents = studentOnly.length;
  const now = Date.now();
  const activeRecent = studentOnly.filter(s => s.lastLogin && (now - new Date(s.lastLogin).getTime()) < 86400000 * 3).length;
  const totalQuestions = studentOnly.reduce((sum, s) => sum + s.totalAnswered, 0);
  const totalCorrectAll = studentOnly.reduce((sum, s) => sum + s.totalCorrect, 0);
  const totalSessionsAll = studentOnly.reduce((sum, s) => sum + s.totalSessions, 0);
  const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrectAll / totalQuestions) * 100) : 0;
  const totalStreakDays = studentOnly.reduce((sum, s) => sum + (s.streak || 0), 0);

  $('#app').innerHTML = `<section class="admin-view">
    <div class="card admin-header-card">
      <div class="admin-title-row">
        <div>
          <span class="eyebrow">NUMIQUICK · ${t('HỆ THỐNG QUẢN TRỊ','ADMINISTRATION SYSTEM')}</span>
          <h1 class="admin-main-title">${t('Trung tâm Quản trị Học sinh','Student Learning Management')}</h1>
          <p class="muted">${t('Kiểm soát danh sách học sinh, thời gian đăng nhập, khối lớp và toàn bộ tiến độ làm bài.','Monitor student logins, grade levels, and overall learning progression.')}</p>
        </div>
        <div class="admin-top-actions">
          <button type="button" class="primary admin-btn" id="adminAddStudentBtn">+ ${t('Thêm học sinh','Add Student')}</button>
          <button type="button" class="admin-btn" id="adminExportBtn">${t('Xuất Excel / CSV','Export CSV')}</button>
          <button type="button" class="admin-btn" id="adminRefreshBtn" title="${t('Làm mới dữ liệu','Refresh')}">${t('Làm mới','Refresh')}</button>
        </div>
      </div>

      <div class="admin-kpi-grid">
        <div class="admin-kpi-card">
          <div class="kpi-body">
            <small>${t('Tổng số học sinh','Total Students')}</small>
            <strong>${totalStudents}</strong>
            <span class="kpi-subtext">${activeRecent} ${t('hoạt động gần đây','active recently')}</span>
          </div>
        </div>
        <div class="admin-kpi-card">
          <div class="kpi-body">
            <small>${t('Tổng số câu đã giải','Questions Solved')}</small>
            <strong>${totalQuestions.toLocaleString()}</strong>
            <span class="kpi-subtext">${totalSessionsAll} ${t('lượt hoàn thành','sessions cleared')}</span>
          </div>
        </div>
        <div class="admin-kpi-card">
          <div class="kpi-body">
            <small>${t('Tỉ lệ đúng toàn trường','Average Accuracy')}</small>
            <strong style="color:${avgAccuracy>=80?'#2b8a3e':avgAccuracy>=65?'#d97706':'#e03131'}">${avgAccuracy}%</strong>
            <span class="kpi-subtext">${t('Toàn bộ khối lớp 1–9','All Grades 1–9')}</span>
          </div>
        </div>
        <div class="admin-kpi-card">
          <div class="kpi-body">
            <small>${t('Tổng chuỗi ngày học','Total Streak Days')}</small>
            <strong>${totalStreakDays} ${t('ngày','days')}</strong>
            <span class="kpi-subtext">${t('Chăm chỉ giữ lửa học tập','Consistent engagement')}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="card admin-filter-bar">
      <div class="admin-search-wrap">
        <input type="text" id="adminSearchInput" placeholder="${t('Tìm kiếm theo tên học sinh hoặc @username...','Search by name or @username...')}" value="${esc(adminSearchQuery)}" style="padding-left:14px">
        <button type="button" id="adminClearSearchBtn" class="clear-search-btn" ${adminSearchQuery ? '' : 'hidden'}>✕</button>
      </div>
      <div class="admin-grade-chips-scroll">
        <button type="button" class="admin-grade-chip ${adminGradeFilter==='all'?'active':''}" data-admin-grade="all">${t('Tất cả','All')} (${studentOnly.length})</button>
        ${[1,2,3,4,5,6,7,8,9].map(g=>{
          const count = studentOnly.filter(s=>s.grade===g).length;
          return `<button type="button" class="admin-grade-chip ${adminGradeFilter===String(g)?'active':''}" data-admin-grade="${g}">Lớp ${g} <span class="chip-count">(${count})</span></button>`;
        }).join('')}
      </div>
      <div class="admin-filters">
        <select id="adminGradeSelect" class="admin-select admin-desktop-only">
          <option value="all" ${adminGradeFilter==='all'?'selected':''}>${t('Tất cả khối lớp (1–9)','All Grades (1–9)')}</option>
          ${[1,2,3,4,5,6,7,8,9].map(g=>`<option value="${g}" ${adminGradeFilter===String(g)?'selected':''}>${typeof NUMI_GRADES!=='undefined'&&NUMI_GRADES[g]?(currentLang()==='vi'?NUMI_GRADES[g].name:NUMI_GRADES[g].enName):('Lớp '+g)}</option>`).join('')}
        </select>
        <select id="adminSortSelect" class="admin-select">
          <option value="lastLogin" ${adminSortBy==='lastLogin'?'selected':''}>${t('Đăng nhập gần nhất','Recent Login')}</option>
          <option value="xp" ${adminSortBy==='xp'?'selected':''}>${t('Điểm XP cao nhất','Highest XP')}</option>
          <option value="accuracy" ${adminSortBy==='accuracy'?'selected':''}>${t('Tỉ lệ đúng cao nhất','Best Accuracy')}</option>
          <option value="sessions" ${adminSortBy==='sessions'?'selected':''}>${t('Làm nhiều bài nhất','Most Sessions')}</option>
          <option value="grade" ${adminSortBy==='grade'?'selected':''}>${t('Khối lớp (1→9)','Grade (1→9)')}</option>
          <option value="name" ${adminSortBy==='name'?'selected':''}>${t('Tên A → Z','Name A → Z')}</option>
        </select>
      </div>
    </div>

    <div class="card admin-table-card" id="adminTableCard">
      <div class="admin-table-header-row">
        <div>
          <h3>${t('Danh sách học sinh & Tiến độ','Student Directory & Progress')} (<span id="adminResultCount">${filteredList.length}</span>)</h3>
          <small class="muted">${t('Theo dõi thời gian đăng nhập thực tế, số câu đúng/sai và hỗ trợ đổi mã PIN cho bé.','Track real login times, accuracy rates, and reset PINs when requested.')}</small>
        </div>
      </div>
      <!-- Desktop Table View (>= 840px) -->
      <div class="admin-table-responsive admin-desktop-only">
        <table class="admin-table">
          <thead>
            <tr>
              <th>${t('Học sinh','Student')}</th>
              <th>${t('Khối lớp','Grade')}</th>
              <th>${t('Đăng nhập gần nhất','Last Login')}</th>
              <th>${t('Tiến độ học tập','Learning Progress')}</th>
              <th>${t('Thao tác','Actions')}</th>
            </tr>
          </thead>
          <tbody>
            ${filteredList.length === 0 ? `<tr><td colspan="5" style="text-align:center;padding:36px;color:#718e76">${t('Không tìm thấy học sinh nào phù hợp với bộ lọc.','No students found matching your filter.')}</td></tr>` : ''}
            ${filteredList.map(s => {
              const gradeInfo = typeof NUMI_GRADES !== 'undefined' && NUMI_GRADES[s.grade];
              const gradeLabel = gradeInfo ? (currentLang() === 'vi' ? gradeInfo.name : gradeInfo.enName) : `Lớp ${s.grade}`;
              const isAdminUser = s.role === 'admin' || s.username === 'admin';
              const accClass = s.accuracy >= 80 ? 'acc-high' : s.accuracy >= 65 ? 'acc-med' : 'acc-low';

              return `<tr class="${isAdminUser ? 'admin-user-row' : ''}">
                <td>
                  <div class="student-cell">
                    <div class="student-avatar">${(typeof numiAnimalOriginal === 'function' ? numiAnimalOriginal : animal)(s.avatar)}</div>
                    <div class="student-meta">
                      <b class="student-name">${esc(s.name)}</b>
                      <span class="student-uname">@${esc(s.username)}</span>
                      ${isAdminUser ? `<span class="role-badge admin-badge">${t('Quản trị viên','Admin')}</span>` : `<span class="role-badge student-badge">${t('Học sinh','Student')}</span>`}
                    </div>
                  </div>
                </td>
                <td>
                  <span class="grade-tag"><b>${gradeLabel}</b></span>
                </td>
                <td>
                  <div class="login-meta">
                    <span class="login-relative">${formatAdminTime(s.lastLogin)}</span>
                    <small class="login-detail">${s.loginCount > 0 ? `${s.loginCount} ${t('lần vào học','logins')}` : t('Chưa đăng nhập lần nào','Never logged in')}</small>
                  </div>
                </td>
                <td>
                  <div class="progress-meta">
                    <div class="progress-main-row">
                      <span class="user-level-badge">Lv.${s.userLevel}</span>
                      <b>${s.xp} XP</b>
                      <span class="acc-pill ${accClass}">${s.accuracy}% ${t('đúng','correct')}</span>
                    </div>
                    <div class="progress-sub-row">
                      <span>${s.totalSessions} ${t('bài','lessons')} (${s.totalAnswered} ${t('câu','qs')})</span>
                      <span>${s.avgSpeed}s/${t('câu','q')}</span>
                      <span>${s.streak} ${t('ngày','d')}</span>
                      ${s.mistakesCount > 0 ? `<span class="mistake-pill">${s.mistakesCount} ${t('câu sai','mistakes')}</span>` : ''}
                    </div>
                  </div>
                </td>
                <td>
                  <div class="action-buttons-wrap">
                    <button type="button" class="admin-act-btn btn-view" data-action="view" data-user="${esc(s.username)}" title="${t('Xem chi tiết bài làm & câu sai','View detailed drill-down')}">${t('Chi tiết','Details')}</button>
                    <button type="button" class="admin-act-btn btn-pin" data-action="pin" data-user="${esc(s.username)}" title="${t('Đổi mã PIN cho học sinh','Reset PIN')}">${t('Mã PIN','PIN')}</button>
                    ${!isAdminUser ? `<button type="button" class="admin-act-btn btn-switch" data-action="switch" data-user="${esc(s.username)}" title="${t('Đăng nhập vào tài khoản học sinh','Switch to student profile')}">${t('Vào học','Open')}</button>` : ''}
                    ${!isAdminUser ? `<button type="button" class="admin-act-btn btn-del" data-action="delete" data-user="${esc(s.username)}" title="${t('Xóa tài khoản','Delete account')}">${t('Xóa','Delete')}</button>` : ''}
                  </div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards View (< 840px) -->
      <div class="admin-cards-list admin-mobile-only">
        ${filteredList.length === 0 ? `<div class="admin-empty-card">${t('Không tìm thấy học sinh nào phù hợp với bộ lọc.','No students found matching your filter.')}</div>` : ''}
        ${filteredList.map(s => {
          const gradeInfo = typeof NUMI_GRADES !== 'undefined' && NUMI_GRADES[s.grade];
          const gradeLabel = gradeInfo ? (currentLang() === 'vi' ? gradeInfo.name : gradeInfo.enName) : `Lớp ${s.grade}`;
          const isAdminUser = s.role === 'admin' || s.username === 'admin';
          const accClass = s.accuracy >= 80 ? 'acc-high' : s.accuracy >= 65 ? 'acc-med' : 'acc-low';

          return `<div class="admin-student-card ${isAdminUser ? 'admin-user-card' : ''}">
            <div class="admin-card-top">
              <div class="student-cell">
                <div class="student-avatar">${(typeof numiAnimalOriginal === 'function' ? numiAnimalOriginal : animal)(s.avatar)}</div>
                <div class="student-meta">
                  <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                    <b class="student-name">${esc(s.name)}</b>
                    ${isAdminUser ? `<span class="role-badge admin-badge">Admin</span>` : `<span class="role-badge student-badge">HS</span>`}
                  </div>
                  <span class="student-uname">@${esc(s.username)}</span>
                </div>
              </div>
              <span class="grade-tag"><b>${gradeLabel}</b></span>
            </div>

            <div class="admin-card-stats-grid">
              <div class="admin-card-stat">
                <small>${t('Chính xác','Accuracy')}</small>
                <span class="acc-pill ${accClass}">${s.accuracy}%</span>
              </div>
              <div class="admin-card-stat">
                <small>${t('Cấp độ & XP','Level & XP')}</small>
                <strong>Lv.${s.userLevel} <span class="stat-meta-note">(${s.xp} XP)</span></strong>
              </div>
              <div class="admin-card-stat">
                <small>${t('Đăng nhập','Last Login')}</small>
                <span class="stat-line-text">${formatAdminTime(s.lastLogin)}</span>
                <span class="stat-meta-note">${s.loginCount > 0 ? `${s.loginCount} ${t('lần vào học','logins')}` : t('Chưa vào','Never')}</span>
              </div>
              <div class="admin-card-stat">
                <small>${t('Bài làm & Lỗi','Lessons & Errors')}</small>
                <span class="stat-line-text">${s.totalSessions} ${t('bài','lessons')} (${s.totalAnswered} ${t('câu','qs')})</span>
                ${s.mistakesCount > 0 ? `<span class="mistake-pill" style="margin-top:2px;display:inline-block">${s.mistakesCount} ${t('câu sai','mistakes')}</span>` : `<span class="stat-meta-note" style="color:#4a7758">0 ${t('lỗi tồn','errors')}</span>`}
              </div>
            </div>

            <div class="admin-card-actions">
              <button type="button" class="admin-act-btn btn-view" data-action="view" data-user="${esc(s.username)}">${t('Chi tiết','Details')}</button>
              <button type="button" class="admin-act-btn btn-pin" data-action="pin" data-user="${esc(s.username)}">${t('Mã PIN','PIN')}</button>
              ${!isAdminUser ? `<button type="button" class="admin-act-btn btn-switch" data-action="switch" data-user="${esc(s.username)}">${t('Vào học','Open')}</button>` : ''}
              ${!isAdminUser ? `<button type="button" class="admin-act-btn btn-del" data-action="delete" data-user="${esc(s.username)}">${t('Xóa','Del')}</button>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  </section>`;

  // Bind actions
  $('#adminAddStudentBtn')?.addEventListener('click', adminAddStudentModal);
  $('#adminExportBtn')?.addEventListener('click', () => adminExportCSV(studentOnly));
  $('#adminRefreshBtn')?.addEventListener('click', () => renderAdmin());

  const bindRowActions = () => {
    $$('#adminTableCard [data-action="view"]').forEach(b => {
      b.onclick = () => adminViewDetailModal(b.dataset.user);
    });
    $$('#adminTableCard [data-action="pin"]').forEach(b => {
      b.onclick = () => adminResetPinModal(b.dataset.user);
    });
    $$('#adminTableCard [data-action="switch"]').forEach(b => {
      b.onclick = () => adminSwitchToStudent(b.dataset.user);
    });
    $$('#adminTableCard [data-action="delete"]').forEach(b => {
      b.onclick = () => adminDeleteStudent(b.dataset.user);
    });
  };

  const applySearchFilter = () => {
    const nextList = getFilteredStudents();
    const countEl = $('#adminResultCount');
    if (countEl) countEl.textContent = String(nextList.length);
    const clearBtn = $('#adminClearSearchBtn');
    if (clearBtn) clearBtn.hidden = !adminSearchQuery;
    const tbody = $('#adminTableCard tbody');
    const cardsWrap = $('#adminTableCard .admin-cards-list');
    if (!tbody || !cardsWrap) { renderAdmin(); return; }
    tbody.innerHTML = nextList.length === 0
      ? `<tr><td colspan="5" style="text-align:center;padding:36px;color:#718e76">${t('Không tìm thấy học sinh nào phù hợp với bộ lọc.','No students found matching your filter.')}</td></tr>`
      : nextList.map(s => {
          const gradeInfo = typeof NUMI_GRADES !== 'undefined' && NUMI_GRADES[s.grade];
          const gradeLabel = gradeInfo ? (currentLang() === 'vi' ? gradeInfo.name : gradeInfo.enName) : `Lớp ${s.grade}`;
          const isAdminUser = s.role === 'admin' || s.username === 'admin';
          const accClass = s.accuracy >= 80 ? 'acc-high' : s.accuracy >= 65 ? 'acc-med' : 'acc-low';
          return `<tr class="${isAdminUser ? 'admin-user-row' : ''}">
            <td><div class="student-cell"><div class="student-avatar">${(typeof numiAnimalOriginal === 'function' ? numiAnimalOriginal : animal)(s.avatar)}</div><div class="student-meta"><b class="student-name">${esc(s.name)}</b><span class="student-uname">@${esc(s.username)}</span>${isAdminUser ? `<span class="role-badge admin-badge">${t('Quản trị viên','Admin')}</span>` : `<span class="role-badge student-badge">${t('Học sinh','Student')}</span>`}</div></div></td>
            <td><span class="grade-tag"><b>${gradeLabel}</b></span></td>
            <td><div class="login-info-cell"><b>${formatAdminTime(s.lastLogin)}</b><small>${s.loginCount > 0 ? `${s.loginCount} ${t('lần đăng nhập','logins')}` : t('Chưa đăng nhập','Never')}</small></div></td>
            <td><div class="progress-cell"><div class="progress-top"><span class="acc-pill ${accClass}">${s.accuracy}%</span><span class="xp-badge">Lv.${s.userLevel} · ${s.xp} XP</span></div><small>${s.totalSessions} ${t('bài','lessons')} · ${s.totalAnswered} ${t('câu','qs')} ${s.mistakesCount > 0 ? `· <span class="mistake-pill">${s.mistakesCount} ${t('lỗi tồn','mistakes')}</span>` : ''}</small></div></td>
            <td><div class="admin-actions-col"><button type="button" class="admin-act-btn btn-view" data-action="view" data-user="${esc(s.username)}" title="${t('Xem chi tiết','View details')}">${t('Chi tiết','Details')}</button><button type="button" class="admin-act-btn btn-pin" data-action="pin" data-user="${esc(s.username)}" title="${t('Đổi mã PIN','Reset PIN')}">${t('Đổi PIN','PIN')}</button>${!isAdminUser ? `<button type="button" class="admin-act-btn btn-switch" data-action="switch" data-user="${esc(s.username)}" title="${t('Đăng nhập vào tài khoản học sinh','Switch to student profile')}">${t('Vào học','Open')}</button>` : ''}${!isAdminUser ? `<button type="button" class="admin-act-btn btn-del" data-action="delete" data-user="${esc(s.username)}" title="${t('Xóa tài khoản','Delete account')}">${t('Xóa','Delete')}</button>` : ''}</div></td>
          </tr>`;
        }).join('');
    cardsWrap.innerHTML = nextList.length === 0
      ? `<div class="admin-empty-card">${t('Không tìm thấy học sinh nào phù hợp với bộ lọc.','No students found matching your filter.')}</div>`
      : nextList.map(s => {
          const gradeInfo = typeof NUMI_GRADES !== 'undefined' && NUMI_GRADES[s.grade];
          const gradeLabel = gradeInfo ? (currentLang() === 'vi' ? gradeInfo.name : gradeInfo.enName) : `Lớp ${s.grade}`;
          const isAdminUser = s.role === 'admin' || s.username === 'admin';
          const accClass = s.accuracy >= 80 ? 'acc-high' : s.accuracy >= 65 ? 'acc-med' : 'acc-low';
          return `<div class="admin-student-card ${isAdminUser ? 'admin-user-card' : ''}"><div class="admin-card-top"><div class="student-cell"><div class="student-avatar">${(typeof numiAnimalOriginal === 'function' ? numiAnimalOriginal : animal)(s.avatar)}</div><div class="student-meta"><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><b class="student-name">${esc(s.name)}</b>${isAdminUser ? `<span class="role-badge admin-badge">Admin</span>` : `<span class="role-badge student-badge">HS</span>`}</div><span class="student-uname">@${esc(s.username)}</span></div></div><span class="grade-tag"><b>${gradeLabel}</b></span></div><div class="admin-card-stats-grid"><div class="admin-card-stat"><small>${t('Chính xác','Accuracy')}</small><span class="acc-pill ${accClass}">${s.accuracy}%</span></div><div class="admin-card-stat"><small>${t('Cấp độ & XP','Level & XP')}</small><strong>Lv.${s.userLevel} <span class="stat-meta-note">(${s.xp} XP)</span></strong></div><div class="admin-card-stat"><small>${t('Đăng nhập','Last Login')}</small><span class="stat-line-text">${formatAdminTime(s.lastLogin)}</span><span class="stat-meta-note">${s.loginCount > 0 ? `${s.loginCount} ${t('lần vào học','logins')}` : t('Chưa vào','Never')}</span></div><div class="admin-card-stat"><small>${t('Bài làm & Lỗi','Lessons & Errors')}</small><span class="stat-line-text">${s.totalSessions} ${t('bài','lessons')} (${s.totalAnswered} ${t('câu','qs')})</span>${s.mistakesCount > 0 ? `<span class="mistake-pill" style="margin-top:2px;display:inline-block">${s.mistakesCount} ${t('câu sai','mistakes')}</span>` : `<span class="stat-meta-note" style="color:#4a7758">0 ${t('lỗi tồn','errors')}</span>`}</div></div><div class="admin-card-actions"><button type="button" class="admin-act-btn btn-view" data-action="view" data-user="${esc(s.username)}">${t('Chi tiết','Details')}</button><button type="button" class="admin-act-btn btn-pin" data-action="pin" data-user="${esc(s.username)}">${t('Mã PIN','PIN')}</button>${!isAdminUser ? `<button type="button" class="admin-act-btn btn-switch" data-action="switch" data-user="${esc(s.username)}">${t('Vào học','Open')}</button>` : ''}${!isAdminUser ? `<button type="button" class="admin-act-btn btn-del" data-action="delete" data-user="${esc(s.username)}">${t('Xóa','Del')}</button>` : ''}</div></div>`;
        }).join('');
    bindRowActions();
  };

  const searchInput = $('#adminSearchInput');
  if (searchInput) {
    let isComposing = false;
    searchInput.addEventListener('compositionstart', () => { isComposing = true; });
    searchInput.addEventListener('compositionend', () => {
      isComposing = false;
      adminSearchQuery = searchInput.value;
      applySearchFilter();
    });
    searchInput.oninput = () => {
      if (isComposing) return;
      adminSearchQuery = searchInput.value;
      applySearchFilter();
    };
  }

  $('#adminClearSearchBtn')?.addEventListener('click', () => {
    adminSearchQuery = '';
    if (searchInput) { searchInput.value = ''; searchInput.focus(); }
    applySearchFilter();
  });

  const gradeSelect = $('#adminGradeSelect');
  if (gradeSelect) {
    gradeSelect.onchange = () => {
      adminGradeFilter = gradeSelect.value;
      renderAdmin();
    };
  }

  $$('.admin-grade-chip').forEach(b => {
    b.onclick = () => {
      adminGradeFilter = b.dataset.adminGrade;
      renderAdmin();
    };
  });

  const sortSelect = $('#adminSortSelect');
  if (sortSelect) {
    sortSelect.onchange = () => {
      adminSortBy = sortSelect.value;
      renderAdmin();
    };
  }

  bindRowActions();
}

function adminExportCSV(students) {
  const headers = [
    'STT',
    'Họ và tên',
    'Tên đăng nhập (@username)',
    'Trạng thái PIN',
    'Khối lớp',
    'Vai trò',
    'Ngày tạo',
    'Đăng nhập gần nhất',
    'Số lần đăng nhập',
    'Cấp độ (Level)',
    'Điểm XP',
    'Số bài luyện',
    'Tổng câu hỏi',
    'Số câu đúng',
    'Tỉ lệ đúng (%)',
    'Tốc độ TB (giây/câu)',
    'Chuỗi ngày học (Streak)',
    'Số câu sai cần ôn (Vườn hoa)'
  ];

  const csvSafe = val => {
    let s = String(val ?? '').replace(/"/g, '""');
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return `"${s}"`;
  };

  const rows = students.map((s, i) => [
    i + 1,
    csvSafe(s.name || ''),
    csvSafe(s.username),
    csvSafe(s.hash && s.hash !== '0' ? 'Đã mã hóa' : 'Mặc định'),
    csvSafe(`Lớp ${s.grade}`),
    csvSafe(s.role === 'admin' ? 'Quản trị viên' : 'Học sinh'),
    csvSafe(s.createdAt ? new Date(s.createdAt).toLocaleString('vi-VN') : ''),
    csvSafe(s.lastLogin ? new Date(s.lastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập'),
    s.loginCount || 0,
    s.userLevel,
    s.xp,
    s.totalSessions,
    s.totalAnswered,
    s.totalCorrect,
    `${s.accuracy}%`,
    s.avgSpeed,
    s.streak,
    s.mistakesCount
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url;
  a.download = `NumiQuick-Bao-Cao-Hoc-Sinh-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  toast(t('Đã xuất báo cáo học sinh thành công!', 'Exported student report successfully!'));
}

async function adminResetPinModal(username) {
  const users = getLocalUsers(), user = users[username];
  if (!user) return;

  modal(`<h2>${t('Đổi mã PIN cho ' + esc(user.name), 'Reset PIN for ' + esc(user.name))}</h2>
  <p class="muted">${t('Nhập mã PIN hoặc mật khẩu mới cho học sinh @' + esc(username) + ' (tối thiểu 4 ký tự):', 'Enter new PIN or password for student @' + esc(username) + ' (min 4 characters):')}</p>
  <div style="margin:16px 0">
    <label style="display:block;margin-bottom:6px;font-weight:700;font-size:13px;color:#3b5e39">${t('Mật khẩu / Mã PIN mới:','New PIN/Password:')}</label>
    <input type="text" id="adminNewPinInput" minlength="4" value="" placeholder="${t('Nhập PIN mới (tối thiểu 4 ký tự)','Enter new PIN (min 4 chars)')}" style="width:100%;font-size:18px;padding:10px 14px;border-radius:12px;border:2px solid #b8dca5;text-align:center;font-weight:800;letter-spacing:1px">
  </div>
  <div class="actions">
    <button class="primary" id="confirmResetPinBtn">${t('Lưu mã PIN mới','Save New PIN')}</button>
    <button onclick="$('#modal').close()">${t('Hủy','Cancel')}</button>
  </div>`);

  $('#confirmResetPinBtn').onclick = async () => {
    const newPin = String($('#adminNewPinInput').value || '').trim();
    if (!newPin || newPin.length < 4) {
      toast(t('Mã PIN cần ít nhất 4 ký tự.', 'PIN must be at least 4 characters.'));
      return;
    }
    const hash = await hashPassword(newPin);
    delete users[username].password;
    users[username].hash = hash;
    users[username].passwordChanged = true;
    saveLocalUsers(users);
    $('#modal').close();
    toast(t('Đã đổi mã PIN cho ' + user.name + ' thành: ' + newPin, 'PIN updated to: ' + newPin));
    renderAdmin();
  };
}

function adminDeleteStudent(username) {
  if (username === 'admin') {
    toast(t('Không thể xóa tài khoản Quản trị viên mặc định!', 'Cannot delete default admin account!'));
    return;
  }
  const users = getLocalUsers(), user = users[username];
  if (!user) return;
  if (!confirm(t(`Bạn có chắc chắn muốn xóa tài khoản học sinh "${user.name}" (@${username})?\nToàn bộ tiến độ học và lịch sử bài làm sẽ bị xóa vĩnh viễn.`, `Are you sure you want to delete student "${user.name}" (@${username})?\nAll learning history will be deleted.`))) {
    return;
  }
  delete users[username];
  saveLocalUsers(users);
  try { localStorage.removeItem('numi-user-state-' + username); } catch {}
  if (typeof currentAuthUser === 'function' && currentAuthUser()?.username === username) {
    const adminUser = users['admin'];
    if (adminUser) {
      localStorage.setItem('numi-current-user-v1', JSON.stringify({
        id: 'admin', username: 'admin', name: adminUser.name, avatar: adminUser.avatar || 'lion', grade: adminUser.grade || 5, role: 'admin', type: 'local'
      }));
      cloudBadge();
    }
  }
  toast(t('Đã xóa tài khoản học sinh ' + user.name, 'Deleted student ' + user.name));
  renderAdmin();
}

async function adminSwitchToStudent(username) {
  const users = getLocalUsers(), user = users[username];
  if (!user) return;
  const activeUser = {
    id: user.username,
    username: user.username,
    name: user.name,
    avatar: user.avatar || 'bunny',
    grade: user.grade || 1,
    role: user.role || 'student',
    type: 'local'
  };
  localStorage.setItem('numi-current-user-v1', JSON.stringify(activeUser));
  try {
    localStorage.setItem('numi-buddy-profile-v1', JSON.stringify({ name: user.name, avatar: user.avatar || 'bunny' }));
    const savedState = JSON.parse(localStorage.getItem('numi-user-state-' + user.username) || 'null');
    if (savedState) {
      state = { ...fresh(), ...savedState };
    } else {
      state.name = user.name;
      state.buddy = user.avatar || 'bunny';
    }
    save();
  } catch {}
  if (typeof syncUserGradeToConfig === 'function') syncUserGradeToConfig(user.grade);
  cloudBadge();
  nav('profile');
  toast(t('Đang xem giao diện học của: ' + user.name + ' (Chuyển về admin trong Hồ sơ bất cứ lúc nào)', 'Viewing as: ' + user.name));
}

function adminAddStudentModal() {
  let chosenAvatar = 'bunny';
  modal(`<h2>${t('Thêm tài khoản học sinh mới','Add New Student Account')}</h2>
  <p class="muted">${t('Tạo tài khoản để theo dõi tiến độ học tập của bé:','Create profile to track student learning progress:')}</p>
  <form id="adminAddStudentForm" style="margin-top:14px;display:flex;flex-direction:column;gap:12px">
    <label style="font-weight:700;font-size:13px;color:#3b5e39">${t('Họ và tên học sinh (VD: Nguyễn Minh Khôi):','Full Name:')}
      <input name="name" maxlength="30" placeholder="${t('Nhập tên của bé','Enter student name')}" required style="width:100%;font-size:15px;padding:9px 12px;border-radius:10px;border:1.5px solid #c2dfae;margin-top:4px">
    </label>
    <label style="font-weight:700;font-size:13px;color:#3b5e39">${t('Tên đăng nhập (@username không dấu):','Username (no spaces):')}
      <input name="username" maxlength="50" placeholder="${t('Ví dụ: minhkhoi4a','e.g. minhkhoi4a')}" required style="width:100%;font-size:15px;padding:9px 12px;border-radius:10px;border:1.5px solid #c2dfae;margin-top:4px">
    </label>
    <label style="font-weight:700;font-size:13px;color:#3b5e39">${t('Mật khẩu / Mã PIN (tối thiểu 4 số/ký tự):','PIN / Password (min 4 chars):')}
      <input name="password" minlength="4" value="1234" required style="width:100%;font-size:15px;padding:9px 12px;border-radius:10px;border:1.5px solid #c2dfae;margin-top:4px">
    </label>
    <label style="font-weight:700;font-size:13px;color:#3b5e39">${t('Khối lớp hiện tại:','Current Grade Level:')}
      <select name="grade" style="width:100%;font-size:15px;padding:9px 12px;border-radius:10px;border:1.5px solid #c2dfae;margin-top:4px">
        ${[1,2,3,4,5,6,7,8,9].map(g => `<option value="${g}">${typeof NUMI_GRADES!=='undefined'&&NUMI_GRADES[g]?(currentLang()==='vi'?NUMI_GRADES[g].name:NUMI_GRADES[g].enName):('Lớp '+g)}</option>`).join('')}
      </select>
    </label>
    <div>
      <span style="font-weight:700;font-size:13px;color:#3b5e39;display:block;margin-bottom:6px">${t('Chọn bạn thú đồng hành:','Choose study buddy:')}</span>
      <div class="buddy-choices">
        ${[['bunny','Thỏ Mimi'],['panda','Gấu Baobao'],['fox','Cáo Kiki'],['lion','Sư tử Leo']].map(([k,label])=>`<button type="button" data-admin-avatar="${k}" class="${k===chosenAvatar?'chosen':''}">${(typeof numiAnimalOriginal === 'function' ? numiAnimalOriginal : animal)(k)}<span>${label}</span></button>`).join('')}
      </div>
    </div>
    <p id="adminAddError" class="danger" style="margin:4px 0;font-weight:700"></p>
    <div class="actions">
      <button type="submit" class="primary">${t('Tạo tài khoản học sinh','Create Student Account')}</button>
      <button type="button" onclick="$('#modal').close()">${t('Hủy','Cancel')}</button>
    </div>
  </form>`);

  $$('[data-admin-avatar]').forEach(btn => {
    btn.onclick = () => {
      chosenAvatar = btn.dataset.adminAvatar;
      $$('[data-admin-avatar]').forEach(b => b.classList.toggle('chosen', b.dataset.adminAvatar === chosenAvatar));
    };
  });

  $('#adminAddStudentForm').onsubmit = async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const name = String(f.get('name') || '').trim();
    const username = String(f.get('username') || '').trim().toLowerCase().replace(/\s+/g, '');
    const password = String(f.get('password') || '').trim();
    const grade = Number(f.get('grade')) || 1;
    const errEl = $('#adminAddError');

    if (!name) { errEl.textContent = t('Vui lòng nhập tên học sinh.', 'Please enter student name.'); return; }
    if (!username || username.length < 2) { errEl.textContent = t('Tên đăng nhập cần ít nhất 2 ký tự.', 'Username must be at least 2 chars.'); return; }
    if (!/^[a-z0-9_.-]+$/.test(username)) { errEl.textContent = t('Tên đăng nhập chỉ gồm chữ cái không dấu, số hoặc dấu gạch.', 'Invalid username format.'); return; }
    if (!password || password.length < 4) { errEl.textContent = t('Mật khẩu cần ít nhất 4 ký tự.', 'Password must be at least 4 chars.'); return; }

    const users = getLocalUsers();
    if (users[username]) {
      errEl.textContent = t('Tên đăng nhập này đã tồn tại. Hãy chọn tên khác.', 'Username already taken.');
      return;
    }

    const hash = await hashPassword(password);
    users[username] = {
      username,
      name,
      hash,
      avatar: chosenAvatar,
      grade,
      role: 'student',
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
      loginCount: 0
    };
    saveLocalUsers(users);

    // Initialize fresh state for new student
    const studentState = {
      version: 1,
      lang: 'vi',
      name,
      buddy: chosenAvatar,
      xp: 0,
      best: 0,
      pieces: {},
      streak: { count: 0, lastDate: '' },
      history: [],
      mistakes: [],
      mastery: {}
    };
    try { localStorage.setItem('numi-user-state-' + username, JSON.stringify(studentState)); } catch {}

    $('#modal').close();
    toast(t('Đã tạo thành công tài khoản cho ' + name, 'Student account created for ' + name));
    renderAdmin();
  };
}

function adminViewDetailModal(username) {
  const users = getLocalUsers(), user = users[username];
  if (!user) return;
  let uState = null;
  try {
    uState = JSON.parse(localStorage.getItem('numi-user-state-' + username) || 'null');
  } catch {}
  if (!uState && typeof currentAuthUser === 'function' && currentAuthUser()?.username === username) {
    uState = typeof state !== 'undefined' ? state : null;
  }

  const history = uState?.history || [];
  const mistakes = uState?.mistakes || [];
  const mastery = uState?.mastery || {};
  const totalAnswered = history.reduce((a, b) => a + (b.total || 0), 0);
  const totalCorrect = history.reduce((a, b) => a + (b.correct || 0), 0);
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const gradeInfo = typeof NUMI_GRADES !== 'undefined' && NUMI_GRADES[user.grade];
  const gradeLabel = gradeInfo ? (currentLang() === 'vi' ? gradeInfo.name : gradeInfo.enName) : `Lớp ${user.grade}`;

  modal(`<div class="admin-detail-modal">
    <div class="admin-detail-header">
      <div class="student-avatar" style="width:48px;height:48px">${(typeof numiAnimalOriginal === 'function' ? numiAnimalOriginal : animal)(user.avatar || 'bunny')}</div>
      <div>
        <h2 style="margin:0">${esc(user.name)}</h2>
        <div style="font-size:13px;color:#5a7663;margin-top:2px">
          @${esc(user.username)} · <b>${gradeLabel}</b> · ${t('Bảo mật PIN:','PIN security:')} <code style="background:#eaf3e3;padding:2px 6px;border-radius:4px;font-weight:700">${t('Đã mã hóa','Encrypted')}</code>
          <button type="button" id="detailResetPinBtn" class="ghost" style="padding:1px 6px;font-size:11px;min-height:auto;margin-left:4px">${t('Đổi PIN','Reset PIN')}</button>
        </div>
      </div>
    </div>

    <div class="admin-detail-tabs" style="display:flex;gap:8px;margin:16px 0;border-bottom:1.5px solid #d4e5cb;padding-bottom:8px">
      <button type="button" class="admin-tab-btn active" id="tabHistBtn">${t('Lịch sử bài làm (' + history.length + ')','Sessions (' + history.length + ')')}</button>
      <button type="button" class="admin-tab-btn" id="tabMistakesBtn">${t('Câu sai cần sửa (' + mistakes.length + ')','Pending Mistakes (' + mistakes.length + ')')}</button>
      <button type="button" class="admin-tab-btn" id="tabMasteryBtn">${t('Kỹ năng (Mastery)','Skill Breakdown')}</button>
    </div>

    <div id="detailTabContent">
      <!-- Session History Tab -->
      <div id="tabHistoryPanel">
        ${history.length === 0 ? `<p class="muted" style="text-align:center;padding:20px 0">${t('Học sinh này chưa hoàn thành lượt làm bài nào.','No sessions recorded yet.')}</p>` : `
        <div style="max-height:280px;overflow-y:auto">
          <table class="admin-subtable">
            <thead>
              <tr>
                <th>${t('Thời gian','Date')}</th>
                <th>${t('Chế độ','Mode')}</th>
                <th>${t('Số câu đúng','Score')}</th>
                <th>${t('Tốc độ','Speed')}</th>
              </tr>
            </thead>
            <tbody>
              ${history.slice(-15).reverse().map(h => `<tr>
                <td>${new Date(h.date).toLocaleString(currentLang()==='vi'?'vi-VN':'en-US',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</td>
                <td>${h.mode==='sprint60'?t('Thi đấu 60s','60s Sprint'):h.mode==='assigned'?t('Bài được giao','Assigned'):t('Tự luyện','Practice')}</td>
                <td><b>${h.correct}</b>/${h.total} (${Math.round((h.correct/h.total)*100)}%)</td>
                <td>${h.time ? h.time.toFixed(1) + 's' : '-'}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>`}
      </div>

      <!-- Mistakes Garden Tab -->
      <div id="tabMistakesPanel" style="display:none">
        ${mistakes.length === 0 ? `<div style="text-align:center;padding:24px;color:#2b8a3e"><b>${t('Tuyệt vời! Bé không có câu sai nào tồn đọng trong Vườn hoa.','Awesome! No pending mistakes in the garden.')}</b></div>` : `
        <div style="max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:8px">
          ${mistakes.map((m, idx) => `<div class="mistake-item-card">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <b>${idx+1}. ${typeof formatQuestionPrompt==='function'?formatQuestionPrompt(m.q):(typeof mathMarkup==='function'?mathMarkup(m.q):esc(m.q))}</b>
              <span class="acc-pill acc-high">${t('Đáp án:','Answer:')} <b>${esc(m.answer)}</b></span>
            </div>
            ${m.explanation ? `<div class="mistake-expl">${esc(m.explanation).replace(/\n/g,'<br>')}</div>` : ''}
          </div>`).join('')}
        </div>`}
      </div>

      <!-- Skill Mastery Tab -->
      <div id="tabMasteryPanel" style="display:none">
        ${Object.keys(mastery).length === 0 ? `<p class="muted" style="text-align:center;padding:20px 0">${t('Chưa đủ dữ liệu đánh giá kỹ năng. Cần ít nhất 5 câu mỗi dạng.','Not enough data to calculate skill mastery.')}</p>` : `
        <div style="max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:8px">
          ${Object.entries(mastery).map(([skillKey, arr]) => {
            const pct = Math.round((arr.reduce((a,b)=>a+b,0)/arr.length)*100);
            return `<div style="display:flex;justify-content:space-between;align-items:center;background:#f5f8f3;padding:8px 12px;border-radius:10px">
              <span><b>${esc(skillKey)}</b> (${arr.length} câu)</span>
              <strong style="color:${pct>=80?'#2b8a3e':pct>=60?'#d97706':'#e03131'}">${pct}%</strong>
            </div>`;
          }).join('')}
        </div>`}
      </div>
    </div>

    <div class="actions" style="margin-top:16px">
      <button class="primary" onclick="$('#modal').close()">${t('Đóng','Close')}</button>
    </div>
  </div>`);

  const detailResetBtn = $('#detailResetPinBtn');
  if (detailResetBtn) {
    detailResetBtn.onclick = () => {
      $('#modal').close();
      adminResetPinModal(username);
    };
  }

  $('#tabHistBtn').onclick = () => {
    $$('.admin-tab-btn').forEach(b => b.classList.toggle('active', b.id === 'tabHistBtn'));
    $('#tabHistoryPanel').style.display = 'block';
    $('#tabMistakesPanel').style.display = 'none';
    $('#tabMasteryPanel').style.display = 'none';
  };
  $('#tabMistakesBtn').onclick = () => {
    $$('.admin-tab-btn').forEach(b => b.classList.toggle('active', b.id === 'tabMistakesBtn'));
    $('#tabHistoryPanel').style.display = 'none';
    $('#tabMistakesPanel').style.display = 'block';
    $('#tabMasteryPanel').style.display = 'none';
  };
  $('#tabMasteryBtn').onclick = () => {
    $$('.admin-tab-btn').forEach(b => b.classList.toggle('active', b.id === 'tabMasteryBtn'));
    $('#tabHistoryPanel').style.display = 'none';
    $('#tabMistakesPanel').style.display = 'none';
    $('#tabMasteryPanel').style.display = 'block';
  };
}

function setAdminFilter({ query, grade, sortBy } = {}) {
  if (query !== undefined) adminSearchQuery = query;
  if (grade !== undefined) adminGradeFilter = grade;
  if (sortBy !== undefined) adminSortBy = sortBy;
}

function isCurrentUserAdmin() {
  const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
  return Boolean(u && (u.role === 'admin' || u.username === 'admin'));
}

const navBeforeAdminOnly = typeof nav === 'function' ? nav : null;
if (navBeforeAdminOnly) {
  nav = function (dest) {
    if (isCurrentUserAdmin() && dest !== 'admin') {
      renderAdmin();
      return;
    }
    navBeforeAdminOnly(dest);
  };
  if (typeof window !== 'undefined') window.nav = nav;
  if (typeof global !== 'undefined') global.nav = nav;
}

const homeBeforeAdminOnly = typeof home === 'function' ? home : null;
if (homeBeforeAdminOnly) {
  home = function () {
    if (isCurrentUserAdmin()) {
      renderAdmin();
      return;
    }
    homeBeforeAdminOnly();
  };
  if (typeof window !== 'undefined') window.home = home;
  if (typeof global !== 'undefined') global.home = home;
}

const setupBeforeAdminOnly = typeof setup === 'function' ? setup : null;
if (setupBeforeAdminOnly) {
  setup = function () {
    if (isCurrentUserAdmin()) {
      renderAdmin();
      return;
    }
    setupBeforeAdminOnly();
  };
  if (typeof window !== 'undefined') window.setup = setup;
  if (typeof global !== 'undefined') global.setup = setup;
}

if (typeof window !== 'undefined') {
  window.renderAdmin = renderAdmin;
  window.isCurrentUserAdmin = isCurrentUserAdmin;
  window.formatAdminTime = formatAdminTime;
  window.getFilteredStudents = getFilteredStudents;
  window.getStudentsSummary = getStudentsSummary;
  window.setAdminFilter = setAdminFilter;
  window.adminViewDetailModal = adminViewDetailModal;
  window.adminExportCSV = adminExportCSV;
}
if (typeof global !== 'undefined') {
  global.renderAdmin = renderAdmin;
  global.isCurrentUserAdmin = isCurrentUserAdmin;
  global.formatAdminTime = formatAdminTime;
  global.getFilteredStudents = getFilteredStudents;
  global.getStudentsSummary = getStudentsSummary;
  global.setAdminFilter = setAdminFilter;
  global.adminViewDetailModal = adminViewDetailModal;
  global.adminExportCSV = adminExportCSV;
}
