'use strict';
// Teacher & Parent Tools: Common Class Mistakes Analytics, Classroom Weekly CSV Export, and Worksheet QR Code
(() => {
  function analyzeCommonMistakes(gradeFilter = null) {
    const users = typeof getLocalUsers === 'function' ? getLocalUsers() : {};
    const counts = new Map();

    for (const u of Object.values(users)) {
      if (!u || u.role === 'admin' || u.username === 'admin') continue;
      if (gradeFilter && Number(u.grade) !== Number(gradeFilter)) continue;

      let uState = null;
      try { uState = JSON.parse(localStorage.getItem('numi-user-state-' + u.username) || 'null'); } catch {}
      if (!uState) continue;

      for (const m of (uState.mistakes || [])) {
        const skill = String(m?.skill || 'natural:+');
        const entry = counts.get(skill) || { skill, mistakeCount: 0, students: new Set(), sampleQ: m?.q || '' };
        entry.mistakeCount++;
        entry.students.add(u.username);
        if (!entry.sampleQ && m?.q) entry.sampleQ = m.q;
        counts.set(skill, entry);
      }
    }

    return Array.from(counts.values())
      .map(item => ({
        skill: item.skill,
        label: typeof skillName === 'function' ? skillName(item.skill) : item.skill,
        mistakeCount: item.mistakeCount,
        studentCount: item.students.size,
        sampleQ: item.sampleQ
      }))
      .sort((a, b) => b.mistakeCount - a.mistakeCount)
      .slice(0, 5);
  }

  function buildClassroomWeeklyCsv(room, assignments, submissions) {
    const headers = [
      'Lớp học',
      'Khối lớp',
      'Bài tập',
      'Hạn nộp',
      'Học sinh',
      'Số câu đúng',
      'Tổng số câu',
      'Tỉ lệ đúng (%)',
      'Tốc độ TB (s)',
      'Thời gian nộp'
    ];

    const csvSafe = val => {
      let s = String(val ?? '').replace(/"/g, '""');
      if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
      return `"${s}"`;
    };

    const rows = [];
    const roomAsgs = (assignments || []).filter(a => a.classroom_id === room.id);
    for (const asg of roomAsgs) {
      const subs = (submissions || []).filter(s => s.assignment_id === asg.id);
      if (subs.length === 0) {
        rows.push([
          csvSafe(room.name),
          csvSafe(`Lớp ${room.grade}`),
          csvSafe(asg.title),
          csvSafe(asg.due_date || ''),
          csvSafe('Chưa có học sinh nộp'),
          0, 0, '0%', 0, csvSafe('')
        ]);
      } else {
        for (const sub of subs) {
          const pct = sub.total > 0 ? Math.round((sub.correct / sub.total) * 100) : 0;
          rows.push([
            csvSafe(room.name),
            csvSafe(`Lớp ${room.grade}`),
            csvSafe(asg.title),
            csvSafe(asg.due_date || ''),
            csvSafe(sub.student_id),
            sub.correct,
            sub.total,
            `${pct}%`,
            sub.avg_time || 0,
            csvSafe(sub.completed_at ? new Date(sub.completed_at).toLocaleString('vi-VN') : '')
          ]);
        }
      }
    }

    return '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  }

  async function exportClassroomWeeklyCSV(roomId) {
    if (typeof fetchTeacherOverview !== 'function') return;
    const data = await fetchTeacherOverview();
    const room = data.classrooms.find(c => c.id === roomId);
    if (!room) return;
    const csvContent = buildClassroomWeeklyCsv(room, data.assignments, data.submissions);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NumiQuick-Bao-Cao-${String(room.join_code || 'Lop')}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast(t('Đã xuất báo cáo tuần của lớp!', 'Exported classroom weekly report!'));
  }

  // Enhance renderClassroomManager with Common Mistakes card and Export CSV button
  const classroomBeforeTools = typeof renderClassroomManager === 'function' ? renderClassroomManager : null;
  if (classroomBeforeTools) {
    renderClassroomManager = async function () {
      await classroomBeforeTools();
      const viewEl = $('.classroom-view');
      if (!viewEl) return;

      const common = analyzeCommonMistakes();
      if (!$('#commonMistakesCard')) {
        const card = document.createElement('div');
        card.id = 'commonMistakesCard';
        card.className = 'card common-mistakes-card';
        card.innerHTML = `
          <h3>📊 ${t('Phân tích lỗi sai phổ biến của học sinh', 'Common Student Mistakes Analysis')}</h3>
          ${common.length === 0
            ? `<p class="muted">${t('Chưa có dữ liệu câu sai nào từ học sinh.', 'No student mistake data recorded yet.')}</p>`
            : `<div class="common-mistakes-list">${common.map(item => `<div class="cm-row">
                <div><b>${esc(item.label)}</b><small>${t('Ví dụ:', 'Sample:')} ${esc(item.sampleQ)}</small></div>
                <span class="mistake-pill">${item.mistakeCount} ${t('lỗi', 'errors')} · ${item.studentCount} ${t('HS', 'students')}</span>
              </div>`).join('')}</div>`}
        `;
        const grid = viewEl.querySelector('.classroom-grid');
        if (grid) grid.before(card);
        else viewEl.append(card);
      }

      $$('[data-assign-room]').forEach(btn => {
        const head = btn.closest('.classroom-card-head');
        if (!head || head.querySelector('[data-export-room]')) return;
        const expBtn = document.createElement('button');
        expBtn.type = 'button';
        expBtn.className = 'ghost';
        expBtn.dataset.exportRoom = btn.dataset.assignRoom;
        expBtn.textContent = t('Xuất CSV', 'Export CSV');
        expBtn.onclick = () => exportClassroomWeeklyCSV(btn.dataset.assignRoom);
        btn.before(expBtn);
      });
    };
    if (typeof window !== 'undefined') window.renderClassroomManager = renderClassroomManager;
    if (typeof global !== 'undefined') global.renderClassroomManager = renderClassroomManager;
  }

  // Enhance renderWorksheet with QR code for parents/students
  const worksheetBeforeTools = typeof renderWorksheet === 'function' ? renderWorksheet : null;
  if (worksheetBeforeTools) {
    renderWorksheet = function () {
      worksheetBeforeTools();
      const footer = $('.worksheet-footer');
      if (!footer || footer.querySelector('.worksheet-qr')) return;
      const targetUrl = (typeof location !== 'undefined' && location.href ? location.href.split('#')[0] : 'https://kimtham18301-arch.github.io/numiquest/') + '#setup';
      const qrSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=' + encodeURIComponent(targetUrl);
      footer.insertAdjacentHTML('beforeend', `<div class="worksheet-qr"><img src="${qrSrc}" width="72" height="72" alt="QR Code" onerror="this.style.display='none'"><small>${t('Quét mã để luyện trực tuyến', 'Scan to practice online')}</small></div>`);
    };
    if (typeof window !== 'undefined') window.renderWorksheet = renderWorksheet;
    if (typeof global !== 'undefined') global.renderWorksheet = renderWorksheet;
  }

  const style = document.createElement('style');
  style.textContent = `
    .common-mistakes-card{margin-top:14px}
    .common-mistakes-card h3{margin:0 0 10px;font-size:16px}
    .common-mistakes-list{display:grid;gap:8px}
    .cm-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 12px;border-radius:10px;background:#fdf6f6;border:1px solid #f4d8d8}
    .cm-row b{display:block;font-size:14px}
    .cm-row small{display:block;color:#6c5b5b;font-size:12px}
    .worksheet-qr{display:inline-flex;flex-direction:column;align-items:center;gap:4px;margin-top:8px}
    .worksheet-qr small{font-size:11px;color:#5f7466}
    body.dark-mode .cm-row{background:#2a1d1d;border-color:#4b2c2c}
  `;
  document.head.append(style);

  if (typeof window !== 'undefined') {
    window.analyzeCommonMistakes = analyzeCommonMistakes;
    window.buildClassroomWeeklyCsv = buildClassroomWeeklyCsv;
    window.exportClassroomWeeklyCSV = exportClassroomWeeklyCSV;
  }
  if (typeof global !== 'undefined') {
    global.analyzeCommonMistakes = analyzeCommonMistakes;
    global.buildClassroomWeeklyCsv = buildClassroomWeeklyCsv;
    global.exportClassroomWeeklyCSV = exportClassroomWeeklyCSV;
  }
})();
