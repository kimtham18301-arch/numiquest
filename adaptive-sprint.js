'use strict';
// Adaptive Difficulty + 60-Second Sprint Mode + Daily Quests
(() => {
  function todayKey() {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  }

  function computeAdaptiveConfig(baseCfg, adaptiveStreak = 0, masteryMap = {}) {
    const cfg = { ...(baseCfg || config || defaults) };
    if (cfg.adaptive === false) return { cfg, levelDelta: 0 };

    let delta = 0;
    if (adaptiveStreak >= 4) delta = 1;
    else if (adaptiveStreak <= -2) delta = -1;
    else if (adaptiveStreak === 0 && masteryMap && typeof masteryMap === 'object') {
      const type = cfg.type || (Array.isArray(cfg.types) ? cfg.types[0] : 'natural');
      const ops = Array.isArray(cfg.ops) && cfg.ops.length ? cfg.ops : ['+'];
      let sum = 0, cnt = 0;
      for (const op of ops) {
        const arr = masteryMap[`${type}:${op}`];
        if (Array.isArray(arr) && arr.length >= 5) {
          const recent = arr.slice(-8);
          sum += recent.reduce((a, b) => a + b, 0);
          cnt += recent.length;
        }
      }
      if (cnt >= 5) {
        const rate = sum / cnt;
        if (rate >= 0.88) delta = 1;
        else if (rate < 0.45) delta = -1;
      }
    }

    const baseDigits = Array.isArray(cfg.digits) && cfg.digits.length ? cfg.digits.map(Number).filter(Boolean) : [cfg.d1 || 1];
    const maxD = Math.max(...baseDigits, 1);
    const minD = Math.min(...baseDigits, 1);

    if (delta > 0) {
      const nextMax = Math.min(3, maxD + 1);
      cfg.digits = nextMax > minD ? [minD, nextMax] : [nextMax];
      cfg.d1 = nextMax;
    } else if (delta < 0) {
      const nextMin = Math.max(1, minD - 1);
      cfg.digits = [nextMin];
      cfg.d1 = nextMin;
    }

    return { cfg, levelDelta: delta };
  }

  // Wrap setup() to expose Adaptive Difficulty toggle
  const setupBeforeAdaptive = typeof setup === 'function' ? setup : null;
  if (setupBeforeAdaptive) {
    setup = function () {
      setupBeforeAdaptive();
      const form = $('#config');
      if (!form || $('#adaptiveToggleWrap')) return;
      const submitBtn = form.querySelector('button[type="submit"], .primary');
      const wrap = document.createElement('label');
      wrap.id = 'adaptiveToggleWrap';
      wrap.className = 'adaptive-toggle-row';
      const checked = config.adaptive !== false ? 'checked' : '';
      wrap.innerHTML = `<input type="checkbox" name="adaptive" ${checked}> <span><b>${t('Lộ trình thích ứng', 'Adaptive difficulty')}</b> <small class="muted">${t('(Tự tăng/giảm độ khó theo chuỗi trả lời đúng/sai)', '(Auto-adjusts difficulty based on your streak)')}</small></span>`;
      if (submitBtn) submitBtn.before(wrap);
      else form.append(wrap);

      const prevSubmit = form.onsubmit;
      if (prevSubmit) {
        form.onsubmit = function (e) {
          const cb = form.querySelector('input[name="adaptive"]');
          if (cb) config.adaptive = cb.checked;
          return prevSubmit.call(this, e);
        };
      }
    };
  }

  // Wrap startQuiz, answerQuiz, showQuiz for Adaptive Difficulty
  const startQuizBeforeAdaptive = typeof startQuiz === 'function' ? startQuiz : null;
  if (startQuizBeforeAdaptive) {
    startQuiz = function () {
      startQuizBeforeAdaptive();
      if (session) {
        session.adaptiveStreak = 0;
        session.adaptiveDelta = 0;
      }
    };
  }

  const answerQuizBeforeAdaptive = typeof answerQuiz === 'function' ? answerQuiz : null;
  if (answerQuizBeforeAdaptive) {
    answerQuiz = function (ans, questionId) {
      const prevLen = session?.results?.length || 0;
      answerQuizBeforeAdaptive(ans, questionId);
      if (!session || session.done || session.results.length <= prevLen) return;
      const last = session.results[session.results.length - 1];
      if (last?.correct) {
        session.adaptiveStreak = session.adaptiveStreak > 0 ? session.adaptiveStreak + 1 : 1;
      } else {
        session.adaptiveStreak = session.adaptiveStreak < 0 ? session.adaptiveStreak - 1 : -1;
      }
      // Adjust the upcoming question in-place if adaptive mode is enabled
      if (config.adaptive !== false && session.index < session.questions.length && session.kind !== 'review') {
        const { cfg, levelDelta } = computeAdaptiveConfig(config, session.adaptiveStreak, state.mastery);
        session.adaptiveDelta = levelDelta;
        if (levelDelta !== 0) {
          session.questions[session.index] = generate(cfg);
        }
      }
    };
  }

  const showQuizBeforeAdaptive = typeof showQuiz === 'function' ? showQuiz : null;
  if (showQuizBeforeAdaptive) {
    showQuiz = function () {
      showQuizBeforeAdaptive();
      if (view !== 'quiz' || !session || session.done) return;
      const delta = session.adaptiveDelta || 0;
      if (delta === 0) return;
      const card = $('#quizCard');
      if (!card || card.querySelector('.adaptive-pill')) return;
      const pill = document.createElement('div');
      pill.className = `adaptive-pill ${delta > 0 ? 'is-up' : 'is-down'}`;
      pill.textContent = delta > 0
        ? t('⚡ Đang tăng độ khó theo phong độ tốt!', '⚡ Difficulty boosted for your streak!')
        : t('🌱 Nhịp độ vừa sức để em tự tin hơn', '🌱 Adjusted to a comfortable pace');
      card.prepend(pill);
    };
  }

  // ---------------- 60-Second Sprint Mode ----------------
  let sprintTimer = null;
  function stopSprint() {
    if (sprintTimer) {
      clearInterval(sprintTimer);
      sprintTimer = null;
    }
  }

  function startSprint60() {
    if (typeof currentAuthUser === 'function' && !currentAuthUser()) {
      toast(t('Vui lòng đăng nhập để bắt đầu thi đấu 60 giây.', 'Please sign in to start 60s Sprint.'));
      if (typeof openAccount === 'function') openAccount('login');
      return;
    }
    stop();
    stopSprint();
    view = 'sprint60';
    if (typeof window !== 'undefined') window.view = 'sprint60';
    document.body.dataset.view = 'sprint60';

    const sprintCfg = {
      ...defaults,
      ...config,
      digits: config.digits?.length ? config.digits : [1],
      ops: config.ops?.length ? config.ops : ['+', '-'],
      types: config.types?.length ? config.types : [config.type || 'natural'],
      type: config.type || 'natural',
      questionStyle: 'normal'
    };

    const s = {
      timeLeft: 60,
      correct: 0,
      total: 0,
      combo: 0,
      bestCombo: 0,
      locked: false,
      current: generate(sprintCfg)
    };

    function renderSprint() {
      if (view !== 'sprint60') { stopSprint(); return; }
      if (typeof document !== 'undefined' && document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
      const q = s.current;
      $('#app').innerHTML = `<section class="narrow card sprint-card">
        <div class="sprint-hud">
          <div class="sprint-stat">
            <small>${t('Thời gian', 'Time')}</small>
            <strong id="sprintClock" class="${s.timeLeft <= 10 ? 'is-urgent' : ''}">${s.timeLeft}s</strong>
          </div>
          <div class="sprint-stat">
            <small>${t('Điểm đúng', 'Score')}</small>
            <strong>${s.correct}</strong>
          </div>
          <div class="sprint-stat">
            <small>${t('Combo', 'Combo')}</small>
            <strong>${s.combo > 1 ? '🔥 x' + s.combo : s.combo}</strong>
          </div>
          <div class="sprint-stat">
            <small>${t('Kỷ lục', 'Best')}</small>
            <strong>${state.sprintBest || 0}</strong>
          </div>
        </div>
        <div class="sprint-problem">${typeof formatQuestionPrompt === 'function' ? formatQuestionPrompt(q.q) : (typeof mathMarkup === 'function' ? mathMarkup(q.q) : esc(q.q))}</div>
        <div class="choices sprint-choices">
          ${q.options.map((opt, idx) => `<button type="button" class="choice" data-sprint-opt="${idx}">${typeof mathMarkup === 'function' ? mathMarkup(opt) : esc(opt)}</button>`).join('')}
        </div>
        <div class="sprint-actions">
          <button type="button" id="sprintQuitBtn" class="ghost">${t('Dừng lượt', 'Quit')}</button>
        </div>
      </section>`;

      $$('[data-sprint-opt]').forEach(btn => {
        btn.onclick = () => {
          if (s.locked || view !== 'sprint60') return;
          s.locked = true;
          const chosen = q.options[Number(btn.dataset.sprintOpt)];
          const ok = isAnswerMatch(chosen, q.answer);
          s.total++;
          if (ok) {
            s.correct++;
            s.combo++;
            if (s.combo > s.bestCombo) s.bestCombo = s.combo;
            btn.classList.add('is-correct');
            if (typeof chime === 'function') chime(true);
            setTimeout(() => {
              if (view !== 'sprint60') return;
              s.locked = false;
              s.current = generate(sprintCfg);
              renderSprint();
            }, 130);
          } else {
            s.combo = 0;
            btn.classList.add('is-wrong');
            $$('[data-sprint-opt]').forEach((b, i) => {
              if (isAnswerMatch(q.options[i], q.answer)) b.classList.add('is-correct');
            });
            if (typeof chime === 'function') chime(false);
            setTimeout(() => {
              if (view !== 'sprint60') return;
              s.locked = false;
              s.current = generate(sprintCfg);
              renderSprint();
            }, 450);
          }
        };
      });

      const quitBtn = $('#sprintQuitBtn');
      if (quitBtn) {
        quitBtn.onclick = () => {
          stopSprint();
          nav('home');
        };
      }
    }

    function finishSprint() {
      stopSprint();
      if (view !== 'sprint60') return;
      const earnedXp = s.correct * 3 + s.bestCombo * 2;
      const earnedPearls = Math.floor(s.correct / 3);
      const prevBest = state.sprintBest || 0;
      const isNewBest = s.correct > prevBest;
      state.sprintBest = Math.max(prevBest, s.correct);
      state.xp += earnedXp;
      if (s.correct > 0 && typeof updateStreak === 'function') updateStreak();
      state.history.push({
        date: new Date().toISOString(),
        mode: 'sprint60',
        correct: s.correct,
        total: Math.max(1, s.total),
        time: s.total ? Number((60 / s.total).toFixed(1)) : 60,
        extra: 0
      });
      state.history = state.history.slice(-200);
      if (earnedPearls > 0 && typeof teaState === 'function') {
        const tea = teaState();
        tea.pearls = (tea.pearls || 0) + earnedPearls;
      }
      save();

      if (s.correct >= 8 && typeof triggerConfetti === 'function') triggerConfetti();

      $('#app').innerHTML = `<section class="narrow card quiz-finish-card">
        <span class="eyebrow">NUMIQUICK · ${t('THI ĐẤU 60 GIÂY', '60-SECOND SPRINT')}</span>
        <h1>${isNewBest ? t('🏆 Kỷ lục mới!', '🏆 New Personal Best!') : t('Hết 60 giây rồi!', 'Time’s up!')}</h1>
        <div class="finish-streak-wrap">
          <span class="finish-xp-pill">+${earnedXp} XP</span>
          ${earnedPearls ? `<span class="finish-xp-pill">+${earnedPearls} 🧋</span>` : ''}
        </div>
        <div class="finish-stats-grid">
          <div class="finish-stat-box">
            <small>${t('Số câu đúng', 'Correct')}</small>
            <strong>${s.correct}</strong>
            <span>/ ${s.total} ${t('câu', 'qs')}</span>
          </div>
          <div class="finish-stat-box">
            <small>${t('Combo cao nhất', 'Best Combo')}</small>
            <strong>x${s.bestCombo}</strong>
            <span>${t('Kỷ lục', 'Best')}: ${state.sprintBest}</span>
          </div>
        </div>
        <div class="finish-actions">
          <button type="button" class="primary wide" id="sprintReplayBtn">${t('Thi đấu lại 60 giây', 'Play 60s Sprint Again')} →</button>
          <button type="button" class="wide" onclick="nav('home')">${t('Về trang chủ', 'Back to Home')}</button>
        </div>
      </section>`;
      $('#sprintReplayBtn').onclick = startSprint60;
      translate();
    }

    renderSprint();
    sprintTimer = setInterval(() => {
      if (view !== 'sprint60') { stopSprint(); return; }
      s.timeLeft--;
      const clk = $('#sprintClock');
      if (clk) {
        clk.textContent = s.timeLeft + 's';
        clk.classList.toggle('is-urgent', s.timeLeft <= 10);
      }
      if (s.timeLeft <= 0) finishSprint();
    }, 1000);
  }

  // ---------------- Daily Quests ----------------
  function getDailyQuests() {
    const today = todayKey();
    const todayEntries = (state.history || []).filter(h => String(h.date || '').slice(0, 10) === today);
    const totalSessionsToday = todayEntries.length;
    const hasHighAccToday = todayEntries.some(h => h.total > 0 && (h.correct / h.total) >= 0.8);
    const hasSprintToday = todayEntries.some(h => h.mode === 'sprint60');

    if (!state.dailyQuests || state.dailyQuests.date !== today) {
      state.dailyQuests = { date: today, claimed: [] };
    }
    const claimed = new Set(state.dailyQuests.claimed || []);
    return [
      {
        id: 'q_warm',
        title: t('Khởi động hôm nay', 'Daily Warm-up'),
        desc: t('Hoàn thành 1 lượt luyện tập', 'Complete 1 practice session'),
        done: totalSessionsToday >= 1,
        claimed: claimed.has('q_warm'),
        xp: 20,
        pearls: 2
      },
      {
        id: 'q_acc',
        title: t('Chính xác cao', 'Sharp Accuracy'),
        desc: t('Đạt từ 80% trở lên trong 1 lượt', 'Score 80%+ in a session'),
        done: hasHighAccToday,
        claimed: claimed.has('q_acc'),
        xp: 25,
        pearls: 3
      },
      {
        id: 'q_sprint',
        title: t('Tia chớp 60 giây', '60s Speedster'),
        desc: t('Chơi 1 lượt Thi đấu 60 giây', 'Finish 1 round of 60s Sprint'),
        done: hasSprintToday,
        claimed: claimed.has('q_sprint'),
        xp: 30,
        pearls: 3
      }
    ];
  }

  function claimDailyQuest(id) {
    const quests = getDailyQuests();
    const q = quests.find(item => item.id === id);
    if (!q || !q.done || q.claimed) return;
    state.dailyQuests.claimed.push(id);
    state.xp += q.xp;
    if (typeof teaState === 'function') {
      const tea = teaState();
      tea.pearls = (tea.pearls || 0) + q.pearls;
    }
    save();
    toast(t(`Đã nhận +${q.xp} XP & +${q.pearls} trân châu!`, `Claimed +${q.xp} XP & +${q.pearls} pearls!`));
    if (view === 'home' && typeof home === 'function') home();
  }

  function injectHomeEnhancements() {
    if (view !== 'home') return;
    const host = $('.home-v2') || $('.simple-home');
    if (!host || host.querySelector('.midterm-hub')) return;

    const quests = getDailyQuests();
    const hub = document.createElement('section');
    hub.className = 'midterm-hub';
    const questIcons = { q_warm: '🌅', q_acc: '🎯', q_sprint: '⚡' };
    hub.innerHTML = `
      <div class="sprint-banner">
        <div>
          <span class="eyebrow">${t('CHẾ ĐỘ TỐC ĐỘ', 'SPEED MODE')}</span>
          <b>⚡ ${t('Thi đấu 60 giây', '60-Second Sprint')}</b>
          <small>${t('Trả lời nhanh liên tiếp trong 60 giây để lập kỷ lục!', 'Answer as many as you can in 60 seconds!')} ${state.sprintBest ? `· 🏆 ${t('Kỷ lục', 'Best')}: ${state.sprintBest}` : ''}</small>
        </div>
        <button type="button" class="cls-3d-btn" id="startSprint60Btn">🚀 ${t('Chơi ngay', 'Sprint')} →</button>
      </div>
      <div class="daily-quests-box">
        <h3>✨ ${t('Nhiệm vụ hôm nay', 'Daily Quests')}</h3>
        <div class="daily-quests-list">
          ${quests.map(q => `<div class="dq-item ${q.done ? 'is-done' : ''}">
            <div class="dq-badge">${questIcons[q.id] || '🌟'}</div>
            <div style="flex:1;min-width:0">
              <b>${q.title}</b>
              <small>${q.desc}</small>
            </div>
            ${q.claimed
              ? `<span class="dq-claimed">✓ ${t('Đã nhận', 'Claimed')}</span>`
              : q.done
                ? `<button type="button" class="dq-claim-btn" data-claim-quest="${q.id}">🎁 +${q.xp} XP · +${q.pearls}🧋</button>`
                : `<span class="dq-reward">+${q.xp} XP</span>`}
          </div>`).join('')}
        </div>
      </div>`;

    const anchor = host.querySelector('.home-v2-links') || host.querySelector('.home-v2-local');
    if (anchor) anchor.before(hub);
    else host.append(hub);

    const sprintBtn = $('#startSprint60Btn');
    if (sprintBtn) sprintBtn.onclick = startSprint60;
    $$('[data-claim-quest]').forEach(btn => {
      btn.onclick = () => claimDailyQuest(btn.dataset.claimQuest);
    });
  }

  const homeBeforeMidterm = typeof home === 'function' ? home : null;
  if (homeBeforeMidterm) {
    home = function () {
      stopSprint();
      homeBeforeMidterm();
      injectHomeEnhancements();
    };
  }

  // Inject concise styles for adaptive pill, sprint mode, and daily quests
  const style = document.createElement('style');
  style.textContent = `
    .adaptive-toggle-row{display:flex;align-items:center;gap:10px;margin:12px 0;padding:10px 12px;border-radius:12px;background:rgba(52,118,92,.08);cursor:pointer;font-size:14px}
    .adaptive-pill{display:inline-block;margin:0 auto 10px;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700}
    .adaptive-pill.is-up{background:#e6f6ec;color:#1b6e3c}
    .adaptive-pill.is-down{background:#fff4e2;color:#9a5b13}
    .midterm-hub{display:grid;gap:12px;margin:14px 0}
    .sprint-banner{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 18px;border-radius:22px;background:linear-gradient(135deg,#eefbf3,#fff7e0);border:2px solid #c6e2cf;box-shadow:0 5px 0 #d7ebdd}
    .sprint-banner b{display:block;font-size:17px;margin:2px 0;color:#234633}
    .sprint-banner small{display:block;color:#526b5c;font-size:13px}
    .daily-quests-box{padding:15px 18px;border-radius:22px;background:#fff;border:2px solid #d4e8da;box-shadow:0 5px 0 #e2f0e6}
    .daily-quests-box h3{margin:0 0 10px;font-size:16px;color:#234633}
    .daily-quests-list{display:grid;gap:9px}
    .dq-item{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:16px;background:#f7fbf8;border:1.5px solid #e1efe5}
    .dq-item.is-done{background:#eefbf2;border-color:#bfe3cb}
    .dq-badge{width:38px;height:38px;border-radius:12px;background:#fff3cf;display:grid;place-items:center;font-size:20px;flex:none}
    .dq-item b{display:block;font-size:14px}
    .dq-item small{display:block;color:#5f7466;font-size:12px}
    .dq-claim-btn{padding:7px 13px;border-radius:12px;border:0;background:#34765c;color:#fff;font-weight:800;font-size:12px;cursor:pointer;box-shadow:0 3px 0 #204f3d}
    .dq-claimed{color:#2b8a3e;font-weight:800;font-size:12px}
    .dq-reward{color:#6a7f71;font-weight:700;font-size:12px;background:#eef4f0;padding:4px 9px;border-radius:999px}
    .sprint-hud{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;text-align:center}
    .sprint-stat{padding:8px;border-radius:12px;background:#f4f9f5}
    .sprint-stat small{display:block;font-size:11px;color:#5f7466}
    .sprint-stat strong{font-size:20px}
    .sprint-stat strong.is-urgent{color:#d93025}
    .sprint-problem{font-size:34px;font-weight:800;text-align:center;margin:14px 0 18px}
    .sprint-choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:12px 0 6px}
    .sprint-choices .choice{width:100%;min-height:72px;padding:14px 12px;border-radius:16px;border:2px solid #d5e4cc;background:#fffefa;color:var(--ink,#244632);font-size:24px;font-weight:800;display:flex;align-items:center;justify-content:center;text-align:center;box-shadow:0 4px 0 #dde8d6;transition:transform .12s ease,background .15s ease,border-color .15s ease}
    .sprint-choices .choice:hover:not(:disabled){background:#f2f8ee;border-color:#78a87e;transform:translateY(-1px)}
    .sprint-choices .choice:focus{outline:none}
    .sprint-choices .choice:focus-visible{outline:3px solid #9ab889;outline-offset:3px}
    .sprint-choices .choice.is-correct{background:#e3f7ea!important;border-color:#2f9e5b!important;color:#175a31!important;box-shadow:0 4px 0 #a9e0bc!important}
    .sprint-choices .choice.is-wrong{background:#fdecec!important;border-color:#e05252!important;color:#8e1e1e!important;box-shadow:0 4px 0 #f4bebe!important}
    .sprint-actions{margin-top:14px;text-align:center}
    body.dark-mode .sprint-banner{background:linear-gradient(135deg,#1f352b,#2d2b1f);border-color:#355243}
    body.dark-mode .sprint-banner small,body.dark-mode .dq-item small{color:#a8bfb0}
    body.dark-mode .daily-quests-box,body.dark-mode .dq-item,body.dark-mode .sprint-stat{background:#1c2620;border-color:#2f4036}
    body.dark-mode .sprint-choices .choice{background:#1a2820;border-color:#324a3c;color:#e8f5ec;box-shadow:0 4px 0 #101914}
    body.dark-mode .sprint-choices .choice:hover:not(:disabled){background:#23362b;border-color:#4da378}
    body.dark-mode .sprint-choices .choice.is-correct{background:#173d28!important;border-color:#42b974!important;color:#c9f7da!important}
    body.dark-mode .sprint-choices .choice.is-wrong{background:#3e1d1d!important;border-color:#e05252!important;color:#ffd2d2!important}
  `;
  document.head.append(style);

  if (typeof window !== 'undefined') {
    window.computeAdaptiveConfig = computeAdaptiveConfig;
    window.startSprint60 = startSprint60;
    window.getDailyQuests = getDailyQuests;
    window.claimDailyQuest = claimDailyQuest;
  }
  if (typeof global !== 'undefined') {
    global.computeAdaptiveConfig = computeAdaptiveConfig;
    global.startSprint60 = startSprint60;
    global.getDailyQuests = getDailyQuests;
    global.claimDailyQuest = claimDailyQuest;
  }
  if (view === 'home') injectHomeEnhancements();
})();
