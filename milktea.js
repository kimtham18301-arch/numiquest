'use strict';
// Bubble-tea goal system: every correct answer earns 1 pearl toward size S/M/L cups.
const teaSizes = { S: 30, M: 50, L: 70 };

function teaState() {
  if (!state.tea || typeof state.tea !== 'object') {
    state.tea = { pearls: 0, size: 'S', cups: { S: 0, M: 0, L: 0 }, stickers: 0 };
  }
  const x = state.tea;
  if (!Number.isSafeInteger(x.pearls) || x.pearls < 0) x.pearls = 0;
  if (!teaSizes[x.size]) x.size = 'S';
  if (!x.cups || typeof x.cups !== 'object') x.cups = {};
  Object.keys(teaSizes).forEach(s => {
    if (!Number.isSafeInteger(x.cups[s]) || x.cups[s] < 0) x.cups[s] = 0;
  });
  if (!Number.isSafeInteger(x.stickers) || x.stickers < 0) x.stickers = 0;
  return x;
}

function teaIcon(size = 'S', lid = true) {
  const scale = size === 'L' ? 1.12 : size === 'M' ? 1.05 : 1;
  return `<svg class="tea-cup size-${size.toLowerCase()}" style="--cup-scale:${scale}" viewBox="0 0 150 170" role="img" aria-label="${t('Ly trà sữa size ' + size, 'Size ' + size + ' milk tea')}"><path d="M39 49h73l-8 101a9 9 0 0 1-9 8H56a9 9 0 0 1-9-8Z" fill="#f6a6bd" stroke="#bd557a" stroke-width="5"/><path d="M44 80h63l-5 65H50Z" fill="#ffedbd"/><path d="M44 80h63l-2 26H46Z" fill="#8b5549"/><path d="M61 68 72 20" stroke="#7a567c" stroke-width="8" stroke-linecap="round"/>${lid ? '<path d="M34 54q41-16 84 0l-3 14H37Z" fill="#78c9bb" stroke="#438f89" stroke-width="4"/>' : ''}<path d="M44 55q8-12 17 0t17 0 17 0 17 0" fill="none" stroke="#fff4dc" stroke-width="6"/><g fill="#59443f"><circle cx="56" cy="132" r="7"/><circle cx="76" cy="139" r="7"/><circle cx="94" cy="128" r="7"/><circle cx="67" cy="117" r="6"/><circle cx="87" cy="114" r="6"/></g><path d="M26 159h98" stroke="#be6582" stroke-width="5" stroke-linecap="round"/><circle cx="111" cy="93" r="13" fill="#ffd564"/><path d="M106 93h10m-5-5v10" stroke="#9b6a2c" stroke-width="2" stroke-linecap="round"/></svg>`;
}

function teaTotalCups(x = teaState()) {
  return Object.values(x.cups).reduce((a, b) => a + b, 0);
}

function teaGoal() {
  const x = teaState(), target = teaSizes[x.size];
  return { x, target, progress: Math.min(100, (x.pearls / target) * 100), ready: x.pearls >= target };
}

function teaRenderGoals() {
  const { x, target, ready } = teaGoal();
  const buddyName = typeof numiBuddyPrefs === 'function' ? numiBuddyPrefs().name : (state.name && state.name !== 'Explorer' ? state.name : 'Numi');
  const buddyAvatar = typeof buddy === 'function' ? buddy() : 'bunny';
  $('#app').innerHTML = `<section class="tea-goals">
    <div class="tea-heading">
      <div>
        <span class="tea-eyebrow">${t('MỤC TIÊU CỦA EM', 'YOUR LITTLE GOAL')}</span>
        <h1>${t('Rủ Numi làm trà sữa!', 'Make bubble tea with Numi!')}</h1>
        <p>${t('Mỗi câu đúng góp một viên trân châu. Tích lũy qua nhiều buổi nhé!', 'Each correct answer earns a pearl. Your progress adds up across sessions!')}</p>
      </div>
      <div class="tea-mascot">${animal(buddyAvatar)}<span>${esc(buddyName)}</span></div>
    </div>
    <div class="tea-progress-card">
      <div class="tea-progress-visual">${teaIcon(x.size)}${[0, 1, 2, 3].map((_, i) => `<span class="floating-pearl pearl-${i}">●</span>`).join('')}</div>
      <div class="tea-progress-info">
        <span class="tea-eyebrow">${t('LY ĐANG LÀM', 'CUP IN PROGRESS')}</span>
        <h2>${t('Size', 'Size')} ${x.size} <small>${target} ${t('viên', 'pearls')}</small></h2>
        <div class="tea-count"><strong>${Math.min(target, x.pearls)}</strong><span>/ ${target} ${t('viên trân châu', 'tapioca pearls')}</span></div>
        <progress max="${target}" value="${Math.min(target, x.pearls)}" aria-label="${x.pearls}/${target}"></progress>
        ${ready
          ? `<button class="tea-claim" id="teaClaim">${t('Ly đầy rồi! Nhận huy hiệu', 'Your cup is ready! Claim it')} →</button>`
          : `<button class="primary" onclick="nav('home')">${t('Luyện để lấy trân châu', 'Practice for pearls')} →</button><small>${t('Còn', 'Only')} ${target - x.pearls} ${t('câu đúng nữa thôi', 'more correct answers to go')}</small>`}
      </div>
    </div>
    <h2 class="tea-size-title">${t('Chọn chiếc ly của em', 'Choose your cup')}</h2>
    <div class="tea-size-grid">
      ${Object.entries(teaSizes).map(([s, n]) => `<button class="tea-size-option ${s === x.size ? 'selected' : ''}" data-tea-size="${s}" aria-pressed="${s === x.size}">${teaIcon(s)}<b>${t('Size', 'Size')} ${s}</b><span>${n} ${t('câu đúng', 'correct answers')}</span><small>${x.cups[s] || 0} ${t('ly đã làm', 'cups completed')}</small></button>`).join('')}
    </div>
    <div class="tea-gift-note">${animal(buddyAvatar)}<p>${t('Mỗi ly hoàn thành cộng thêm tiến độ và XP để em đổi phụ kiện cho bạn đồng hành. Bố mẹ có thể thưởng ngoài đời khi bé hoàn thành ly nhé!', 'Each completed cup adds XP for buddy accessories. Grown-ups can also celebrate with a real-world treat!')}</p></div>
    <button class="tea-back" onclick="nav('home')">← ${t('Về trang chủ', 'Back to home')}</button>
  </section>`;

  $$('[data-tea-size]').forEach(b => b.onclick = () => {
    x.size = b.dataset.teaSize;
    save();
    teaRenderGoals();
  });
  if (ready) $('#teaClaim').onclick = () => teaClaimCup();
  translate();
}

