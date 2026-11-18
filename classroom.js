'use strict';
// Classroom & Weekly Assignments (Cloud-first with Supabase RLS + Local Storage fallback)
(() => {
  const CLASSROOM_LOCAL_KEY = 'numi-classrooms-v1';
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

  async function submitAssignmentResult(assignmentId, correct, total, avgTime) {
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
    const row = { id: existingIdx >= 0 ? store.submissions[existingIdx].id : newId('sub'), student_id: sid, ...payload };
    if (existingIdx >= 0) store.submissions[existingIdx] = row;
    else store.submissions.push(row);
    saveLocalClassStore(store);
    return row;
  }

  async function fetchTeacherOverview() {
    if (isCloudReadyForClassroom()) {
      await cloudRefresh();
      const uid = encodeURIComponent(cloudSession.user.id);
      const classrooms = await cloudRequest(`/rest/v1/numi_classrooms?teacher_id=eq.${uid}&order=created_at.desc`);
      const assignments = classrooms.length
        ? await cloudRequest(`/rest/v1/numi_assignments?classroom_id=in.(${classrooms.map(c => c.id).join(',')})&order=created_at.desc`)
        : [];
      const submissions = assignments.length
        ? await cloudRequest(`/rest/v1/numi_submissions?assignment_id=in.(${assignments.map(a => a.id).join(',')})`)
        : [];
      return { classrooms, assignments, submissions };
    }

    const store = loadLocalClassStore();
    return {
      classrooms: [...store.classrooms].reverse(),
      assignments: [...store.assignments].reverse(),
      submissions: store.submissions
    };
  }

  async function fetchStudentAssignments() {
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
        submitAssignmentResult(aid, correct, total, avgTime)
          .then(() => toast(t('Đã nộp kết quả bài tập về lớp học!', 'Assignment result submitted!')))
          .catch(() => {});
      }
    };
  }

  // ---------------- Teacher Classroom Management View ----------------
  async function renderClassroomManager() {
    stop();
    view = 'classroom';
    document.body.dataset.view = 'classroom';
    $('#app').innerHTML = `<section class="narrow card"><p class="muted">${t('Đang tải dữ liệu lớp học...', 'Loading classrooms...')}</p></section>`;

    let data;
    try { data = await fetchTeacherOverview(); } catch { data = { classrooms: [], assignments: [], submissions: [] }; }

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
          return `<div class="card classroom-card">
            <div class="classroom-card-head">
              <div>
                <h3>${esc(room.name)}</h3>
                <small class="muted">${t('Khối lớp', 'Grade')} ${room.grade} · ${t('Mã lớp:', 'Code:')} <code class="join-code-pill">${esc(room.join_code)}</code></small>
              </div>
              <button type="button" class="primary" data-assign-room="${esc(room.id)}" data-assign-grade="${room.grade}">+ ${t('Giao bài', 'Assign')}</button>
            </div>
            <div class="assignment-list">
              ${roomAsgs.length === 0 ? `<p class="muted">${t('Chưa giao bài tập nào cho lớp này.', 'No assignments yet.')}</p>` : roomAsgs.map(a => {
                const subs = data.submissions.filter(s => s.assignment_id === a.id);
                return `<div class="assignment-row">
                  <div>
                    <b>${esc(a.title)}</b>
                    <small>${a.due_date ? t('Hạn nộp: ', 'Due: ') + esc(a.due_date) + ' · ' : ''}${a.config?.count || 10} ${t('câu', 'qs')} · ${subs.length} ${t('bài đã nộp', 'submissions')}</small>
                  </div>
                  ${subs.length ? `<span class="acc-pill acc-high">${Math.round(subs.reduce((acc, s) => acc + (s.correct / s.total) * 100, 0) / subs.length)}% TB</span>` : ''}
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
          renderClassroomManager();
        } catch (err) {
          toast(err.message);
        }
      };
    };

    $$('[data-assign-room]').forEach(btn => {
      btn.onclick = () => {
        const roomId = btn.dataset.assignRoom;
        const g = Number(btn.dataset.assignGrade) || 1;
        modal(`<h2>${t('Giao bài tập mới', 'New Assignment')}</h2>
        <form id="newAssignForm" style="display:grid;gap:12px;margin-top:12px">
          <label>${t('Tiêu đề bài tập / Tuần học', 'Assignment title')}
            <input name="title" maxlength="120" required placeholder="${t('VD: Tuần 12 - Phép nhân 2 chữ số', 'e.g. Week 12 - Multiplication')}">
          </label>
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
          <label>${t('Số câu hỏi', 'Question count')}
            <select name="count"><option value="10">10</option><option value="15">15</option><option value="20">20</option></select>
          </label>
          <div class="actions">
            <button type="submit" class="primary">${t('Giao bài ngay', 'Assign Now')}</button>
            <button type="button" onclick="$('#modal').close()">${t('Hủy', 'Cancel')}</button>
          </div>
        </form>`);
        $('#newAssignForm').onsubmit = async e => {
          e.preventDefault();
          const f = new FormData(e.target);
          const type = String(f.get('type') || 'natural');
          try {
            await createAssignment(roomId, f.get('title'), f.get('dueDate'), {
              ...defaults,
              grade: g,
              type,
              types: [type],
              ops: ['+', '-', '*', '/'],
              digits: g >= 4 ? [1, 2] : [1],
              count: Number(f.get('count')) || 10,
              seconds: 20
            });
            $('#modal').close();
            toast(t('Đã giao bài tập cho cả lớp!', 'Assignment posted to classroom!'));
            renderClassroomManager();
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
        renderClassroomManager();
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
        btn.onclick = renderClassroomManager;
        topActions.prepend(btn);
      }
    };
  }

  async function injectStudentClassroomBox() {
    if (view !== 'home') return;
    const host = $('.home-v2') || $('.simple-home');
    if (!host || host.querySelector('.student-classroom-box')) return;

    const box = document.createElement('section');
    box.className = 'student-classroom-box';
    const anchor = host.querySelector('.home-v2-links') || host.querySelector('.home-v2-local');
    if (anchor) anchor.before(box);
    else host.append(box);

    let data;
    try { data = await fetchStudentAssignments(); } catch { data = { classrooms: [], assignments: [], submissions: [] }; }
    if (!box.isConnected || view !== 'home') return;

    const doneIds = new Set(data.submissions.map(s => s.assignment_id));
    const pending = data.assignments.filter(a => !doneIds.has(a.id));

    box.innerHTML = `
      <div class="classroom-student-head">
        <div>
          <b>🏫 ${t('Lớp học & Bài tập được giao', 'My Classroom & Assignments')}</b>
          <small>${data.classrooms.length ? data.classrooms.map(c => esc(c.name)).join(', ') : t('Chưa tham gia lớp nào', 'Not enrolled in a classroom yet')}</small>
        </div>
        <button type="button" id="joinClassBtn" class="ghost">${t('+ Nhập mã lớp', '+ Join Code')}</button>
      </div>
      ${pending.length ? `<div class="student-asg-list">${pending.slice(0, 3).map(a => `<div class="dq-item">
        <div><b>${esc(a.title)}</b><small>${a.config?.count || 10} ${t('câu', 'qs')}${a.due_date ? ' · ' + t('Hạn: ', 'Due: ') + esc(a.due_date) : ''}</small></div>
        <button type="button" class="dq-claim-btn" data-start-asg="${esc(a.id)}">${t('Làm bài', 'Start')} →</button>
      </div>`).join('')}</div>` : ''}
    `;

    $('#joinClassBtn').onclick = () => {
      modal(`<h2>${t('Tham gia lớp học', 'Join Classroom')}</h2>
      <p class="muted">${t('Nhập mã lớp 6 ký tự do thầy cô hoặc phụ huynh cung cấp:', 'Enter the 6-character classroom code:')}</p>
      <input id="joinCodeInput" maxlength="6" placeholder="ABC123" style="width:100%;font-size:22px;text-align:center;text-transform:uppercase;letter-spacing:4px;padding:10px;margin:12px 0">
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
    .student-classroom-box{padding:14px 16px;border-radius:16px;background:rgba(255,255,255,.78);border:1.5px solid #dce8dc;margin:12px 0;display:grid;gap:10px}
    .classroom-student-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
    .classroom-student-head b{display:block;font-size:15px}
    .classroom-student-head small{display:block;color:#5f7466;font-size:12px}
    .student-asg-list{display:grid;gap:8px}
    .classroom-grid{display:grid;gap:14px;margin-top:14px}
    .classroom-card-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
    .join-code-pill{background:#eaf5ee;color:#1e6244;padding:2px 8px;border-radius:6px;font-weight:800;letter-spacing:1px}
    .assignment-list{display:grid;gap:8px}
    .assignment-row{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-radius:12px;background:#f7faf7;border:1px solid #e4efe4}
    .assignment-row b{display:block;font-size:14px}
    .assignment-row small{color:#5f7466;font-size:12px}
    body.dark-mode .student-classroom-box,body.dark-mode .assignment-row{background:#1c2620;border-color:#2f4036}
  `;
  document.head.append(style);

  if (typeof window !== 'undefined') {
    window.createClassroom = createClassroom;
    window.joinClassroomByCode = joinClassroomByCode;
    window.createAssignment = createAssignment;
    window.submitAssignmentResult = submitAssignmentResult;
    window.fetchTeacherOverview = fetchTeacherOverview;
    window.fetchStudentAssignments = fetchStudentAssignments;
    window.renderClassroomManager = renderClassroomManager;
  }
  if (typeof global !== 'undefined') {
    global.createClassroom = createClassroom;
    global.joinClassroomByCode = joinClassroomByCode;
    global.createAssignment = createAssignment;
    global.submitAssignmentResult = submitAssignmentResult;
    global.fetchTeacherOverview = fetchTeacherOverview;
    global.fetchStudentAssignments = fetchStudentAssignments;
    global.renderClassroomManager = renderClassroomManager;
  }
  if (view === 'home') injectStudentClassroomBox();
})();
