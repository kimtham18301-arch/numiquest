// When leaving an unfinished mistake-review garden, let the learner keep going or clear only its remaining questions.
(() => {
  const originalNav = nav;
  nav = function (destination) {
    if (view === 'garden' && session && !session.done && destination !== view) {
      gardenPause();
      let choice = 'continue';
      modal(`<div class="review-exit-dialog"><div class="intro-animal">${animal('bunny')}</div><h2>${t('Em muốn làm gì với câu sai?','What would you like to do with these mistakes?')}</h2><p>${t('Em có thể ở lại ôn tiếp, thoát và giữ câu sai để ôn sau, hoặc xóa các câu sai còn lại. Lịch sử và huy hiệu đã đạt vẫn được giữ.','Keep reviewing, leave and save mistakes for later, or clear the remaining mistakes. Your history and badges will stay.')}</p><div class="review-exit-actions"><button id="reviewStay" class="primary">${t('Làm tiếp câu sai','Keep reviewing')}</button><button id="reviewKeep">${t('Thoát, giữ lại câu sai','Leave & save for later')}</button><button id="reviewDiscard">${t('Thoát và xóa câu sai','Leave & clear mistakes')}</button></div></div>`, () => {
        if (choice === 'clear') {
          state.mistakes = [];
          save();
          if (session) session.done = true;
          originalNav(destination);
        } else if (choice === 'keep') {
          if (session) session.done = true;
          originalNav(destination);
        } else {
          gardenResume();
        }
      });
      $('#reviewStay').onclick = () => { choice = 'continue'; $('#modal').close(); };
      $('#reviewKeep').onclick = () => { choice = 'keep'; $('#modal').close(); };
      $('#reviewDiscard').onclick = () => { choice = 'clear'; $('#modal').close(); };
      return;
    }
    originalNav(destination);
  };
  const style = document.createElement('style');
  style.textContent = `
    .review-exit-dialog{text-align:center;max-width:480px;margin:auto}
    .review-exit-dialog h2{font-size:24px;line-height:1.3}
    .review-exit-dialog p{font-size:16px;line-height:1.6;color:#506752}
    .review-exit-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px}
    .review-exit-actions #reviewStay{grid-column:1/-1}
    .review-exit-actions button{font-size:15px;min-height:52px;line-height:1.3}
    @media(max-width:560px){.review-exit-actions{grid-template-columns:1fr}.review-exit-dialog h2{font-size:22px}.review-exit-dialog p{font-size:15px}}
  `;
  document.head.append(style);
})();