function teaClaimCup() {
  const { x, target, ready } = teaGoal();
  if (!ready) return;
  const size = x.size;
  x.pearls -= target;
  x.cups[size]++;
  state.xp = (state.xp || 0) + 20;
  const total = teaTotalCups(x);
  let badge = t(' Em được thưởng thêm +20 XP!', ' You also earned +20 bonus XP!');
  if (total % 3 === 0) {
    x.stickers++;
    badge = t(' Em còn mở thêm một huy hiệu trà sữa & +20 XP!', ' You also unlocked a Milk Tea sticker & +20 XP!');
  }
  save();
  modal(`<div class="tea-claimed-art">${teaIcon(size)}</div>
    <span class="tea-eyebrow">${t('MỤC TIÊU HOÀN THÀNH', 'GOAL COMPLETE')}</span>
    <h2>${t('Ly trà sữa size', 'Size')} ${size} ${t('đã đầy!', 'is ready!')}</h2>
    <p>${t('Bé đã trả lời đúng', 'You answered')} ${target} ${t('câu để gom đủ trân châu. Tiến độ còn dư vẫn được giữ.', 'questions correctly to collect these pearls. Extra pearls stay in your basket.')}${badge}</p>
    <div class="notice">${total} ${t('ly hoàn thành ·', 'cups completed ·')} ${x.stickers} ${t('huy hiệu', 'stickers')}</div>
    <p class="tea-parent-note">${t('Cho bố mẹ xem thành tích nhé. Bố mẹ sẽ cùng em chọn phần thưởng ngoài đời.', 'Show your grown-up your progress and choose a real-world reward together.')}</p>
    <button class="primary wide" id="teaClaimDone">${t('Tiếp tục luyện', 'Keep practicing')}</button>`);
  $('#teaClaimDone').onclick = () => {
    $('#modal').close();
    teaRenderGoals();
  };
}

atlas = function () {
  teaRenderGoals();
};

function teaEarnPearl() {
  const x = teaState();
  x.pearls++;
  if (session) {
    session.pearlsEarned = (session.pearlsEarned || 0) + 1;
  }
  save();
}

// Correct answers in practice and flower-garden review earn 1 pearl each.
const answerBeforeTea = typeof answerQuiz === 'function' ? answerQuiz : null;
if (answerBeforeTea) {
  answerQuiz = function (ans, id) {
    if (view !== 'quiz' || !session || session.done || session.answered) return;
    const s = session, q = s.questions[s.index];
    if (!q || (id && id !== q.id)) return;
    if (ans !== null && isAnswerMatch(ans, q.answer)) {
      teaEarnPearl();
    }
    answerBeforeTea(ans, id);
  };
}

const matchBeforeTea = typeof gardenMatch === 'function' ? gardenMatch : null;
if (matchBeforeTea) {
  gardenMatch = function (potId, flowerId) {
    const q = garden?.questions.find(q => q.id === potId);
    const flower = garden?.answers.find(a => a.id === flowerId);
    const willEarn = q && flower && !garden.busy && !garden.done.has(potId) && !garden.used.has(flowerId) && q.answer === flower.answer;
    matchBeforeTea(potId, flowerId);
    if (willEarn) teaEarnPearl();
  };
}

const bAtlas = $('[data-view="atlas"]');
if (bAtlas) bAtlas.setAttribute('aria-label', t('Mục tiêu trà sữa', 'Milk tea goals'));

teaState();
if (typeof window !== 'undefined') {
  window.teaSizes = teaSizes;
  window.teaState = teaState;
  window.teaIcon = teaIcon;
  window.teaTotalCups = teaTotalCups;
  window.teaGoal = teaGoal;
  window.teaEarnPearl = teaEarnPearl;
  window.teaClaimCup = teaClaimCup;
  window.teaRenderGoals = teaRenderGoals;
  window.atlas = atlas;
}
if (typeof global !== 'undefined') {
  global.teaSizes = teaSizes;
  global.teaState = teaState;
  global.teaIcon = teaIcon;
  global.teaTotalCups = teaTotalCups;
  global.teaGoal = teaGoal;
  global.teaEarnPearl = teaEarnPearl;
  global.teaClaimCup = teaClaimCup;
  global.teaRenderGoals = teaRenderGoals;
  global.atlas = atlas;
}
