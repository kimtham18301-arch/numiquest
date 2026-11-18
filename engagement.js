'use strict';
// Engagement & Gamification: Buddy Accessory Shop and Web Speech API Reader
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

  const style = document.createElement('style');
  style.textContent = `
    .acc-shop-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:12px}
    .acc-shop-item{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 10px;border-radius:14px;border:1.5px solid #dce8dc;background:#f8fbf8;text-align:center}
    .acc-shop-item.is-equipped{border-color:#34765c;background:#eaf5ee}
    .acc-preview-svg{width:64px;height:60px}
    .speech-bar{display:flex;justify-content:center;margin:-4px 0 10px}
    .speech-btn{font-size:13px;padding:4px 12px;min-height:32px;border-radius:999px}
    body.dark-mode .acc-shop-item{background:#1c2620;border-color:#2f4036}
  `;
  document.head.append(style);

  if (typeof window !== 'undefined') {
    window.BUDDY_ACCESSORIES = BUDDY_ACCESSORIES;
    window.buyOrEquipAccessory = buyOrEquipAccessory;
    window.openAccessoryShop = openAccessoryShop;
    window.formatMathForSpeech = formatMathForSpeech;
    window.speakQuestionText = speakQuestionText;
  }
  if (typeof global !== 'undefined') {
    global.BUDDY_ACCESSORIES = BUDDY_ACCESSORIES;
    global.buyOrEquipAccessory = buyOrEquipAccessory;
    global.openAccessoryShop = openAccessoryShop;
    global.formatMathForSpeech = formatMathForSpeech;
    global.speakQuestionText = speakQuestionText;
  }
})();
