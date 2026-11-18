'use strict';
// Classroom & Weekly Assignments (Cloud-first with Supabase RLS + Local Storage fallback)
(() => {
  const CLASSROOM_LOCAL_KEY = 'numi-classrooms-v1';
  const CLASSROOM_SEED_FLAG = 'numi-sample-classroom-seeded-v1';
  let activeAssignmentId = null;

  function isCloudReadyForClassroom() {
    return typeof cloudConfigured === 'function' && cloudConfigured() &&
      typeof cloudSession !== 'undefined' && cloudSession && cloudSession.user?.id &&
      typeof cloudRequest === 'function';
  }

  function loadLocalClassStore() {
    try {
      const raw = JSON.parse(localStorage.getItem(CLASSROOM_LOCAL_KEY) || '{}') || {};
      return {
        classrooms: Array.isArray(raw.classrooms) ? raw.classrooms : [],
        enrollments: Array.isArray(raw.enrollments) ? raw.enrollments : [],
        assignments: Array.isArray(raw.assignments) ? raw.assignments : [],
        submissions: Array.isArray(raw.submissions) ? raw.submissions : []
      };
    } catch {
      return { classrooms: [], enrollments: [], assignments: [], submissions: [] };
    }
  }

  function saveLocalClassStore(store) {
    try { localStorage.setItem(CLASSROOM_LOCAL_KEY, JSON.stringify(store)); } catch {}
  }

  function seedSampleClassroomIfNeeded() {
    if (isCloudReadyForClassroom()) return;
    try {
      if (localStorage.getItem(CLASSROOM_SEED_FLAG)) return;
      const rawUsers = JSON.parse(localStorage.getItem('numi-local-users-v1') || '{}') || {};
      if (!rawUsers['minhkhoi']) return;
      const store = loadLocalClassStore();
      if (store.classrooms.length > 0) {
        localStorage.setItem(CLASSROOM_SEED_FLAG, '1');
        return;
      }

      const roomId = 'room_sample_4a';
      const asg1 = 'asg_sample_w1';
      const asg2 = 'asg_sample_w2';
      const now = Date.now();
      const due = new Date(now + 86400000 * 5).toISOString().slice(0, 10);

      store.classrooms.push({
        id: roomId,
        teacher_id: 'admin',
        name: 'Lớp 4A - Toán Tư Duy',
        grade: 4,
        join_code: 'LP4A26',
        created_at: new Date(now - 86400000 * 3).toISOString()
      });

      for (const sid of ['minhkhoi', 'baoan', 'haidang']) {
        if (rawUsers[sid]) {
          store.enrollments.push({
            classroom_id: roomId,
            student_id: sid,
            joined_at: new Date(now - 86400000 * 2).toISOString()
          });
        }
      }

      store.assignments.push(
        {
          id: asg1,
          classroom_id: roomId,
          title: 'Tuần 1: Cộng trừ nhanh 2 chữ số',
          due_date: due,
          config: { type: 'natural', types: ['natural'], ops: ['+', '-'], digits: [1, 2], questionStyle: 'normal', count: 10, seconds: 20, grade: 4 },
          created_at: new Date(now - 86400000 * 2).toISOString()
        },
        {
          id: asg2,
          classroom_id: roomId,
          title: 'Tuần 2: Tìm số còn thiếu (?)',
          due_date: due,
          config: { type: 'natural', types: ['natural'], ops: ['+', '-', '*'], digits: [1, 2], questionStyle: 'missing', count: 10, seconds: 25, grade: 4 },
          created_at: new Date(now - 86400000).toISOString()
        }
      );

      store.submissions.push(
        {
          id: 'sub_sample_1',
          assignment_id: asg1,
          student_id: 'minhkhoi',
          correct: 9,
          total: 10,
          avg_time: 4.8,
          completed_at: new Date(now - 3600000 * 5).toISOString()
        },
        {
          id: 'sub_sample_2',
          assignment_id: asg1,
          student_id: 'haidang',
          correct: 10,
          total: 10,
          avg_time: 3.9,
          completed_at: new Date(now - 3600000 * 3).toISOString()
        }
      );

      saveLocalClassStore(store);
      localStorage.setItem(CLASSROOM_SEED_FLAG, '1');
    } catch {}
  }

  function generateJoinCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  function newId(prefix = 'cls') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  }

  async function createClassroom(name, grade = 1) {
    const cleanName = String(name || '').trim().slice(0, 80);
    if (!cleanName) throw Error(t('Vui lòng nhập tên lớp học.', 'Please enter a classroom name.'));
    const g = Math.max(1, Math.min(9, Number(grade) || 1));
    const code = generateJoinCode();

    if (isCloudReadyForClassroom()) {
      await cloudRefresh();
      const rows = await cloudRequest('/rest/v1/numi_classrooms', 'POST', {
        teacher_id: cloudSession.user.id,
        name: cleanName,
        grade: g,
        join_code: code
      }, true, { Prefer: 'return=representation' });
      return rows?.[0] || null;
    }

    const store = loadLocalClassStore();
    const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
    const room = {
      id: newId('room'),
      teacher_id: u?.username || 'admin',
      name: cleanName,
      grade: g,
      join_code: code,
      created_at: new Date().toISOString()
    };
    store.classrooms.push(room);
    saveLocalClassStore(store);
    return room;
  }

  async function joinClassroomByCode(code) {
    const cleanCode = String(code || '').trim().toUpperCase();
    if (cleanCode.length !== 6) throw Error(t('Mã lớp cần đúng 6 ký tự.', 'Classroom code must be 6 characters.'));

    if (isCloudReadyForClassroom()) {
      await cloudRefresh();
      const classroomId = await cloudRequest('/rest/v1/rpc/join_classroom_by_code', 'POST', { p_code: cleanCode });
      return classroomId;
    }

    const store = loadLocalClassStore();
    const room = store.classrooms.find(c => String(c.join_code).toUpperCase() === cleanCode);
    if (!room) throw Error(t('Không tìm thấy lớp học với mã này.', 'Classroom code not found.'));
    const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
    const sid = u?.username || 'guest';
    if (!store.enrollments.some(e => e.classroom_id === room.id && e.student_id === sid)) {
      store.enrollments.push({ classroom_id: room.id, student_id: sid, joined_at: new Date().toISOString() });
      saveLocalClassStore(store);
    }
    return room.id;
  }

  async function createAssignment(classroomId, title, dueDate, assignConfig) {
    const cleanTitle = String(title || '').trim().slice(0, 120);
    if (!cleanTitle) throw Error(t('Vui lòng nhập tiêu đề bài tập.', 'Please enter an assignment title.'));
    const cfg = { ...(assignConfig || config || defaults) };

    if (isCloudReadyForClassroom()) {
      await cloudRefresh();
      const rows = await cloudRequest('/rest/v1/numi_assignments', 'POST', {
        classroom_id: classroomId,
        title: cleanTitle,
        due_date: dueDate || null,
        config: cfg
      }, true, { Prefer: 'return=representation' });
      return rows?.[0] || null;
    }

    const store = loadLocalClassStore();
    const item = {
      id: newId('asg'),
      classroom_id: classroomId,
      title: cleanTitle,
      due_date: dueDate || null,
      config: cfg,
      created_at: new Date().toISOString()
    };
    store.assignments.push(item);
    saveLocalClassStore(store);
    return item;
  }

  async function deleteAssignment(assignmentId) {
    if (!assignmentId) return false;
    if (isCloudReadyForClassroom()) {
      await cloudRefresh();
      await cloudRequest(`/rest/v1/numi_assignments?id=eq.${encodeURIComponent(assignmentId)}`, 'DELETE');
      return true;
    }

    const store = loadLocalClassStore();
    const before = store.assignments.length;
    store.assignments = store.assignments.filter(a => a.id !== assignmentId);
    store.submissions = store.submissions.filter(s => s.assignment_id !== assignmentId);
    saveLocalClassStore(store);
    return store.assignments.length < before;
  }

  async function submitAssignmentResult(assignmentId, correct, total, avgTime, extraMeta = {}) {
    if (!assignmentId || !(total > 0)) return null;
    const payload = {
      assignment_id: assignmentId,
      correct: Math.max(0, Number(correct) || 0),
      total: Math.max(1, Number(total) || 1),
      avg_time: Number(avgTime) || 0,
      completed_at: new Date().toISOString()
    };

    if (isCloudReadyForClassroom()) {
      await cloudRefresh();
      const rows = await cloudRequest('/rest/v1/numi_submissions?on_conflict=assignment_id,student_id', 'POST', {
        ...payload,
        student_id: cloudSession.user.id
      }, true, { Prefer: 'resolution=merge-duplicates,return=representation' });
      return rows?.[0] || null;
    }

    const store = loadLocalClassStore();
    const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
    const sid = u?.username || 'guest';
    const existingIdx = store.submissions.findIndex(s => s.assignment_id === assignmentId && s.student_id === sid);
    const row = {
      id: existingIdx >= 0 ? store.submissions[existingIdx].id : newId('sub'),
      student_id: sid,
      ...payload,
      ...(extraMeta && typeof extraMeta === 'object' ? extraMeta : {})
    };
    if (existingIdx >= 0) store.submissions[existingIdx] = row;
    else store.submissions.push(row);
    saveLocalClassStore(store);
    return row;
  }

  async function fetchTeacherOverview() {
    seedSampleClassroomIfNeeded();
    if (isCloudReadyForClassroom()) {
      await cloudRefresh();
      const uid = encodeURIComponent(cloudSession.user.id);
      const classrooms = await cloudRequest(`/rest/v1/numi_classrooms?teacher_id=eq.${uid}&order=created_at.desc`);
      const cids = classrooms.map(c => c.id).join(',');
      const enrollments = classrooms.length
        ? await cloudRequest(`/rest/v1/numi_enrollments?classroom_id=in.(${cids})`)
        : [];
      const assignments = classrooms.length
        ? await cloudRequest(`/rest/v1/numi_assignments?classroom_id=in.(${cids})&order=created_at.desc`)
        : [];
      const submissions = assignments.length
        ? await cloudRequest(`/rest/v1/numi_submissions?assignment_id=in.(${assignments.map(a => a.id).join(',')})`)
        : [];
      return { classrooms, enrollments, assignments, submissions };
    }

    const store = loadLocalClassStore();
    return {
      classrooms: [...store.classrooms].reverse(),
      enrollments: store.enrollments,
      assignments: [...store.assignments].reverse(),
      submissions: store.submissions
    };
  }

  async function fetchStudentAssignments() {
    seedSampleClassroomIfNeeded();
    if (isCloudReadyForClassroom()) {
      await cloudRefresh();
      const uid = encodeURIComponent(cloudSession.user.id);
      const enrollments = await cloudRequest(`/rest/v1/numi_enrollments?student_id=eq.${uid}`);
      if (!enrollments.length) return { classrooms: [], assignments: [], submissions: [] };
      const cids = enrollments.map(e => e.classroom_id).join(',');
      const classrooms = await cloudRequest(`/rest/v1/numi_classrooms?id=in.(${cids})`);
      const assignments = await cloudRequest(`/rest/v1/numi_assignments?classroom_id=in.(${cids})&order=created_at.desc`);
      const submissions = await cloudRequest(`/rest/v1/numi_submissions?student_id=eq.${uid}`);
      return { classrooms, assignments, submissions };
    }

    const store = loadLocalClassStore();
    const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
    const sid = u?.username || 'guest';
    const myRoomIds = new Set(store.enrollments.filter(e => e.student_id === sid).map(e => e.classroom_id));
    const classrooms = store.classrooms.filter(c => myRoomIds.has(c.id));
    const assignments = store.assignments.filter(a => myRoomIds.has(a.classroom_id)).reverse();
    const submissions = store.submissions.filter(s => s.student_id === sid);
    return { classrooms, assignments, submissions };
  }

  function resolveStudentMeta(studentId) {
    const users = typeof getLocalUsers === 'function' ? getLocalUsers() : {};
    const u = users[studentId];
    return {
      name: u?.name || studentId,
      avatar: u?.avatar || 'bunny'
    };
  }

  function getClassroomLeaderboard(classroomId, storeOverride = null) {
    const store = storeOverride || loadLocalClassStore();
    const enrolled = (store.enrollments || []).filter(e => e.classroom_id === classroomId);
    const asgIds = new Set((store.assignments || []).filter(a => a.classroom_id === classroomId).map(a => a.id));
    const subs = (store.submissions || []).filter(s => asgIds.has(s.assignment_id));

    const statsByStudent = new Map();
    for (const e of enrolled) {
      statsByStudent.set(e.student_id, {
        student_id: e.student_id,
        ...resolveStudentMeta(e.student_id),
        completedCount: 0,
        totalCorrect: 0,
        totalQuestions: 0
      });
    }

    for (const s of subs) {
      const entry = statsByStudent.get(s.student_id) || {
        student_id: s.student_id,
        ...resolveStudentMeta(s.student_id),
        completedCount: 0,
        totalCorrect: 0,
        totalQuestions: 0
      };
      entry.completedCount++;
      entry.totalCorrect += Number(s.correct) || 0;
      entry.totalQuestions += Number(s.total) || 0;
      statsByStudent.set(s.student_id, entry);
    }

    return Array.from(statsByStudent.values())
      .map(item => ({
        ...item,
        accuracy: item.totalQuestions > 0 ? Math.round((item.totalCorrect / item.totalQuestions) * 100) : 0
      }))
      .sort((a, b) => (b.totalCorrect - a.totalCorrect) || (b.accuracy - a.accuracy) || a.name.localeCompare(b.name));
  }

  function assignmentIcon(asg) {
    const cfg = asg?.config || {};
    if (cfg.questionStyle === 'missing') return '🧩';
    if (cfg.questionStyle === 'word') return '📖';
    if (cfg.type === 'fraction') return '🍰';
    if (cfg.type === 'decimal') return '🎈';
    if (cfg.type === 'negative') return '❄️';
    return '🌟';
  }

  function openClassroomLeaderboardModal(classroomId, dataOverride = null) {
    const store = dataOverride || loadLocalClassStore();
    const room = (store.classrooms || []).find(c => c.id === classroomId);
    const board = getClassroomLeaderboard(classroomId, store);

    const top3 = [board[1], board[0], board[2]];
    const podiumRanks = [2, 1, 3];
    const podiumHtml = board.length >= 2 ? `<div class="cls-podium">${top3.map((row, idx) => {
      if (!row) return '<div class="cls-podium-slot is-empty"></div>';
      const rank = podiumRanks[idx];
      return `<div class="cls-podium-slot rank-${rank}">
        <div class="cls-podium-crown">${rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉'}</div>
        <div class="cls-podium-avatar">${typeof numiAnimalOriginal === 'function' ? numiAnimalOriginal(row.avatar) : (typeof animal === 'function' ? animal(row.avatar) : '🐰')}</div>
        <b>${esc(row.name)}</b>
        <span>${row.totalCorrect} ${t('đúng', 'pts')}</span>
      </div>`;
    }).join('')}</div>` : '';

    modal(`<h2>🏆 ${t('Bảng thi đua', 'Leaderboard')}${room ? ` · ${esc(room.name)}` : ''}</h2>
    <p class="muted">${t('Xếp hạng theo tổng số câu làm đúng và độ chính xác của các bài tập được giao.', 'Ranked by total correct answers and accuracy across assignments.')}</p>
    ${podiumHtml}
    ${board.length === 0
      ? `<p class="muted" style="text-align:center;padding:18px 0">${t('Chưa có học sinh nào trong lớp.', 'No students enrolled yet.')}</p>`
      : `<div class="cls-board-list">${board.map((row, idx) => `<div class="cls-board-row">
          <span class="cls-rank">${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
          <span class="cls-mini-avatar">${typeof numiAnimalOriginal === 'function' ? numiAnimalOriginal(row.avatar) : (typeof animal === 'function' ? animal(row.avatar) : '🐰')}</span>
          <div class="cls-board-user">
            <b>${esc(row.name)}</b>
            <small>${row.completedCount} ${t('bài đã nộp', 'completed')} · ${row.accuracy}%</small>
          </div>
          <strong class="cls-score">${row.totalCorrect} ${t('đúng', 'pts')}</strong>
        </div>`).join('')}</div>`}
    <div class="actions" style="margin-top:14px">
      <button type="button" class="primary" onclick="$('#modal').close()">${t('Đóng', 'Close')}</button>
    </div>`);
  }

  function openAssignmentSubmissionsModal(assignmentId, data) {
    const asg = data.assignments.find(a => a.id === assignmentId);
    if (!asg) return;
    const room = data.classrooms.find(c => c.id === asg.classroom_id);
    const enrolledIds = (data.enrollments || []).filter(e => e.classroom_id === asg.classroom_id).map(e => e.student_id);
    const subs = data.submissions.filter(s => s.assignment_id === assignmentId);
    const subByStudent = new Map(subs.map(s => [s.student_id, s]));
    const allStudentIds = Array.from(new Set([...enrolledIds, ...subs.map(s => s.student_id)]));

    modal(`<h2>📋 ${esc(asg.title)}</h2>
    <p class="muted">${room ? esc(room.name) + ' · ' : ''}${subs.length}/${allStudentIds.length} ${t('học sinh đã nộp bài', 'students submitted')}</p>
    ${allStudentIds.length === 0
      ? `<p class="muted" style="text-align:center;padding:18px 0">${t('Lớp chưa có học sinh tham gia.', 'No students in this classroom yet.')}</p>`
      : `<div class="cls-board-list">${allStudentIds.map(sid => {
          const meta = resolveStudentMeta(sid);
          const sub = subByStudent.get(sid);
          const pct = sub && sub.total > 0 ? Math.round((sub.correct / sub.total) * 100) : 0;
          return `<div class="cls-board-row">
            <div class="cls-board-user">
              <b>${esc(meta.name)}</b>
              <small>@${esc(sid)} ${sub ? `· ${sub.avg_time || 0}s/${t('câu', 'q')}` : ''}</small>
            </div>
            ${sub
              ? `<span class="acc-pill ${pct >= 80 ? 'acc-high' : pct >= 60 ? 'acc-med' : 'acc-low'}">${sub.correct}/${sub.total} (${pct}%)</span>`
              : `<span class="mistake-pill">${t('Chưa nộp', 'Pending')}</span>`}
          </div>`;
        }).join('')}</div>`}
    <div class="actions" style="margin-top:14px">
      <button type="button" class="primary" onclick="$('#modal').close()">${t('Đóng', 'Close')}</button>
    </div>`);
  }

  function startAssignedLesson(assignment) {
    if (!assignment?.config) return;
    activeAssignmentId = assignment.id;
    config = { ...defaults, ...assignment.config };
    if (typeof window !== 'undefined') window.config = config;
    if (typeof global !== 'undefined') global.config = config;
    startQuiz();
  }

  // Auto-submit assignment when finishing a practice session
  const finishBeforeClassroom = typeof finishPractice === 'function' ? finishPractice : null;
  if (finishBeforeClassroom) {
    finishPractice = function () {
      const s = session;
      finishBeforeClassroom();
      if (activeAssignmentId && s?.results?.length) {
        const correct = s.results.filter(x => x.correct).length;
        const total = s.results.length;
        const avgTime = Number((s.results.reduce((a, b) => a + b.elapsed, 0) / total).toFixed(1));
        const aid = activeAssignmentId;
        activeAssignmentId = null;
        if (typeof teaState === 'function') {
          const tea = teaState();
          tea.pearls = (tea.pearls || 0) + 2;
        }
        state.xp = (state.xp || 0) + 30;
        save();
        const wrongQuestions = (s.questions || [])
          .filter((q, idx) => s.results[idx] && !s.results[idx].correct)
          .map(q => ({ q: q.q, answer: q.answer }));
        const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
        const extraMeta = {
          focus_lost: Number(s.focusLostCount) || 0,
          wrong_questions: wrongQuestions
        };
        if (typeof autoStickerForScore === 'function') {
          extraMeta.sticker = autoStickerForScore(pct);
        }
        submitAssignmentResult(aid, correct, total, avgTime, extraMeta)
          .then(() => toast(t('🎉 Đã nộp bài tập! Thưởng +30 XP & +2 trân châu!', '🎉 Submitted! Earned +30 XP & +2 pearls!')))
          .catch(() => {});
      }
    };
  }

  // ---------------- Teacher Classroom Management View ----------------
  function invokeClassroomManager() {
    const fn = (typeof window !== 'undefined' && window.renderClassroomManager) ||
               (typeof global !== 'undefined' && global.renderClassroomManager) ||
               renderClassroomManager;
    return fn();
  }
  function invokeSubmissionsModal(asgId, data) {
    const fn = (typeof window !== 'undefined' && window.openAssignmentSubmissionsModal) ||
               (typeof global !== 'undefined' && global.openAssignmentSubmissionsModal) ||
               openAssignmentSubmissionsModal;
    return fn(asgId, data);
  }

  async function renderClassroomManager() {
    stop();
    view = 'classroom';
    document.body.dataset.view = 'classroom';
    $('#app').innerHTML = `<section class="narrow card"><p class="muted">${t('Đang tải dữ liệu lớp học...', 'Loading classrooms...')}</p></section>`;

    let data;
    try { data = await fetchTeacherOverview(); } catch { data = { classrooms: [], enrollments: [], assignments: [], submissions: [] }; }

    $('#app').innerHTML = `<section class="admin-view classroom-view">
      <div class="card admin-header-card">
        <div class="admin-title-row">
          <div>
            <span class="eyebrow">NUMIQUICK · ${t('LỚP HỌC & GIAO BÀI', 'CLASSROOMS & ASSIGNMENTS')}</span>
            <h1 class="admin-main-title">${t('Quản lý Lớp học & Bài tập Tuần', 'Classrooms & Weekly Assignments')}</h1>
            <p class="muted">${isCloudReadyForClassroom() ? t('Đang đồng bộ trực tuyến qua Supabase RLS.', 'Synced online via Supabase RLS.') : t('Đang lưu cục bộ trên máy này (cấu hình Supabase để đồng bộ nhiều thiết bị).', 'Saved locally (configure Supabase for multi-device sync).')}</p>
          </div>
          <div class="admin-top-actions">
            <button type="button" class="primary admin-btn" id="btnNewClassroom">+ ${t('Tạo lớp học', 'New Classroom')}</button>
            <button type="button" class="admin-btn" onclick="nav('admin')">← ${t('Quản trị HS', 'Admin')}</button>
          </div>
        </div>
      </div>

      ${data.classrooms.length === 0 ? `<div class="card"><p class="muted">${t('Chưa có lớp học nào. Bấm “+ Tạo lớp học” để lấy mã lớp cho học sinh tham gia.', 'No classrooms yet. Click “+ New Classroom” to create a join code.')}</p></div>` : ''}

      <div class="classroom-grid">
        ${data.classrooms.map(room => {
          const roomAsgs = data.assignments.filter(a => a.classroom_id === room.id);
          const studentCount = (data.enrollments || []).filter(e => e.classroom_id === room.id).length;
          return `<div class="card classroom-card">
            <div class="classroom-card-head">
              <div>
                <h3>${esc(room.name)}</h3>
                <small class="muted">${t('Khối lớp', 'Grade')} ${room.grade} · ${studentCount} ${t('học sinh', 'students')} · ${t('Mã lớp:', 'Code:')} <code class="join-code-pill">${esc(room.join_code)}</code> <button type="button" class="ghost cls-mini-btn" data-copy-code="${esc(room.join_code)}">📋 ${t('Sao chép', 'Copy')}</button></small>
              </div>
              <div class="cls-head-actions">
                <button type="button" class="ghost" data-room-board="${esc(room.id)}">🏆 ${t('Thi đua', 'Rank')}</button>
                <button type="button" class="primary" data-assign-room="${esc(room.id)}" data-assign-grade="${room.grade}">+ ${t('Giao bài', 'Assign')}</button>
              </div>
            </div>
            <div class="assignment-list">
              ${roomAsgs.length === 0 ? `<p class="muted">${t('Chưa giao bài tập nào cho lớp này.', 'No assignments yet.')}</p>` : roomAsgs.map(a => {
                const subs = data.submissions.filter(s => s.assignment_id === a.id);
                return `<div class="assignment-row">
                  <div>
                    <b>${esc(a.title)}</b>
                    <small>${a.due_date ? t('Hạn nộp: ', 'Due: ') + esc(a.due_date) + ' · ' : ''}${a.config?.count || 10} ${t('câu', 'qs')} · ${subs.length}/${Math.max(studentCount, subs.length)} ${t('đã nộp', 'submitted')}</small>
                  </div>
                  <div class="cls-row-actions">
                    ${subs.length ? `<span class="acc-pill acc-high">${Math.round(subs.reduce((acc, s) => acc + (s.correct / s.total) * 100, 0) / subs.length)}% TB</span>` : ''}
                    <button type="button" class="ghost cls-mini-btn" data-view-subs="${esc(a.id)}">${t('Chi tiết', 'Details')}</button>
                    <button type="button" class="ghost cls-mini-btn cls-del-btn" data-del-asg="${esc(a.id)}">${t('Xóa', 'Del')}</button>
                  </div>
                </div>`;
              }).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>
    </section>`;

    $('#btnNewClassroom').onclick = () => {
      modal(`<h2>${t('Tạo lớp học mới', 'Create New Classroom')}</h2>
      <form id="newClassForm" style="display:grid;gap:12px;margin-top:12px">
        <label>${t('Tên lớp học (VD: Lớp 4A - Cô Thảo)', 'Classroom name')}
          <input name="name" maxlength="80" required placeholder="${t('Nhập tên lớp', 'Enter name')}">
        </label>
        <label>${t('Khối lớp', 'Grade')}
          <select name="grade">${[1,2,3,4,5,6,7,8,9].map(g => `<option value="${g}">${t('Lớp', 'Grade')} ${g}</option>`).join('')}</select>
        </label>
        <div class="actions">
          <button type="submit" class="primary">${t('Tạo lớp & Lấy mã', 'Create Classroom')}</button>
          <button type="button" onclick="$('#modal').close()">${t('Hủy', 'Cancel')}</button>
        </div>
      </form>`);
      $('#newClassForm').onsubmit = async e => {
        e.preventDefault();
        const f = new FormData(e.target);
        try {
          const room = await createClassroom(f.get('name'), f.get('grade'));
          $('#modal').close();
          toast(t(`Đã tạo lớp! Mã tham gia: ${room.join_code}`, `Created! Join code: ${room.join_code}`));
          invokeClassroomManager();
        } catch (err) {
          toast(err.message);
        }
      };
    };

    $$('[data-copy-code]').forEach(btn => {
      btn.onclick = () => {
        const code = btn.dataset.copyCode;
        navigator.clipboard?.writeText(code)
          .then(() => toast(t('Đã sao chép mã lớp: ' + code, 'Copied join code: ' + code)))
          .catch(() => toast(t('Mã lớp: ' + code, 'Join code: ' + code)));
      };
    });

    $$('[data-room-board]').forEach(btn => {
      btn.onclick = () => openClassroomLeaderboardModal(btn.dataset.roomBoard, data);
    });

    $$('[data-view-subs]').forEach(btn => {
      btn.onclick = () => invokeSubmissionsModal(btn.dataset.viewSubs, data);
    });

    $$('[data-del-asg]').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm(t('Xóa bài tập này khỏi lớp?', 'Delete this assignment?'))) return;
        await deleteAssignment(btn.dataset.delAsg);
        toast(t('Đã xóa bài tập.', 'Assignment deleted.'));
        invokeClassroomManager();
      };
    });

    $$('[data-assign-room]').forEach(btn => {
      btn.onclick = () => {
        const roomId = btn.dataset.assignRoom;
        const g = Number(btn.dataset.assignGrade) || 1;
        modal(`<h2>${t('Giao bài tập mới', 'New Assignment')}</h2>
        <form id="newAssignForm" style="display:grid;gap:10px;margin-top:12px">
          <label>${t('Tiêu đề bài tập / Tuần học', 'Assignment title')}
            <input name="title" maxlength="120" required placeholder="${t('VD: Tuần 12 - Phép nhân 2 chữ số', 'e.g. Week 12 - Multiplication')}">
          </label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label>${t('Hạn nộp', 'Due date')}
              <input name="dueDate" type="date">
            </label>
            <label>${t('Loại số', 'Number type')}
              <select name="type">
                <option value="natural">${t('Số tự nhiên', 'Whole numbers')}</option>
                <option value="fraction">${t('Phân số', 'Fractions')}</option>
                <option value="decimal">${t('Số thập phân', 'Decimals')}</option>
                <option value="negative">${t('Số nguyên âm', 'Negative integers')}</option>
              </select>
            </label>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label>${t('Dạng bài', 'Style')}
              <select name="questionStyle">
                <option value="normal">${t('Tính nhẩm chuẩn', 'Standard')}</option>
                <option value="convenient">${t('Tính thuận tiện', 'Regrouping')}</option>
                <option value="expression">${t('Biểu thức nhiều phép', 'Expressions')}</option>
                <option value="missing">${t('Tìm số còn thiếu (?)', 'Missing number (?)')}</option>
                <option value="word">${t('Toán đố ngắn', 'Short word problems')}</option>
              </select>
            </label>
            <label>${t('Số câu & Thời gian', 'Count & Seconds')}
              <select name="count">
                <option value="10">10 ${t('câu', 'qs')} (20s)</option>
                <option value="15">15 ${t('câu', 'qs')} (20s)</option>
                <option value="20">20 ${t('câu', 'qs')} (25s)</option>
              </select>
            </label>
          </div>
          <div>
            <small class="muted">${t('Phép tính áp dụng:', 'Operations:')}</small>
            <div style="display:flex;gap:12px;margin-top:4px">
              ${[['+','+'],['-','−'],['*','×'],['/','÷']].map(([v,lbl])=>`<label style="display:inline-flex;align-items:center;gap:4px"><input type="checkbox" name="ops" value="${v}" checked> ${lbl}</label>`).join('')}
            </div>
          </div>
          <div class="actions">
            <button type="submit" class="primary">${t('Giao bài ngay', 'Assign Now')}</button>
            <button type="button" onclick="$('#modal').close()">${t('Hủy', 'Cancel')}</button>
          </div>
        </form>`);
        $('#newAssignForm').onsubmit = async e => {
          e.preventDefault();
          const f = new FormData(e.target);
          const type = String(f.get('type') || 'natural');
          const ops = f.getAll('ops');
          const count = Number(f.get('count')) || 10;
          try {
            await createAssignment(roomId, f.get('title'), f.get('dueDate'), {
              ...defaults,
              grade: g,
              type,
              types: [type],
              ops: ops.length ? ops : ['+', '-'],
              questionStyle: String(f.get('questionStyle') || 'normal'),
              digits: g >= 4 ? [1, 2] : [1],
              count,
              seconds: count >= 20 ? 25 : 20
            });
            $('#modal').close();
            toast(t('Đã giao bài tập cho cả lớp!', 'Assignment posted to classroom!'));
            invokeClassroomManager();
          } catch (err) {
            toast(err.message);
          }
        };
      };
    });
  }

  // Hook into admin screen and home screen
  const navBeforeClassroom = typeof nav === 'function' ? nav : null;
  if (navBeforeClassroom) {
    nav = function (dest) {
      if (dest === 'classroom') {
        invokeClassroomManager();
        return;
      }
      navBeforeClassroom(dest);
    };
  }

  const adminBeforeClassroom = typeof renderAdmin === 'function' ? renderAdmin : null;
  if (adminBeforeClassroom) {
    renderAdmin = function () {
      adminBeforeClassroom();
      const topActions = $('.admin-top-actions');
      if (topActions && !$('#adminClassroomBtn')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'adminClassroomBtn';
        btn.className = 'admin-btn';
        btn.textContent = t('Lớp học & Giao bài', 'Classrooms');
        btn.onclick = invokeClassroomManager;
        topActions.prepend(btn);
      }
    };
  }

  async function injectStudentClassroomBox() {
    if (view !== 'home') return;
    const host = $('.home-v2') || $('.simple-home');
    if (!host || host.querySelector('.student-classroom-box')) return;

    seedSampleClassroomIfNeeded();

    const box = document.createElement('section');
    box.className = 'student-classroom-box cls-cute-card';
    const anchor = host.querySelector('.home-v2-links') || host.querySelector('.home-v2-local');
    if (anchor) anchor.before(box);
    else host.append(box);

    const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
    const isAdmin = u && (u.role === 'admin' || u.username === 'admin');
    const mascotSvg = typeof animal === 'function' ? animal(u?.avatar || 'bunny', 'cls-mascot-svg') : '🐰';

    if (isAdmin) {
      let tData;
      try { tData = await fetchTeacherOverview(); } catch { tData = { classrooms: [], enrollments: [], assignments: [], submissions: [] }; }
      if (!box.isConnected || view !== 'home') return;
      box.innerHTML = `
        <div class="cls-cute-hero">
          <div class="cls-mascot-badge">${mascotSvg}</div>
          <div class="cls-hero-copy">
            <span class="cls-cute-pill">${t('GÓC GIÁO VIÊN', 'TEACHER HUB')}</span>
            <b>🏫 ${t('Quản lý Lớp học & Giao bài', 'Classroom & Assignment Hub')}</b>
            <small>${t('Tạo lớp, lấy mã mời và theo dõi bài làm của các bé thật dễ dàng!', 'Create classrooms, share join codes, and track progress!')}</small>
          </div>
          <button type="button" id="openTeacherClassBtn" class="cls-3d-btn">✨ ${t('Quản lý lớp', 'Manage')} →</button>
        </div>
        <div class="cls-teacher-stats">
          <div class="cls-tstat is-mint"><span>🏫 ${t('Lớp học', 'Classrooms')}</span><b>${tData.classrooms.length}</b></div>
          <div class="cls-tstat is-butter"><span>📝 ${t('Bài đã giao', 'Assignments')}</span><b>${tData.assignments.length}</b></div>
          <div class="cls-tstat is-pink"><span>🎉 ${t('Lượt nộp', 'Submissions')}</span><b>${tData.submissions.length}</b></div>
        </div>
      `;
      $('#openTeacherClassBtn').onclick = invokeClassroomManager;
      return;
    }

    let data;
    try { data = await fetchStudentAssignments(); } catch { data = { classrooms: [], assignments: [], submissions: [] }; }
    if (!box.isConnected || view !== 'home') return;

    const subByAsg = new Map(data.submissions.map(s => [s.assignment_id, s]));
    const pending = data.assignments.filter(a => !subByAsg.has(a.id));
    const completed = data.assignments.filter(a => subByAsg.has(a.id));
    const primaryRoom = data.classrooms[0];
    const totalAsgs = data.assignments.length;
    const progressPct = totalAsgs > 0 ? Math.round((completed.length / totalAsgs) * 100) : 0;

    box.innerHTML = `
      <div class="cls-cute-hero">
        <div class="cls-mascot-badge">${mascotSvg}</div>
        <div class="cls-hero-copy">
          ${data.classrooms.length ? `<span class="cls-cute-pill">🏫 ${data.classrooms.map(c => esc(c.name)).join(', ')}</span>` : ''}
          <b>${t('Nhiệm vụ Lớp học của em', 'My Classroom Quests')}</b>
          <small>${data.classrooms.length
            ? (pending.length ? t(`Cố lên! Còn ${pending.length} bài tập nhỏ đang chờ em chinh phục!`, `You’ve got ${pending.length} fun missions waiting!`) : t('Tuyệt vời! Em đã làm xong hết bài của lớp rồi!', 'Yay! You finished every class quest!'))
            : t('Nhập mã 6 ký tự từ cô giáo hoặc ba mẹ để mở khóa bài tập nhé!', 'Enter a 6-letter code from your teacher or parent!')}</small>
        </div>
        <div class="cls-head-actions">
          ${primaryRoom ? `<button type="button" id="studentClassRankBtn" class="cls-soft-btn">🏆 ${t('Thi đua', 'Rank')}</button>` : ''}
          <button type="button" id="joinClassBtn" class="cls-soft-btn">🔑 ${t('Nhập mã lớp', 'Join Code')}</button>
        </div>
      </div>
      ${totalAsgs > 0 ? `<div class="cls-star-bar"><span>⭐ ${t('Tiến độ:', 'Progress:')} ${completed.length}/${totalAsgs} ${t('bài', 'done')}</span><div class="cls-star-track"><i style="width:${progressPct}%"></i></div></div>` : ''}
      ${pending.length ? `<div class="student-asg-list">${pending.slice(0, 3).map(a => `<div class="cls-cute-task">
        <div class="cls-task-icon">${assignmentIcon(a)}</div>
        <div class="cls-task-info">
          <b>${esc(a.title)}</b>
          <small>${a.config?.count || 10} ${t('câu', 'qs')}${a.due_date ? ' · ⏰ ' + esc(a.due_date) : ''} · <span class="cls-reward-tag">🎁 +30 XP · +2 🧋</span></small>
        </div>
        <button type="button" class="cls-3d-btn" data-start-asg="${esc(a.id)}">🚀 ${t('Làm ngay!', 'Play!')}</button>
      </div>`).join('')}</div>` : ''}
      ${completed.length ? `<details class="cls-completed-wrap"><summary>🌟 ${t('Bài đã hoàn thành', 'Completed quests')} (${completed.length})</summary><div class="student-asg-list" style="margin-top:8px">${completed.slice(0, 3).map(a => {
        const sub = subByAsg.get(a.id);
        return `<div class="cls-cute-task is-done">
          <div class="cls-task-icon">🏅</div>
          <div class="cls-task-info"><b>${esc(a.title)}</b><small>${t('Điểm:', 'Score:')} ${sub.correct}/${sub.total} · ${sub.avg_time || 0}s/${t('câu', 'q')}</small></div>
          <button type="button" class="cls-soft-btn cls-mini-btn" data-redo-asg="${esc(a.id)}">${t('Làm lại', 'Retry')}</button>
        </div>`;
      }).join('')}</div></details>` : ''}
    `;

    if (primaryRoom && $('#studentClassRankBtn')) {
      $('#studentClassRankBtn').onclick = () => openClassroomLeaderboardModal(primaryRoom.id);
    }

    $('#joinClassBtn').onclick = () => {
      modal(`<h2>${t('Tham gia lớp học', 'Join Classroom')}</h2>
      <p class="muted">${t('Nhập mã lớp 6 ký tự do thầy cô hoặc phụ huynh cung cấp:', 'Enter the 6-character classroom code:')}</p>
      <input id="joinCodeInput" maxlength="6" placeholder="LP4A26" style="width:100%;font-size:22px;text-align:center;text-transform:uppercase;letter-spacing:4px;padding:10px;margin:12px 0">
      <div class="actions">
        <button type="button" class="primary" id="confirmJoinClassBtn">${t('Tham gia', 'Join')}</button>
        <button type="button" onclick="$('#modal').close()">${t('Hủy', 'Cancel')}</button>
      </div>`);
      $('#confirmJoinClassBtn').onclick = async () => {
        try {
          await joinClassroomByCode($('#joinCodeInput').value);
          $('#modal').close();
          toast(t('Đã tham gia lớp học thành công!', 'Joined classroom successfully!'));
          if (typeof home === 'function') home();
        } catch (err) {
          toast(err.message);
        }
      };
    };

    $$('[data-start-asg]').forEach(btn => {
      btn.onclick = () => {
        const asg = pending.find(x => x.id === btn.dataset.startAsg);
        if (asg) startAssignedLesson(asg);
      };
    });
    $$('[data-redo-asg]').forEach(btn => {
      btn.onclick = () => {
        const asg = completed.find(x => x.id === btn.dataset.redoAsg);
        if (asg) startAssignedLesson(asg);
      };
    });
  }

  const homeBeforeClassroom = typeof home === 'function' ? home : null;
  if (homeBeforeClassroom) {
    home = function () {
      homeBeforeClassroom();
      injectStudentClassroomBox();
    };
  }

  const style = document.createElement('style');
  style.textContent = `
    .student-classroom-box.cls-cute-card{padding:16px 18px;border-radius:24px;background:linear-gradient(145deg,#fffcf3,#f1fbf5);border:2px solid #cbe4d3;box-shadow:0 5px 0 #d4eadc;margin:14px 0;display:grid;gap:12px}
    .cls-cute-hero{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
    .cls-mascot-badge{width:56px;height:56px;border-radius:18px;background:#fff4cc;border:2px solid #f7dc88;display:grid;place-items:center;flex:none;box-shadow:0 3px 0 #eed073}
    .cls-mascot-svg{width:46px;height:46px}
    .cls-hero-copy{flex:1;min-width:180px}
    .cls-hero-copy b{display:block;font-size:16px;color:#244835;margin-top:2px}
    .cls-hero-copy small{display:block;color:#557262;font-size:12.5px;line-height:1.4}
    .cls-cute-pill{display:inline-block;padding:2px 10px;border-radius:999px;background:#e2f5e9;color:#1d6844;font-size:11px;font-weight:800;letter-spacing:.4px}
    .cls-3d-btn{padding:8px 15px;border-radius:14px;border:0;background:#34765c;color:#fff;font-weight:800;font-size:13px;cursor:pointer;box-shadow:0 4px 0 #21513e;transition:transform .12s ease,box-shadow .12s ease}
    .cls-3d-btn:hover{transform:translateY(-1px)}
    .cls-3d-btn:active{transform:translateY(2px);box-shadow:0 2px 0 #21513e}
    .cls-soft-btn{padding:7px 12px;border-radius:13px;border:1.5px solid #cde2d3;background:#fff;color:#2c5640;font-weight:800;font-size:12px;cursor:pointer;box-shadow:0 3px 0 #dcebe0;transition:transform .12s ease}
    .cls-soft-btn:hover{transform:translateY(-1px)}
    .cls-teacher-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
    .cls-tstat{padding:10px;border-radius:16px;text-align:center;border:1.5px solid #e4efe4}
    .cls-tstat span{display:block;font-size:11.5px;font-weight:700;color:#4f685a}
    .cls-tstat b{font-size:20px;color:#224533}
    .cls-tstat.is-mint{background:#eaf8f0;border-color:#c9ebd8}
    .cls-tstat.is-butter{background:#fff8e1;border-color:#f4dfa0}
    .cls-tstat.is-pink{background:#fff0f6;border-color:#f6cadb}
    .cls-star-bar{display:flex;align-items:center;gap:10px;font-size:12px;font-weight:800;color:#2d5a42}
    .cls-star-track{flex:1;height:10px;border-radius:999px;background:#e3efe6;overflow:hidden}
    .cls-star-track i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#37b24d,#fab005);transition:width .3s ease}
    .cls-cute-task{display:flex;align-items:center;gap:12px;padding:11px 13px;border-radius:18px;background:#fff;border:1.5px solid #d9ebdf;box-shadow:0 3px 0 #e5f1e9}
    .cls-cute-task.is-done{background:#f7fbf8;opacity:.9}
    .cls-task-icon{width:42px;height:42px;border-radius:14px;background:#fff4d6;display:grid;place-items:center;font-size:22px;flex:none}
    .cls-task-info{flex:1;min-width:0}
    .cls-task-info b{display:block;font-size:14px;color:#244835}
    .cls-task-info small{display:block;font-size:12px;color:#5a7566}
    .cls-reward-tag{display:inline-block;padding:1px 7px;border-radius:999px;background:#fff3cf;color:#995c00;font-weight:800}
    .cls-podium{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;align-items:end;margin:12px 0 6px;padding:10px 8px 0;background:linear-gradient(180deg,#fff9e6,#f4fbf6);border-radius:18px;border:1.5px solid #e6eedb}
    .cls-podium-slot{display:flex;flex-direction:column;align-items:center;padding:8px 6px;border-radius:14px 14px 0 0;text-align:center}
    .cls-podium-slot.rank-1{background:#fff1b8;min-height:132px;border:1.5px solid #f0c94d}
    .cls-podium-slot.rank-2{background:#eef4f8;min-height:112px;border:1.5px solid #cfdce6}
    .cls-podium-slot.rank-3{background:#fceee4;min-height:102px;border:1.5px solid #ebc7ad}
    .cls-podium-crown{font-size:20px;line-height:1}
    .cls-podium-avatar .animal{width:44px;height:44px}
    .cls-podium-slot b{font-size:12.5px;margin-top:2px;color:#244835;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .cls-podium-slot span{font-size:11px;font-weight:800;color:#2b8a3e}
    .cls-mini-avatar{width:30px;height:30px;flex:none;display:grid;place-items:center}
    .cls-mini-avatar .animal{width:30px;height:30px}
    .cls-head-actions,.cls-row-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
    .cls-mini-btn{padding:4px 9px;font-size:12px;min-height:28px;border-radius:10px}
    .cls-del-btn{color:#c92a2a}
    .student-asg-list{display:grid;gap:8px}
    .classroom-grid{display:grid;gap:14px;margin-top:14px}
    .classroom-card-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;flex-wrap:wrap}
    .join-code-pill{background:#eaf5ee;color:#1e6244;padding:2px 8px;border-radius:6px;font-weight:800;letter-spacing:1px}
    .assignment-list{display:grid;gap:8px}
    .assignment-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:14px;background:#f7faf7;border:1.5px solid #e4efe4;flex-wrap:wrap}
    .assignment-row b{display:block;font-size:14px}
    .assignment-row small{color:#5f7466;font-size:12px}
    .cls-board-list{display:grid;gap:8px;max-height:240px;overflow-y:auto;margin-top:10px}
    .cls-board-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 12px;border-radius:14px;background:#f7faf7;border:1.5px solid #e4efe4}
    .cls-rank{font-size:18px;width:28px;text-align:center;flex:none}
    .cls-board-user{flex:1;min-width:0}
    .cls-board-user b{display:block;font-size:14px}
    .cls-board-user small{display:block;color:#5f7466;font-size:12px}
    .cls-score{color:#1e6244;font-size:14px}
    .cls-completed-wrap summary{cursor:pointer;font-size:12.5px;font-weight:800;color:#4a7758}
    body.dark-mode .student-classroom-box.cls-cute-card{background:linear-gradient(145deg,#1b2821,#20241b);border-color:#324c3d;box-shadow:0 5px 0 #101813}
    body.dark-mode .cls-hero-copy b,body.dark-mode .cls-task-info b,body.dark-mode .cls-tstat b,body.dark-mode .cls-star-bar{color:#e6f4ea}
    body.dark-mode .cls-hero-copy small,body.dark-mode .cls-task-info small,body.dark-mode .cls-tstat span{color:#a8bfb0}
    body.dark-mode .cls-cute-task,body.dark-mode .cls-soft-btn,body.dark-mode .assignment-row,body.dark-mode .cls-board-row{background:#1c2620;border-color:#2f4036;color:#e6f4ea;box-shadow:none}
    body.dark-mode .cls-tstat.is-mint,body.dark-mode .cls-tstat.is-butter,body.dark-mode .cls-tstat.is-pink{background:#1f2d25;border-color:#2f4036}
    body.dark-mode .cls-podium{background:#19231d;border-color:#2f4036}
    body.dark-mode .cls-podium-slot.rank-1,body.dark-mode .cls-podium-slot.rank-2,body.dark-mode .cls-podium-slot.rank-3{background:#233128;border-color:#3a5243}
    body.dark-mode .cls-podium-slot b,body.dark-mode .cls-score{color:#6ee7b7}
  `;
  document.head.append(style);

  if (typeof window !== 'undefined') {
    window.loadLocalClassStore = loadLocalClassStore;
    window.saveLocalClassStore = saveLocalClassStore;
    window.resolveStudentMeta = resolveStudentMeta;
    window.startAssignedLesson = startAssignedLesson;
    window.createClassroom = createClassroom;
    window.joinClassroomByCode = joinClassroomByCode;
    window.createAssignment = createAssignment;
    window.deleteAssignment = deleteAssignment;
    window.submitAssignmentResult = submitAssignmentResult;
    window.fetchTeacherOverview = fetchTeacherOverview;
    window.fetchStudentAssignments = fetchStudentAssignments;
    window.getClassroomLeaderboard = getClassroomLeaderboard;
    window.openClassroomLeaderboardModal = openClassroomLeaderboardModal;
    window.openAssignmentSubmissionsModal = openAssignmentSubmissionsModal;
    window.renderClassroomManager = renderClassroomManager;
  }
  if (typeof global !== 'undefined') {
    global.loadLocalClassStore = loadLocalClassStore;
    global.saveLocalClassStore = saveLocalClassStore;
    global.resolveStudentMeta = resolveStudentMeta;
    global.startAssignedLesson = startAssignedLesson;
    global.createClassroom = createClassroom;
    global.joinClassroomByCode = joinClassroomByCode;
    global.createAssignment = createAssignment;
    global.deleteAssignment = deleteAssignment;
    global.submitAssignmentResult = submitAssignmentResult;
    global.fetchTeacherOverview = fetchTeacherOverview;
    global.fetchStudentAssignments = fetchStudentAssignments;
    global.getClassroomLeaderboard = getClassroomLeaderboard;
    global.openClassroomLeaderboardModal = openClassroomLeaderboardModal;
    global.openAssignmentSubmissionsModal = openAssignmentSubmissionsModal;
    global.renderClassroomManager = renderClassroomManager;
  }
  if (view === 'home') injectStudentClassroomBox();
})();
