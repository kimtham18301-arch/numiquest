'use strict';
// Engagement & Gamification: Buddy Accessory Shop, Seeded Async Friend Challenge, and Web Speech API Reader
(() => {
  const BUDDY_ACCESSORIES = [
    {
      id: 'glasses',
      nameVi: 'Kính tri thức',
      nameEn: 'Smart Glasses',
      cost: 50,
      svg: '<g class="buddy-acc" stroke="#2c3e50" stroke-width="3.5" fill="rgba(255,255,255,0.28)"><circle cx="65" cy="82" r="13"/><circle cx="95" cy="82" r="13"/><line x1="78" y1="82" x2="82" y2="82"/></g>'
    },
    {
      id: 'ribbon',
      nameVi: 'Nơ hồng xinh',
      nameEn: 'Pink Ribbon',
      cost: 80,
      svg: '<g class="buddy-acc"><path d="M80 34 L62 22 Q58 34 62 44 Z M80 34 L98 22 Q102 34 98 44 Z" fill="#ff5c93" stroke="#fff" stroke-width="2"/><circle cx="80" cy="34" r="6" fill="#ff85b0" stroke="#fff" stroke-width="1.5"/></g>'
    },
    {
      id: 'cap',
      nameVi: 'Mũ năng động',
      nameEn: 'Sporty Cap',
      cost: 120,
      svg: '<g class="buddy-acc"><path d="M44 48 Q80 18 116 48 Z" fill="#2563eb" stroke="#fff" stroke-width="2"/><path d="M40 48 Q80 42 128 50 Q124 57 80 53 Q44 52 40 48 Z" fill="#1d4ed8"/></g>'
    },
    {
      id: 'crown',
      nameVi: 'Vương miện sao',
      nameEn: 'Star Crown',
      cost: 200,
      svg: '<g class="buddy-acc"><path d="M52 42 L58 18 L72 32 L80 14 L88 32 L102 18 L108 42 Z" fill="#fbbf24" stroke="#b45309" stroke-width="2" stroke-linejoin="round"/><circle cx="80" cy="31" r="4" fill="#ef4444"/></g>'
    }
  ];

  function ensureAccessoriesState() {
    if (!state.accessories || typeof state.accessories !== 'object') {
      state.accessories = { owned: [], equipped: null };
    }
    if (!Array.isArray(state.accessories.owned)) state.accessories.owned = [];
    return state.accessories;
  }

  // Inject equipped accessory SVG layer directly into animal() output
  const animalBeforeEngagement = typeof animal === 'function' ? animal : null;
  if (animalBeforeEngagement) {
    animal = function (kind = 'lion', cls = '') {
      const markup = animalBeforeEngagement(kind, cls);
      const accId = state?.accessories?.equipped;
      if (!accId || typeof markup !== 'string') return markup;
      const acc = BUDDY_ACCESSORIES.find(a => a.id === accId);
      if (!acc) return markup;
      return markup.replace('</svg>', acc.svg + '</svg>');
    };
    if (typeof window !== 'undefined') window.animal = animal;
    if (typeof global !== 'undefined') global.animal = animal;
  }

  function buyOrEquipAccessory(id) {
    const acc = BUDDY_ACCESSORIES.find(a => a.id === id);
    if (!acc) return false;
    const store = ensureAccessoriesState();
    if (store.owned.includes(id)) {
      store.equipped = store.equipped === id ? null : id;
      save();
      return true;
    }
    if ((state.xp || 0) < acc.cost) {
      toast(t(`Bé cần ${acc.cost} XP để mở khóa món này nhé!`, `You need ${acc.cost} XP to unlock this item!`));
      return false;
    }
    state.xp -= acc.cost;
    store.owned.push(id);
    store.equipped = id;
    save();
    toast(t(`Đã mở khóa và đeo ${acc.nameVi}!`, `Unlocked and equipped ${acc.nameEn}!`));
    return true;
  }

  function openAccessoryShop() {
    const store = ensureAccessoriesState();
    modal(`<h2>🛍️ ${t('Cửa hàng phụ kiện', 'Buddy Accessory Shop')}</h2>
    <p class="muted">${t('Dùng điểm XP để mua và trang trí cho bạn đồng hành. Hiện có:', 'Use XP to unlock and equip items. Current XP:')} <b>${state.xp || 0} XP</b></p>
    <div class="acc-shop-grid">
      ${BUDDY_ACCESSORIES.map(a => {
        const owned = store.owned.includes(a.id);
        const equipped = store.equipped === a.id;
        return `<div class="acc-shop-item ${equipped ? 'is-equipped' : ''}">
          <svg viewBox="30 10 100 95" class="acc-preview-svg" aria-hidden="true">${a.svg}</svg>
          <b>${t(a.nameVi, a.nameEn)}</b>
          <small>${owned ? (equipped ? t('Đang đeo', 'Equipped') : t('Đã sở hữu', 'Owned')) : `${a.cost} XP`}</small>
          <button type="button" class="${equipped ? '' : 'primary'}" data-buy-acc="${a.id}">
            ${equipped ? t('Tháo ra', 'Unequip') : owned ? t('Đeo vào', 'Equip') : t('Mua ngay', 'Buy')}
          </button>
        </div>`;
      }).join('')}
    </div>
    <div class="actions" style="margin-top:14px">
      <button type="button" onclick="$('#modal').close(); if(view==='home'&&typeof home==='function')home();">${t('Xong', 'Done')}</button>
    </div>`);

    $$('[data-buy-acc]').forEach(btn => {
      btn.onclick = () => {
        if (buyOrEquipAccessory(btn.dataset.buyAcc)) {
          openAccessoryShop();
          if (view === 'home' && typeof home === 'function') home();
        }
      };
    });
  }

  // ---------------- Seeded Async Friend Challenge ----------------
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function encodeChallengeCode(seed, grade) {
    const g = Math.max(1, Math.min(9, Number(grade) || 1));
    const s = (Math.abs(Number(seed) || 12345) % 99999).toString(36).toUpperCase().padStart(4, '0');
    return `NQ${g}-${s}`;
  }

  function decodeChallengeCode(code) {
    const m = String(code || '').trim().toUpperCase().match(/^NQ([1-9])-([0-9A-Z]{1,6})$/);
    if (!m) return null;
    const grade = Number(m[1]);
    const seed = parseInt(m[2], 36);
    if (!Number.isFinite(seed)) return null;
    return { grade, seed };
  }

  function generateSeededQuestions(seed, cfg, count = 10) {
    const origRandom = Math.random;
    Math.random = mulberry32(seed);
    try {
      const list = [];
      for (let i = 0; i < count; i++) {
        list.push(generate(cfg));
      }
      return list;
    } finally {
      Math.random = origRandom;
    }
  }

  function startSeededChallenge(code) {
    const parsed = decodeChallengeCode(code);
    if (!parsed) throw Error(t('Mã thách đấu không hợp lệ (VD: NQ4-1A2B).', 'Invalid challenge code (e.g. NQ4-1A2B).'));
    const gDef = (typeof NUMI_GRADES !== 'undefined' && NUMI_GRADES[parsed.grade]) ? NUMI_GRADES[parsed.grade] : {};
    const cfg = { ...defaults, ...gDef, grade: parsed.grade, count: 10, seconds: 20 };
    const qs = generateSeededQuestions(parsed.seed, cfg, 10);
    config = cfg;
    if (typeof window !== 'undefined') window.config = config;
    if (typeof global !== 'undefined') global.config = config;
    stop();
    view = 'quiz';
    session = {
      kind: 'friendChallenge',
      challengeCode: encodeChallengeCode(parsed.seed, parsed.grade),
      questions: qs,
      index: 0,
      results: [],
      done: false,
      answered: false,
      combo: 0,
      extra: 0,
      started: performance.now()
    };
    showQuiz();
  }

  function openFriendChallengeModal() {
    const g = config.grade || currentAuthUser()?.grade || 1;
    const mySeed = Math.floor(Math.random() * 90000) + 10000;
    const myCode = encodeChallengeCode(mySeed, g);

    modal(`<h2>⚔️ ${t('Thách đấu bạn cùng lớp', 'Friend Challenge')}</h2>
    <p class="muted">${t('Gửi mã dưới đây để cả hai cùng làm chung 1 bộ đề 10 câu giống hệt nhau!', 'Share this code so both of you solve the exact same 10 questions!')}</p>
    <div class="friend-code-box">
      <small>${t('Mã thử thách của em (Lớp ' + g + '):', 'Your challenge code (Grade ' + g + '):')}</small>
      <strong id="myFriendCode">${myCode}</strong>
      <div class="actions" style="margin-top:8px">
        <button type="button" id="copyFriendCodeBtn">${t('Sao chép mã', 'Copy Code')}</button>
        <button type="button" class="primary" id="playMyChallengeBtn">${t('Làm đề này ngay', 'Play This Set')} →</button>
      </div>
    </div>
    <hr style="margin:16px 0;border:0;border-top:1px solid #dce8dc">
    <label>${t('Hoặc nhập mã thách đấu từ bạn:', 'Or enter a friend’s code:')}
      <input id="friendCodeInput" placeholder="NQ4-XXXX" style="width:100%;text-transform:uppercase;letter-spacing:2px;font-weight:800;margin-top:6px">
    </label>
    <div class="actions" style="margin-top:10px">
      <button type="button" class="primary" id="joinFriendCodeBtn">${t('Nhận lời thách đấu', 'Accept Challenge')} →</button>
      <button type="button" onclick="$('#modal').close()">${t('Đóng', 'Close')}</button>
    </div>`);

    $('#copyFriendCodeBtn').onclick = () => {
      navigator.clipboard?.writeText(myCode).then(() => toast(t('Đã sao chép mã: ' + myCode, 'Copied: ' + myCode))).catch(() => {});
    };
    $('#playMyChallengeBtn').onclick = () => {
      $('#modal').close();
      startSeededChallenge(myCode);
    };
    $('#joinFriendCodeBtn').onclick = () => {
      try {
        const val = $('#friendCodeInput').value;
        $('#modal').close();
        startSeededChallenge(val);
      } catch (err) {
        toast(err.message);
      }
    };
  }

  // ---------------- Web Speech API Reader ----------------
  function formatMathForSpeech(text, targetLang = 'vi') {
    let s = String(text || '');
    if (targetLang === 'en') {
      return s
        .replaceAll('+', ' plus ')
        .replaceAll('−', ' minus ')
        .replaceAll('-', ' minus ')
        .replaceAll('×', ' times ')
        .replaceAll('*', ' times ')
        .replaceAll('÷', ' divided by ')
        .replaceAll('=', ' equals ')
        .replaceAll('?', ' what number ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    return s
      .replaceAll('+', ' cộng ')
      .replaceAll('−', ' trừ ')
      .replaceAll('-', ' trừ ')
      .replaceAll('×', ' nhân ')
      .replaceAll('*', ' nhân ')
      .replaceAll('÷', ' chia ')
      .replaceAll('=', ' bằng ')
      .replaceAll('?', ' mấy ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function speakQuestionText(text) {
    if (typeof window === 'undefined' || !window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') {
      toast(t('Trình duyệt chưa hỗ trợ đọc giọng nói.', 'Speech synthesis is not supported in this browser.'));
      return false;
    }
    try {
      window.speechSynthesis.cancel();
      const l = typeof lang !== 'undefined' && lang === 'en' ? 'en' : 'vi';
      const u = new SpeechSynthesisUtterance(formatMathForSpeech(text, l));
      u.lang = l === 'en' ? 'en-US' : 'vi-VN';
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
      return true;
    } catch {
      return false;
    }
  }

  const showQuizBeforeEngagement = typeof showQuiz === 'function' ? showQuiz : null;
  if (showQuizBeforeEngagement) {
    showQuiz = function () {
      showQuizBeforeEngagement();
      if (view !== 'quiz' || !session || session.done) return;
      const q = session.questions?.[session.index];
      const card = $('#quizCard');
      if (!q || !card || $('#speakQuizBtn')) return;

      const bar = document.createElement('div');
      bar.className = 'speech-bar';
      bar.innerHTML = `<button type="button" id="speakQuizBtn" class="ghost speech-btn">🔊 ${t('Đọc đề', 'Read aloud')}</button>`;
      const problemEl = card.querySelector('.question, .numpad-prompt');
      if (problemEl) problemEl.after(bar);
      else card.prepend(bar);

      $('#speakQuizBtn').onclick = () => speakQuestionText(q.q);
      if (state.autoSpeak) speakQuestionText(q.q);
    };
  }

  // Inject Shop & Friend Challenge buttons onto Home
  function injectEngagementButtons() {
    if (view !== 'home') return;
    const links = $('.home-v2-links');
    if (!links || links.querySelector('[data-engagement-btn]')) return;

    const shopBtn = document.createElement('button');
    shopBtn.type = 'button';
    shopBtn.dataset.engagementBtn = 'shop';
    shopBtn.innerHTML = `<b>🛍️ ${t('Cửa hàng phụ kiện', 'Accessory Shop')}</b><small>${t('Trang trí cho bạn đồng hành', 'Customize your buddy')}</small>`;
    shopBtn.onclick = openAccessoryShop;

    const chalBtn = document.createElement('button');
    chalBtn.type = 'button';
    chalBtn.dataset.engagementBtn = 'challenge';
    chalBtn.innerHTML = `<b>⚔️ ${t('Thách đấu bạn bè', 'Friend Challenge')}</b><small>${t('Cùng làm chung 1 bộ đề', 'Play the same 10-question set')}</small>`;
    chalBtn.onclick = openFriendChallengeModal;

    links.append(shopBtn, chalBtn);
  }

  const homeBeforeEngagement = typeof home === 'function' ? home : null;
  if (homeBeforeEngagement) {
    home = function () {
      homeBeforeEngagement();
      injectEngagementButtons();
    };
  }

  const style = document.createElement('style');
  style.textContent = `
    .acc-shop-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:12px}
    .acc-shop-item{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 10px;border-radius:14px;border:1.5px solid #dce8dc;background:#f8fbf8;text-align:center}
    .acc-shop-item.is-equipped{border-color:#34765c;background:#eaf5ee}
    .acc-preview-svg{width:64px;height:60px}
    .friend-code-box{padding:12px;border-radius:14px;background:#f4f9f5;border:1.5px solid #cfe3d4;text-align:center;margin-top:10px}
    .friend-code-box strong{display:block;font-size:26px;letter-spacing:3px;color:#1e6244;margin:4px 0}
    .speech-bar{display:flex;justify-content:center;margin:-4px 0 10px}
    .speech-btn{font-size:13px;padding:4px 12px;min-height:32px;border-radius:999px}
    body.dark-mode .acc-shop-item,body.dark-mode .friend-code-box{background:#1c2620;border-color:#2f4036}
  `;
  document.head.append(style);

  if (typeof window !== 'undefined') {
    window.BUDDY_ACCESSORIES = BUDDY_ACCESSORIES;
    window.buyOrEquipAccessory = buyOrEquipAccessory;
    window.openAccessoryShop = openAccessoryShop;
    window.encodeChallengeCode = encodeChallengeCode;
    window.decodeChallengeCode = decodeChallengeCode;
    window.generateSeededQuestions = generateSeededQuestions;
    window.startSeededChallenge = startSeededChallenge;
    window.formatMathForSpeech = formatMathForSpeech;
    window.speakQuestionText = speakQuestionText;
  }
  if (typeof global !== 'undefined') {
    global.BUDDY_ACCESSORIES = BUDDY_ACCESSORIES;
    global.buyOrEquipAccessory = buyOrEquipAccessory;
    global.openAccessoryShop = openAccessoryShop;
    global.encodeChallengeCode = encodeChallengeCode;
    global.decodeChallengeCode = decodeChallengeCode;
    global.generateSeededQuestions = generateSeededQuestions;
    global.startSeededChallenge = startSeededChallenge;
    global.formatMathForSpeech = formatMathForSpeech;
    global.speakQuestionText = speakQuestionText;
  }
  if (view === 'home') injectEngagementButtons();
})();
