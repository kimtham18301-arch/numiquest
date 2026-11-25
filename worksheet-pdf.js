// Printable A4 Worksheet & Exam Composer with Column Arithmetic Grids & Answer Key PDF (v2.12.0)
(() => {
  'use strict';

  let wsState = {
    grade: 3,
    topics: [],
    count: 10,
    format: 'mixed', // 'mixed' | 'essay' | 'mcq'
    includeAnswerKey: true,
    title: '',
    subtitle: '',
    durationMin: 20,
    examCode: '01',
    questions: []
  };

  function defaultTitleFor(grade, topics) {
    const g = Number(grade) || 1;
    if (topics && topics.length === 1 && typeof NUMI_GRADE_TOPICS !== 'undefined' && NUMI_GRADE_TOPICS[g]) {
      const meta = NUMI_GRADE_TOPICS[g].find(x => x.id === topics[0]);
      if (meta) return t(`PHIẾU LUYỆN TẬP TOÁN LỚP ${g} — ${meta.vi.toUpperCase()}`, `GRADE ${g} MATH WORKSHEET — ${meta.en.toUpperCase()}`);
    }
    return t(`ĐỀ ÔN TẬP TỔNG HỢP TOÁN LỚP ${g}`, `GRADE ${g} COMPREHENSIVE MATH WORKSHEET`);
  }

  function makeSingleWorksheetQuestion(grade, topics, forceFormat) {
    const g = Number(grade) || 1;
    const gDef = (typeof NUMI_GRADES !== 'undefined' && NUMI_GRADES[g]) ? NUMI_GRADES[g] : { ops: ['+', '-'], types: ['natural'], digits: [1, 2] };
    const cleanTopics = Array.isArray(topics) ? topics.filter(id => id && id !== 'all') : [];
    const cfg = {
      ...(typeof defaults !== 'undefined' ? defaults : {}),
      ...gDef,
      grade: g,
      ops: [...(gDef.ops || ['+', '-'])],
      types: [...(gDef.types || ['natural'])],
      type: (gDef.types && gDef.types[0]) || 'natural',
      digits: [...(gDef.digits || [1, 2])],
      questionStyle: 'normal',
      topic: cleanTopics.length === 1 ? cleanTopics[0] : 'all',
      topics: cleanTopics
    };
    const q = typeof generate === 'function' ? generate(cfg) : null;
    if (!q) return null;
    const colSpec = typeof parseColumnArithmetic === 'function' ? parseColumnArithmetic(q.q) : null;
    return {
      ...q,
      colSpec: (colSpec && (colSpec.hasDec || colSpec.totalCols >= 2 || g <= 5)) ? colSpec : null,
      forceFormat: forceFormat || null
    };
  }

  function generateWorksheetQuestions(grade, topics, count) {
    const out = [];
    const seenQ = new Set();
    let tries = 0;
    while (out.length < count && tries < count * 8) {
      tries++;
      const q = makeSingleWorksheetQuestion(grade, topics);
      if (!q) break;
      const key = String(q.q || '').trim();
      if (seenQ.has(key) && tries < count * 5) continue;
      seenQ.add(key);
      out.push(q);
    }
    return out;
  }

  function buildPrintPlaceHeaders(spec) {
    const intVi = ['Đ.vị', 'Chục', 'Trăm', 'Nghìn', 'C.ng', 'Tr.ng', 'Tr'];
    const decVi = ['P.10', 'P.100', 'P.1000'];
    const intCount = spec.commaCol >= 0 ? spec.commaCol : spec.totalCols;
    const out = [];
    for (let c = 0; c < spec.totalCols; c++) {
      if (c === spec.commaCol) out.push(',');
      else if (c < intCount) out.push(intVi[intCount - 1 - c] || '');
      else out.push(decVi[c - spec.commaCol - 1] || '');
    }
    return out;
  }

  function renderPrintableColumnGrid(spec) {
    const headers = buildPrintPlaceHeaders(spec);
    return `<table class="ws-col-tbl">
      <thead>
        <tr>
          <th class="ws-op-h">Hàng</th>
          ${headers.map((h, c) => `<th class="${c === spec.commaCol ? 'ws-cm' : ''}">${esc(h)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        <tr class="ws-carry-r">
          <td class="ws-op-c ws-carry-t">Nhớ</td>
          ${headers.map((_, c) => `<td class="${c === spec.commaCol ? 'ws-cm' : ''}">&nbsp;</td>`).join('')}
        </tr>
        <tr>
          <td class="ws-op-c">&nbsp;</td>
          ${spec.rowA.map((ch, c) => `<td class="${c === spec.commaCol ? 'ws-cm ws-cm-g' : 'ws-d'}">${ch === ' ' ? '&nbsp;' : esc(ch)}</td>`).join('')}
        </tr>
        <tr>
          <td class="ws-op-c ws-op-sym">${esc(spec.op)}</td>
          ${spec.rowB.map((ch, c) => `<td class="${c === spec.commaCol ? 'ws-cm ws-cm-g' : 'ws-d'}">${ch === ' ' ? '&nbsp;' : esc(ch)}</td>`).join('')}
        </tr>
        <tr class="ws-ans-r">
          <td class="ws-op-c ws-op-sym">=</td>
          ${headers.map((_, c) => `<td class="${c === spec.commaCol ? 'ws-cm ws-cm-g' : 'ws-blank'}">${c === spec.commaCol ? ',' : '&nbsp;'}</td>`).join('')}
        </tr>
      </tbody>
    </table>`;
  }

  function formatPromptPlain(qStr) {
    const s = String(qStr || '').trim();
    return (s.includes('?') || s.includes('=')) ? esc(s) : `${esc(s)} = ?`;
  }

  function buildWorksheetSheetHTML(stateObj, interactivePreview = false) {
    const qs = stateObj.questions || [];
    const g = Number(stateObj.grade) || 1;
    const title = (stateObj.title || defaultTitleFor(g, stateObj.topics)).trim();
    const subtitle = (stateObj.subtitle || t(`Môn: Toán · Lớp ${g} (Chuẩn GDPT 2018)`, `Subject: Maths · Grade ${g}`)).trim();
    const today = new Date().toLocaleDateString('vi-VN');

    const renderSwapBtn = idx => interactivePreview
      ? `<button type="button" class="ws-swap-btn no-print" data-ws-swap="${idx}" title="${t('Đổi câu khác', 'Swap this question')}">↻</button>`
      : '';

    let bodyHtml = '';
    if (stateObj.format === 'mcq') {
      bodyHtml = `<div class="ws-section-title">${t('PHẦN TRẮC NGHIỆM (Khoanh tròn vào chữ cái đặt trước câu trả lời đúng)', 'MULTIPLE CHOICE (Circle the correct letter)')}</div>
        <div class="ws-mcq-grid">
          ${qs.map((q, i) => `<div class="ws-q-box">
            <div class="ws-q-head">
              <span class="ws-q-num">${t('Câu', 'Q')} ${i + 1}.</span>
              <span class="ws-q-text">${formatPromptPlain(q.q)}</span>
              ${renderSwapBtn(i)}
            </div>
            <div class="ws-mcq-opts">
              ${(q.options || []).map((opt, oi) => `<span><b>${'ABCD'[oi]}.</b> ${esc(String(opt))}</span>`).join('')}
            </div>
          </div>`).join('')}
        </div>`;
    } else if (stateObj.format === 'essay') {
      const colItems = [];
      const textItems = [];
      qs.forEach((q, i) => {
        if (q.colSpec) colItems.push({ q, i });
        else textItems.push({ q, i });
      });
      if (colItems.length) {
        bodyHtml += `<div class="ws-section-title">${t('PHẦN I. ĐẶT TÍNH RỒI TÍNH', 'PART I. COLUMN ARITHMETIC')}</div>
          <div class="ws-col-grid">
            ${colItems.map(({ q, i }) => `<div class="ws-col-card">
              <div class="ws-q-head">
                <span class="ws-q-num">${t('Câu', 'Q')} ${i + 1}.</span>
                <span class="ws-q-text">${formatPromptPlain(q.q)}</span>
                ${renderSwapBtn(i)}
              </div>
              ${renderPrintableColumnGrid(q.colSpec)}
            </div>`).join('')}
          </div>`;
      }
      if (textItems.length) {
        bodyHtml += `<div class="ws-section-title">${colItems.length ? t('PHẦN II. TÍNH NHẨM & TỰ LUẬN', 'PART II. MENTAL MATH & WORD PROBLEMS') : t('BÀI TẬP TỰ LUẬN', 'WRITTEN EXERCISES')}</div>
          <div class="ws-essay-list">
            ${textItems.map(({ q, i }) => `<div class="ws-essay-item">
              <div class="ws-q-head">
                <span class="ws-q-num">${t('Câu', 'Q')} ${i + 1}.</span>
                <span class="ws-q-text">${formatPromptPlain(q.q)}</span>
                ${renderSwapBtn(i)}
              </div>
              <div class="ws-write-lines">
                <span>${t('Bài làm / Trả lời:', 'Answer:')} ..................................................................................................................</span>
                ${String(q.q || '').length > 28 ? '<span>......................................................................................................................................</span>' : ''}
              </div>
            </div>`).join('')}
          </div>`;
      }
    } else {
      // 'mixed': Part I (MCQ — non-column questions up to half) + Part II (Column arithmetic grids + written essay)
      const part2 = [];
      const part1 = [];
      const half = Math.ceil(qs.length / 2);
      qs.forEach((q, i) => {
        if (q.colSpec) part2.push({ q, i });
        else if (part1.length < half) part1.push({ q, i });
        else part2.push({ q, i });
      });
      if (part1.length) {
        bodyHtml += `<div class="ws-section-title">${t('PHẦN I. TRẮC NGHIỆM (Khoanh tròn vào chữ cái trước đáp án đúng)', 'PART I. MULTIPLE CHOICE')}</div>
          <div class="ws-mcq-grid">
            ${part1.map(({ q, i }) => `<div class="ws-q-box">
              <div class="ws-q-head">
                <span class="ws-q-num">${t('Câu', 'Q')} ${i + 1}.</span>
                <span class="ws-q-text">${formatPromptPlain(q.q)}</span>
                ${renderSwapBtn(i)}
              </div>
              <div class="ws-mcq-opts">
                ${(q.options || []).map((opt, oi) => `<span><b>${'ABCD'[oi]}.</b> ${esc(String(opt))}</span>`).join('')}
              </div>
            </div>`).join('')}
          </div>`;
      }
      if (part2.length) {
        const colPart = part2.filter(x => x.q.colSpec);
        const essayPart = part2.filter(x => !x.q.colSpec);
        bodyHtml += `<div class="ws-section-title">${t('PHẦN II. ĐẶT TÍNH RỒI TÍNH & TỰ LUẬN', 'PART II. COLUMN ARITHMETIC & WRITTEN')}</div>`;
        if (colPart.length) {
          bodyHtml += `<div class="ws-col-grid">
            ${colPart.map(({ q, i }) => `<div class="ws-col-card">
              <div class="ws-q-head">
                <span class="ws-q-num">${t('Câu', 'Q')} ${i + 1}.</span>
                <span class="ws-q-text">${formatPromptPlain(q.q)}</span>
                ${renderSwapBtn(i)}
              </div>
              ${renderPrintableColumnGrid(q.colSpec)}
            </div>`).join('')}
          </div>`;
        }
        if (essayPart.length) {
          bodyHtml += `<div class="ws-essay-list">
            ${essayPart.map(({ q, i }) => `<div class="ws-essay-item">
              <div class="ws-q-head">
                <span class="ws-q-num">${t('Câu', 'Q')} ${i + 1}.</span>
                <span class="ws-q-text">${formatPromptPlain(q.q)}</span>
                ${renderSwapBtn(i)}
              </div>
              <div class="ws-write-lines">
                <span>${t('Bài làm / Trả lời:', 'Answer:')} ..................................................................................................................</span>
              </div>
            </div>`).join('')}
          </div>`;
        }
      }
    }

    const answerKeyHtml = stateObj.includeAnswerKey ? `
      <div class="ws-answer-page">
        <div class="ws-ans-head">
          <strong>${t('ĐÁP ÁN & HƯỚNG DẪN CHẤM', 'ANSWER KEY & SOLUTIONS')}</strong>
          <span>${esc(title)} · ${t('Mã đề', 'Code')}: ${esc(stateObj.examCode)}</span>
        </div>
        <table class="ws-ans-table">
          <thead>
            <tr>
              <th style="width:58px">${t('Câu', 'Q')}</th>
              <th style="width:28%">${t('Đề bài', 'Question')}</th>
              <th style="width:16%">${t('Đáp án', 'Answer')}</th>
              <th>${t('Hướng dẫn giải nhanh', 'Explanation')}</th>
            </tr>
          </thead>
          <tbody>
            ${qs.map((q, i) => `<tr>
              <td style="text-align:center;font-weight:800">${i + 1}</td>
              <td>${formatPromptPlain(q.q)}</td>
              <td style="text-align:center;font-weight:900;color:#1b5a3c">${esc(String(q.answer))}</td>
              <td>${esc(String(q.explanation || '').replace(/\n/g, ' · '))}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    ` : '';

    return `
      <div class="ws-a4-paper">
        <div class="ws-header">
          <div class="ws-hdr-left">
            <div class="ws-brand">NUMIQUICK · ${t('PHIẾU ĐỀ ÔN TẬP', 'MATH WORKSHEET')}</div>
            <div class="ws-sub">${esc(subtitle)}</div>
            <div class="ws-meta-line">${t('Ngày:', 'Date:')} ${today} · ${t('Mã đề:', 'Code:')} <b>${esc(stateObj.examCode)}</b> · ${t('Thời gian:', 'Time:')} <b>${stateObj.durationMin} ${t('phút', 'min')}</b></div>
          </div>
          <div class="ws-hdr-right">
            <div>${t('Họ và tên:', 'Full name:')} ........................................</div>
            <div>${t('Lớp:', 'Class:')} .................. &nbsp; ${t('Điểm:', 'Score:')} ..............</div>
          </div>
        </div>
        <h2 class="ws-main-title">${esc(title)}</h2>
        ${bodyHtml}
        <div class="ws-footer-note">${t('— Hết — Chúc em làm bài thật cẩn thận và đạt điểm cao!', '— End — Good luck!')}</div>
      </div>
      ${answerKeyHtml}
    `;
  }

  function printCurrentWorksheet() {
    if (typeof document === 'undefined') return;
    let sheet = document.getElementById('numiPrintSheet');
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.id = 'numiPrintSheet';
      sheet.className = 'numi-print-sheet';
      document.body.append(sheet);
    }
    sheet.innerHTML = buildWorksheetSheetHTML(wsState, false);
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  }

  function openWorksheetComposer(preset = {}) {
    const startGrade = Number(preset.grade || (typeof config !== 'undefined' && config.grade && config.grade !== 'custom' ? config.grade : 3)) || 3;
    const startTopics = Array.isArray(preset.topics)
      ? [...preset.topics]
      : (typeof config !== 'undefined' && Array.isArray(config.topics) && config.topics.length ? [...config.topics] : []);
    const startCount = Number(preset.count || (startGrade <= 2 ? 10 : 12));

    wsState = {
      grade: startGrade,
      topics: startTopics,
      count: [8, 10, 12, 15, 20].includes(startCount) ? startCount : 10,
      format: startGrade <= 5 ? 'mixed' : 'mcq',
      includeAnswerKey: true,
      title: defaultTitleFor(startGrade, startTopics),
      subtitle: t(`Môn: Toán · Lớp ${startGrade} (Chuẩn GDPT 2018)`, `Subject: Maths · Grade ${startGrade}`),
      durationMin: startGrade <= 2 ? 15 : 20,
      examCode: '01',
      questions: []
    };
    wsState.questions = generateWorksheetQuestions(wsState.grade, wsState.topics, wsState.count);

    const renderComposerModal = () => {
      const topicList = (typeof NUMI_GRADE_TOPICS !== 'undefined' && NUMI_GRADE_TOPICS[wsState.grade]) || [];
      const isAllTopics = wsState.topics.length === 0;

      modal(`<div class="ws-composer">
        <div class="ws-comp-top">
          <div>
            <span class="eyebrow">NUMIQUICK · ${t('SOẠN ĐỀ & IN PHIẾU PDF (KHỔ A4)', 'A4 WORKSHEET & PDF COMPOSER')}</span>
            <h2 style="margin:2px 0 0">🖨️ ${t('Soạn đề sẵn & Xuất file PDF', 'Compose Printable Worksheet PDF')}</h2>
          </div>
          <div class="ws-comp-actions">
            <button type="button" class="ws-btn-sec" id="wsRegenAllBtn">🔄 ${t('Đổi mã đề mới', 'New Version')}</button>
            <button type="button" class="primary" id="wsPrintPdfBtn">🖨️ ${t('In / Lưu PDF (A4)', 'Print / Save PDF')}</button>
            <button type="button" class="ws-btn-sec" id="wsCloseModalBtn">✕</button>
          </div>
        </div>

        <div class="ws-controls-bar">
          <label>${t('Khối lớp', 'Grade')}
            <select id="wsGradeSel">
              ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => `<option value="${g}" ${wsState.grade === g ? 'selected' : ''}>${t('Lớp', 'Grade')} ${g}</option>`).join('')}
            </select>
          </label>
          <label>${t('Số câu', 'Questions')}
            <select id="wsCountSel">
              ${[8, 10, 12, 15, 20].map(n => `<option value="${n}" ${wsState.count === n ? 'selected' : ''}>${n} ${t('câu', 'qs')}</option>`).join('')}
            </select>
          </label>
          <label>${t('Hình thức đề', 'Format')}
            <select id="wsFormatSel">
              <option value="mixed" ${wsState.format === 'mixed' ? 'selected' : ''}>${t('Kết hợp (Trắc nghiệm + Đặt tính & Tự luận)', 'Mixed (MCQ + Column + Essay)')}</option>
              <option value="essay" ${wsState.format === 'essay' ? 'selected' : ''}>${t('Tự luận + Kẻ bảng đặt tính ô ly', 'Written + Column Grids')}</option>
              <option value="mcq" ${wsState.format === 'mcq' ? 'selected' : ''}>${t('100% Trắc nghiệm (A, B, C, D)', '100% Multiple Choice')}</option>
            </select>
          </label>
          <label>${t('Thời gian (phút)', 'Time (min)')}
            <input type="number" id="wsDurInput" min="5" max="90" value="${wsState.durationMin}">
          </label>
          <label class="ws-title-field">${t('Tiêu đề phiếu đề', 'Worksheet Title')}
            <input type="text" id="wsTitleInput" value="${esc(wsState.title)}" maxlength="90">
          </label>
          <label class="ws-check-lbl">
            <input type="checkbox" id="wsAnsKeyCheck" ${wsState.includeAnswerKey ? 'checked' : ''}>
            <span>${t('Kèm trang Đáp án & Lời giải (trang riêng)', 'Include Answer Key page')}</span>
          </label>
        </div>

        <div class="ws-topic-strip">
          <span class="ws-topic-strip-lbl">${t('Chọn chuyên đề đưa vào đề:', 'Topics in worksheet:')}</span>
          <div class="ws-topic-pills">
            ${topicList.map(tp => {
              const on = tp.id === 'all' ? isAllTopics : wsState.topics.includes(tp.id);
              return `<button type="button" class="ws-tp-pill ${on ? 'active' : ''}" data-ws-topic="${esc(tp.id)}">${tp.id === 'all' ? '✨ ' : tp.col ? '📐 ' : ''}${esc(typeof lang !== 'undefined' && lang === 'en' ? tp.en : tp.vi)}</button>`;
            }).join('')}
          </div>
        </div>

        <div class="ws-preview-tip">💡 ${t('Xem trước khổ giấy A4 bên dưới. Chạm nút <b>↻</b> ở bất kỳ câu nào để đổi riêng câu đó, sau đó bấm <b>In / Lưu PDF (A4)</b> rồi chọn <i>Lưu dưới dạng PDF</i>.', 'Preview your A4 sheet below. Click <b>↻</b> on any question to replace it, then click <b>Print / Save PDF</b>.')}</div>

        <div class="ws-preview-stage" id="wsPreviewStage">
          ${buildWorksheetSheetHTML(wsState, true)}
        </div>
      </div>`);

      const modalEl = $('#modal');
      if (modalEl) modalEl.classList.add('ws-wide-modal');
      const defaultClose = $('#closeModal');
      if (defaultClose) defaultClose.style.display = 'none';

      const restoreModal = () => {
        if (modalEl) modalEl.classList.remove('ws-wide-modal');
        if (defaultClose) defaultClose.style.display = '';
      };
      if (modalEl && typeof modalEl.addEventListener === 'function') {
        modalEl.addEventListener('close', restoreModal, { once: true });
      }
      const closeClean = () => {
        restoreModal();
        if (modalEl && typeof modalEl.close === 'function') modalEl.close();
      };

      const refreshPreview = () => {
        const stage = $('#wsPreviewStage');
        if (stage) {
          stage.innerHTML = buildWorksheetSheetHTML(wsState, true);
          bindSwapButtons();
        }
      };

      const bindSwapButtons = () => {
        $$('[data-ws-swap]').forEach(btn => {
          btn.onclick = () => {
            const idx = Number(btn.dataset.wsSwap);
            const nextQ = makeSingleWorksheetQuestion(wsState.grade, wsState.topics);
            if (nextQ && Number.isInteger(idx) && idx >= 0 && idx < wsState.questions.length) {
              wsState.questions[idx] = nextQ;
              refreshPreview();
            }
          };
        });
      };

      $('#wsCloseModalBtn')?.addEventListener('click', closeClean);
      $('#wsPrintPdfBtn')?.addEventListener('click', () => printCurrentWorksheet());
      $('#wsRegenAllBtn')?.addEventListener('click', () => {
        const curNum = parseInt(wsState.examCode, 10) || 1;
        wsState.examCode = String((curNum % 99) + 1).padStart(2, '0');
        wsState.questions = generateWorksheetQuestions(wsState.grade, wsState.topics, wsState.count);
        refreshPreview();
      });

      $('#wsGradeSel')?.addEventListener('change', e => {
        wsState.grade = Number(e.target.value) || 1;
        wsState.topics = [];
        wsState.title = defaultTitleFor(wsState.grade, []);
        wsState.subtitle = t(`Môn: Toán · Lớp ${wsState.grade} (Chuẩn GDPT 2018)`, `Subject: Maths · Grade ${wsState.grade}`);
        wsState.questions = generateWorksheetQuestions(wsState.grade, wsState.topics, wsState.count);
        renderComposerModal();
      });

      $('#wsCountSel')?.addEventListener('change', e => {
        wsState.count = Number(e.target.value) || 10;
        wsState.questions = generateWorksheetQuestions(wsState.grade, wsState.topics, wsState.count);
        refreshPreview();
      });

      $('#wsFormatSel')?.addEventListener('change', e => {
        wsState.format = e.target.value || 'mixed';
        refreshPreview();
      });

      $('#wsDurInput')?.addEventListener('input', e => {
        wsState.durationMin = Math.max(5, Math.min(90, Number(e.target.value) || 20));
        refreshPreview();
      });

      $('#wsTitleInput')?.addEventListener('input', e => {
        wsState.title = e.target.value;
        refreshPreview();
      });

      $('#wsAnsKeyCheck')?.addEventListener('change', e => {
        wsState.includeAnswerKey = Boolean(e.target.checked);
        refreshPreview();
      });

      $$('[data-ws-topic]').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.wsTopic;
          if (id === 'all') {
            wsState.topics = [];
          } else {
            wsState.topics = wsState.topics.includes(id)
              ? wsState.topics.filter(x => x !== id)
              : [...wsState.topics, id];
          }
          wsState.title = defaultTitleFor(wsState.grade, wsState.topics);
          wsState.questions = generateWorksheetQuestions(wsState.grade, wsState.topics, wsState.count);
          renderComposerModal();
        };
      });

      bindSwapButtons();
    };

    renderComposerModal();
  }

  // Inject "🖨️ Soạn & In phiếu đề PDF" into Setup view (right under "Bắt đầu học →")
  const setupBeforeWs = typeof setup === 'function' ? setup : null;
  if (setupBeforeWs) {
    setup = function () {
      setupBeforeWs();
      const form = $('#config');
      const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
      if (form && submitBtn && !$('#openWorksheetPdfBtn')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'openWorksheetPdfBtn';
        btn.className = 'ws-launch-btn wide';
        btn.innerHTML = `🖨️ ${t('Soạn đề sẵn & In phiếu PDF (A4)', 'Compose & Print A4 PDF Worksheet')}`;
        btn.onclick = () => {
          const g = config?.grade && config.grade !== 'custom' ? Number(config.grade) : 3;
          const tps = Array.isArray(config?.topics) && config.topics.length ? [...config.topics] : (config?.topic && config.topic !== 'all' ? [config.topic] : []);
          const cnt = Number($('#lessonCount')?.value || config?.count || 10);
          openWorksheetComposer({ grade: g, topics: tps, count: cnt });
        };
        if (typeof submitBtn.insertAdjacentElement === 'function') {
          submitBtn.insertAdjacentElement('afterend', btn);
        } else {
          form.append(btn);
        }
      }
    };
    if (typeof window !== 'undefined') window.setup = setup;
    if (typeof global !== 'undefined') global.setup = setup;
  }

  // Inject "🖨️ Soạn & In đề PDF" into Teacher Workspace top action bar
  function injectTeacherPdfBtn() {
    const actionsBar = $('.admin-top-actions');
    if (actionsBar && !$('#tchOpenWorksheetPdfBtn')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'tchOpenWorksheetPdfBtn';
      btn.className = 'admin-btn ws-tch-pdf-btn';
      btn.innerHTML = `🖨️ ${t('Soạn & In đề PDF', 'Print Worksheet PDF')}`;
      btn.onclick = () => {
        const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
        openWorksheetComposer({ grade: u?.grade || 3, topics: [], count: 12 });
      };
      const createBtn = $('#tchCreateClassBtn');
      if (createBtn && typeof createBtn.insertAdjacentElement === 'function') {
        createBtn.insertAdjacentElement('afterend', btn);
      } else {
        actionsBar.prepend(btn);
      }
    }
  }
  const renderTchBeforeWs = typeof window !== 'undefined' && typeof window.renderTeacherWorkspace === 'function'
    ? window.renderTeacherWorkspace
    : null;
  if (renderTchBeforeWs) {
    const wrappedTch = function () {
      const r = renderTchBeforeWs.apply(this, arguments);
      injectTeacherPdfBtn();
      return r;
    };
    window.renderTeacherWorkspace = wrappedTch;
    if (typeof global !== 'undefined') global.renderTeacherWorkspace = wrappedTch;
  }
  if (typeof view !== 'undefined' && view === 'teacher') {
    injectTeacherPdfBtn();
  }

  // Inject styles (Screen composer UI + clean A4 @media print sheet!)
  if (typeof document !== 'undefined' && document.head) {
    const style = document.createElement('style');
    style.textContent = `
      .ws-launch-btn{margin-top:8px!important;min-height:46px!important;border-radius:14px!important;border:2px solid #b8d7c0!important;background:#f2faf4!important;color:#1e563a!important;font-size:15px!important;font-weight:800!important;cursor:pointer!important}
      .ws-launch-btn:hover{background:#e3f4e7!important;border-color:#68a77e!important}
      .ws-tch-pdf-btn{background:#eef8f0!important;border-color:#9bc9a9!important;color:#1b5639!important;font-weight:800!important}
      body.dark-mode .ws-launch-btn{background:#182e22!important;border-color:#325c44!important;color:#a9e5c3!important}
      body.dark-mode .ws-tch-pdf-btn{background:#1a3325!important;border-color:#35664b!important;color:#a9e5c3!important}

      dialog#modal.ws-wide-modal{width:min(96vw,980px)!important;max-width:980px!important;max-height:92vh!important;padding:16px 20px!important;overflow-y:auto!important}
      .ws-composer{display:grid;gap:12px}
      .ws-comp-top{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;border-bottom:1.5px solid #e2eee0;padding-bottom:10px}
      .ws-comp-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
      .ws-btn-sec{min-height:38px!important;padding:6px 12px!important;border-radius:10px!important;border:1.5px solid #cfe0cc!important;background:#fff!important;color:#274c36!important;font-weight:800!important;font-size:13px!important;cursor:pointer}
      .ws-controls-bar{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;background:#f6faf4;border:1.5px solid #dfebd9;border-radius:14px;padding:10px 12px}
      .ws-controls-bar label{display:flex;flex-direction:column;gap:4px;font-size:12px;font-weight:800;color:#2d523c;margin:0}
      .ws-controls-bar select,.ws-controls-bar input[type=text],.ws-controls-bar input[type=number]{min-height:36px!important;padding:5px 10px!important;border-radius:9px!important;border:1.5px solid #c9dec4!important;font-size:13px!important;background:#fff!important;color:#1f3d2d!important}
      .ws-title-field{grid-column:span 2}
      .ws-check-lbl{flex-direction:row!important;align-items:center!important;gap:8px!important;grid-column:1/-1;cursor:pointer;padding-top:2px}
      .ws-topic-strip{display:grid;gap:6px}
      .ws-topic-strip-lbl{font-size:12px;font-weight:800;color:#2d523c}
      .ws-topic-pills{display:flex;flex-wrap:wrap;gap:5px}
      .ws-tp-pill{min-height:28px!important;padding:4px 10px!important;border-radius:999px!important;border:1.5px solid #d1e2cb!important;background:#f8fcf6!important;color:#2c4d39!important;font-size:12px!important;font-weight:700!important;cursor:pointer}
      .ws-tp-pill.active,.ws-tp-pill.active:hover{background:#2d6a51!important;border-color:#1d4e39!important;color:#fff!important}
      .ws-preview-tip{font-size:12px;color:#4a6b56;background:#eef7ee;border-radius:10px;padding:7px 12px}
      .ws-preview-stage{background:#e7eee8;border-radius:14px;padding:16px;max-height:54vh;overflow-y:auto;display:grid;gap:16px}

      /* ===== A4 Worksheet Paper Styling (both preview and @media print) ===== */
      .ws-a4-paper,.ws-answer-page{background:#ffffff;color:#111827;border:1px solid #d4ded6;border-radius:8px;padding:20px 24px;box-shadow:0 4px 16px rgba(0,0,0,.06);font-family:'Nunito',Arial,sans-serif;line-height:1.45}
      .ws-header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;border-bottom:2px solid #224d36;padding-bottom:10px;margin-bottom:12px;font-size:12.5px}
      .ws-brand{font-weight:900;color:#1e563a;font-size:13px;letter-spacing:.03em}
      .ws-sub{font-weight:700;color:#374151;margin-top:2px}
      .ws-meta-line{color:#4b5563;margin-top:2px;font-size:12px}
      .ws-hdr-right{text-align:right;display:grid;gap:4px;font-weight:700;color:#1f2937;white-space:nowrap}
      .ws-main-title{text-align:center;font-size:18px;font-weight:900;color:#163d28;margin:4px 0 14px;text-transform:uppercase}
      .ws-section-title{font-size:13.5px;font-weight:900;color:#1b4d33;margin:12px 0 8px;padding:4px 10px;background:#eef6ef;border-left:4px solid #2b6a50;border-radius:4px}
      .ws-mcq-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px 14px}
      .ws-q-box{border:1px solid #dce6dd;border-radius:8px;padding:8px 10px;break-inside:avoid}
      .ws-q-head{display:flex;align-items:baseline;gap:6px;margin-bottom:6px;font-size:13.5px}
      .ws-q-num{font-weight:900;color:#1b5336;white-space:nowrap}
      .ws-q-text{font-weight:800;color:#111827;flex:1}
      .ws-swap-btn{min-height:22px!important;width:24px!important;height:22px!important;padding:0!important;border-radius:6px!important;border:1px solid #cdddc9!important;background:#f4faf3!important;color:#2b6346!important;font-size:13px!important;font-weight:800!important;cursor:pointer;flex-shrink:0}
      .ws-mcq-opts{display:grid;grid-template-columns:repeat(2,1fr);gap:4px 10px;font-size:13px;color:#1f2937}
      .ws-col-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
      .ws-col-card{border:1px solid #d5e2d6;border-radius:8px;padding:8px 10px;display:flex;flex-direction:column;align-items:center;break-inside:avoid}
      .ws-col-card .ws-q-head{width:100%}
      .ws-col-tbl{border-collapse:collapse;border:1.8px solid #527e62;margin:4px auto 2px;table-layout:fixed}
      .ws-col-tbl th,.ws-col-tbl td{border:1px solid #9ab9a3;text-align:center;vertical-align:middle;width:30px;height:24px;padding:0;font-size:15px;font-weight:800}
      .ws-col-tbl th{background:#ecf5ec;color:#1f4d35;font-size:9.5px;height:19px}
      .ws-col-tbl .ws-op-h,.ws-col-tbl .ws-op-c{width:30px;background:#f6faf5;font-size:10px;color:#2a5c42}
      .ws-col-tbl .ws-op-sym{font-size:16px;font-weight:900}
      .ws-col-tbl .ws-carry-r td{height:19px;background:#fffdf6}
      .ws-col-tbl .ws-carry-t{font-size:9px;color:#9a6b1e}
      .ws-col-tbl .ws-cm{width:14px!important;background:#fff5e6}
      .ws-col-tbl .ws-cm-g{color:#c2410c;font-weight:900}
      .ws-col-tbl .ws-ans-r td{border-top:2.4px solid #1b4b32!important;height:28px;background:#ffffff}
      .ws-essay-list{display:grid;gap:10px}
      .ws-essay-item{border:1px solid #dce6dd;border-radius:8px;padding:8px 12px;break-inside:avoid}
      .ws-write-lines{display:grid;gap:8px;margin-top:6px;font-size:12.5px;color:#6b7280}
      .ws-footer-note{text-align:center;font-size:12px;font-style:italic;color:#4b5563;margin-top:14px;padding-top:8px;border-top:1px dashed #cbd5cc}

      .ws-ans-head{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #224d36;padding-bottom:8px;margin-bottom:10px;font-size:13px;color:#1a4c32}
      .ws-ans-table{width:100%;border-collapse:collapse;font-size:12.5px}
      .ws-ans-table th,.ws-ans-table td{border:1px solid #c6d6c9;padding:5px 8px;text-align:left;vertical-align:top}
      .ws-ans-table th{background:#eef6ef;color:#1b4d33;font-weight:800}

      .numi-print-sheet{display:none}
      @media print {
        @page { size: A4 portrait; margin: 12mm; }
        body > *:not(#numiPrintSheet) { display: none !important; }
        #numiPrintSheet { display: block !important; background: #fff !important; }
        #numiPrintSheet .ws-a4-paper,
        #numiPrintSheet .ws-answer-page {
          border: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        #numiPrintSheet .ws-answer-page { page-break-before: always; break-before: page; }
        .no-print { display: none !important; }
      }
      @media (max-width: 720px) {
        .ws-mcq-grid,.ws-col-grid{grid-template-columns:1fr}
        .ws-title-field{grid-column:span 1}
        .ws-header{flex-direction:column}
        .ws-hdr-right{text-align:left}
      }
    `;
    document.head.append(style);
  }

  const exp = { openWorksheetComposer, generateWorksheetQuestions, buildWorksheetSheetHTML };
  if (typeof window !== 'undefined') Object.assign(window, exp);
  if (typeof global !== 'undefined') Object.assign(global, exp);
})();
