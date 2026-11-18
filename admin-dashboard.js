'use strict';
// Comprehensive Admin Center: 7-Day Activity Analytics, Learning Tiers, 1-Click Remedial,
// Quick Classroom Hub, Student Editor, Batch Grade Promotion, and Full System Backup/Restore.
(() => {
  function localDateKey(d = new Date()) {
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  }

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

    const [rawType, rawOp] = weakestSkill.split(':');
    const type = ['natural', 'fraction', 'decimal', 'negative', 'remainder'].includes(rawType) ? rawType : 'natural';
    const op = ['+', '-', '*', '/'].includes(rawOp) ? rawOp : '+';
    const questionStyle = rawOp === 'missing' ? 'missing' : rawOp === 'word' ? 'word' : 'normal';

    if (typeof loadLocalClassStore !== 'function' || typeof createAssignment !== 'function') {
      throw Error('Classroom module unavailable');
    }

    let store = loadLocalClassStore();
    const enrolled = store.enrollments.find(e => e.student_id === username);
    let room = enrolled ? store.classrooms.find(c => c.id === enrolled.classroom_id) : store.classrooms[0];

    if (!room && typeof createClassroom === 'function') {
      room = await createClassroom(`Lớp ${user.grade || 1} - Phụ đạo`, user.grade || 1);
      store = loadLocalClassStore();
    }
    if (room && !store.enrollments.some(e => e.classroom_id === room.id && e.student_id === username)) {
      store.enrollments.push({ classroom_id: room.id, student_id: username, joined_at: new Date().toISOString() });
      if (typeof saveLocalClassStore === 'function') saveLocalClassStore(store);
    }

    const skillText = typeof skillName === 'function' ? skillName(weakestSkill) : weakestSkill;
    const due = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10);
    const asg = await createAssignment(
      room.id,
      t(`Phụ đạo (${user.name}): ${skillText}`, `Remedial (${user.name}): ${skillText}`),
      due,
      {
        ...(typeof defaults !== 'undefined' ? defaults : {}),
        grade: user.grade || 1,
        type,
        types: [type],
        ops: [op],
        questionStyle,
        digits: (user.grade || 1) >= 4 ? [1, 2] : [1],
        count: 10,
        seconds: 25,
        targetStudent: username
      }
    );
    return { assignment: asg, room, weakestSkill };
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
    const classrooms = typeof loadLocalClassStore === 'function' ? loadLocalClassStore() : null;
    return {
      format: 'numiquick-system-v1',
      exportedAt: new Date().toISOString(),
      users,
      states,
      classrooms
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
    if (payload.classrooms && typeof payload.classrooms === 'object' && typeof saveLocalClassStore === 'function') {
      saveLocalClassStore(payload.classrooms);
    }
    return true;
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
      renderAdmin();
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
      if (!parent || !uname || uname === 'admin' || parent.querySelector('[data-action="edit-student"]')) return;
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'admin-act-btn btn-edit';
      editBtn.dataset.action = 'edit-student';
      editBtn.dataset.user = uname;
      editBtn.textContent = `✏️ ${t('Sửa', 'Edit')}`;
      editBtn.onclick = () => editStudentProfileModal(uname);
      pinBtn.before(editBtn);
    });
  }

  const renderAdminBeforeDash = typeof renderAdmin === 'function' ? renderAdmin : null;
  if (renderAdminBeforeDash) {
    renderAdmin = async function () {
      renderAdminBeforeDash();
      const adminView = $('.admin-view');
      const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
      const isAdmin = Boolean(u && (u.role === 'admin' || u.username === 'admin'));
      if (!adminView || !isAdmin) return;

      // 1. Add Batch Promote, System Backup & Restore buttons
      const topActions = $('.admin-top-actions');
      if (topActions && !$('#adminBatchPromoteBtn')) {
        topActions.insertAdjacentHTML('beforeend', `
          <button type="button" class="admin-btn" id="adminBatchPromoteBtn">⬆️ ${t('Chuyển khối', 'Promote')}</button>
          <button type="button" class="admin-btn" id="adminSysBackupBtn">💾 ${t('Sao lưu HT', 'Backup All')}</button>
          <button type="button" class="admin-btn" id="adminSysRestoreBtn">📂 ${t('Khôi phục HT', 'Restore All')}</button>
          <input type="file" id="adminSysRestoreInput" accept="application/json" hidden style="display:none">
        `);
        $('#adminBatchPromoteBtn').onclick = openBatchPromoteModal;
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

      // 2. Compute analytics & render 2-column Insights + Quick Class Hub
      const allStudents = typeof getStudentsSummary === 'function'
        ? getStudentsSummary().filter(s => s.role !== 'admin' && s.username !== 'admin')
        : [];
      const analytics = computeAdminAnalytics(allStudents);
      const totalTier = Math.max(1, analytics.tiers.excellent + analytics.tiers.good + analytics.tiers.average + analytics.tiers.needsWork);

      let classData = { classrooms: [], enrollments: [], assignments: [], submissions: [] };
      if (typeof fetchTeacherOverview === 'function') {
        try { classData = await fetchTeacherOverview(); } catch {}
      }
      if (!adminView.isConnected || view !== 'admin') return;

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
                <small class="muted">${t('Giao bài ôn đúng kỹ năng còn yếu chỉ với 1 bấm', '1-click remedial assignment on weakest skill')}</small>
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

          <div id="adminQuickClassCard" class="card adm-panel adm-class-hub">
            <div class="adm-panel-head" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
              <div>
                <h3>🏫 ${t('Điều phối Lớp học & Bài tập Tuần', 'Classrooms & Weekly Assignments')} (${classData.classrooms.length})</h3>
                <small class="muted">${t('Quản lý nhanh mã lớp, nhập danh sách và tỉ lệ nộp bài của từng lớp', 'Quick overview of join codes and submission rates')}</small>
              </div>
              <button type="button" class="primary" onclick="nav('classroom')">${t('Mở trang Lớp học đầy đủ', 'Open Full Classroom Manager')} →</button>
            </div>
            ${classData.classrooms.length === 0
              ? `<p class="muted">${t('Chưa có lớp học nào.', 'No classrooms yet.')}</p>`
              : `<div class="adm-mini-rooms">${classData.classrooms.slice(0, 4).map(room => {
                  const sCount = (classData.enrollments || []).filter(e => e.classroom_id === room.id).length;
                  const rAsgs = classData.assignments.filter(a => a.classroom_id === room.id);
                  const rSubCount = rAsgs.reduce((sum, a) => sum + classData.submissions.filter(s => s.assignment_id === a.id).length, 0);
                  return `<div class="adm-mini-room">
                    <div>
                      <b>${esc(room.name)}</b>
                      <small>${t('Mã:', 'Code:')} <code>${esc(room.join_code)}</code> · ${sCount} ${t('HS', 'students')} · ${rAsgs.length} ${t('bài', 'tasks')} · ${rSubCount} ${t('lượt nộp', 'subs')}</small>
                    </div>
                    <button type="button" class="ghost" onclick="nav('classroom')">${t('Chi tiết', 'Manage')} →</button>
                  </div>`;
                }).join('')}</div>`}
          </div>
        `;
        headerCard.insertAdjacentHTML('afterend', insightsHtml);

        $$('[data-remedial-user]').forEach(btn => {
          btn.onclick = async () => {
            try {
              const res = await assignRemedialForStudent(btn.dataset.remedialUser);
              toast(t(`Đã giao bài phụ đạo vào ${res.room.name}!`, `Assigned remedial lesson to ${res.room.name}!`));
              renderAdmin();
            } catch (err) {
              toast(err.message);
            }
          };
        });
      }

      // 3. Inject Edit buttons & keep synced after search filtering
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
    .adm-risk-list,.adm-mini-rooms{display:grid;gap:8px}
    .adm-risk-row,.adm-mini-room{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 12px;border-radius:12px;background:#f7faf7;border:1px solid #e4efe4}
    .adm-risk-row b,.adm-mini-room b{display:block;font-size:13.5px}
    .adm-risk-row small,.adm-mini-room small{color:#5f7466;font-size:12px}
    .adm-remedial-btn{padding:6px 11px;border-radius:10px;border:0;background:#f08c00;color:#fff;font-weight:800;font-size:12px;cursor:pointer;white-space:nowrap}
    .adm-class-hub{margin-bottom:14px}
    .btn-edit{background:#edf2ff;color:#364fc7}
    @media(max-width:860px){.adm-insights-grid{grid-template-columns:1fr}}
    body.dark-mode .adm-risk-row,body.dark-mode .adm-mini-room{background:#1c2620;border-color:#2f4036}
    body.dark-mode .adm-tier-legend{color:#a8bfb0}
  `;
  document.head.append(style);

  if (typeof window !== 'undefined') {
    window.computeAdminAnalytics = computeAdminAnalytics;
    window.updateStudentByAdmin = updateStudentByAdmin;
    window.batchPromoteGrade = batchPromoteGrade;
    window.assignRemedialForStudent = assignRemedialForStudent;
    window.buildFullSystemBackup = buildFullSystemBackup;
    window.restoreFullSystemBackup = restoreFullSystemBackup;
    window.editStudentProfileModal = editStudentProfileModal;
  }
  if (typeof global !== 'undefined') {
    global.computeAdminAnalytics = computeAdminAnalytics;
    global.updateStudentByAdmin = updateStudentByAdmin;
    global.batchPromoteGrade = batchPromoteGrade;
    global.assignRemedialForStudent = assignRemedialForStudent;
    global.buildFullSystemBackup = buildFullSystemBackup;
    global.restoreFullSystemBackup = restoreFullSystemBackup;
    global.editStudentProfileModal = editStudentProfileModal;
  }

  if (typeof view !== 'undefined' && view === 'admin') renderAdmin();
})();
