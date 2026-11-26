// Printable A4 Worksheet & Exam Composer — Separate Student Sheet (No Answers) & Answer Key Sheet (With Answers) (v2.12.1)
(() => {
  'use strict';

  let wsState = {
    grade: 3, // 1..9 or 'custom'
    topics: [],
    domainFilter: 'all', // 'all' | 'number' | 'geometry'
    difficultyMode: 'progressive', // 'progressive' | 'easy' | 'medium' | 'hard'
    customCfg: {
      ops: ['+', '-', '*', '/'],
      types: ['natural'],
      digits: [2],
      questionStyle: 'normal',
      termCount: 3
    },
    count: 10,
    format: 'mixed', // 'mixed' | 'essay' | 'mcq'
    previewTab: 'exam', // 'exam' (no answers) | 'answers' (with answers)
    title: '',
    subtitle: '',
    durationMin: 20,
    examCode: '01',
    questions: []
  };

  function defaultTitleFor(grade, topics, domainFilter = 'all') {
    if (grade === 'custom') {
      return t('PHIẾU LUYỆN TÍNH NHẨM & PHẢN XẠ PHÉP TÍNH', 'CUSTOM MENTAL MATH & CALCULATION WORKSHEET');
    }
    const g = Number(grade) || 1;
    if (topics && topics.length === 1 && typeof NUMI_GRADE_TOPICS !== 'undefined' && NUMI_GRADE_TOPICS[g]) {
      const meta = NUMI_GRADE_TOPICS[g].find(x => x.id === topics[0]);
      if (meta) return t(`PHIẾU LUYỆN TẬP TOÁN LỚP ${g} — ${meta.vi.toUpperCase()}`, `GRADE ${g} MATH WORKSHEET — ${meta.en.toUpperCase()}`);
    }
    if (g >= 6 && domainFilter === 'number') {
      return t(`ĐỀ KIỂM TRA SỐ HỌC LỚP ${g}`, `GRADE ${g} NUMBERS & ALGEBRA WORKSHEET`);
    }
    if (g >= 6 && domainFilter === 'geometry') {
      return t(`ĐỀ KIỂM TRA HÌNH HỌC LỚP ${g}`, `GRADE ${g} GEOMETRY WORKSHEET`);
    }
    return t(`ĐỀ ÔN TẬP TỔNG HỢP TOÁN LỚP ${g}`, `GRADE ${g} COMPREHENSIVE MATH WORKSHEET`);
  }

  function makePureCustomCalcQuestion(customCfg = {}) {
    const ops = Array.isArray(customCfg.ops) && customCfg.ops.length ? [...customCfg.ops] : ['+', '-'];
    const rawTypes = Array.isArray(customCfg.types) && customCfg.types.length ? [...customCfg.types] : ['natural'];
    const digits = Array.isArray(customCfg.digits) && customCfg.digits.length ? customCfg.digits.map(Number) : [2];
    let style = customCfg.questionStyle || 'normal';
    if (style === 'word') style = 'normal'; // Never generate word problems in Custom calculation mode!
    let types = [...rawTypes];
    if (style === 'convenient') types = ['natural'];
    else if (style === 'expression') {
      types = types.filter(x => x === 'natural' || x === 'fraction');
      if (!types.length) types = ['natural'];
    }
    const cfg = {
      ...(typeof defaults !== 'undefined' ? defaults : {}),
      grade: 'custom',
      ops,
      types,
      type: types[0] || 'natural',
      digits,
      questionStyle: style,
      termCount: Number(customCfg.termCount) || 3,
      topic: 'all',
      topics: []
    };
    let q = null;
    if (style === 'missing' && typeof generateMissingNumber === 'function') {
      q = generateMissingNumber(cfg);
    } else if ((style === 'convenient' || style === 'expression') && typeof customGenerate === 'function') {
      q = customGenerate(cfg);
    } else if (typeof plainGenerate === 'function') {
      q = plainGenerate(cfg);
    } else if (typeof generate === 'function') {
      q = generate(cfg);
    }
    if (!q) return null;
    return {
      ...q,
      isCustomCalc: true,
      columnReady: false,
      isColumnExercise: false
    };
  }

  function makeSingleWorksheetQuestion(grade, topics, opts = {}) {
    if (grade === 'custom') {
      return makePureCustomCalcQuestion(opts.customCfg || wsState.customCfg);
    }
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
      topics: cleanTopics,
      domainFilter: opts.domainFilter || 'all',
      difficultyMode: opts.difficultyMode || 'progressive'
    };
    const q = typeof generate === 'function' ? generate(cfg) : null;
    if (!q) return null;
    return {
      ...q,
      isColumnExercise: Boolean(q.columnReady)
    };
  }

  function generateWorksheetQuestions(grade, topics, count, opts = {}) {
    if (grade === 'custom') {
      const out = [];
      const seenQ = new Set();
      let tries = 0;
      const targetCnt = Math.max(1, Number(count) || 10);
      while (out.length < targetCnt && tries < targetCnt * 12) {
        tries++;
        const q = makePureCustomCalcQuestion(opts.customCfg || wsState.customCfg);
        if (!q) break;
        const key = String(q.q || '').trim();
        if (seenQ.has(key) && tries < targetCnt * 8) continue;
        seenQ.add(key);
        out.push(q);
      }
      return out;
    }
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
      topics: cleanTopics,
      domainFilter: opts.domainFilter || 'all',
      difficultyMode: opts.difficultyMode || 'progressive'
    };
    if (typeof generateUniqueQuestions === 'function') {
      const qs = generateUniqueQuestions(count, cfg);
      if (Array.isArray(qs) && qs.length) {
        return qs.map(q => ({ ...q, isColumnExercise: Boolean(q.columnReady) }));
      }
    }
    const out = [];
    const seenQ = new Set();
    let tries = 0;
    while (out.length < count && tries < count * 8) {
      tries++;
      const q = makeSingleWorksheetQuestion(grade, topics, opts);
      if (!q) break;
      const key = String(q.q || '').trim();
      if (seenQ.has(key) && tries < count * 5) continue;
      seenQ.add(key);
      out.push(q);
    }
    return out;
  }

  function formatPromptPlain(qStr) {
    const s = String(qStr || '').trim();
    const hasProse = /[a-zA-ZÀ-ỹ]{2,}/.test(s);
    if (!hasProse) {
      return (s.includes('?') || s.includes('=')) ? esc(s) : `${esc(s)} = ?`;
    }
    // For Vietnamese/English word problems & knowledge prompts, replace standalone placeholder " ?" with clean exam blanks " ……"
    const cleaned = s.replace(/(^|\s)\?(?=\s|$|[.,;:])/g, '$1……');
    return esc(cleaned);
  }

  function isOptCorrect(opt, answer) {
    if (typeof isAnswerMatch === 'function') return isAnswerMatch(opt, answer);
    return String(opt).trim() === String(answer).trim();
  }

  // Build either the Student Worksheet (withAnswers = false) OR the Graded Answer Key Sheet (withAnswers = true)
  function buildWorksheetSheetHTML(stateObj, options = {}) {
    const withAnswers = Boolean(typeof options === 'boolean' ? false : options.withAnswers);
    const interactivePreview = Boolean(typeof options === 'boolean' ? options : options.interactivePreview);
    const qs = stateObj.questions || [];
    const isCustom = stateObj.grade === 'custom';
    const g = isCustom ? 'custom' : (Number(stateObj.grade) || 1);
    const title = (stateObj.title || defaultTitleFor(g, stateObj.topics, stateObj.domainFilter)).trim();
    const subtitle = (stateObj.subtitle || (isCustom
      ? t('Chế độ: Tùy chỉnh — Luyện phản xạ tính nhẩm', 'Mode: Custom — Mental Math Speed Drill')
      : t(`Môn: Toán · Lớp ${g} (Chuẩn GDPT 2018)`, `Subject: Maths · Grade ${g}`))).trim();
    const today = new Date().toLocaleDateString('vi-VN');

    const renderSwapBtn = origIdx => interactivePreview
      ? `<button type="button" class="ws-swap-btn no-print" data-ws-swap="${origIdx}" title="${t('Đổi câu khác', 'Swap this question')}">↻</button>`
      : '';

    const renderMcqCard = (q, displayNum, origIdx) => `<div class="ws-q-box ${withAnswers ? 'is-ans-box' : ''}">
      <div class="ws-q-head">
        <span class="ws-q-num">${t('Câu', 'Q')} ${displayNum}.</span>
        <span class="ws-q-text">${formatPromptPlain(q.q)}</span>
        ${renderSwapBtn(origIdx)}
      </div>
      <div class="ws-mcq-opts">
        ${(q.options || []).map((opt, oi) => {
          const hit = withAnswers && isOptCorrect(opt, q.answer);
          return `<span class="${hit ? 'ws-opt-hit' : ''}"><b>${'ABCD'[oi]}.</b> ${esc(String(opt))}${hit ? ' ✓' : ''}</span>`;
        }).join('')}
      </div>
      ${withAnswers && q.explanation ? `<div class="ws-inline-sol">💡 ${esc(String(q.explanation).replace(/\n/g, ' · '))}</div>` : ''}
    </div>`;

    const renderColCard = (q, displayNum, origIdx) => `<div class="ws-col-card ${withAnswers ? 'is-ans-box' : ''}">
      <div class="ws-q-head">
        <span class="ws-q-num">${t('Câu', 'Q')} ${displayNum}.</span>
        <span class="ws-q-text">${formatPromptPlain(q.q)}</span>
        ${renderSwapBtn(origIdx)}
      </div>
      ${withAnswers
        ? `<div class="ws-essay-sol" style="width:100%;box-sizing:border-box"><b>✓ ${t('Đáp án:', 'Ans:')} ${esc(String(q.answer))}</b>${q.explanation ? `<div style="margin-top:3px;font-size:11.5px;color:#2b573e">${esc(String(q.explanation).replace(/\n/g, ' · '))}</div>` : ''}</div>`
        : `<div class="ws-blank-workbox" aria-label="${t('Ô trống tự đặt tính', 'Blank space for written calculation')}"></div>`}
    </div>`;

    const renderEssayItem = (q, displayNum, origIdx) => {
      const len = String(q.q || '').length;
      const baseExtra = len > 55 ? 2 : len > 24 ? 1 : 0;
      const extraLines = (g >= 6 || q.difficulty === 'hard') ? Math.max(2, baseExtra) : baseExtra;
      const tierTag = withAnswers && q.difficultyLabel ? ` <span style="font-size:11px;font-weight:800;color:#4b5563">[${esc(q.difficultyLabel)}]</span>` : '';
      return `<div class="ws-essay-item ${withAnswers ? 'is-ans-box' : ''}">
      <div class="ws-q-head">
        <span class="ws-q-num">${t('Câu', 'Q')} ${displayNum}.</span>
        <span class="ws-q-text">${formatPromptPlain(q.q)}${tierTag}</span>
        ${renderSwapBtn(origIdx)}
      </div>
      ${withAnswers
        ? `<div class="ws-essay-sol"><b>✓ ${t('Đáp án:', 'Answer:')} ${esc(String(q.answer))}</b>${q.explanation ? ` — <span>${esc(String(q.explanation).replace(/\n/g, ' · '))}</span>` : ''}</div>`
        : `<div class="ws-write-lines">
            <div class="ws-write-row"><span class="ws-write-lbl">${t('Bài làm / Trả lời:', 'Answer:')}</span><span class="ws-dot-fill"></span></div>
            ${Array.from({ length: extraLines }, () => '<div class="ws-write-row"><span class="ws-dot-fill"></span></div>').join('')}
          </div>`}
    </div>`;
    };

    let bodyHtml = '';
    const displayOrder = [];
    let seq = 0;

    if (stateObj.format === 'mcq') {
      const items = qs.map((q, origIdx) => {
        const displayNum = ++seq;
        displayOrder.push({ q, displayNum });
        return renderMcqCard(q, displayNum, origIdx);
      });
      bodyHtml = `<div class="ws-section-title">${t('PHẦN TRẮC NGHIỆM (Khoanh tròn vào chữ cái đặt trước câu trả lời đúng)', 'MULTIPLE CHOICE (Circle the correct letter)')}</div>
        <div class="ws-mcq-grid">${items.join('')}</div>`;
    } else if (stateObj.format === 'essay') {
      const colItems = [];
      const textItems = [];
      qs.forEach((q, origIdx) => {
        if (q.isColumnExercise) colItems.push({ q, origIdx });
        else textItems.push({ q, origIdx });
      });
      if (colItems.length) {
        const cards = colItems.map(({ q, origIdx }) => {
          const displayNum = ++seq;
          displayOrder.push({ q, displayNum });
          return renderColCard(q, displayNum, origIdx);
        });
        bodyHtml += `<div class="ws-section-title">${t('PHẦN I. ĐẶT TÍNH RỒI TÍNH', 'PART I. COLUMN ARITHMETIC')}</div>
          <div class="ws-col-grid">${cards.join('')}</div>`;
      }
      if (textItems.length) {
        const cards = textItems.map(({ q, origIdx }) => {
          const displayNum = ++seq;
          displayOrder.push({ q, displayNum });
          return renderEssayItem(q, displayNum, origIdx);
        });
        bodyHtml += `<div class="ws-section-title">${colItems.length ? t('PHẦN II. TÍNH NHẨM & TỰ LUẬN', 'PART II. MENTAL MATH & WORD PROBLEMS') : t('BÀI TẬP TỰ LUẬN', 'WRITTEN EXERCISES')}</div>
          <div class="ws-essay-list">${cards.join('')}</div>`;
      }
    } else {
      const part2 = [];
      const part1 = [];
      const half = Math.ceil(qs.length / 2);
      qs.forEach((q, origIdx) => {
        if (q.isColumnExercise) part2.push({ q, origIdx });
        else if (part1.length < half) part1.push({ q, origIdx });
        else part2.push({ q, origIdx });
      });
      if (part1.length) {
        const cards = part1.map(({ q, origIdx }) => {
          const displayNum = ++seq;
          displayOrder.push({ q, displayNum });
          return renderMcqCard(q, displayNum, origIdx);
        });
        bodyHtml += `<div class="ws-section-title">${t('PHẦN I. TRẮC NGHIỆM (Khoanh tròn vào chữ cái trước đáp án đúng)', 'PART I. MULTIPLE CHOICE')}</div>
          <div class="ws-mcq-grid">${cards.join('')}</div>`;
      }
      if (part2.length) {
        const colPart = part2.filter(x => x.q.isColumnExercise);
        const essayPart = part2.filter(x => !x.q.isColumnExercise);
        const part2Heading = colPart.length && essayPart.length
          ? t('PHẦN II. ĐẶT TÍNH RỒI TÍNH & TỰ LUẬN', 'PART II. COLUMN ARITHMETIC & WRITTEN')
          : colPart.length
            ? t('PHẦN II. ĐẶT TÍNH RỒI TÍNH', 'PART II. COLUMN ARITHMETIC')
            : t('PHẦN II. TỰ LUẬN', 'PART II. WRITTEN EXERCISES');
        bodyHtml += `<div class="ws-section-title">${part2Heading}</div>`;
        if (colPart.length) {
          const cards = colPart.map(({ q, origIdx }) => {
            const displayNum = ++seq;
            displayOrder.push({ q, displayNum });
            return renderColCard(q, displayNum, origIdx);
          });
          bodyHtml += `<div class="ws-col-grid">${cards.join('')}</div>`;
        }
        if (essayPart.length) {
          const cards = essayPart.map(({ q, origIdx }) => {
            const displayNum = ++seq;
            displayOrder.push({ q, displayNum });
            return renderEssayItem(q, displayNum, origIdx);
          });
          bodyHtml += `<div class="ws-essay-list">${cards.join('')}</div>`;
        }
      }
    }

    const quickKeyTable = withAnswers ? `
      <div class="ws-quick-key-wrap">
        <div class="ws-section-title">📋 ${t('BẢNG TRA ĐÁP ÁN NHANH (CHẤM BÀI)', 'QUICK ANSWER SUMMARY TABLE')}</div>
        <div class="ws-quick-key-grid">
          ${displayOrder.map(({ q, displayNum }) => `<div class="ws-qk-cell"><small>${t('Câu', 'Q')} ${displayNum}</small><b>${esc(String(q.answer))}</b></div>`).join('')}
        </div>
      </div>
    ` : '';

    return `
      <div class="ws-a4-paper ${withAnswers ? 'ws-paper-answers' : 'ws-paper-exam'}">
        <div class="ws-header">
          <div class="ws-hdr-left">
            <div class="ws-brand">NUMIQUICK · ${withAnswers ? t('BẢN ĐÁP ÁN & HƯỚNG DẪN CHẤM', 'ANSWER KEY & SOLUTIONS') : t('PHIẾU ĐỀ BÀI (KHÔNG ĐÁP ÁN)', 'STUDENT WORKSHEET')}</div>
            <div class="ws-sub">${esc(subtitle)}</div>
            <div class="ws-meta-line">${t('Ngày:', 'Date:')} ${today} · ${t('Mã đề:', 'Code:')} <b>${esc(stateObj.examCode)}</b> · ${t('Thời gian:', 'Time:')} <b>${stateObj.durationMin} ${t('phút', 'min')}</b></div>
          </div>
          <div class="ws-hdr-right">
            ${withAnswers
              ? `<div class="ws-ans-stamp">✅ ${t('BẢN CÓ ĐÁP ÁN', 'WITH ANSWERS')}</div><div style="font-size:11.5px;color:#4b5563">${t('Dành cho Giáo viên / Phụ huynh chấm bài', 'For Teacher / Parent grading')}</div>`
              : `<div class="ws-hdr-field"><span>${t('Họ và tên:', 'Full name:')}</span><span class="ws-hdr-dots" style="min-width:150px"></span></div><div class="ws-hdr-field"><span>${t('Lớp:', 'Class:')}</span><span class="ws-hdr-dots" style="min-width:64px"></span><span style="margin-left:8px">${t('Điểm:', 'Score:')}</span><span class="ws-hdr-dots" style="min-width:52px"></span></div>`}
          </div>
        </div>
        <h2 class="ws-main-title">${esc(title)}${withAnswers ? ` — ${t('ĐÁP ÁN', 'KEY')}` : ''}</h2>
        ${bodyHtml}
        ${quickKeyTable}
        <div class="ws-footer-note">${withAnswers ? t('— Hết bản Đáp án & Hướng dẫn chấm —', '— End of Answer Key —') : t('— Hết — Chúc em làm bài thật cẩn thận và đạt điểm cao!', '— End — Good luck!')}</div>
      </div>
    `;
  }

  function printWorksheetSheet(withAnswers = false) {
    if (typeof document === 'undefined') return;
    let sheet = document.getElementById('numiPrintSheet');
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.id = 'numiPrintSheet';
      sheet.className = 'numi-print-sheet';
      document.body.append(sheet);
    }
    sheet.innerHTML = buildWorksheetSheetHTML(wsState, { withAnswers: Boolean(withAnswers), interactivePreview: false });
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  }

  function openWorksheetComposer(preset = {}) {
    const isPresetCustom = preset.grade === 'custom' || (!preset.grade && typeof config !== 'undefined' && config.grade === 'custom');
    const startGrade = isPresetCustom
      ? 'custom'
      : (Number(preset.grade || (typeof config !== 'undefined' && config.grade && config.grade !== 'custom' ? config.grade : 3)) || 3);
    const startTopics = Array.isArray(preset.topics)
      ? [...preset.topics]
      : (typeof config !== 'undefined' && Array.isArray(config.topics) && config.topics.length ? [...config.topics] : []);
    const startCount = Number(preset.count || (startGrade === 'custom' ? 15 : startGrade <= 2 ? 10 : 12));
    const startDom = preset.domainFilter || (typeof config !== 'undefined' && config.domainFilter ? config.domainFilter : 'all');
    const startDiff = preset.difficultyMode || (typeof config !== 'undefined' && config.difficultyMode ? config.difficultyMode : 'progressive');
    const initCustom = preset.customCfg || {
      ops: Array.isArray(config?.ops) && config.ops.length ? [...config.ops] : ['+', '-'],
      types: Array.isArray(config?.types) && config.types.length ? [...config.types] : [config?.type || 'natural'],
      digits: Array.isArray(config?.digits) && config.digits.length ? config.digits.map(Number) : [2],
      questionStyle: (config?.questionStyle && config.questionStyle !== 'word') ? config.questionStyle : 'normal',
      termCount: Number(config?.termCount) || 3
    };

    wsState = {
      grade: startGrade,
      topics: startTopics,
      domainFilter: startGrade !== 'custom' && startGrade >= 6 ? startDom : 'all',
      difficultyMode: startDiff,
      customCfg: initCustom,
      count: [8, 10, 12, 15, 20, 30].includes(startCount) ? startCount : 12,
      format: startGrade === 'custom' ? 'essay' : 'mixed',
      previewTab: 'exam',
      title: defaultTitleFor(startGrade, startTopics, startGrade !== 'custom' && startGrade >= 6 ? startDom : 'all'),
      subtitle: startGrade === 'custom'
        ? t('Môn: Toán · Phiếu Luyện tính nhẩm & Phản xạ phép tính (Tùy chỉnh)', 'Subject: Maths · Pure Mental Math & Calculation Drill')
        : t(`Môn: Toán · Lớp ${startGrade} (Chuẩn GDPT 2018)`, `Subject: Maths · Grade ${startGrade}`),
      durationMin: startGrade === 'custom' ? 15 : (startGrade <= 2 ? 15 : startGrade >= 6 ? 45 : 25),
      examCode: '01',
      questions: []
    };
    const wsOpts = () => ({ domainFilter: wsState.domainFilter, difficultyMode: wsState.difficultyMode, customCfg: wsState.customCfg });
    wsState.questions = generateWorksheetQuestions(wsState.grade, wsState.topics, wsState.count, wsOpts());

    const renderComposerModal = () => {
      const isCustomMode = wsState.grade === 'custom';
      const fullList = !isCustomMode && (typeof NUMI_GRADE_TOPICS !== 'undefined' && NUMI_GRADE_TOPICS[wsState.grade]) ? NUMI_GRADE_TOPICS[wsState.grade] : [];
      const isSec = !isCustomMode && wsState.grade >= 6;
      const topicList = isSec && wsState.domainFilter !== 'all'
        ? fullList.filter(tp => tp.id === 'all' || tp.domain === wsState.domainFilter)
        : fullList;
      const isAllTopics = wsState.topics.length === 0;
      const showAnswers = wsState.previewTab === 'answers';
      const cc = wsState.customCfg || {};

      const customCalcStripHtml = `
        <div class="ws-custom-calc-box">
          <div class="ws-topic-strip-lbl">${t('Cấu hình bài tính toán thuần túy (Luyện tính nhẩm — không trộn lời văn / hình học):', 'Pure Calculation Drill Settings (Mental math only):')}</div>
          <div class="ws-custom-row">
            <div>
              <small>${t('Phép tính:', 'Operations:')}</small>
              <div class="ws-topic-pills">
                ${[['+', '+'], ['-', '−'], ['*', '×'], ['/', '÷']].map(([v, sym]) => `<button type="button" class="ws-tp-pill ${(cc.ops || []).includes(v) ? 'active' : ''}" data-ws-op="${v}">${sym}</button>`).join('')}
              </div>
            </div>
            <div>
              <small>${t('Loại số:', 'Number types:')}</small>
              <div class="ws-topic-pills">
                ${[['natural', 'Tự nhiên', 'Whole'], ['decimal', 'Thập phân', 'Decimal'], ['fraction', 'Phân số', 'Fraction'], ['negative', 'Số âm', 'Signed'], ['remainder', 'Chia dư', 'Remainder']].map(([k, vi, en]) => `<button type="button" class="ws-tp-pill ${(cc.types || []).includes(k) ? 'active' : ''}" data-ws-type="${k}">${t(vi, en)}</button>`).join('')}
              </div>
            </div>
            <div>
              <small>${t('Số chữ số:', 'Digits:')}</small>
              <div class="ws-topic-pills">
                ${[1, 2, 3, 4, 5].map(d => `<button type="button" class="ws-tp-pill ${(cc.digits || []).includes(d) ? 'active' : ''}" data-ws-digit="${d}">${d}</button>`).join('')}
              </div>
            </div>
            <div>
              <small>${t('Dạng tính nhẩm:', 'Calc style:')}</small>
              <select id="wsCustomStyleSel" class="ws-inline-sel">
                <option value="normal" ${cc.questionStyle === 'normal' ? 'selected' : ''}>${t('Tính từng phép tính', 'Single calculation')}</option>
                <option value="convenient" ${cc.questionStyle === 'convenient' ? 'selected' : ''}>${t('Tính thuận tiện (gộp tròn)', 'Convenient regrouping')}</option>
                <option value="expression" ${cc.questionStyle === 'expression' ? 'selected' : ''}>${t('Biểu thức nhiều phép tính', 'Multi-op expressions')}</option>
                <option value="missing" ${cc.questionStyle === 'missing' ? 'selected' : ''}>${t('Tìm số còn thiếu (?)', 'Missing number (?)')}</option>
              </select>
            </div>
          </div>
        </div>
      `;

      modal(`<div class="ws-composer">
        <div class="ws-comp-top">
          <div>
            <span class="eyebrow">NUMIQUICK · ${t('SOẠN ĐỀ & IN PHIẾU PDF (KHỔ A4)', 'A4 WORKSHEET & PDF COMPOSER')}</span>
            <h2 style="margin:2px 0 0">${t('Soạn đề sẵn & In 2 bản PDF riêng biệt', 'Compose & Print Separate Exam & Key PDFs')}</h2>
          </div>
          <div class="ws-comp-actions">
            <button type="button" class="ws-btn-sec" id="wsRegenAllBtn">${t('Đổi mã đề mới', 'New Version')}</button>
            <button type="button" class="primary ws-btn-print-exam" id="wsPrintExamOnlyBtn">${t('In đề (Không đáp án)', 'Print Exam Only')}</button>
            <button type="button" class="ws-btn-print-ans" id="wsPrintWithAnswersBtn">${t('In bản Có đáp án', 'Print Answer Key')}</button>
            <button type="button" class="ws-btn-sec" id="wsCloseModalBtn">✕</button>
          </div>
        </div>

        <div class="ws-controls-bar">
          <label>${t('Chế độ / Khối lớp', 'Mode / Grade')}
            <select id="wsGradeSel">
              <option value="custom" ${isCustomMode ? 'selected' : ''}>${t('Tùy chỉnh — Luyện tính nhẩm', 'Custom — Pure Mental Math')}</option>
              ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => `<option value="${g}" ${wsState.grade === g ? 'selected' : ''}>${t('Lớp', 'Grade')} ${g}</option>`).join('')}
            </select>
          </label>
          <label>${t('Số câu', 'Questions')}
            <select id="wsCountSel">
              ${[8, 10, 12, 15, 20, 30].map(n => `<option value="${n}" ${wsState.count === n ? 'selected' : ''}>${n} ${t('câu', 'qs')}</option>`).join('')}
            </select>
          </label>
          ${!isCustomMode ? `<label>${t('Mức độ đề', 'Difficulty')}
            <select id="wsDiffSel">
              <option value="progressive" ${wsState.difficultyMode === 'progressive' ? 'selected' : ''}>${t('Ma trận chuẩn (Dễ → Khó)', 'Progressive (Easy → Hard)')}</option>
              <option value="easy" ${wsState.difficultyMode === 'easy' ? 'selected' : ''}>${t('Mức 1: Nhận biết (Dễ)', 'Lv1: Foundation')}</option>
              <option value="medium" ${wsState.difficultyMode === 'medium' ? 'selected' : ''}>${t('Mức 2: Thông hiểu (Vừa)', 'Lv2: Comprehension')}</option>
              <option value="hard" ${wsState.difficultyMode === 'hard' ? 'selected' : ''}>${t('Mức 3: Vận dụng & Toán giải', 'Lv3: Application & Word')}</option>
            </select>
          </label>` : ''}
          <label>${t('Hình thức đề', 'Format')}
            <select id="wsFormatSel">
              <option value="mixed" ${wsState.format === 'mixed' ? 'selected' : ''}>${t('Kết hợp (Trắc nghiệm + Tự luận)', 'Mixed (MCQ + Written)')}</option>
              <option value="essay" ${wsState.format === 'essay' ? 'selected' : ''}>${t('100% Tự luận (Kèm ô trống tự trình bày)', '100% Written Exercises')}</option>
              <option value="mcq" ${wsState.format === 'mcq' ? 'selected' : ''}>${t('100% Trắc nghiệm (A, B, C, D)', '100% Multiple Choice')}</option>
            </select>
          </label>
          <label>${t('Thời gian (phút)', 'Time (min)')}
            <input type="number" id="wsDurInput" min="5" max="90" value="${wsState.durationMin}">
          </label>
          <label class="ws-title-field">${t('Tiêu đề phiếu đề', 'Worksheet Title')}
            <input type="text" id="wsTitleInput" value="${esc(wsState.title)}" maxlength="90">
          </label>
        </div>

        ${isCustomMode ? customCalcStripHtml : `
          <div class="ws-topic-strip">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">
              <span class="ws-topic-strip-lbl">${t('Chọn chuyên đề đưa vào đề:', 'Topics in worksheet:')}</span>
              ${isSec ? `<div style="display:flex;gap:5px;flex-wrap:wrap">
                <button type="button" class="ws-tp-pill ${wsState.domainFilter === 'all' ? 'active' : ''}" data-ws-dom="all">${t('Tất cả', 'All')}</button>
                <button type="button" class="ws-tp-pill ${wsState.domainFilter === 'number' ? 'active' : ''}" data-ws-dom="number">${t('Số học', 'Numbers & Algebra')}</button>
                <button type="button" class="ws-tp-pill ${wsState.domainFilter === 'geometry' ? 'active' : ''}" data-ws-dom="geometry">${t('Hình học', 'Geometry')}</button>
              </div>` : ''}
            </div>
            <div class="ws-topic-pills">
              ${topicList.map(tp => {
                const on = tp.id === 'all' ? isAllTopics : wsState.topics.includes(tp.id);
                return `<button type="button" class="ws-tp-pill ${on ? 'active' : ''}" data-ws-topic="${esc(tp.id)}">${esc(typeof lang !== 'undefined' && lang === 'en' ? tp.en : tp.vi)}</button>`;
              }).join('')}
            </div>
          </div>
        `}

        <div class="ws-preview-tabs" id="wsPreviewTabs" role="tablist">
          <button type="button" class="ws-tab-btn ${!showAnswers ? 'active' : ''}" id="wsTabExam" data-ws-tab="exam" role="tab" aria-selected="${!showAnswers}">${t('Bảng 1: Đề phát học sinh (Không đáp án)', 'Sheet 1: Student Exam (No Answers)')}</button>
          <button type="button" class="ws-tab-btn ${showAnswers ? 'active' : ''}" id="wsTabAnswers" data-ws-tab="answers" role="tab" aria-selected="${showAnswers}">${t('Bảng 2: Bản Có đáp án & Lời giải (Chấm bài)', 'Sheet 2: Answer Key & Solutions')}</button>
        </div>

        <div class="ws-preview-stage" id="wsPreviewStage">
          ${buildWorksheetSheetHTML(wsState, { withAnswers: showAnswers, interactivePreview: true })}
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
        const isAns = wsState.previewTab === 'answers';
        $$('[data-ws-tab]').forEach(tb => {
          const on = tb.dataset.wsTab === wsState.previewTab;
          tb.classList.toggle('active', on);
          tb.setAttribute('aria-selected', String(on));
        });
        if (stage) {
          stage.innerHTML = buildWorksheetSheetHTML(wsState, { withAnswers: isAns, interactivePreview: true });
          bindSwapButtons();
        }
      };

      const bindSwapButtons = () => {
        $$('[data-ws-swap]').forEach(btn => {
          btn.onclick = () => {
            const idx = Number(btn.dataset.wsSwap);
            const curTier = wsState.questions[idx]?.difficulty || undefined;
            const nextQ = makeSingleWorksheetQuestion(wsState.grade, wsState.topics, { ...wsOpts(), difficultyMode: curTier || wsState.difficultyMode });
            if (nextQ && Number.isInteger(idx) && idx >= 0 && idx < wsState.questions.length) {
              wsState.questions[idx] = nextQ;
              refreshPreview();
            }
          };
        });
      };

      $('#wsCloseModalBtn')?.addEventListener('click', closeClean);
      $('#wsPrintExamOnlyBtn')?.addEventListener('click', () => printWorksheetSheet(false));
      $('#wsPrintWithAnswersBtn')?.addEventListener('click', () => printWorksheetSheet(true));
      $('#wsRegenAllBtn')?.addEventListener('click', () => {
        const curNum = parseInt(wsState.examCode, 10) || 1;
        wsState.examCode = String((curNum % 99) + 1).padStart(2, '0');
        wsState.questions = generateWorksheetQuestions(wsState.grade, wsState.topics, wsState.count, wsOpts());
        refreshPreview();
      });

      $$('[data-ws-tab]').forEach(tb => {
        tb.onclick = () => {
          wsState.previewTab = tb.dataset.wsTab === 'answers' ? 'answers' : 'exam';
          refreshPreview();
        };
      });

      $('#wsGradeSel')?.addEventListener('change', e => {
        const rawVal = e.target.value;
        wsState.grade = rawVal === 'custom' ? 'custom' : (Number(rawVal) || 1);
        wsState.topics = [];
        wsState.domainFilter = 'all';
        wsState.durationMin = wsState.grade === 'custom' ? 15 : (wsState.grade <= 2 ? 15 : wsState.grade >= 6 ? 45 : 25);
        wsState.title = defaultTitleFor(wsState.grade, [], 'all');
        wsState.subtitle = wsState.grade === 'custom'
          ? t('Môn: Toán · Phiếu Luyện tính nhẩm & Phản xạ phép tính (Tùy chỉnh)', 'Subject: Maths · Pure Mental Math & Calculation Drill')
          : t(`Môn: Toán · Lớp ${wsState.grade} (Chuẩn GDPT 2018)`, `Subject: Maths · Grade ${wsState.grade}`);
        wsState.questions = generateWorksheetQuestions(wsState.grade, wsState.topics, wsState.count, wsOpts());
        renderComposerModal();
      });

      const toggleArrItem = (arr, item) => {
        const cur = Array.isArray(arr) ? arr : [];
        if (cur.includes(item)) return cur.length > 1 ? cur.filter(x => x !== item) : cur;
        return [...cur, item];
      };
      $$('[data-ws-op]').forEach(btn => {
        btn.onclick = () => {
          wsState.customCfg.ops = toggleArrItem(wsState.customCfg.ops, btn.dataset.wsOp);
          wsState.questions = generateWorksheetQuestions('custom', [], wsState.count, wsOpts());
          renderComposerModal();
        };
      });
      $$('[data-ws-type]').forEach(btn => {
        btn.onclick = () => {
          wsState.customCfg.types = toggleArrItem(wsState.customCfg.types, btn.dataset.wsType);
          wsState.questions = generateWorksheetQuestions('custom', [], wsState.count, wsOpts());
          renderComposerModal();
        };
      });
      $$('[data-ws-digit]').forEach(btn => {
        btn.onclick = () => {
          wsState.customCfg.digits = toggleArrItem(wsState.customCfg.digits, Number(btn.dataset.wsDigit));
          wsState.questions = generateWorksheetQuestions('custom', [], wsState.count, wsOpts());
          renderComposerModal();
        };
      });
      $('#wsCustomStyleSel')?.addEventListener('change', e => {
        wsState.customCfg.questionStyle = e.target.value || 'normal';
        wsState.questions = generateWorksheetQuestions('custom', [], wsState.count, wsOpts());
        renderComposerModal();
      });

      $('#wsCountSel')?.addEventListener('change', e => {
        wsState.count = Number(e.target.value) || 10;
        wsState.questions = generateWorksheetQuestions(wsState.grade, wsState.topics, wsState.count, wsOpts());
        refreshPreview();
      });

      $('#wsDiffSel')?.addEventListener('change', e => {
        wsState.difficultyMode = e.target.value || 'progressive';
        wsState.questions = generateWorksheetQuestions(wsState.grade, wsState.topics, wsState.count, wsOpts());
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

      $$('[data-ws-dom]').forEach(btn => {
        btn.onclick = () => {
          wsState.domainFilter = btn.dataset.wsDom || 'all';
          wsState.topics = [];
          wsState.title = defaultTitleFor(wsState.grade, [], wsState.domainFilter);
          wsState.questions = generateWorksheetQuestions(wsState.grade, [], wsState.count, wsOpts());
          renderComposerModal();
        };
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
          wsState.title = defaultTitleFor(wsState.grade, wsState.topics, wsState.domainFilter);
          wsState.questions = generateWorksheetQuestions(wsState.grade, wsState.topics, wsState.count, wsOpts());
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
        btn.innerHTML = `${t('Soạn đề sẵn & In phiếu PDF (A4)', 'Compose & Print A4 PDF Worksheet')}`;
        btn.onclick = () => {
          const cnt = Number($('#lessonCount')?.value || config?.count || 12);
          if (config?.grade === 'custom') {
            let customCfg = {
              ops: Array.isArray(config?.ops) && config.ops.length ? [...config.ops] : ['+', '-'],
              types: Array.isArray(config?.types) && config.types.length ? [...config.types] : [config?.type || 'natural'],
              digits: Array.isArray(config?.digits) && config.digits.length ? config.digits.map(Number) : [2],
              questionStyle: (config?.questionStyle && config.questionStyle !== 'word') ? config.questionStyle : 'normal',
              termCount: Number(config?.termCount) || 3
            };
            if (form && typeof FormData !== 'undefined') {
              try {
                const fd = new FormData(form);
                const fOps = fd.getAll('op');
                const fTypes = fd.getAll('type');
                const fDigits = fd.getAll('digits').map(Number).filter(Boolean);
                const fStyle = fd.get('questionStyle');
                const fTerms = Number(fd.get('termCount')) || 3;
                if (fOps.length) customCfg.ops = fOps;
                if (fTypes.length) customCfg.types = fTypes;
                if (fDigits.length) customCfg.digits = fDigits;
                if (fStyle && fStyle !== 'word') customCfg.questionStyle = String(fStyle);
                customCfg.termCount = fTerms;
              } catch {}
            }
            openWorksheetComposer({ grade: 'custom', customCfg, count: cnt });
            return;
          }
          const u = typeof currentAuthUser === 'function' ? currentAuthUser() : null;
          const g = config?.grade && config.grade !== 'custom' ? Number(config.grade) : (Number(u?.grade) || 4);
          const tps = Array.isArray(config?.topics) && config.topics.length ? [...config.topics] : (config?.topic && config.topic !== 'all' ? [config.topic] : []);
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
        let activeGrade = Number(u?.grade) || 4;
        try {
          const nc = window.NumiClasses;
          if (nc && u && typeof nc.getClassesForTeacher === 'function') {
            const clsList = nc.getClassesForTeacher(u.username) || [];
            const activeCls = clsList.find(c => c.id === nc.ui?.activeTeacherClassId) || clsList[0];
            if (activeCls?.grade) activeGrade = Number(activeCls.grade);
          }
        } catch {}
        openWorksheetComposer({ grade: activeGrade, topics: [], count: 12 });
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

      dialog#modal.ws-wide-modal{width:min(96vw,1000px)!important;max-width:1000px!important;max-height:92vh!important;padding:16px 20px 24px!important;overflow-y:auto!important;overflow-x:hidden!important}
      .ws-composer{display:flex;flex-direction:column;gap:11px}
      .ws-comp-top{position:sticky;top:-16px;z-index:6;background:#fffefa;margin:-16px -20px 0;padding:14px 20px 10px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;border-bottom:1.5px solid #e2eee0}
      body.dark-mode .ws-comp-top{background:#18261f;border-bottom-color:#2b4937}
      .ws-comp-actions{display:flex;gap:7px;flex-wrap:wrap;align-items:center}
      .ws-btn-sec{min-height:38px!important;padding:6px 11px!important;border-radius:10px!important;border:1.5px solid #cfe0cc!important;background:#fff!important;color:#274c36!important;font-weight:800!important;font-size:13px!important;cursor:pointer}
      .ws-btn-print-exam{min-height:38px!important;padding:6px 13px!important;border-radius:10px!important;font-size:13px!important}
      .ws-btn-print-ans{min-height:38px!important;padding:6px 13px!important;border-radius:10px!important;border:1.5px solid #22734d!important;background:#1f6a47!important;color:#ffffff!important;font-weight:800!important;font-size:13px!important;cursor:pointer}
      .ws-btn-print-ans:hover{background:#185538!important;color:#ffffff!important}
      .ws-controls-bar{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:10px;background:#f6faf4;border:1.5px solid #dfebd9;border-radius:14px;padding:10px 12px}
      .ws-controls-bar label{display:flex;flex-direction:column;gap:4px;font-size:12px;font-weight:800;color:#2d523c;margin:0}
      .ws-controls-bar select,.ws-controls-bar input[type=text],.ws-controls-bar input[type=number]{min-height:36px!important;padding:5px 10px!important;border-radius:9px!important;border:1.5px solid #c9dec4!important;font-size:13px!important;background:#fff!important;color:#1f3d2d!important}
      .ws-title-field{grid-column:span 2}
      .ws-topic-strip{display:grid;gap:6px}
      .ws-topic-strip-lbl{font-size:12px;font-weight:800;color:#2d523c}
      .ws-topic-pills{display:flex;flex-wrap:wrap;gap:5px}
      .ws-tp-pill{min-height:28px!important;padding:4px 10px!important;border-radius:999px!important;border:1.5px solid #d1e2cb!important;background:#f8fcf6!important;color:#2c4d39!important;font-size:12px!important;font-weight:700!important;cursor:pointer}
      .ws-tp-pill.active,.ws-tp-pill.active:hover{background:#2d6a51!important;border-color:#1d4e39!important;color:#fff!important}

      .ws-preview-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#edf4eb;padding:5px;border-radius:12px}
      .ws-tab-btn{min-height:38px!important;padding:6px 12px!important;border-radius:9px!important;border:1.5px solid transparent!important;background:transparent!important;color:#355943!important;font-size:13px!important;font-weight:800!important;cursor:pointer}
      .ws-tab-btn.active,.ws-tab-btn.active:hover{background:#ffffff!important;border-color:#b8d7be!important;color:#174f34!important;box-shadow:0 2px 6px rgba(24,78,50,.1)}

      .ws-custom-calc-box{background:#f6faf4;border:1.5px solid #dfebd9;border-radius:14px;padding:10px 12px;display:grid;gap:8px}
      .ws-custom-row{display:flex;flex-wrap:wrap;gap:12px 18px;align-items:flex-end}
      .ws-custom-row small{display:block;font-size:11.5px;font-weight:800;color:#2d523c;margin-bottom:4px}
      .ws-inline-sel{min-height:30px!important;padding:4px 10px!important;border-radius:9px!important;border:1.5px solid #c9dec4!important;font-size:12.5px!important;font-weight:700!important;background:#fff!important;color:#1f3d2d!important}
      body.dark-mode .ws-controls-bar,body.dark-mode .ws-custom-calc-box{background:#15251c;border-color:#2b4937}
      body.dark-mode .ws-controls-bar label,body.dark-mode .ws-topic-strip-lbl,body.dark-mode .ws-custom-row small{color:#b8dec7}
      body.dark-mode .ws-controls-bar select,body.dark-mode .ws-controls-bar input,body.dark-mode .ws-inline-sel{background:#101d16!important;border-color:#345944!important;color:#e3f3ea!important}
      body.dark-mode .ws-tp-pill{background:#182b20!important;border-color:#2f523e!important;color:#cbe5d6!important}
      body.dark-mode .ws-tp-pill.active{background:#2d6a51!important;border-color:#4ba880!important;color:#fff!important}
      body.dark-mode .ws-preview-tabs{background:#15251c}
      body.dark-mode .ws-tab-btn{color:#a8ceb7!important}
      body.dark-mode .ws-tab-btn.active{background:#223b2d!important;border-color:#3d6b50!important;color:#fff!important}
      .ws-preview-stage{background:#e7eee8;border-radius:14px;padding:16px;max-height:none;overflow:visible;display:block}
      body.dark-mode .ws-preview-stage{background:#122018}

      /* ===== A4 Worksheet Paper Styling (both preview and @media print) ===== */
      .ws-a4-paper{background:#ffffff;color:#111827;border:1px solid #d4ded6;border-radius:8px;padding:20px 24px;box-shadow:0 4px 16px rgba(0,0,0,.06);font-family:'Nunito',Arial,sans-serif;line-height:1.45;width:100%;max-width:100%;min-width:0;height:auto;box-sizing:border-box;overflow-x:clip;overflow-y:visible}
      .ws-header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;border-bottom:2px solid #224d36;padding-bottom:10px;margin-bottom:12px;font-size:12.5px}
      .ws-brand{font-weight:900;color:#1e563a;font-size:13px;letter-spacing:.03em}
      .ws-sub{font-weight:700;color:#374151;margin-top:2px}
      .ws-meta-line{color:#4b5563;margin-top:2px;font-size:12px}
      .ws-hdr-right{text-align:right;display:grid;gap:6px;font-weight:700;color:#1f2937;flex-shrink:0}
      .ws-hdr-field{display:flex;align-items:flex-end;justify-content:flex-end;gap:6px;white-space:nowrap}
      .ws-hdr-dots{display:inline-block;height:14px;border-bottom:1.5px dotted #6b7280}
      .ws-ans-stamp{display:inline-block;padding:3px 10px;border-radius:999px;background:#e5f7ec;border:1.5px solid #2e8b57;color:#145c36;font-weight:900;font-size:12px}
      .ws-main-title{text-align:center;font-size:18px;font-weight:900;color:#163d28;margin:4px 0 14px;text-transform:uppercase}
      .ws-section-title{font-size:13.5px;font-weight:900;color:#1b4d33;margin:12px 0 8px;padding:4px 10px;background:#eef6ef;border-left:4px solid #2b6a50;border-radius:4px;max-width:100%;box-sizing:border-box}
      .ws-mcq-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 14px;min-width:0;max-width:100%}
      .ws-q-box{border:1px solid #dce6dd;border-radius:8px;padding:8px 10px;break-inside:avoid;min-width:0;max-width:100%;box-sizing:border-box}
      .ws-q-head{display:flex;align-items:flex-start;gap:6px;margin-bottom:6px;font-size:13.5px;min-width:0;width:100%}
      .ws-q-num{font-weight:900;color:#1b5336;white-space:nowrap;flex-shrink:0}
      .ws-q-text{font-weight:800;color:#111827;flex:1;min-width:0;overflow-wrap:break-word;word-break:break-word}
      .ws-swap-btn{min-height:22px!important;width:24px!important;height:22px!important;padding:0!important;border-radius:6px!important;border:1px solid #cdddc9!important;background:#f4faf3!important;color:#2b6346!important;font-size:13px!important;font-weight:800!important;cursor:pointer;flex-shrink:0}
      .ws-mcq-opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 10px;font-size:13px;color:#1f2937}
      .ws-opt-hit{background:#e4f7ea;color:#115e35;font-weight:900;border:1.5px solid #2e8b57;border-radius:6px;padding:1px 6px}
      .ws-inline-sol{margin-top:5px;padding-top:4px;border-top:1px dashed #d3e5d7;font-size:11.5px;color:#2e5b42}
      .ws-col-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;min-width:0;max-width:100%}
      .ws-col-card{border:1px solid #d5e2d6;border-radius:8px;padding:8px 10px;display:flex;flex-direction:column;align-items:stretch;break-inside:avoid;min-width:0;max-width:100%;box-sizing:border-box}
      .ws-col-card .ws-q-head{width:100%}
      .ws-blank-workbox{width:100%;height:96px;border:1px dashed #b9ccb9;border-radius:6px;background-image:linear-gradient(to right,rgba(60,110,80,.08) 1px,transparent 1px),linear-gradient(to bottom,rgba(60,110,80,.08) 1px,transparent 1px);background-size:16px 16px;background-color:#ffffff;margin-top:4px;box-sizing:border-box}
      .ws-essay-list{display:grid;gap:10px;min-width:0;max-width:100%}
      .ws-essay-item{border:1px solid #dce6dd;border-radius:8px;padding:10px 12px;break-inside:avoid;min-width:0;max-width:100%;box-sizing:border-box}
      .ws-write-lines{display:grid;gap:10px;margin-top:8px;font-size:12.5px;color:#4b5563;min-width:0;width:100%}
      .ws-write-row{display:flex;align-items:flex-end;gap:8px;min-height:20px;width:100%;min-width:0}
      .ws-write-lbl{white-space:nowrap;flex-shrink:0;font-weight:700;color:#4b5563}
      .ws-dot-fill{flex:1;min-width:40px;height:14px;border-bottom:1.5px dotted #8fa396}
      .ws-essay-sol{margin-top:5px;padding:5px 9px;border-radius:6px;background:#ebf8ef;border-left:3px solid #267d50;font-size:12.5px;color:#154c30;overflow-wrap:break-word}
      .ws-quick-key-wrap{margin-top:14px;break-inside:avoid}
      .ws-quick-key-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:6px}
      .ws-qk-cell{border:1px solid #c6dccb;border-radius:7px;padding:5px 6px;text-align:center;background:#f7fcf8;display:flex;flex-direction:column;gap:2px}
      .ws-qk-cell small{font-size:10.5px;color:#4f6f5b;font-weight:700}
      .ws-qk-cell b{font-size:13.5px;color:#145a35;font-weight:900}
      .ws-footer-note{text-align:center;font-size:12px;font-style:italic;color:#4b5563;margin-top:14px;padding-top:8px;border-top:1px dashed #cbd5cc}

      .numi-print-sheet{display:none}
      @media print {
        @page { size: A4 portrait; margin: 12mm; }
        body > *:not(#numiPrintSheet) { display: none !important; }
        #numiPrintSheet { display: block !important; background: #fff !important; }
        #numiPrintSheet .ws-a4-paper {
          border: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .no-print { display: none !important; }
      }
      @media (max-width: 720px) {
        .ws-mcq-grid,.ws-col-grid,.ws-preview-tabs{grid-template-columns:1fr}
        .ws-title-field{grid-column:span 1}
        .ws-header{flex-direction:column}
        .ws-hdr-right{text-align:left}
      }
    `;
    document.head.append(style);
  }

  const exp = { openWorksheetComposer, generateWorksheetQuestions, buildWorksheetSheetHTML, printWorksheetSheet };
  if (typeof window !== 'undefined') Object.assign(window, exp);
  if (typeof global !== 'undefined') Object.assign(global, exp);
})();
