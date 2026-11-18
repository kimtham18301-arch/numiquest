'use strict';
// Azota-inspired Classroom Suite:
// 1. 1-Click Shareable Homework Link (#hw=...)
// 2. Bulk Student List Import (paste names -> auto accounts + enrollment)
// 3. 3-Tier Cognitive Matrix Generator (40% Easy / 40% Medium / 20% Hard)
// 4. Exam Mode (same seed + per-student shuffle + single attempt + tab-leave tracking)
// 5. Class Score Distribution Chart & Per-Assignment Wrong Question Breakdown
// 6. Teacher Feedback Stickers & Bonus XP

(() => {
  const TEACHER_STICKERS = [
    { id: 'star', icon: '🌟', vi: 'Xuất sắc!', en: 'Excellent!', bonusXp: 15 },
    { id: 'progress', icon: '🚀', vi: 'Tiến bộ vượt bậc!', en: 'Great progress!', bonusXp: 10 },
    { id: 'careful', icon: '🔍', vi: 'Cẩn thận phép tính nhé!', en: 'Watch the steps!', bonusXp: 5 },
    { id: 'fighting', icon: '💪', vi: 'Cố gắng hơn lần sau!', en: 'Keep practicing!', bonusXp: 5 }
  ];

  // ---------------- 1. 1-Click Homework Share Link ----------------
  function toBase64Url(str) {
    const utf8 = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)));
    return btoa(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function fromBase64Url(b64) {
    let s = String(b64 || '').replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bin = atob(s);
    const escStr = Array.from(bin, ch => '%' + ch.charCodeAt(0).toString(16).padStart(2, '0')).join('');
    return decodeURIComponent(escStr);
  }

  function buildHomeworkShareLink(room, assignment) {
    if (!room || !assignment) return '';
    const payload = {
      c: room.join_code,
      r: room.name,
      g: room.grade,
      a: assignment.id,
      t: assignment.title,
      d: assignment.due_date || null,
      cfg: assignment.config || {}
    };
    const encoded = toBase64Url(JSON.stringify(payload));
    const base = (typeof location !== 'undefined' && location.href)
      ? location.href.split('#')[0]
      : 'https://kimtham18301-arch.github.io/numiquest/';
    return `${base}#hw=${encoded}`;
  }

  function parseHomeworkShareHash(hashStr) {
    const raw = String(hashStr || '').trim();
    const match = raw.match(/#?hw=([A-Za-z0-9\-_]+)/);
    if (!match) return null;
    try {
      const data = JSON.parse(fromBase64Url(match[1]));
      if (!data || !data.c || !data.t || !data.cfg) return null;
      return data;
    } catch {
      return null;
    }
  }

  async function handleIncomingHomeworkHash() {
    if (typeof location === 'undefined') return;
    const parsed = parseHomeworkShareHash(location.hash);
    if (!parsed) return;

    const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
    if (!u) return;

    try { history.replaceState(null, '', location.pathname + location.search); } catch {}

    // Ensure classroom & assignment exist in local store so link works even on another browser session
    if (typeof loadLocalClassStore === 'function' && typeof saveLocalClassStore === 'function') {
      const store = loadLocalClassStore();
      let room = store.classrooms.find(c => String(c.join_code).toUpperCase() === String(parsed.c).toUpperCase());
      if (!room) {
        room = {
          id: 'room_' + String(parsed.c).toLowerCase(),
          teacher_id: 'teacher',
          name: parsed.r || `Lớp ${parsed.g || 1}`,
          grade: Number(parsed.g) || 1,
          join_code: String(parsed.c).toUpperCase(),
          created_at: new Date().toISOString()
        };
        store.classrooms.push(room);
      }
      if (!store.enrollments.some(e => e.classroom_id === room.id && e.student_id === u.username)) {
        store.enrollments.push({ classroom_id: room.id, student_id: u.username, joined_at: new Date().toISOString() });
      }
      let asg = store.assignments.find(a => a.id === parsed.a);
      if (!asg) {
        asg = {
          id: parsed.a || ('asg_' + Date.now()),
          classroom_id: room.id,
          title: parsed.t,
          due_date: parsed.d || null,
          config: parsed.cfg,
          created_at: new Date().toISOString()
        };
        store.assignments.push(asg);
      }
      saveLocalClassStore(store);

      modal(`<h2>🔗 ${t('Nhận bài tập từ Thầy/Cô', 'Homework Link Received')}</h2>
      <p><b>${esc(asg.title)}</b></p>
      <p class="muted">${esc(room.name)} · ${asg.config?.count || 10} ${t('câu', 'qs')}</p>
      <div class="actions">
        <button type="button" class="primary" id="startLinkedHwBtn">🚀 ${t('Làm bài ngay', 'Start Now')}</button>
        <button type="button" onclick="$('#modal').close(); if(typeof home==='function')home();">${t('Để sau', 'Later')}</button>
      </div>`);
      $('#startLinkedHwBtn').onclick = () => {
        $('#modal').close();
        if (typeof startAssignedLesson === 'function') startAssignedLesson(asg);
      };
    }
  }

  // ---------------- 2. Bulk Student List Import ----------------
  function slugifyStudentName(name) {
    return String(name || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 18) || 'hocsinh';
  }

  async function bulkImportStudentsToClassroom(classroomId, rawNamesText) {
    const lines = String(rawNamesText || '')
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);
    if (!lines.length) throw Error(t('Vui lòng nhập ít nhất 1 tên học sinh.', 'Please enter at least one student name.'));

    const users = typeof getLocalUsers === 'function' ? getLocalUsers() : {};
    const store = typeof loadLocalClassStore === 'function' ? loadLocalClassStore() : { classrooms: [], enrollments: [], assignments: [], submissions: [] };
    const room = store.classrooms.find(c => c.id === classroomId);
    const grade = room?.grade || 1;
    const defaultHash = typeof hashPassword === 'function'
      ? await hashPassword('1234')
      : '77efd557dd7880dfc9b22f85c497f6b76682ed594bb6fe1ac87463a47179272c';

    const avatars = ['bunny', 'panda', 'fox', 'lion'];
    const created = [];

    for (let i = 0; i < lines.length; i++) {
      const fullName = lines[i].slice(0, 30);
      const baseSlug = slugifyStudentName(fullName);
      let uname = baseSlug;
      let suffix = 1;
      while (users[uname]) {
        uname = `${baseSlug}${suffix++}`;
      }
      const av = avatars[i % avatars.length];
      users[uname] = {
        username: uname,
        name: fullName,
        hash: defaultHash,
        avatar: av,
        grade,
        role: 'student',
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
        loginCount: 0
      };
      try {
        localStorage.setItem('numi-user-state-' + uname, JSON.stringify({
          version: 1, lang: 'vi', name: fullName, buddy: av,
          xp: 0, best: 0, pieces: {}, streak: { count: 0, lastDate: '' },
          history: [], mistakes: [], mastery: {}
        }));
      } catch {}

      if (!store.enrollments.some(e => e.classroom_id === classroomId && e.student_id === uname)) {
        store.enrollments.push({ classroom_id: classroomId, student_id: uname, joined_at: new Date().toISOString() });
      }
      created.push({ username: uname, name: fullName });
    }

    if (typeof saveLocalUsers === 'function') saveLocalUsers(users);
    if (typeof saveLocalClassStore === 'function') saveLocalClassStore(store);
    return created;
  }

  // ---------------- 3. 3-Tier Cognitive Matrix Generator ----------------
  function seededPrng(seed) {
    let a = (Number(seed) || 12345) >>> 0;
    return () => {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function generateMatrixQuestions(baseCfg = {}, count = 10, seed = null) {
    const total = Math.max(3, Math.min(40, Number(count) || 10));
    const nEasy = Math.round(total * 0.4);
    const nMed = Math.round(total * 0.4);
    const nHard = Math.max(1, total - nEasy - nMed);

    const origRandom = Math.random;
    if (seed !== null && seed !== undefined) Math.random = seededPrng(seed);
    try {
      const out = [];
      const easyCfg = { ...baseCfg, digits: [1], questionStyle: 'normal' };
      const medCfg = { ...baseCfg, digits: [1, 2], questionStyle: baseCfg.type === 'natural' ? 'convenient' : 'normal' };
      const hardCfg = { ...baseCfg, digits: [1, 2], questionStyle: 'missing' };

      for (let i = 0; i < nEasy; i++) {
        const q = generate(easyCfg);
        q.matrixTier = 'easy';
        out.push(q);
      }
      for (let i = 0; i < nMed; i++) {
        const q = generate(medCfg);
        q.matrixTier = 'medium';
        out.push(q);
      }
      for (let i = 0; i < nHard; i++) {
        const cfgH = i % 2 === 1 ? { ...hardCfg, questionStyle: 'word' } : hardCfg;
        const q = generate(cfgH);
        q.matrixTier = 'hard';
        out.push(q);
      }
      return out.slice(0, total);
    } finally {
      Math.random = origRandom;
    }
  }

  // ---------------- 4. Exam Mode Shuffle & Visibility Tracking ----------------
  function stringHash(str) {
    let h = 2166136261;
    const s = String(str || 'guest');
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function shuffleArrayWithPrng(arr, prng) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function shuffleForStudent(questions, studentKey) {
    const prng = seededPrng(stringHash(studentKey));
    return shuffleArrayWithPrng(questions, prng).map(q => ({
      ...q,
      options: Array.isArray(q.options) ? shuffleArrayWithPrng(q.options, prng) : q.options
    }));
  }

  // Wrap startAssignedLesson to apply Matrix, Exam Shuffle, and 1-Attempt Lock
  const startAssignedBeforeAzota = typeof startAssignedLesson === 'function' ? startAssignedLesson : null;
  if (startAssignedBeforeAzota) {
    startAssignedLesson = function (assignment) {
      if (!assignment?.config) return;
      const cfg = assignment.config;
      const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
      const sid = u?.username || 'guest';

      if (cfg.examMode && typeof loadLocalClassStore === 'function') {
        const store = loadLocalClassStore();
        const already = store.submissions.find(s => s.assignment_id === assignment.id && s.student_id === sid);
        if (already) {
          toast(t('Bài kiểm tra này chỉ được nộp 1 lần. Em đã hoàn thành rồi!', 'This exam allows 1 attempt only. Already submitted!'));
          return;
        }
      }

      startAssignedBeforeAzota(assignment);
      if (!session || view !== 'quiz') return;

      const count = Number(cfg.count) || 10;
      const seed = cfg.seed || stringHash(assignment.id);
      let customQs = null;
      if (cfg.useMatrix) {
        customQs = generateMatrixQuestions(cfg, count, cfg.examMode ? seed : null);
      } else if (cfg.examMode) {
        const origRandom = Math.random;
        Math.random = seededPrng(seed);
        try {
          customQs = Array.from({ length: count }, () => generate(cfg));
        } finally {
          Math.random = origRandom;
        }
      }

      if (customQs) {
        session.questions = cfg.examMode ? shuffleForStudent(customQs, sid) : customQs;
      } else if (cfg.examMode) {
        session.questions = shuffleForStudent(session.questions, sid);
      }

      if (cfg.examMode) {
        session.isExamMode = true;
        session.focusLostCount = 0;
      }
      showQuiz();
    };
    if (typeof window !== 'undefined') window.startAssignedLesson = startAssignedLesson;
    if (typeof global !== 'undefined') global.startAssignedLesson = startAssignedLesson;
  }

  // Track tab/window switching during Exam Mode
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && typeof view !== 'undefined' && view === 'quiz' && typeof session !== 'undefined' && session && !session.done && session.isExamMode) {
        session.focusLostCount = (session.focusLostCount || 0) + 1;
      }
    });
  }

  // Show Matrix tier & Exam badge on quizCard
  const showQuizBeforeAzota = typeof showQuiz === 'function' ? showQuiz : null;
  if (showQuizBeforeAzota) {
    showQuiz = function () {
      showQuizBeforeAzota();
      if (view !== 'quiz' || !session || session.done) return;
      const card = $('#quizCard');
      const q = session.questions?.[session.index];
      if (!card || !q) return;

      const existing = card.querySelector('.azota-quiz-badges');
      if (existing) existing.remove();

      const badges = [];
      if (session.isExamMode) {
        badges.push(`<span class="azota-badge is-exam">🔒 ${t('Chế độ Kiểm tra', 'Exam Mode')}</span>`);
      }
      if (q.matrixTier) {
        const tierLabel = q.matrixTier === 'easy'
          ? `🟢 ${t('Nhận biết', 'Basic')}`
          : q.matrixTier === 'medium'
            ? `🔵 ${t('Thông hiểu', 'Medium')}`
            : `🟣 ${t('Vận dụng', 'Advanced')}`;
        badges.push(`<span class="azota-badge is-${q.matrixTier}">${tierLabel}</span>`);
      }
      if (badges.length) {
        card.insertAdjacentHTML('afterbegin', `<div class="azota-quiz-badges">${badges.join('')}</div>`);
      }
    };
  }

  // ---------------- 5. Score Distribution & Wrong Questions Analytics ----------------
  function computeScoreDistribution(submissions) {
    const dist = { excellent: 0, good: 0, average: 0, needsWork: 0 };
    for (const s of (submissions || [])) {
      const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
      if (pct >= 90) dist.excellent++;
      else if (pct >= 70) dist.good++;
      else if (pct >= 50) dist.average++;
      else dist.needsWork++;
    }
    return dist;
  }

  // ---------------- 6. Teacher Feedback Stickers ----------------
  function autoStickerForScore(pct) {
    if (pct >= 90) return 'star';
    if (pct >= 70) return 'progress';
    if (pct >= 50) return 'careful';
    return 'fighting';
  }

  function getStickerInfo(stickerId) {
    return TEACHER_STICKERS.find(s => s.id === stickerId) || null;
  }

  function giveStickerToSubmission(submissionId, stickerId) {
    const sticker = getStickerInfo(stickerId);
    if (!sticker || typeof loadLocalClassStore !== 'function') return false;
    const store = loadLocalClassStore();
    const sub = store.submissions.find(s => s.id === submissionId);
    if (!sub) return false;
    const hadPrev = Boolean(sub.stickerGranted);
    sub.sticker = sticker.id;
    sub.stickerGranted = true;
    saveLocalClassStore(store);

    if (!hadPrev && sub.student_id) {
      try {
        const key = 'numi-user-state-' + sub.student_id;
        const uState = JSON.parse(localStorage.getItem(key) || 'null');
        if (uState && typeof uState === 'object') {
          uState.xp = (Number(uState.xp) || 0) + sticker.bonusXp;
          localStorage.setItem(key, JSON.stringify(uState));
        }
      } catch {}
    }
    return true;
  }

  // Upgrade openAssignmentSubmissionsModal with Score Distribution + Wrong Questions + Stickers
  const openSubsBeforeAzota = typeof openAssignmentSubmissionsModal === 'function' ? openAssignmentSubmissionsModal : null;
  if (openSubsBeforeAzota) {
    openAssignmentSubmissionsModal = function (assignmentId, data) {
      const asg = data.assignments.find(a => a.id === assignmentId);
      if (!asg) return;
      const room = data.classrooms.find(c => c.id === asg.classroom_id);
      const enrolledIds = (data.enrollments || []).filter(e => e.classroom_id === asg.classroom_id).map(e => e.student_id);
      const subs = data.submissions.filter(s => s.assignment_id === assignmentId);
      const subByStudent = new Map(subs.map(s => [s.student_id, s]));
      const allStudentIds = Array.from(new Set([...enrolledIds, ...subs.map(s => s.student_id)]));

      const dist = computeScoreDistribution(subs);
      const totalSubs = Math.max(1, subs.length);
      const wrongCounts = new Map();
      for (const s of subs) {
        for (const wq of (s.wrong_questions || [])) {
          const k = String(wq.q || '');
          if (!k) continue;
          const prev = wrongCounts.get(k) || { q: k, answer: wq.answer || '', count: 0 };
          prev.count++;
          wrongCounts.set(k, prev);
        }
      }
      const topWrong = Array.from(wrongCounts.values()).sort((a, b) => b.count - a.count).slice(0, 4);

      modal(`<h2>📊 ${esc(asg.title)}</h2>
      <p class="muted">${room ? esc(room.name) + ' · ' : ''}${subs.length}/${allStudentIds.length} ${t('học sinh đã nộp bài', 'students submitted')}${asg.config?.examMode ? ` · 🔒 ${t('Chế độ Kiểm tra', 'Exam Mode')}` : ''}</p>
      ${subs.length > 0 ? `<div class="azota-dist-box">
        <b>${t('Phổ điểm lớp học', 'Score Distribution')}</b>
        <div class="azota-dist-bars">
          <div><span>🌟 90–100%</span><div class="azota-bar"><i style="width:${Math.round(dist.excellent / totalSubs * 100)}%;background:#2b8a3e"></i></div><b>${dist.excellent}</b></div>
          <div><span>🔵 70–89%</span><div class="azota-bar"><i style="width:${Math.round(dist.good / totalSubs * 100)}%;background:#1971c2"></i></div><b>${dist.good}</b></div>
          <div><span>🟡 50–69%</span><div class="azota-bar"><i style="width:${Math.round(dist.average / totalSubs * 100)}%;background:#f08c00"></i></div><b>${dist.average}</b></div>
          <div><span>🔴 &lt; 50%</span><div class="azota-bar"><i style="width:${Math.round(dist.needsWork / totalSubs * 100)}%;background:#e03131"></i></div><b>${dist.needsWork}</b></div>
        </div>
      </div>` : ''}
      ${topWrong.length ? `<div class="azota-wrong-box">
        <b>${t('Các câu hay sai trong đề:', 'Most missed questions:')}</b>
        ${topWrong.map(w => `<small>• ${esc(w.q)} = <b>${esc(w.answer)}</b> (${w.count} ${t('HS sai', 'wrong')})</small>`).join('')}
      </div>` : ''}
      ${allStudentIds.length === 0
        ? `<p class="muted" style="text-align:center;padding:18px 0">${t('Lớp chưa có học sinh tham gia.', 'No students in this classroom yet.')}</p>`
        : `<div class="cls-board-list">${allStudentIds.map(sid => {
            const meta = typeof resolveStudentMeta === 'function' ? resolveStudentMeta(sid) : { name: sid };
            const sub = subByStudent.get(sid);
            const pct = sub && sub.total > 0 ? Math.round((sub.correct / sub.total) * 100) : 0;
            const st = sub?.sticker ? getStickerInfo(sub.sticker) : null;
            return `<div class="cls-board-row" style="flex-wrap:wrap">
              <div class="cls-board-user">
                <b>${esc(meta.name)}</b>
                <small>@${esc(sid)} ${sub ? `· ${sub.avg_time || 0}s/${t('câu', 'q')}` : ''}${sub && sub.focus_lost > 0 ? ` · <span style="color:#e03131">⚠️ ${t('Rời tab', 'Left tab')} ${sub.focus_lost}x</span>` : ''}</small>
              </div>
              ${sub
                ? `<div class="cls-row-actions">
                    <span class="acc-pill ${pct >= 80 ? 'acc-high' : pct >= 60 ? 'acc-med' : 'acc-low'}">${sub.correct}/${sub.total} (${pct}%)</span>
                    <select class="azota-sticker-select" data-sub-sticker="${esc(sub.id)}" title="${t('Tặng sticker lời phê', 'Give feedback sticker')}">
                      ${TEACHER_STICKERS.map(item => `<option value="${item.id}" ${st?.id === item.id ? 'selected' : ''}>${item.icon} ${t(item.vi, item.en)}</option>`).join('')}
                    </select>
                  </div>`
                : `<span class="mistake-pill">${t('Chưa nộp', 'Pending')}</span>`}
            </div>`;
          }).join('')}</div>`}
      <div class="actions" style="margin-top:14px">
        <button type="button" class="primary" onclick="$('#modal').close()">${t('Đóng', 'Close')}</button>
      </div>`);

      $$('[data-sub-sticker]').forEach(sel => {
        sel.onchange = () => {
          if (giveStickerToSubmission(sel.dataset.subSticker, sel.value)) {
            const st = getStickerInfo(sel.value);
            toast(t(`Đã gửi sticker "${st.icon} ${st.vi}" cho học sinh!`, `Sent "${st.icon} ${st.en}" sticker!`));
          }
        };
      });
    };
    if (typeof window !== 'undefined') window.openAssignmentSubmissionsModal = openAssignmentSubmissionsModal;
    if (typeof global !== 'undefined') global.openAssignmentSubmissionsModal = openAssignmentSubmissionsModal;
  }

  // Upgrade renderClassroomManager with Bulk Import, Copy Share Link, Matrix & Exam options
  const renderClassBeforeAzota = typeof renderClassroomManager === 'function' ? renderClassroomManager : null;
  if (renderClassBeforeAzota) {
    renderClassroomManager = async function () {
      await renderClassBeforeAzota();
      const data = typeof fetchTeacherOverview === 'function'
        ? await fetchTeacherOverview().catch(() => ({ classrooms: [], enrollments: [], assignments: [], submissions: [] }))
        : { classrooms: [], enrollments: [], assignments: [], submissions: [] };

      // 1. Add Bulk Import Student List button to each classroom header
      $$('[data-assign-room]').forEach(btn => {
        const roomId = btn.dataset.assignRoom;
        const headActions = btn.closest('.cls-head-actions') || btn.parentElement;
        if (headActions && !headActions.querySelector(`[data-bulk-import="${roomId}"]`)) {
          const impBtn = document.createElement('button');
          impBtn.type = 'button';
          impBtn.className = 'ghost';
          impBtn.dataset.bulkImport = roomId;
          impBtn.textContent = `📋 ${t('Nhập DS HS', 'Import List')}`;
          impBtn.onclick = () => {
            modal(`<h2>📋 ${t('Nhập nhanh danh sách học sinh', 'Bulk Import Student Names')}</h2>
            <p class="muted">${t('Dán danh sách họ tên từ Excel hoặc Word (mỗi học sinh 1 dòng). Hệ thống tự tạo tài khoản (PIN mặc định 1234) và xếp vào lớp:', 'Paste student names (one per line). Accounts with default PIN 1234 are created automatically:')}</p>
            <textarea id="bulkStudentNames" rows="7" placeholder="Nguyễn Minh An&#10;Trần Bảo Ngọc&#10;Lê Hoàng Nam" style="width:100%;padding:10px;border-radius:12px;border:1.5px solid #cde2d3;margin:10px 0"></textarea>
            <div class="actions">
              <button type="button" class="primary" id="confirmBulkImportBtn">${t('Tạo & Thêm vào lớp', 'Import Students')}</button>
              <button type="button" onclick="$('#modal').close()">${t('Hủy', 'Cancel')}</button>
            </div>`);
            $('#confirmBulkImportBtn').onclick = async () => {
              try {
                const list = await bulkImportStudentsToClassroom(roomId, $('#bulkStudentNames').value);
                $('#modal').close();
                toast(t(`Đã thêm ${list.length} học sinh vào lớp!`, `Imported ${list.length} students!`));
                renderClassroomManager();
              } catch (err) {
                toast(err.message);
              }
            };
          };
          btn.before(impBtn);
        }
      });

      // 2. Add Copy Homework Share Link button to each assignment row
      $$('[data-view-subs]').forEach(btn => {
        const asgId = btn.dataset.viewSubs;
        const actions = btn.closest('.cls-row-actions');
        if (!actions || actions.querySelector(`[data-copy-hw-link="${asgId}"]`)) return;
        const asg = data.assignments.find(a => a.id === asgId);
        const room = asg ? data.classrooms.find(c => c.id === asg.classroom_id) : null;
        if (!asg || !room) return;

        const linkBtn = document.createElement('button');
        linkBtn.type = 'button';
        linkBtn.className = 'ghost cls-mini-btn';
        linkBtn.dataset.copyHwLink = asgId;
        linkBtn.textContent = `🔗 ${t('Link', 'Link')}`;
        linkBtn.onclick = () => {
          const url = buildHomeworkShareLink(room, asg);
          navigator.clipboard?.writeText(url)
            .then(() => toast(t('Đã sao chép link giao bài! Gửi qua Zalo cho phụ huynh/HS nhé.', 'Copied homework link!')))
            .catch(() => modal(`<h3>🔗 ${t('Link giao bài tập', 'Homework Link')}</h3><input readonly value="${esc(url)}" style="width:100%;padding:8px" onclick="this.select()">`));
        };
        btn.before(linkBtn);
      });

      // 3. Inject Matrix & Exam Mode checkboxes into New Assignment modal when clicked
      $$('[data-assign-room]').forEach(btn => {
        const origClick = btn.onclick;
        btn.onclick = () => {
          origClick();
          const form = $('#newAssignForm');
          if (!form || form.querySelector('[name="useMatrix"]')) return;
          const actions = form.querySelector('.actions');
          const optsBox = document.createElement('div');
          optsBox.className = 'azota-assign-opts';
          optsBox.innerHTML = `
            <label style="display:flex;align-items:center;gap:8px;font-size:13px"><input type="checkbox" name="useMatrix" checked> <span><b>🧩 ${t('Tạo theo Ma trận 3 mức độ', '3-Tier Matrix')}</b> <small class="muted">(40% ${t('Nhận biết', 'Basic')} · 40% ${t('Thông hiểu', 'Medium')} · 20% ${t('Vận dụng', 'Hard')})</small></span></label>
            <label style="display:flex;align-items:center;gap:8px;font-size:13px"><input type="checkbox" name="examMode"> <span><b>🔒 ${t('Chế độ Kiểm tra', 'Exam Mode')}</b> <small class="muted">(${t('Đảo đề, nộp 1 lần, đếm rời tab', 'Shuffle, 1 attempt, tab monitor')})</small></span></label>
          `;
          if (actions) actions.before(optsBox);
          const prevSubmit = form.onsubmit;
          form.onsubmit = async e => {
            e.preventDefault();
            const f = new FormData(form);
            const roomId = btn.dataset.assignRoom;
            const g = Number(btn.dataset.assignGrade) || 1;
            const type = String(f.get('type') || 'natural');
            const ops = f.getAll('ops');
            const count = Number(f.get('count')) || 10;
            const useMatrix = f.get('useMatrix') !== null;
            const examMode = f.get('examMode') !== null;
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
                seconds: count >= 20 ? 25 : 20,
                useMatrix,
                examMode,
                seed: Math.floor(Math.random() * 900000) + 100000
              });
              $('#modal').close();
              toast(t('Đã giao bài tập cho cả lớp!', 'Assignment posted to classroom!'));
              renderClassroomManager();
            } catch (err) {
              if (prevSubmit) toast(err.message);
            }
          };
        };
      });
    };
    if (typeof window !== 'undefined') window.renderClassroomManager = renderClassroomManager;
    if (typeof global !== 'undefined') global.renderClassroomManager = renderClassroomManager;
  }

  // Show Teacher Feedback Sticker badges on Home's Completed Assignments list
  const homeBeforeAzota = typeof home === 'function' ? home : null;
  if (homeBeforeAzota) {
    home = function () {
      homeBeforeAzota();
      setTimeout(() => {
        if (view !== 'home' || typeof loadLocalClassStore !== 'function') return;
        const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
        if (!u) return;
        const store = loadLocalClassStore();
        const mySubs = new Map(store.submissions.filter(s => s.student_id === u.username).map(s => [s.assignment_id, s]));
        $$('[data-redo-asg]').forEach(btn => {
          const sub = mySubs.get(btn.dataset.redoAsg);
          const st = sub?.sticker ? getStickerInfo(sub.sticker) : null;
          if (!st) return;
          const info = btn.closest('.cls-cute-task')?.querySelector('.cls-task-info');
          if (info && !info.querySelector('.azota-sticker-pill')) {
            info.insertAdjacentHTML('beforeend', `<span class="azota-sticker-pill">${st.icon} ${t('Cô phê:', 'Teacher:')} ${t(st.vi, st.en)}</span>`);
          }
        });
      }, 60);
      handleIncomingHomeworkHash();
    };
  }

  const style = document.createElement('style');
  style.textContent = `
    .azota-quiz-badges{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:8px}
    .azota-badge{padding:3px 10px;border-radius:999px;font-size:11.5px;font-weight:800;background:#eef6f0;color:#24523a}
    .azota-badge.is-exam{background:#fff0f0;color:#c92a2a}
    .azota-badge.is-easy{background:#ebfbee;color:#2b8a3e}
    .azota-badge.is-medium{background:#e7f5ff;color:#1864ab}
    .azota-badge.is-hard{background:#f3f0ff;color:#5f3dc4}
    .azota-dist-box{margin:10px 0;padding:12px;border-radius:14px;background:#f7fbf8;border:1.5px solid #dcebe0}
    .azota-dist-bars{display:grid;gap:6px;margin-top:8px}
    .azota-dist-bars>div{display:grid;grid-template-columns:86px 1fr 28px;align-items:center;gap:8px;font-size:12px}
    .azota-bar{height:10px;border-radius:999px;background:#e5eee7;overflow:hidden}
    .azota-bar i{display:block;height:100%;border-radius:999px}
    .azota-wrong-box{margin:10px 0;padding:10px 12px;border-radius:12px;background:#fff5f5;border:1px solid #ffd8d8;display:grid;gap:4px;font-size:12.5px}
    .azota-sticker-select{font-size:12px;padding:4px 6px;border-radius:8px;border:1px solid #cde2d3;background:#fff}
    .azota-sticker-pill{display:inline-block;margin-top:3px;padding:2px 8px;border-radius:999px;background:#fff3cf;color:#995c00;font-size:11.5px;font-weight:800}
    .azota-assign-opts{display:grid;gap:8px;padding:10px;border-radius:12px;background:#f4f9f5;border:1px solid #dcebe0}
    body.dark-mode .azota-dist-box,body.dark-mode .azota-assign-opts{background:#1c2620;border-color:#2f4036}
    body.dark-mode .azota-wrong-box{background:#2a1c1c;border-color:#4b2b2b}
    body.dark-mode .azota-sticker-select{background:#1c2620;color:#e6f4ea;border-color:#2f4036}
  `;
  document.head.append(style);

  if (typeof window !== 'undefined') {
    window.TEACHER_STICKERS = TEACHER_STICKERS;
    window.buildHomeworkShareLink = buildHomeworkShareLink;
    window.parseHomeworkShareHash = parseHomeworkShareHash;
    window.bulkImportStudentsToClassroom = bulkImportStudentsToClassroom;
    window.generateMatrixQuestions = generateMatrixQuestions;
    window.shuffleForStudent = shuffleForStudent;
    window.computeScoreDistribution = computeScoreDistribution;
    window.autoStickerForScore = autoStickerForScore;
    window.giveStickerToSubmission = giveStickerToSubmission;
  }
  if (typeof global !== 'undefined') {
    global.TEACHER_STICKERS = TEACHER_STICKERS;
    global.buildHomeworkShareLink = buildHomeworkShareLink;
    global.parseHomeworkShareHash = parseHomeworkShareHash;
    global.bulkImportStudentsToClassroom = bulkImportStudentsToClassroom;
    global.generateMatrixQuestions = generateMatrixQuestions;
    global.shuffleForStudent = shuffleForStudent;
    global.computeScoreDistribution = computeScoreDistribution;
    global.autoStickerForScore = autoStickerForScore;
    global.giveStickerToSubmission = giveStickerToSubmission;
  }

  handleIncomingHomeworkHash();
})();
