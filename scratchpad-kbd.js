// Fast keyboard shortcuts (1-4 / A-D / Numpad / Enter / S / R) & Touch/Mouse Drawing Scratchpad
(() => {
  'use strict';

  let scratchpadOpen = false;
  let scratchpadTool = 'pen'; // 'pen' | 'eraser'
  let scratchpadColor = '#1d3b2b';
  let strokes = [];
  let activeStroke = null;
  let canvasRef = null;
  let ctxRef = null;

  const PEN_COLORS = [
    { id: 'ink', color: '#1d3b2b', darkColor: '#e8f5ec', labelVi: 'Mực đen', labelEn: 'Ink' },
    { id: 'blue', color: '#2563eb', darkColor: '#60a5fa', labelVi: 'Xanh dương', labelEn: 'Blue' },
    { id: 'red', color: '#dc2626', darkColor: '#f87171', labelVi: 'Đỏ', labelEn: 'Red' }
  ];

  function isDark() {
    return typeof document !== 'undefined' && document.body && document.body.classList.contains('dark-mode');
  }

  function effectiveStrokeColor(strokeColor) {
    if (strokeColor === '#1d3b2b' && isDark()) return '#e8f5ec';
    if (strokeColor === '#e8f5ec' && !isDark()) return '#1d3b2b';
    return strokeColor;
  }

  function resizeAndRedrawCanvas() {
    if (!canvasRef || !ctxRef) return;
    const rect = canvasRef.getBoundingClientRect();
    const w = Math.max(260, Math.round(rect.width || 560));
    const h = Math.max(180, Math.round(rect.height || 220));
    const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
    if (canvasRef.width !== Math.round(w * dpr) || canvasRef.height !== Math.round(h * dpr)) {
      canvasRef.width = Math.round(w * dpr);
      canvasRef.height = Math.round(h * dpr);
    }
    ctxRef.setTransform(dpr, 0, 0, dpr, 0, 0);
    redrawStrokes();
  }

  function redrawStrokes() {
    if (!canvasRef || !ctxRef) return;
    const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
    const w = canvasRef.width / dpr;
    const h = canvasRef.height / dpr;
    ctxRef.clearRect(0, 0, w, h);

    // Subtle ruled notebook grid
    ctxRef.save();
    ctxRef.strokeStyle = isDark() ? 'rgba(130, 180, 150, 0.12)' : 'rgba(56, 105, 80, 0.10)';
    ctxRef.lineWidth = 1;
    const step = 28;
    for (let y = step; y < h; y += step) {
      ctxRef.beginPath();
      ctxRef.moveTo(0, y);
      ctxRef.lineTo(w, y);
      ctxRef.stroke();
    }
    for (let x = step; x < w; x += step) {
      ctxRef.beginPath();
      ctxRef.moveTo(x, 0);
      ctxRef.lineTo(x, h);
      ctxRef.stroke();
    }
    ctxRef.restore();

    for (const st of strokes) {
      if (!st.points || st.points.length === 0) continue;
      ctxRef.save();
      ctxRef.lineCap = 'round';
      ctxRef.lineJoin = 'round';
      if (st.tool === 'eraser') {
        ctxRef.globalCompositeOperation = 'destination-out';
        ctxRef.lineWidth = 18;
        ctxRef.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctxRef.globalCompositeOperation = 'source-over';
        ctxRef.lineWidth = 3;
        ctxRef.strokeStyle = effectiveStrokeColor(st.color);
      }
      ctxRef.beginPath();
      if (st.points.length === 1) {
        const p = st.points[0];
        ctxRef.arc(p.x, p.y, st.tool === 'eraser' ? 9 : 1.8, 0, Math.PI * 2);
        ctxRef.fillStyle = st.tool === 'eraser' ? 'rgba(0,0,0,1)' : effectiveStrokeColor(st.color);
        ctxRef.fill();
      } else {
        ctxRef.moveTo(st.points[0].x, st.points[0].y);
        for (let i = 1; i < st.points.length - 1; i++) {
          const midX = (st.points[i].x + st.points[i + 1].x) / 2;
          const midY = (st.points[i].y + st.points[i + 1].y) / 2;
          ctxRef.quadraticCurveTo(st.points[i].x, st.points[i].y, midX, midY);
        }
        const last = st.points[st.points.length - 1];
        ctxRef.lineTo(last.x, last.y);
        ctxRef.stroke();
      }
      ctxRef.restore();
    }
  }

  function clearScratchpad() {
    strokes = [];
    activeStroke = null;
    redrawStrokes();
  }

  function undoScratchpad() {
    if (!strokes.length) return;
    strokes.pop();
    redrawStrokes();
  }

  function toggleScratchpad(forceState) {
    scratchpadOpen = typeof forceState === 'boolean' ? forceState : !scratchpadOpen;
    const drawer = $('#scratchpadDrawer');
    const toggleBtn = $('#scratchpadToggleBtn');
    if (drawer) {
      drawer.hidden = !scratchpadOpen;
      drawer.classList.toggle('is-open', scratchpadOpen);
    }
    if (toggleBtn) {
      toggleBtn.classList.toggle('is-active', scratchpadOpen);
      toggleBtn.setAttribute('aria-expanded', String(scratchpadOpen));
    }
    if (scratchpadOpen) {
      setTimeout(resizeAndRedrawCanvas, 20);
    }
    return scratchpadOpen;
  }

  function bindCanvasEvents(canvas) {
    canvasRef = canvas;
    ctxRef = canvas.getContext ? canvas.getContext('2d') : null;
    if (!ctxRef) return;

    const getPoint = e => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    canvas.addEventListener('pointerdown', e => {
      if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return;
      e.preventDefault();
      if (canvas.setPointerCapture) {
        try { canvas.setPointerCapture(e.pointerId); } catch {}
      }
      const color = isDark() && scratchpadColor === '#1d3b2b' ? '#e8f5ec' : scratchpadColor;
      activeStroke = { tool: scratchpadTool, color, points: [getPoint(e)] };
      strokes.push(activeStroke);
      redrawStrokes();
    });

    canvas.addEventListener('pointermove', e => {
      if (!activeStroke) return;
      e.preventDefault();
      const pt = getPoint(e);
      const prev = activeStroke.points[activeStroke.points.length - 1];
      if (!prev || Math.hypot(pt.x - prev.x, pt.y - prev.y) >= 1.5) {
        activeStroke.points.push(pt);
        redrawStrokes();
      }
    });

    const finishStroke = () => {
      activeStroke = null;
    };
    canvas.addEventListener('pointerup', finishStroke);
    canvas.addEventListener('pointercancel', finishStroke);
  }

  function injectQuizScratchpadAndKbdUI() {
    if (typeof view === 'undefined' || view !== 'quiz') return;
    const card = $('#quizCard');
    if (!card || card.querySelector('#scratchpadDrawer')) return;

    // Reset strokes for each new question
    strokes = [];
    activeStroke = null;

    // Add keyboard shortcut hints on choice buttons
    $$('#quizCard [data-answer]').forEach((btn, idx) => {
      if (!btn.querySelector('.kbd-num-tag')) {
        const tag = document.createElement('span');
        tag.className = 'kbd-num-tag';
        tag.textContent = String(idx + 1);
        tag.setAttribute('aria-hidden', 'true');
        btn.append(tag);
      }
    });

    // Inject Scratchpad toggle button into quiz top bar (next to timer)
    const metaLeft = $('.quiz-meta-left');
    if (metaLeft && !$('#scratchpadToggleBtn')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'scratchpadToggleBtn';
      btn.className = 'scratchpad-toggle-btn' + (scratchpadOpen ? ' is-active' : '');
      btn.setAttribute('aria-expanded', String(scratchpadOpen));
      btn.title = t('Mở/Đóng bảng nháp vẽ tay (phím S)', 'Toggle drawing scratchpad (S)');
      btn.innerHTML = `✏️ <span>${t('Nháp', 'Scratchpad')}</span>`;
      btn.onclick = () => toggleScratchpad();
      metaLeft.append(btn);
    }

    // Build collapsible scratchpad drawer inside quizCard
    const drawer = document.createElement('div');
    drawer.id = 'scratchpadDrawer';
    drawer.className = 'scratchpad-drawer' + (scratchpadOpen ? ' is-open' : '');
    drawer.hidden = !scratchpadOpen;
    drawer.innerHTML = `
      <div class="scratchpad-bar">
        <div class="scratchpad-tools">
          <span class="scratchpad-label">✏️ ${t('Bảng nháp', 'Scratchpad')}</span>
          <div class="scratchpad-colors">
            ${PEN_COLORS.map(c => `<button type="button" class="sp-color-btn ${scratchpadTool === 'pen' && scratchpadColor === c.color ? 'active' : ''}" data-sp-color="${c.color}" title="${t(c.labelVi, c.labelEn)}" style="--sp-c:${c.color}"></button>`).join('')}
          </div>
          <button type="button" class="sp-tool-btn ${scratchpadTool === 'eraser' ? 'active' : ''}" id="spEraserBtn" title="${t('Tẩy', 'Eraser')}">🧽 ${t('Tẩy', 'Erase')}</button>
        </div>
        <div class="scratchpad-actions">
          <button type="button" class="sp-tool-btn" id="spUndoBtn" title="${t('Hoàn tác nét vẽ', 'Undo')}">↩ ${t('Hoàn tác', 'Undo')}</button>
          <button type="button" class="sp-tool-btn" id="spClearBtn" title="${t('Xóa sạch bảng nháp', 'Clear')}">🗑️ ${t('Xóa', 'Clear')}</button>
          <button type="button" class="sp-tool-btn" id="spCloseBtn" title="${t('Thu gọn bảng nháp', 'Close')}">✕</button>
        </div>
      </div>
      <div class="scratchpad-canvas-wrap">
        <canvas id="scratchpadCanvas" class="scratchpad-canvas" aria-label="${t('Bảng nháp vẽ tay để tính toán', 'Drawing scratchpad for calculations')}"></canvas>
      </div>
    `;
    card.append(drawer);

    // Subtle keyboard shortcut hint bar
    const kbdHint = document.createElement('div');
    kbdHint.className = 'quiz-kbd-hint';
    const isNumpad = typeof config !== 'undefined' && config?.inputMode === 'numpad';
    kbdHint.innerHTML = isNumpad
      ? `⌨️ ${t('Gõ số <b>0–9</b>, <b>-</b>, <b>/</b>, <b>,</b> · <b>Enter</b> trả lời · <b>S</b> bảng nháp', 'Type <b>0–9</b>, <b>-</b>, <b>/</b>, <b>.</b> · <b>Enter</b> submit · <b>S</b> scratchpad')}`
      : `⌨️ ${t('Phím tắt: <b>1–4</b> (hoặc <b>A–D</b>) chọn đáp án · <b>Enter</b> câu tiếp · <b>S</b> mở nháp · <b>R</b> đọc đề', 'Shortcuts: <b>1–4</b> (or <b>A–D</b>) answer · <b>Enter</b> next · <b>S</b> scratchpad · <b>R</b> read aloud')}`;
    card.append(kbdHint);

    const canvas = $('#scratchpadCanvas');
    if (canvas) bindCanvasEvents(canvas);

    $$('[data-sp-color]').forEach(btn => {
      btn.onclick = () => {
        scratchpadTool = 'pen';
        scratchpadColor = btn.dataset.spColor;
        $$('[data-sp-color]').forEach(b => b.classList.toggle('active', b.dataset.spColor === scratchpadColor));
        $('#spEraserBtn')?.classList.remove('active');
      };
    });
    const eraserBtn = $('#spEraserBtn');
    if (eraserBtn) {
      eraserBtn.onclick = () => {
        scratchpadTool = scratchpadTool === 'eraser' ? 'pen' : 'eraser';
        eraserBtn.classList.toggle('active', scratchpadTool === 'eraser');
        $$('[data-sp-color]').forEach(b => b.classList.toggle('active', scratchpadTool === 'pen' && b.dataset.spColor === scratchpadColor));
      };
    }
    const undoBtn = $('#spUndoBtn');
    if (undoBtn) undoBtn.onclick = undoScratchpad;
    const clearBtn = $('#spClearBtn');
    if (clearBtn) clearBtn.onclick = clearScratchpad;
    const closeBtn = $('#spCloseBtn');
    if (closeBtn) closeBtn.onclick = () => toggleScratchpad(false);

    if (scratchpadOpen) {
      setTimeout(resizeAndRedrawCanvas, 20);
    }
  }

  // Global keyboard handler for Quiz & Speed Sprint 60s
  function handleQuizKeydown(e) {
    if (!e || e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    if (typeof view === 'undefined' || (view !== 'quiz' && view !== 'sprint60')) return;

    // Ignore when typing inside form inputs or when modal dialog is open
    const tag = (e.target && e.target.tagName ? e.target.tagName : '').toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) return;
    const dlg = $('#modal');
    if (dlg && dlg.open) return;

    const key = String(e.key || '');
    const low = key.toLowerCase();

    if (view === 'sprint60') {
      const idxMap = { '1': 0, '2': 1, '3': 2, '4': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
      if (Object.prototype.hasOwnProperty.call(idxMap, low)) {
        const opts = $$('[data-sprint-opt]');
        const target = opts[idxMap[low]];
        if (target && !target.disabled) {
          e.preventDefault();
          target.click();
          return true;
        }
      }
      return false;
    }

    // Quiz view shortcuts
    if (low === 's') {
      e.preventDefault();
      toggleScratchpad();
      return true;
    }
    if (low === 'r') {
      const speakBtn = $('#speakQuizBtn') || $('#speakQuestionBtn');
      if (speakBtn) {
        e.preventDefault();
        speakBtn.click();
        return true;
      }
    }

    // If worked-example Next button is visible, Enter or Space advances immediately
    const nextBtn = $('#nextQuizBtn');
    if (nextBtn && (key === 'Enter' || key === ' ')) {
      e.preventDefault();
      nextBtn.click();
      return true;
    }

    if (typeof session !== 'undefined' && session && (session.answered || session.done)) {
      return false;
    }

    // Numpad keyboard input
    const submitBtn = $('#numpadSubmit');
    const isNumpadActive = Boolean(submitBtn && typeof config !== 'undefined' && config?.inputMode === 'numpad' && typeof handleNumpad === 'function');
    if (isNumpadActive) {
      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        const btn = $(`[data-np="${key}"]`);
        if (btn && !btn.disabled) btn.click();
        return true;
      }
      if (key === '-' || key === 'Subtract') {
        e.preventDefault();
        $('[data-np="-"]')?.click();
        return true;
      }
      if (key === '/' || key === 'Divide') {
        e.preventDefault();
        $('[data-np="/"]')?.click();
        return true;
      }
      if (key === ',' || key === '.' || key === 'Decimal') {
        e.preventDefault();
        $('[data-np=","]')?.click();
        return true;
      }
      if (key === 'Backspace') {
        e.preventDefault();
        $('[data-np="backspace"]')?.click();
        return true;
      }
      if (key === 'Escape' || key === 'Delete') {
        e.preventDefault();
        $('[data-np="clear"]')?.click();
        return true;
      }
      if (key === 'Enter') {
        e.preventDefault();
        if (!submitBtn.disabled) submitBtn.click();
        return true;
      }
      return false;
    }

    // Multiple-choice keyboard shortcuts: 1-4 or A-D
    const choiceMap = { '1': 0, '2': 1, '3': 2, '4': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
    if (Object.prototype.hasOwnProperty.call(choiceMap, low)) {
      const buttons = $$('#quizCard [data-answer]');
      const target = buttons[choiceMap[low]];
      if (target && !target.disabled) {
        e.preventDefault();
        target.click();
        return true;
      }
    }
    return false;
  }

  // Hook showQuiz cleanly
  const showQuizBeforeScratchpad = typeof showQuiz === 'function' ? showQuiz : null;
  if (showQuizBeforeScratchpad) {
    showQuiz = function () {
      showQuizBeforeScratchpad();
      injectQuizScratchpadAndKbdUI();
    };
    if (typeof window !== 'undefined') window.showQuiz = showQuiz;
    if (typeof global !== 'undefined') global.showQuiz = showQuiz;
  }

  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('keydown', handleQuizKeydown);
    window.addEventListener('resize', () => {
      if (scratchpadOpen) resizeAndRedrawCanvas();
    });
  }

  // Inject styles
  if (typeof document !== 'undefined' && document.head) {
    const style = document.createElement('style');
    style.textContent = `
      .scratchpad-toggle-btn{display:inline-flex;align-items:center;gap:5px;min-height:34px;padding:5px 11px;border-radius:999px;border:1.5px solid #cfe0c7;background:#fff;color:#2c523b;font-size:12.5px;font-weight:800;cursor:pointer;transition:all .15s ease}
      .scratchpad-toggle-btn:hover{background:#eef6ea;border-color:#8eb787}
      .scratchpad-toggle-btn.is-active,.scratchpad-toggle-btn.is-active:hover{background:#2b6a50!important;border-color:#1f4f3c!important;color:#fff!important}
      .scratchpad-drawer{margin-top:14px;border:2px solid #d5e4cc;border-radius:18px;background:#fffdf7;overflow:hidden;box-shadow:inset 0 1px 0 rgba(255,255,255,.7)}
      .scratchpad-bar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;padding:8px 12px;background:#f3f8f0;border-bottom:1.5px solid #e0ecd8}
      .scratchpad-tools,.scratchpad-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
      .scratchpad-label{font-size:12px;font-weight:800;color:#2e513a;margin-right:2px}
      .scratchpad-colors{display:inline-flex;align-items:center;gap:5px;padding:2px 6px;border-radius:999px;background:#fff;border:1px solid #d8e5d0}
      .sp-color-btn{width:22px;height:22px;min-height:22px;padding:0;border-radius:50%;border:2px solid transparent;background:var(--sp-c,#1d3b2b);cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.15)}
      .sp-color-btn.active{border-color:#fff;box-shadow:0 0 0 2.5px #34765c;transform:scale(1.08)}
      .sp-tool-btn{min-height:30px;padding:4px 9px;border-radius:10px;border:1px solid #d3e1cb;background:#fff;color:#2f4e3b;font-size:12px;font-weight:700;cursor:pointer}
      .sp-tool-btn:hover{background:#eaf4e4}
      .sp-tool-btn.active{background:#34765c;border-color:#285f49;color:#fff}
      .scratchpad-canvas-wrap{position:relative;width:100%;height:220px;background:#fffdf7}
      .scratchpad-canvas{display:block;width:100%;height:100%;touch-action:none;cursor:crosshair}
      .quiz-kbd-hint{margin-top:12px;padding:7px 12px;border-radius:10px;background:#f5f9f2;color:#5a7262;font-size:12px;text-align:center}
      .quiz-kbd-hint b{color:#264b35;background:#e4efe0;padding:1px 5px;border-radius:5px;font-weight:800}
      .answer{position:relative}
      .kbd-num-tag{position:absolute;top:8px;right:10px;width:20px;height:20px;border-radius:6px;background:rgba(52,118,92,.1);color:#4a6b56;font-size:11px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;pointer-events:none}
      body.dark-mode .scratchpad-toggle-btn{background:#192820;border-color:#2f4c3b;color:#cde4d6}
      body.dark-mode .scratchpad-toggle-btn.is-active{background:#34765c;border-color:#4ea880;color:#fff}
      body.dark-mode .scratchpad-drawer{background:#142019;border-color:#2c4637}
      body.dark-mode .scratchpad-bar{background:#1a2b22;border-bottom-color:#2b4536}
      body.dark-mode .scratchpad-label{color:#d3e9dc}
      body.dark-mode .scratchpad-colors{background:#111c16;border-color:#2c4637}
      body.dark-mode .sp-tool-btn{background:#15241c;border-color:#2d4838;color:#d0e6d9}
      body.dark-mode .sp-tool-btn.active{background:#34765c;color:#fff}
      body.dark-mode .scratchpad-canvas-wrap{background:#121e17}
      body.dark-mode .quiz-kbd-hint{background:#17241d;color:#9bb6a5}
      body.dark-mode .quiz-kbd-hint b{background:#23382c;color:#dcf2e4}
      body.dark-mode .kbd-num-tag{background:rgba(140,210,170,.14);color:#a8cbb6}
      @media (max-width: 700px) {
        .quiz-kbd-hint, .kbd-num-tag { display: none; }
        .scratchpad-canvas-wrap { height: 200px; }
      }
    `;
    document.head.append(style);
  }

  if (typeof window !== 'undefined') {
    window.toggleScratchpad = toggleScratchpad;
    window.clearScratchpad = clearScratchpad;
    window.undoScratchpad = undoScratchpad;
    window.handleQuizKeydown = handleQuizKeydown;
  }
  if (typeof global !== 'undefined') {
    global.toggleScratchpad = toggleScratchpad;
    global.clearScratchpad = clearScratchpad;
    global.undoScratchpad = undoScratchpad;
    global.handleQuizKeydown = handleQuizKeydown;
  }
})();
