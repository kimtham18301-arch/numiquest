// Interactive Column Arithmetic ("Đặt tính rồi tính"), Dual-Input Tự luận & Single-Viewport Zero-Scroll Quiz UX (v2.5.0)
(() => {
  'use strict';

  let colPanelOpen = false;
  let colUserDismissed = false;
  let activeColIdx = 0; // index into answer digit cells (right-to-left entry)

  // Parse a binary arithmetic question suitable for vertical column calculation (+, -, × for natural & decimals)
  function parseColumnArithmetic(qStr) {
    const raw = String(qStr || '').trim();
    const m = raw.match(/^(\d+(?:[.,]\d+)?)\s*([+−\-×*])\s*(\d+(?:[.,]\d+)?)$/);
    if (!m) return null;
    const rawA = m[1].replace('.', ',');
    const opRaw = m[2];
    const op = opRaw === '-' ? '−' : opRaw === '*' ? '×' : opRaw;
    const rawB = m[3].replace('.', ',');

    // Only show column helper when helpful (multi-digit or decimal or Grade 1-5)
    const numA = parseFloat(rawA.replace(',', '.'));
    const numB = parseFloat(rawB.replace(',', '.'));
    if (!Number.isFinite(numA) || !Number.isFinite(numB)) return null;

    const hasDec = rawA.includes(',') || rawB.includes(',');
    if (op === '×' && hasDec) return null; // Keep multiplication column clean for whole numbers

    if (op === '+' || op === '−') {
      const [intA, decA = ''] = rawA.split(',');
      const [intB, decB = ''] = rawB.split(',');
      const decLen = Math.max(decA.length, decB.length);
      const exactRes = op === '+'
        ? Number((numA + numB).toFixed(decLen))
        : Number((numA - numB).toFixed(decLen));
      if (exactRes < 0) return null;
      const resStr = decLen > 0 ? exactRes.toFixed(decLen).replace('.', ',') : String(Math.round(exactRes));
      const [intR] = resStr.split(',');
      const intLen = Math.max(intA.length, intB.length, intR.length);

      const padRow = (iPart, dPart) => {
        const left = iPart.padStart(intLen, ' ').split('');
        const right = decLen > 0 ? dPart.padEnd(decLen, '0').split('') : [];
        return decLen > 0 ? [...left, ',', ...right] : left;
      };

      const rowA = padRow(intA, decA);
      const rowB = padRow(intB, decB);
      const totalCols = rowA.length;
      const commaCol = decLen > 0 ? intLen : -1;
      return { op, rawA, rawB, rowA, rowB, totalCols, commaCol, hasDec, decLen, expected: exactRes };
    }

    // Multiplication (whole numbers, e.g. 124 × 3 or 34 × 12)
    const exactRes = Math.round(numA * numB);
    const resStr = String(exactRes);
    const totalCols = Math.max(rawA.length, rawB.length, resStr.length);
    const rowA = rawA.padStart(totalCols, ' ').split('');
    const rowB = rawB.padStart(totalCols, ' ').split('');
    return { op, rawA, rawB, rowA, rowB, totalCols, commaCol: -1, hasDec: false, decLen: 0, expected: exactRes };
  }

  function composeColumnAnswer(spec) {
    const inputs = $$('#columnCalcPanel .col-ans-cell');
    let out = '';
    for (let c = 0; c < spec.totalCols; c++) {
      if (c === spec.commaCol) {
        out += ',';
      } else {
        const inp = inputs.find(el => Number(el.dataset.colIdx) === c);
        const v = inp ? String(inp.value || '').trim() : '';
        if (v) out += v;
      }
    }
    // Strip leading zeros except right before comma or single '0'
    out = out.replace(/^0+(?=\d)/, '');
    if (out.startsWith(',')) out = '0' + out;
    if (out.includes(',')) out = out.replace(/0+$/, '').replace(/,$/, '');
    return out;
  }

  function buildColumnCalcMarkup(spec) {
    const digitCols = [];
    for (let c = 0; c < spec.totalCols; c++) {
      if (c !== spec.commaCol) digitCols.push(c);
    }
    const carryRow = Array.from({ length: spec.totalCols }, (_, c) =>
      c === spec.commaCol
        ? '<span class="col-cell col-comma-spacer"></span>'
        : `<button type="button" class="col-carry-btn" data-carry-col="${c}" title="${t('Chạm để đánh dấu nhớ', 'Tap to mark carry')}"></button>`
    ).join('');

    const renderDigitRow = (cells, opLabel = '') => `<div class="col-grid-row">
      <span class="col-op-cell">${opLabel}</span>
      ${cells.map(ch => `<span class="col-cell ${ch === ',' ? 'col-comma' : ''}">${ch === ' ' ? '&nbsp;' : esc(ch)}</span>`).join('')}
    </div>`;

    const ansCells = Array.from({ length: spec.totalCols }, (_, c) =>
      c === spec.commaCol
        ? '<span class="col-cell col-comma">,</span>'
        : `<input type="text" inputmode="numeric" maxlength="1" class="col-ans-cell" data-col-idx="${c}" aria-label="${t('Chữ số cột', 'Column digit')} ${c + 1}">`
    ).join('');

    return `
      <div class="col-calc-head">
        <span>📐 ${t('Đặt tính rồi tính', 'Column Arithmetic')}</span>
        <div class="col-calc-head-btns">
          <button type="button" class="sp-tool-btn" id="colClearBtn">↺ ${t('Xóa ô', 'Clear')}</button>
          <button type="button" class="sp-tool-btn" id="colCloseBtn" title="${t('Đóng đặt tính', 'Close')}">✕</button>
        </div>
      </div>
      <div class="col-calc-tip">${t('Tính từ <b>phải sang trái</b> (hàng đơn vị trước). Chạm ô nhỏ trên cùng để ghi <b>nhớ</b>.', 'Compute <b>right to left</b> (ones first). Tap tiny top boxes to mark <b>carries</b>.')}</div>
      <div class="col-notebook" style="--col-n:${spec.totalCols}">
        <div class="col-grid-row col-carry-row">
          <span class="col-op-cell col-carry-lbl">${t('Nhớ', 'C')}</span>
          ${carryRow}
        </div>
        ${renderDigitRow(spec.rowA, '')}
        ${renderDigitRow(spec.rowB, spec.op)}
        <div class="col-divider-line"></div>
        <div class="col-grid-row col-ans-row">
          <span class="col-op-cell">=</span>
          ${ansCells}
        </div>
      </div>
      <div class="col-digit-pad" aria-label="${t('Bàn phím chọn chữ số đặt tính', 'Column digit pad')}">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(d => `<button type="button" class="col-pad-btn" data-col-digit="${d}">${d}</button>`).join('')}
        <button type="button" class="col-pad-btn col-pad-back" data-col-digit="back" title="${t('Xóa lùi', 'Backspace')}">⌫</button>
      </div>
      <div class="col-calc-footer">
        <span class="col-preview-text">${t('Kết quả:', 'Result:')} <strong id="colComposedVal">?</strong></span>
        <button type="button" class="primary col-apply-btn" id="colApplyBtn">✔ ${t('Nộp kết quả này', 'Use this answer')}</button>
      </div>
    `;
  }

  function applyColumnResultToQuiz(valStr) {
    if (!valStr) {
      toast(t('Em hãy điền chữ số vào hàng kết quả đặt tính trước nhé!', 'Fill in the column answer digits first!'));
      return;
    }
    const q = session?.questions?.[session?.index];
    if (!q || session?.answered) return;

    // In Tự luận (numpad) mode -> directly submit answerQuiz!
    if (typeof config !== 'undefined' && config.inputMode === 'numpad' && typeof answerQuiz === 'function') {
      answerQuiz(valStr, q.id);
      return;
    }
    // In Trắc nghiệm (choices) mode -> match choice button or show gentle hint
    const buttons = $$('#quizCard [data-answer]');
    const matchIdx = q.options.findIndex(opt => typeof isAnswerMatch === 'function' ? isAnswerMatch(opt, valStr) : String(opt) === valStr);
    if (matchIdx >= 0 && buttons[matchIdx] && !buttons[matchIdx].disabled) {
      buttons[matchIdx].click();
    } else {
      toast(t(`Kết quả đặt tính của em là ${valStr} — kiểm tra lại hàng nhớ xem có khớp 1 trong 4 đáp án không nhé!`, `Your column result is ${valStr} — double-check carries against the 4 options!`));
    }
  }

  function toggleColumnCalc(forceState) {
    const panel = $('#columnCalcPanel');
    if (!panel) return false;
    colPanelOpen = typeof forceState === 'boolean' ? forceState : !colPanelOpen;
    if (!colPanelOpen && typeof forceState !== 'boolean') colUserDismissed = true;
    else if (colPanelOpen) colUserDismissed = false;
    panel.hidden = !colPanelOpen;
    panel.classList.toggle('is-open', colPanelOpen);

    // If opening Column Calc, close Drawing Scratchpad so side workbench stays 100% single-viewport!
    if (colPanelOpen) {
      const sp = $('#scratchpadDrawer');
      if (sp && !sp.hidden && typeof toggleScratchpad === 'function') {
        toggleScratchpad(false);
      }
    }
    syncQuizSideWorkbenchState();
    const btn = $('#colCalcToggleBtn');
    if (btn) {
      btn.classList.toggle('is-active', colPanelOpen);
      btn.setAttribute('aria-expanded', String(colPanelOpen));
    }
    if (colPanelOpen) {
      const inputs = $$('#columnCalcPanel .col-ans-cell');
      const rightmost = inputs[inputs.length - 1];
      if (rightmost) {
        activeColIdx = Number(rightmost.dataset.colIdx);
        rightmost.focus();
      }
    }
    return colPanelOpen;
  }

  function syncQuizSideWorkbenchState() {
    const card = $('#quizCard');
    if (!card) return;
    const sp = $('#scratchpadDrawer');
    const col = $('#columnCalcPanel');
    const hasOpenTool = Boolean((sp && !sp.hidden) || (col && !col.hidden));
    card.classList.toggle('has-side-tool', hasOpenTool);
    const sidePane = $('#quizSidePane');
    if (sidePane) sidePane.hidden = !hasOpenTool;
  }

  function enhanceQuizSingleViewportAndColumnCalc() {
    if (typeof view === 'undefined' || view !== 'quiz' || !session || session.done) return;
    const card = $('#quizCard');
    if (!card || card.dataset.v25Enhanced) return;
    card.dataset.v25Enhanced = '1';

    const q = session.questions?.[session.index];
    if (!q) return;

    // 1. Merge stepper directly into compact single-line quiz top bar to save vertical space
    const topBar = $('.quiz-top-bar');
    const stepper = $('.quiz-stepper');
    if (topBar && stepper && (typeof topBar.contains !== 'function' || !topBar.contains(stepper))) {
      const clock = $('#clock');
      if (clock && typeof topBar.insertBefore === 'function') topBar.insertBefore(stepper, clock);
      else if (typeof topBar.append === 'function') topBar.append(stepper);
    }

    // 2. Build 2-column split structure inside quizCard (Main Question Column + Right Side Workbench)
    const mainCol = document.createElement('div');
    mainCol.className = 'quiz-main-col';
    const sidePane = document.createElement('aside');
    sidePane.id = 'quizSidePane';
    sidePane.className = 'quiz-side-pane';
    sidePane.hidden = true;

    // Move existing children into mainCol, except scratchpadDrawer which goes into sidePane!
    const existingChildren = Array.from(card.children || []);
    for (const ch of existingChildren) {
      if (ch.id === 'scratchpadDrawer') {
        sidePane.append(ch);
      } else {
        mainCol.append(ch);
      }
    }
    card.append(mainCol);
    card.append(sidePane);

    // 3. Build sleek single-line utility toolbar right below companion / above question:
    //    [🔊 Đọc đề] [📐 Đặt tính] [✏️ Nháp] [⌨️ Trắc nghiệm / Tự luận]
    const utilBar = document.createElement('div');
    utilBar.className = 'quiz-util-bar';

    const existingSpeakWrap = mainCol.querySelector('.speech-bar, .quiz-speak-bar');
    if (existingSpeakWrap) {
      const speakBtn = existingSpeakWrap.querySelector('#speakQuizBtn');
      if (speakBtn) utilBar.append(speakBtn);
      existingSpeakWrap.remove();
    }

    const colSpec = parseColumnArithmetic(q.q);
    if (colSpec) {
      // Auto-open interactive Column Arithmetic on desktop for explicit column topics unless user closed it
      const isDesktop = typeof window !== 'undefined' && (window.innerWidth || 0) >= 860;
      if (isDesktop && q.columnReady && !colUserDismissed && !colPanelOpen) {
        const sp = $('#scratchpadDrawer');
        if (!sp || sp.hidden) colPanelOpen = true;
      }
      const colBtn = document.createElement('button');
      colBtn.type = 'button';
      colBtn.id = 'colCalcToggleBtn';
      colBtn.className = 'quiz-pill-btn' + (colPanelOpen ? ' is-active' : '');
      colBtn.setAttribute('aria-expanded', String(colPanelOpen));
      colBtn.innerHTML = `📐 <span>${t('Đặt tính', 'Column')}</span>`;
      colBtn.onclick = () => toggleColumnCalc();
      utilBar.append(colBtn);

      const colPanel = document.createElement('div');
      colPanel.id = 'columnCalcPanel';
      colPanel.className = 'column-calc-panel';
      colPanel.hidden = !colPanelOpen;
      colPanel.innerHTML = buildColumnCalcMarkup(colSpec);
      sidePane.prepend(colPanel);

      // Bind interactive Column Arithmetic events
      const inputs = $$('#columnCalcPanel .col-ans-cell');
      const digitCols = inputs.map(el => Number(el.dataset.colIdx));
      activeColIdx = digitCols[digitCols.length - 1] ?? 0;

      const refreshComposed = () => {
        const val = composeColumnAnswer(colSpec);
        const outEl = $('#colComposedVal');
        if (outEl) outEl.textContent = val || '?';
      };

      const focusCol = cIdx => {
        const target = inputs.find(el => Number(el.dataset.colIdx) === cIdx);
        if (target) {
          activeColIdx = cIdx;
          inputs.forEach(el => el.classList.toggle('is-focused', el === target));
          target.focus();
        }
      };

      const enterDigitAtActive = digit => {
        const pos = digitCols.indexOf(activeColIdx);
        const curEl = inputs[pos >= 0 ? pos : inputs.length - 1];
        if (!curEl) return;
        if (digit === 'back') {
          if (curEl.value) {
            curEl.value = '';
          } else if (pos < digitCols.length - 1) {
            const rightEl = inputs[pos + 1];
            if (rightEl) {
              rightEl.value = '';
              focusCol(digitCols[pos + 1]);
            }
          }
          refreshComposed();
          return;
        }
        curEl.value = String(digit);
        refreshComposed();
        // Auto-advance LEFT (ones → tens → hundreds)
        if (pos > 0) {
          focusCol(digitCols[pos - 1]);
        }
      };

      inputs.forEach(inp => {
        inp.addEventListener('focus', () => {
          activeColIdx = Number(inp.dataset.colIdx);
          inputs.forEach(el => el.classList.toggle('is-focused', el === inp));
        });
        inp.addEventListener('keydown', e => {
          if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            e.stopPropagation();
            enterDigitAtActive(e.key);
          } else if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
            e.stopPropagation();
            enterDigitAtActive('back');
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const p = digitCols.indexOf(activeColIdx);
            if (p > 0) focusCol(digitCols[p - 1]);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            const p = digitCols.indexOf(activeColIdx);
            if (p >= 0 && p < digitCols.length - 1) focusCol(digitCols[p + 1]);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            applyColumnResultToQuiz(composeColumnAnswer(colSpec));
          }
        });
      });

      $$('#columnCalcPanel [data-col-digit]').forEach(btn => {
        btn.onclick = () => enterDigitAtActive(btn.dataset.colDigit);
      });

      $$('#columnCalcPanel [data-carry-col]').forEach(btn => {
        btn.onclick = () => {
          const cur = Number(btn.textContent || 0);
          const next = (cur + 1) % 4; // cycles '', 1, 2, 3
          btn.textContent = next ? String(next) : '';
          btn.classList.toggle('has-carry', next > 0);
        };
      });

      $('#colClearBtn')?.addEventListener('click', () => {
        inputs.forEach(el => { el.value = ''; });
        $$('#columnCalcPanel [data-carry-col]').forEach(b => { b.textContent = ''; b.classList.remove('has-carry'); });
        refreshComposed();
        if (digitCols.length) focusCol(digitCols[digitCols.length - 1]);
      });
      $('#colCloseBtn')?.addEventListener('click', () => { colUserDismissed = true; toggleColumnCalc(false); });
      $('#colApplyBtn')?.addEventListener('click', () => applyColumnResultToQuiz(composeColumnAnswer(colSpec)));
    } else {
      colPanelOpen = false;
    }

    // Add gentle dual-input hint on Tự luận (numpad) mode
    const npWrap = mainCol.querySelector('.numpad-wrap');
    if (npWrap && !npWrap.querySelector('.numpad-dual-hint')) {
      const hint = document.createElement('div');
      hint.className = 'numpad-dual-hint';
      hint.textContent = t('⌨️ Gõ trực tiếp trên bàn phím hoặc chạm số trên màn hình · Enter để nộp', '⌨️ Type on keyboard or tap on-screen keys · Press Enter to submit');
      npWrap.append(hint);
    }

    // Move scratchpad toggle button right next to Đặt tính & Đọc đề inside utilBar
    const spToggle = $('#scratchpadToggleBtn');
    if (spToggle) {
      spToggle.classList.add('quiz-pill-btn');
      utilBar.append(spToggle);
      const origSpClick = spToggle.onclick;
      spToggle.onclick = () => {
        if (colPanelOpen) toggleColumnCalc(false);
        if (typeof origSpClick === 'function') origSpClick();
        syncQuizSideWorkbenchState();
      };
    }

    // Quick Answer Mode Switcher pill: Trắc nghiệm ↔ Tự luận (Gõ phím / Bấm số)
    const type = (q.skill || '').split(':')[0];
    if (session.kind !== 'battle' && type !== 'remainder') {
      const modeBtn = document.createElement('button');
      modeBtn.type = 'button';
      modeBtn.id = 'quizModeSwitchBtn';
      modeBtn.className = 'quiz-pill-btn';
      const isNumpad = config.inputMode === 'numpad';
      modeBtn.innerHTML = isNumpad
        ? `☑️ <span>${t('Đổi sang Trắc nghiệm', 'Switch to Choices')}</span>`
        : `⌨️ <span>${t('Tự luận (Gõ/Bấm số)', 'Free Input')}</span>`;
      modeBtn.title = t('Chuyển đổi nhanh giữa Trắc nghiệm và Tự luận', 'Toggle Multiple Choice / Free Input');
      modeBtn.onclick = () => {
        if (session.answered) return;
        config.inputMode = config.inputMode === 'numpad' ? 'choices' : 'numpad';
        if (typeof window !== 'undefined') window.config = config;
        if (typeof global !== 'undefined') global.config = config;
        showQuiz();
      };
      utilBar.append(modeBtn);
    }

    const qEl = mainCol.querySelector('.question');
    if (qEl) qEl.before(utilBar);
    else mainCol.prepend(utilBar);

    // Sync side pane state when scratchpad is toggled via S key or close button
    $('#spCloseBtn')?.addEventListener('click', () => setTimeout(syncQuizSideWorkbenchState, 10));
    syncQuizSideWorkbenchState();
  }

  // Wrap toggleScratchpad so S shortcut keeps side pane & column calc mutually exclusive
  const prevToggleSp = typeof window !== 'undefined' ? window.toggleScratchpad : null;
  if (typeof prevToggleSp === 'function') {
    const wrappedSp = function (forceState) {
      const next = prevToggleSp(forceState);
      if (next && colPanelOpen) toggleColumnCalc(false);
      syncQuizSideWorkbenchState();
      return next;
    };
    window.toggleScratchpad = wrappedSp;
    if (typeof global !== 'undefined') global.toggleScratchpad = wrappedSp;
  }

  // Hook showQuiz cleanly
  const showQuizBeforeCol = typeof showQuiz === 'function' ? showQuiz : null;
  if (showQuizBeforeCol) {
    showQuiz = function () {
      showQuizBeforeCol();
      enhanceQuizSingleViewportAndColumnCalc();
    };
    if (typeof window !== 'undefined') window.showQuiz = showQuiz;
    if (typeof global !== 'undefined') global.showQuiz = showQuiz;
  }

  // Inject Single-Viewport Zero-Scroll Quiz CSS + Column Arithmetic CSS
  if (typeof document !== 'undefined' && document.head) {
    const style = document.createElement('style');
    style.textContent = `
      /* ===== Single-Viewport Zero-Scroll Quiz Workspace (Desktop & Mobile) ===== */
      body[data-view="quiz"] header,
      body[data-view="quiz"] footer {
        display: none !important;
      }
      body[data-view="quiz"] {
        overflow-x: hidden;
      }
      body[data-view="quiz"] main {
        max-width: 1080px !important;
        margin: 0 auto !important;
        padding: 10px 16px !important;
        min-height: 100dvh !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
      }
      body[data-view="quiz"] .quiz-view-container {
        width: 100% !important;
        max-width: 1040px !important;
        margin: 0 auto !important;
      }
      body[data-view="quiz"] .quiz-top-bar {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 10px !important;
        margin-bottom: 10px !important;
        padding: 6px 12px !important;
        border-radius: 16px !important;
        background: rgba(255, 254, 250, 0.92);
        border: 1px solid #dfe8d9;
      }
      body.dark-mode[data-view="quiz"] .quiz-top-bar {
        background: #17241d;
        border-color: #294133;
      }
      body[data-view="quiz"] .quiz-top-bar .quiz-stepper {
        flex: 1 1 auto !important;
        margin: 0 !important;
        padding: 2px 4px !important;
        justify-content: center !important;
        overflow-x: auto !important;
        flex-wrap: nowrap !important;
      }
      @media (max-width: 640px) {
        body[data-view="quiz"] .quiz-top-bar .quiz-stepper {
          display: none !important;
        }
      }
      body[data-view="quiz"] .stepper-dot {
        width: 22px !important;
        height: 22px !important;
        font-size: 10.5px !important;
        flex-shrink: 0 !important;
      }
      body[data-view="quiz"] .quiz-card {
        padding: 16px 20px !important;
        border-radius: 22px !important;
        display: grid !important;
        grid-template-columns: 1fr !important;
        gap: 16px !important;
        align-items: start !important;
        transition: none !important;
      }
      @media (min-width: 860px) {
        body[data-view="quiz"] {
          height: 100dvh;
          overflow: hidden;
        }
        body[data-view="quiz"] .quiz-card {
          max-height: calc(100dvh - 76px);
          overflow-y: auto;
        }
        body[data-view="quiz"] .quiz-card.has-side-tool {
          grid-template-columns: 1.2fr 0.95fr !important;
        }
      }
      .numpad-dual-hint {
        margin-top: 6px;
        text-align: center;
        font-size: 11.5px;
        font-weight: 700;
        color: #54725e;
      }
      body.dark-mode .numpad-dual-hint {
        color: #9ec0aa;
      }
      .quiz-main-col {
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .quiz-side-pane {
        min-width: 0;
        border-left: 1.5px dashed #dce7d5;
        padding-left: 16px;
      }
      body.dark-mode .quiz-side-pane {
        border-left-color: #2c4637;
      }
      @media (max-width: 859px) {
        .quiz-side-pane {
          border-left: none;
          border-top: 1.5px dashed #dce7d5;
          padding-left: 0;
          padding-top: 12px;
        }
      }
      body[data-view="quiz"] .quiz-companion {
        margin: 0 0 8px !important;
        padding: 0 0 8px !important;
        border-bottom: 1px solid #ecf2e8;
        gap: 8px !important;
      }
      body[data-view="quiz"] .quiz-companion .animal {
        width: 34px !important;
        height: 34px !important;
      }
      body[data-view="quiz"] .quiz-companion span {
        font-size: 13px !important;
      }
      .quiz-util-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 7px;
        margin-bottom: 8px;
      }
      .quiz-pill-btn,
      .quiz-util-bar #speakQuizBtn {
        display: inline-flex !important;
        align-items: center !important;
        gap: 5px !important;
        min-height: 34px !important;
        padding: 5px 11px !important;
        border-radius: 999px !important;
        border: 1.5px solid #cfe0c7 !important;
        background: #ffffff !important;
        color: #294e38 !important;
        font-size: 12.5px !important;
        font-weight: 800 !important;
        cursor: pointer !important;
        margin: 0 !important;
      }
      .quiz-pill-btn:hover,
      .quiz-util-bar #speakQuizBtn:hover {
        background: #eef6ea !important;
        border-color: #88b582 !important;
      }
      .quiz-pill-btn.is-active,
      .quiz-pill-btn.is-active:hover {
        background: #2b6a50 !important;
        border-color: #1f4f3c !important;
        color: #ffffff !important;
      }
      body.dark-mode .quiz-pill-btn,
      body.dark-mode .quiz-util-bar #speakQuizBtn {
        background: #18271f !important;
        border-color: #2e4b3a !important;
        color: #d2e9dc !important;
      }
      body.dark-mode .quiz-pill-btn.is-active {
        background: #2b6a50 !important;
        border-color: #4ea880 !important;
        color: #fff !important;
      }
      body[data-view="quiz"] .question {
        margin: 6px 0 12px !important;
        font-size: clamp(26px, 4.2vw, 42px) !important;
        line-height: 1.25 !important;
        min-height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
      body[data-view="quiz"] .question.question-compact {
        font-size: clamp(19px, 2.8vw, 30px) !important;
      }
      body[data-view="quiz"] .answers {
        gap: 10px !important;
        margin-top: 4px !important;
      }
      body[data-view="quiz"] .answer {
        min-height: 66px !important;
        padding: 10px 14px !important;
        font-size: clamp(20px, 2.5vw, 26px) !important;
      }
      body[data-view="quiz"] .quiz-feedback {
        margin: 8px 0 0 !important;
        min-height: 20px;
        font-size: 13.5px !important;
      }
      body[data-view="quiz"] .worked-example {
        margin-top: 8px !important;
        padding: 10px 14px !important;
        font-size: 13.5px !important;
        line-height: 1.45 !important;
        max-height: 210px;
        overflow-y: auto;
      }
      /* Collapse disabled numpad keypad while reviewing wrong-answer explanation so Next button stays 100% in viewport with zero scroll */
      body[data-view="quiz"] .quiz-main-col:has(.worked-example:not([hidden])) .numpad-grid,
      body[data-view="quiz"] .quiz-main-col:has(.worked-example:not([hidden])) .numpad-dual-hint {
        display: none !important;
      }
      body[data-view="quiz"] .numpad-wrap {
        max-width: 340px !important;
        margin: 0 auto !important;
      }
      body[data-view="quiz"] .numpad-display {
        min-height: 44px !important;
        padding: 6px 12px !important;
        margin-bottom: 8px !important;
      }
      body[data-view="quiz"] .np-btn {
        min-height: 44px !important;
        font-size: 18px !important;
      }
      body[data-view="quiz"] .quiz-kbd-hint {
        margin-top: 8px !important;
        padding: 5px 10px !important;
        font-size: 11.5px !important;
      }
      body[data-view="quiz"] .scratchpad-drawer {
        margin-top: 0 !important;
      }
      body[data-view="quiz"] .scratchpad-canvas-wrap {
        height: 260px !important;
      }

      /* ===== Interactive Column Arithmetic ("Đặt tính rồi tính") ===== */
      .column-calc-panel {
        border: 2px solid #d5e4cc;
        border-radius: 18px;
        background: #fffdf7;
        overflow: hidden;
      }
      .col-calc-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 12px;
        background: #f2f8ef;
        border-bottom: 1.5px solid #dfecd7;
        font-size: 13px;
        font-weight: 800;
        color: #254b35;
      }
      .col-calc-head-btns {
        display: flex;
        gap: 6px;
      }
      .col-calc-tip {
        padding: 6px 12px;
        font-size: 11.5px;
        color: #546d5c;
        background: #fafcf8;
        border-bottom: 1px solid #edf3e9;
      }
      .col-notebook {
        padding: 12px 14px 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        background-image: linear-gradient(to bottom, rgba(56, 105, 80, 0.06) 1px, transparent 1px);
        background-size: 100% 24px;
      }
      .col-grid-row {
        display: grid;
        grid-template-columns: 32px repeat(var(--col-n, 3), 40px);
        gap: 6px;
        align-items: center;
        justify-items: center;
      }
      .col-op-cell {
        font-size: 22px;
        font-weight: 900;
        color: #2d6a51;
        text-align: center;
      }
      .col-carry-lbl {
        font-size: 10.5px;
        font-weight: 800;
        color: #8a6d3b;
        text-transform: uppercase;
      }
      .col-carry-btn {
        width: 26px !important;
        height: 24px !important;
        min-height: 24px !important;
        padding: 0 !important;
        border-radius: 7px !important;
        border: 1.5px dashed #d4c49c !important;
        background: #fffcf0 !important;
        color: #b45309 !important;
        font-size: 12px !important;
        font-weight: 900 !important;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .col-carry-btn.has-carry {
        border-style: solid !important;
        border-color: #d97706 !important;
        background: #fef3c7 !important;
      }
      .col-cell {
        width: 40px;
        height: 36px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 25px;
        font-weight: 900;
        color: #223f2f;
        font-variant-numeric: tabular-nums;
      }
      .col-comma {
        width: 18px;
        color: #c2410c;
      }
      .col-divider-line {
        width: calc(32px + var(--col-n, 3) * 46px);
        max-width: 100%;
        height: 3px;
        border-radius: 3px;
        background: #2b4f3a;
        margin: 2px 0 4px;
      }
      .col-ans-cell {
        width: 40px !important;
        height: 44px !important;
        min-height: 44px !important;
        margin: 0 !important;
        padding: 0 !important;
        border-radius: 11px !important;
        border: 2px solid #b8d3ba !important;
        background: #ffffff !important;
        color: #1c4a32 !important;
        font-size: 23px !important;
        font-weight: 900 !important;
        text-align: center !important;
        cursor: pointer;
      }
      .col-ans-cell.is-focused,
      .col-ans-cell:focus {
        border-color: #2d6a51 !important;
        background: #eefaf2 !important;
        box-shadow: 0 0 0 3px rgba(45, 106, 81, 0.18) !important;
        outline: none !important;
      }
      .col-digit-pad {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 5px;
        padding: 8px 10px;
        background: #f5faf3;
        border-top: 1px solid #e1ede0;
      }
      .col-pad-btn {
        min-height: 34px !important;
        padding: 4px 0 !important;
        border-radius: 9px !important;
        border: 1.5px solid #cfe0c9 !important;
        background: #ffffff !important;
        color: #244632 !important;
        font-size: 15px !important;
        font-weight: 800 !important;
      }
      .col-pad-btn:hover {
        background: #e9f5e6 !important;
      }
      .col-pad-back {
        grid-column: span 2;
        background: #fff4ec !important;
        border-color: #efd2ba !important;
        color: #9a3412 !important;
      }
      .col-calc-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 9px 12px;
        border-top: 1.5px solid #e1ede0;
        background: #ffffff;
      }
      .col-preview-text {
        font-size: 13px;
        color: #4d6756;
      }
      .col-preview-text strong {
        font-size: 17px;
        color: #1f5438;
      }
      .col-apply-btn {
        min-height: 36px !important;
        padding: 6px 12px !important;
        font-size: 13px !important;
        border-radius: 10px !important;
      }
      body.dark-mode .column-calc-panel { background: #14211a; border-color: #2b4637; }
      body.dark-mode .col-calc-head { background: #1a2b22; border-bottom-color: #2b4637; color: #d5ecde; }
      body.dark-mode .col-calc-tip { background: #16241c; border-bottom-color: #263d30; color: #9eb9a8; }
      body.dark-mode .col-cell { color: #e6f5ec; }
      body.dark-mode .col-divider-line { background: #64a882; }
      body.dark-mode .col-carry-btn { background: #222015 !important; border-color: #6b5826 !important; color: #facc15 !important; }
      body.dark-mode .col-ans-cell { background: #111c16 !important; border-color: #325440 !important; color: #e8f7ee !important; }
      body.dark-mode .col-ans-cell.is-focused { background: #1b3627 !important; border-color: #52b788 !important; }
      body.dark-mode .col-digit-pad { background: #17251d; border-top-color: #2a4335; }
      body.dark-mode .col-pad-btn { background: #1f3127 !important; border-color: #324f3e !important; color: #e2f3e8 !important; }
      body.dark-mode .col-calc-footer { background: #15221b; border-top-color: #2a4335; }
      body.dark-mode .col-preview-text strong { color: #9ee6be; }
    `;
    document.head.append(style);
  }

  const exp = { parseColumnArithmetic, toggleColumnCalc };
  if (typeof window !== 'undefined') Object.assign(window, exp);
  if (typeof global !== 'undefined') Object.assign(global, exp);
})();
