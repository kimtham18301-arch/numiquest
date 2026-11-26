'use strict';
// A clean learning-first home screen, vivid flower-review art and persistent child-friendly color themes.
const NUMI_THEMES={candy:{name:'Kẹo ngọt',color:'#e64b83'},ocean:{name:'Đại dương',color:'#168eb8'},sunshine:{name:'Nắng vui',color:'#e57820'},purple:{name:'Tím mộng mơ',color:'#8257bd'}};
function numiThemeApply(name){if(!NUMI_THEMES[name])name='candy';document.body.dataset.theme=name;try{localStorage.setItem('numi-color-theme',name)}catch{};$$('[data-numi-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.numiTheme===name)))}
function numiThemePicker(){const current=document.body.dataset.theme||'candy';return `<section class="numi-theme-picker" aria-label="${t('Chọn màu giao diện','Choose a color theme')}"><span>${t('Màu của em','My colors')}</span><div>${Object.entries(NUMI_THEMES).map(([key,p])=>`<button type="button" data-numi-theme="${key}" aria-label="${p.name}" aria-pressed="${key===current}" title="${p.name}" style="--swatch:${p.color}"><i></i></button>`).join('')}</div></section>`}
function numiVividFlower(open=false,variant=0){const colors=['#ff5488','#ffbd2e','#9a5bfa','#24b8d0','#ff783b'];const c=colors[((variant%colors.length)+colors.length)%colors.length];return `<svg class="garden-flower ${open?'is-open':''}" viewBox="0 0 100 130" aria-hidden="true"><path d="M50 112V52" stroke="#36a66a" stroke-width="6" stroke-linecap="round"/><path d="M49 91Q22 92 25 74Q44 73 49 91M51 101Q75 99 78 82Q57 80 51 101" fill="#59c77b"/><g class="petals" fill="${c}" stroke="#fff" stroke-width="1.3"><ellipse cx="50" cy="28" rx="14" ry="22"/><ellipse cx="50" cy="28" rx="14" ry="22" transform="rotate(60 50 50)"/><ellipse cx="50" cy="28" rx="14" ry="22" transform="rotate(120 50 50)"/><ellipse cx="50" cy="28" rx="14" ry="22" transform="rotate(180 50 50)"/><ellipse cx="50" cy="28" rx="14" ry="22" transform="rotate(240 50 50)"/><ellipse cx="50" cy="28" rx="14" ry="22" transform="rotate(300 50 50)"/></g><circle class="flower-center" cx="50" cy="50" r="15" fill="#ffe14d" stroke="#fff" stroke-width="2"/><path class="flower-smile" d="M43 51Q50 59 57 51" stroke="#775221" stroke-width="2" stroke-linecap="round" fill="none"/><g class="bud"><path d="M50 66Q26 54 36 30Q47 26 50 36Q55 24 66 29Q77 53 50 66Z" fill="${c}"/><path d="M50 64Q36 63 31 51Q45 48 50 58Q57 46 69 49Q66 64 50 64Z" fill="#59c77b"/></g></svg>`}
gardenFlower=numiVividFlower;
function numiWelcome(){
 if(typeof isCurrentUserAdmin==='function'&&isCurrentUserAdmin()){renderAdmin();return;}
 const pending=state.mistakes.length,buddyPrefs=numiBuddyPrefs(),streak=getStreak();
 const u=typeof currentAuthUser==='function'?currentAuthUser():null;
 const uGradeNum=u?.grade&&typeof NUMI_GRADES!=='undefined'&&NUMI_GRADES[u.grade]?Number(u.grade):null;
 const gradeBtnLabel=uGradeNum
   ?t(`Ôn tập chương trình ${NUMI_GRADES[uGradeNum].name} →`,`Review ${NUMI_GRADES[uGradeNum].enName} curriculum →`)
   :t('Ôn tập theo Lớp (Tiểu học & THCS) →','School Curriculum Review (Gr 1–9) →');
 document.body.dataset.view='home';
 const showShopBtn=Boolean(typeof NUMI_FEATURE_FLAGS!=='undefined'&&NUMI_FEATURE_FLAGS.accessoryShop);
 $('#app').innerHTML=`<section class="home-v2"><div class="home-v2-top"><div class="home-v2-streak" title="${t('Chuỗi ngày luyện tập liên tục','Daily practice streak')}"><b>${streak.count}</b> <small>${t('ngày liên tiếp','day streak')}</small></div>${numiThemePicker()}</div><section class="home-v2-hero"><button class="home-v2-mascot" type="button" onclick="nav('profile')" aria-label="${t('Hồ sơ học sinh & Bạn đồng hành','Student profile & study buddy')}">${animal('bunny')}<span>${esc(buddyPrefs.name)}</span><small>${t('Chạm xem hồ sơ cá nhân','Tap to view profile')}</small></button><div class="home-v2-copy"><span class="home-v2-eyebrow">${t('MỖI NGÀY GIỎI THÊM MỘT CHÚT','A LITTLE BETTER EVERY DAY')}</span><h1>${t('Cùng '+esc(buddyPrefs.name)+'<br>luyện tính nhanh!','Practice quick<br>maths with '+esc(buddyPrefs.name)+'!')}</h1><p>${t('Tự chọn phép tính (+, −, ×, ÷) để rèn phản xạ tính nhẩm, hoặc ôn tập chuyên đề theo lớp học trên trường.','Pick operations (+, −, ×, ÷) to train mental math speed, or review school curriculum topics by grade.')}</p><button id="homePracticeStart" type="button" class="home-v2-cta">${t('Tùy chỉnh / Bài tập tính nhẩm','Custom / Mental Math Practice')} <span>→</span></button><button id="homeGradeSetupBtn" type="button" class="home-v2-settings home-v2-grade-btn">${gradeBtnLabel}</button></div></section>${pending?`<button class="home-v2-review" onclick="startReview()"><b>${t('Có '+pending+' câu cần ôn trong Vườn hoa','You have '+pending+' mistakes to review')}</b><span>→</span></button>`:''}<div class="home-v2-links">${showShopBtn?`<button type="button" onclick="if(typeof openAccessoryShop==='function')openAccessoryShop()"><b>${t('Cửa hàng phụ kiện','Accessory Shop')}</b><small>${t('Trang trí bạn đồng hành','Customize your buddy')}</small></button>`:''}<button type="button" onclick="nav('stats')"><b>${t('Tiến bộ','Progress')}</b><small>${t('Xem kết quả học','Learning results')}</small></button><button type="button" onclick="nav('profile')"><b>${t('Hồ sơ','Profile')}</b><small>${t('Xem thành tích','View honors')}</small></button><button type="button" onclick="nav('guide')"><b>${t('Hướng dẫn','Guide')}</b><small>${t('Cách dùng & mẹo','How-to & tips')}</small></button></div><p class="home-v2-local">${t('Tiến độ được lưu trên thiết bị này.','Progress is saved on this device.')}</p></section>`;
 $('#homePracticeStart').onclick=numiOpenCustomPractice;
 const gradeSetupBtn=$('#homeGradeSetupBtn');
 if(gradeSetupBtn)gradeSetupBtn.onclick=numiOpenGradePractice;
 $$('[data-numi-theme]').forEach(b=>b.onclick=()=>numiThemeApply(b.dataset.numiTheme));translate();
}
function numiOpenCustomPractice(){
  if(!currentAuthUser()){toast(t('Vui lòng đăng nhập để bắt đầu học.','Please sign in to start learning.'));openAccount('login');return}
  const ops=Array.isArray(config?.ops)&&config.ops.length?[...config.ops]:['+','-'];
  const types=Array.isArray(config?.types)&&config.types.length?[...config.types]:['natural'];
  const digits=Array.isArray(config?.digits)&&config.digits.length?[...config.digits]:[1,2];
  config={
    ...defaults,
    ...config,
    grade:'custom',
    topic:'all',
    topics:[],
    ops,
    types,
    type:types[0]||'natural',
    digits,
    questionStyle:(config?.questionStyle&&config.questionStyle!=='word')?config.questionStyle:'normal',
    untimed:false,
    customPresetSeconds:null
  };
  if(typeof window!=='undefined')window.config=config;
  if(typeof global!=='undefined')global.config=config;
  nav('setup');
  const formEl=typeof $==='function'?$('#config'):null;
  if(formEl&&typeof formEl.scrollIntoView==='function'){
    try{formEl.scrollIntoView({behavior:'smooth',block:'start'})}catch{}
  }else if(typeof window!=='undefined'&&typeof window.scrollTo==='function'){
    window.scrollTo(0,0);
  }
}
function numiOpenGradePractice(){
  if(!currentAuthUser()){toast(t('Vui lòng đăng nhập để bắt đầu học.','Please sign in to start learning.'));openAccount('login');return}
  const u=currentAuthUser();
  const targetGrade=(u?.grade&&typeof NUMI_GRADES!=='undefined'&&NUMI_GRADES[u.grade])?Number(u.grade):((config?.grade&&config.grade!=='custom'&&NUMI_GRADES[config.grade])?Number(config.grade):4);
  const g=NUMI_GRADES[targetGrade];
  if(g){
    config={
      ...defaults,
      ...g,
      grade:g.id,
      topic:'all',
      topics:[],
      ops:[...g.ops],
      types:[...g.types],
      type:g.types[0],
      digits:[...g.digits],
      count:g.count,
      seconds:g.seconds,
      inputMode:g.inputMode,
      untimed:false,
      customPresetSeconds:null
    };
    if(typeof window!=='undefined')window.config=config;
    if(typeof global!=='undefined')global.config=config;
  }
  nav('setup');
  if(typeof window!=='undefined'&&typeof window.scrollTo==='function')window.scrollTo(0,0);
}
if(typeof window!=='undefined'){window.numiOpenCustomPractice=numiOpenCustomPractice;window.numiOpenGradePractice=numiOpenGradePractice;}
if(typeof global!=='undefined'){global.numiOpenCustomPractice=numiOpenCustomPractice;global.numiOpenGradePractice=numiOpenGradePractice;}
function numiStartPractice(){
  if(!currentAuthUser()){toast(t('Vui lòng đăng nhập để bắt đầu học.','Please sign in to start learning.'));openAccount('login');return}
  try{
    if(state.mistakes.length){startReview();window.scrollTo(0,0);return}
    if(config&&config.grade==='custom'){
      const ops=Array.isArray(config.ops)&&config.ops.length?config.ops:['+'],
            types=Array.isArray(config.types)&&config.types.length?config.types:[config.type||'natural'],
            digits=Array.isArray(config.digits)&&config.digits.length?config.digits:[config.d1||1];
      config={
        ...defaults,
        ...config,
        grade:'custom',
        topic:'all',
        topics:[],
        ops,
        types,
        type:types[0]||'natural',
        digits,
        count:Math.max(1,Math.min(100,+config.count||10)),
        seconds:Math.max(5,Math.min(120,+config.seconds||15)),
        inputMode:config.inputMode||'choices'
      };
    }else{
      const u=currentAuthUser();
      const uGrade=u?.grade?Number(u.grade):null;
      let targetGrade=(config&&config.grade&&config.grade!=='custom')?Number(config.grade):(uGrade||1);
      if(typeof NUMI_GRADES!=='undefined'&&NUMI_GRADES[targetGrade]){
        const g=NUMI_GRADES[targetGrade];
        config={
          ...defaults,
          ...g,
          ...config,
          grade:g.id,
          ops:Array.isArray(config?.ops)&&config.ops.length?[...config.ops]:[...g.ops],
          types:Array.isArray(config?.types)&&config.types.length?[...config.types]:[...g.types],
          type:(Array.isArray(config?.types)&&config.types[0])||g.types[0],
          digits:Array.isArray(config?.digits)&&config.digits.length?[...config.digits]:[...g.digits],
          count:Math.max(1,Math.min(100,+config?.count||g.count)),
          seconds:Math.max(5,Math.min(120,+config?.seconds||g.seconds)),
          inputMode:config?.inputMode||g.inputMode
        };
      }
    }
    if(typeof window!=='undefined')window.config=config;
    if(typeof global!=='undefined')global.config=config;
    startQuiz();
    if(view!=='quiz')throw Error('quiz did not open');
    window.scrollTo(0,0);
  }catch(error){
    console.error('Numi practice could not start:',error);
    toast(t('Chưa mở được bài. Em thử vào “Chọn dạng bài” rồi bấm “Bắt đầu học” nhé.','The lesson could not open. Please choose a lesson and tap “Start learning.”'));
  }
}
const numiOldHome=home;home=numiWelcome;
// Keep results focused on learning and pearls; do not expose old food/farm inventory.
const numiOldFinish=finishPractice;
finishPractice=function(){
  const s=session;
  numiOldFinish();
  if(!s||s.kind==='challenge')return;
  const n=s.results.filter(x=>x.correct).length,tea=teaState(),earned=s.pearlsEarned||0,streak=getStreak();
  const pct=s.results.length>0?Math.round((n/s.results.length)*100):0;
  if(pct>=70){
    if(typeof haptic==='function')haptic('victory');
    if(typeof triggerConfetti==='function')triggerConfetti();
  }
  const avgSpeed=avg(s.results.map(x=>x.elapsed)).toFixed(1);
  const tierSummary=(()=>{
    const buckets={easy:{ok:0,tot:0,lbl:t('Nhận biết','Lv1')},medium:{ok:0,tot:0,lbl:t('Thông hiểu','Lv2')},hard:{ok:0,tot:0,lbl:t('Vận dụng','Lv3')}};
    s.results.forEach((r,idx)=>{
      const d=r.difficulty||s.questions?.[idx]?.difficulty;
      if(d&&buckets[d]){buckets[d].tot++;if(r.correct)buckets[d].ok++;}
    });
    const active=Object.values(buckets).filter(b=>b.tot>0);
    if(!active.length)return '';
    return `<div style="display:flex;justify-content:center;flex-wrap:wrap;gap:6px;margin-top:10px">${active.map(b=>`<span style="padding:4px 10px;border-radius:999px;background:#eef6ef;border:1px solid #cbe2ce;font-size:12px;font-weight:800;color:#1e4d35">${b.lbl}: ${b.ok}/${b.tot}</span>`).join('')}</div>`;
  })();
  const reviewAccordion=(()=>{
    if(!Array.isArray(s.questions)||!s.questions.length)return '';
    const rows=s.questions.map((q,idx)=>{
      const r=s.results[idx]||{};
      const ok=Boolean(r.correct);
      const userAns=r.givenAnswer!==undefined&&r.givenAnswer!==null?String(r.givenAnswer):t('Bỏ qua / Hết giờ','Skipped');
      const expHtml=mathMarkup(typeof hint==='function'?hint(q):(q.explanation||'')).replace(/\n/g,'<br>');
      return `<div style="text-align:left;padding:10px 12px;border-radius:12px;border:1.5px solid ${ok?'#c3e6cb':'#f5c2c7'};background:${ok?'rgba(43,138,62,0.05)':'rgba(224,49,49,0.05)'};margin-top:8px">
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:4px">
          <b style="font-size:13px;color:${ok?'#2b8a3e':'#c92a2a'}">${ok?'✓':'✕'} ${t('Câu','Q')} ${idx+1}${q.difficultyLabel?' · '+esc(q.difficultyLabel):''}</b>
          <small style="font-weight:700;opacity:.75">${r.elapsed?r.elapsed.toFixed(1)+'s':''}</small>
        </div>
        <div style="font-weight:800;font-size:14px;margin-bottom:4px">${typeof formatQuestionPrompt==='function'?formatQuestionPrompt(q.q):esc(q.q)}</div>
        <div style="font-size:12.5px;margin-bottom:6px">${t('Bài làm:','Your answer:')} <b>${esc(userAns)}</b> · ${t('Đáp án đúng:','Correct:')} <b style="color:#1b6e3c">${mathMarkup(q.answer)}</b></div>
        <div style="font-size:12.5px;line-height:1.45;padding:7px 10px;border-radius:8px;background:rgba(52,118,92,0.08)"><b>💡 ${t('Bài giải chi tiết:','Solution:')}</b><br>${expHtml}</div>
      </div>`;
    }).join('');
    return `<details style="margin-top:14px;text-align:left"><summary style="cursor:pointer;padding:9px 12px;border-radius:11px;background:#f2f8f3;border:1.5px solid #cfe2d2;font-weight:800;font-size:13.5px;color:#1f5137;text-align:center">📋 ${t('Xem lại đề & Bài giải chi tiết từng câu','Review Questions & Step-by-Step Solutions')} (${s.questions.length})</summary><div style="margin-top:6px;max-height:380px;overflow-y:auto;padding-right:2px">${rows}</div></details>`;
  })();

  $('#app').innerHTML=`<section class="narrow card home-v2-result quiz-finish-card">
    <span class="home-v2-eyebrow">${t('LƯỢT LUYỆN HOÀN THÀNH','PRACTICE COMPLETE')}</span>
    <h1 class="finish-title">${pct===100?t('Xuất sắc! Đúng toàn bộ!','Flawless! 100% Correct!'):pct>=70?t('Làm tốt lắm!','Well done!'):t('Cố gắng lên nhé!','Keep practicing!')}</h1>

    <div class="finish-streak-wrap">
      <span class="home-v2-streak"><b>${streak.count}</b> <small>${t('ngày liên tiếp','days streak')}</small></span>
      <span class="finish-xp-pill">+${n*3} XP</span>
    </div>

    <div class="finish-stats-grid">
      <div class="finish-stat-box">
        <small>${t('Điểm số','Score')}</small>
        <strong style="color:${pct>=80?'#2b8a3e':pct>=60?'#d97706':'#e03131'}">${n}/${s.results.length}</strong>
        <span>(${pct}%)</span>
      </div>
      <div class="finish-stat-box">
        <small>${t('Thời gian TB','Avg Time')}</small>
        <strong>${avgSpeed}s</strong>
        <span>/${t('câu','question')}</span>
      </div>
    </div>
    ${tierSummary}
    ${reviewAccordion}

    <div class="finish-actions" style="margin-top:16px">
      ${state.mistakes.length?`<button class="primary wide" onclick="startReview()">${t('Ôn '+state.mistakes.length+' câu sai bằng Vườn hoa','Review '+state.mistakes.length+' mistakes')} →</button>`:''}
      <button class="${state.mistakes.length?'':'primary'} wide" onclick="numiStartPractice()">${t('Luyện thêm một lượt','Practice another lesson')}</button>
      <button class="wide" onclick="nav('setup')">${t('Chọn chuyên đề khác','Choose another topic')}</button>
      <button class="wide" onclick="nav('home')">${t('Về trang chủ','Back to Home')}</button>
    </div>
  </section>`;
  translate();
};
// Stop the app router from treating an account destination as the home fallback.
const numiOldNav=nav;nav=function(destination){if(destination==='login'){openAccount('login');return}if(destination==='home'){numiOldNav('home');return}if(destination==='account'&&!currentAuthUser()){openAccount('login');return}if(destination==='profile'||destination==='account'){view=destination;if(typeof window!=='undefined')window.view=destination;if(typeof global!=='undefined')global.view=destination;renderProfile();return}if(destination==='guide'){view='guide';if(typeof window!=='undefined')window.view='guide';if(typeof global!=='undefined')global.view='guide';renderGuide();return}if(!currentAuthUser()){toast(t('Vui lòng đăng nhập để bắt đầu học.','Please sign in to start learning.'));openAccount('login');return}numiOldNav(destination)};
// Make the controls concise; the help button explains which question types are included.
const numiOldSetup=setup;setup=function(){numiOldSetup();const form=$('#config');if(!form)return;
 const advanced=form.querySelector('.advanced-picks');if(advanced){const hints=advanced.querySelectorAll('.settings-hint');hints.forEach((x,i)=>{if(i===0){x.hidden=true;const d=document.createElement('details');d.className='advanced-help';d.innerHTML=`<summary>${t('Giải thích ngắn','Quick help')}</summary><p>${t('“Tính thuận tiện” giúp ghép số cho dễ tính. “Biểu thức” có nhiều phép tính và có thể dùng ngoặc. Chỉ chọn loại số bé đã học.','Regrouping makes sums easier. Expressions combine operations and may use brackets. Choose only number types already learned.')}</p>`;x.insertAdjacentElement('afterend',d)}else x.hidden=true});const labs=advanced.querySelectorAll('label');if(labs[0])labs[0].firstChild.textContent=t('Dạng bài','Mode');if(labs[1])labs[1].firstChild.textContent=t('Số phép tính','Number of terms')}};
// A missed problem returns as a fresh equivalent question so the learner cannot rely on the old answer.
function numiReviewVariant(old){
 if(!old)return old;
 const validFresh=q=>Boolean(q&&q.q&&q.answer!==undefined&&q.answer!==null&&!/undefined|NaN/.test(String(q.q))&&!/undefined|NaN/.test(String(q.answer)));
 const topicId=(old.topicId&&old.topicId!=='all')?old.topicId:(old.config?.topic&&old.config.topic!=='all'?old.config.topic:null);
 if(topicId&&typeof generateTopicQuestion==='function'){
  const baseCfg={...(typeof defaults!=='undefined'?defaults:{}),...(typeof config!=='undefined'?config:{}),...(old.config||{}),topic:topicId,topics:[topicId]};
  let freshQ=null;
  for(let i=0;i<25;i++){
   const cand=generateTopicQuestion(topicId,baseCfg);
   if(validFresh(cand)){freshQ=cand;if(cand.q!==old.q&&cand.answer!==old.answer)break}
  }
  if(validFresh(freshQ))return {...freshQ,id:old.id,originalSkill:old.skill,topicId,config:{...(freshQ.config||baseCfg),topic:topicId,topics:[topicId]}};
 }
 const skill=String(old.skill||''),parts=skill.split(':'),type=parts[0]||old.config?.type||'natural',op=parts[1]||'+';
 const validTypes=new Set(['natural','fraction','decimal','negative','remainder']);
 const validOps=new Set(['+','-','*','/','convenient','expression','missing','word']);
 if(validTypes.has(type)&&validOps.has(op)){
  const baseDef=typeof defaults!=='undefined'?defaults:{};
  const c={...baseDef,...(typeof config!=='undefined'?config:{}),...(old.config||{}),grade:'custom',topic:'all',topics:[]};
  c.digits=Array.isArray(c.digits)&&c.digits.length?c.digits:[1];
  c.questionStyle=(op==='convenient'||op==='expression'||op==='missing'||op==='word')?op:'normal';
  c.type=type;c.types=[type];
  c.ops=(op==='convenient'||op==='expression'||op==='missing'||op==='word')?(Array.isArray(c.ops)&&c.ops.length?c.ops:['+','-','*']):[op];
  let freshQ=null;
  for(let i=0;i<40;i++){
   const cand=generate(c);
   if(validFresh(cand)){freshQ=cand;if(cand.q!==old.q&&cand.answer!==old.answer)break}
  }
  if(validFresh(freshQ))return {...freshQ,id:old.id,originalSkill:old.skill,config:{...(freshQ.config||c),type}};
 }
 return {...old,id:old.id,originalSkill:old.skill};
}
const numiOriginalStartReview=startReview;startReview=function(){if(!currentAuthUser()){openAccount('login');return}if(!state.mistakes.length)return numiOriginalStartReview();const saved=state.mistakes;state.mistakes=saved.map(numiReviewVariant);try{numiOriginalStartReview()}finally{state.mistakes=saved}};
// Prevent natural-number practice and distractors from displaying negative values.
const numiOriginalGenerate=generate;
generate=function(c){
  const cfg=c||(typeof window!=='undefined'&&window.config)||config;
  let q=numiOriginalGenerate(cfg);
  const qType=(q.config?.type||q.config?.types?.[0]||cfg.type);
  if(qType==='natural'&&q.skill?.startsWith('natural:')){
    let answer=Number(String(q.answer).replace(',','.'));
    if(answer<0){
      const safe={...cfg,questionStyle:'normal',type:'natural',types:['natural'],ops:['+']};
      q=numiOriginalGenerate(safe);
      answer=Number(String(q.answer).replace(',','.'));
    }
    const used=new Set([String(q.answer)]);
    q.options=(q.options||[]).map(x=>{
      if(!String(x).startsWith('-')){
        used.add(String(x));
        return x;
      }
      for(let d=1;d<100;d++){
        const candidate=String(Math.max(0,answer+d));
        if(!used.has(candidate)){
          used.add(candidate);
          return candidate;
        }
      }
      return '0';
    });
  }
  return q;
};
if(typeof window!=='undefined')window.generate=generate;
if(typeof global!=='undefined')global.generate=generate;
// Load saved theme once and retain it across every screen.
let numiSavedTheme='candy';try{numiSavedTheme=localStorage.getItem('numi-color-theme')||'candy'}catch{}numiThemeApply(numiSavedTheme);
const numiOriginalTranslate=translate;translate=function(){numiOriginalTranslate();const homeLabel=$('nav [data-view="home"] i'),practiceLabel=$('nav [data-view="setup"] i');if(homeLabel)homeLabel.textContent=t('Trang chủ','Home');if(practiceLabel)practiceLabel.textContent=t('Luyện tập','Practice')};

// Drag across columns with a tap-to-pair fallback, including when a card is off-screen.
function numiGardenPointer(e,card){
 if(e.button!==0||garden?.busy||card.disabled)return;e.preventDefault();
 const pointerId=e.pointerId,startX=e.clientX,startY=e.clientY;let moving=false,ghost=null,ended=false;
 const removeTargets=()=>$$('.drop-target').forEach(x=>x.classList.remove('drop-target'));
 const cleanup=()=>{if(ended)return;ended=true;window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',cancel);ghost?.remove();ghost=null;gardenGhost=null;card.classList.remove('dragging');removeTargets()};
 const findTarget=(x,y)=>{const nodes=document.elementsFromPoint?document.elementsFromPoint(x,y):[document.elementFromPoint(x,y)];for(const node of nodes){const target=node?.closest?.('[data-match-kind]');if(target&&!target.disabled&&target.dataset.matchKind!==card.dataset.matchKind)return target}return null};
 const move=ev=>{if(ev.pointerId!==pointerId||ended)return;if(Math.hypot(ev.clientX-startX,ev.clientY-startY)>12&&!moving){moving=true;ghost=card.cloneNode(true);ghost.classList.add('garden-ghost');ghost.removeAttribute('data-match-kind');ghost.removeAttribute('data-match-id');ghost.style.width=card.offsetWidth+'px';document.body.append(ghost);gardenGhost=ghost;card.classList.add('dragging')}if(ghost){ev.preventDefault();ghost.style.left=ev.clientX+'px';ghost.style.top=ev.clientY+'px';removeTargets();const target=findTarget(ev.clientX,ev.clientY);target?.classList.add('drop-target')}};
 const up=ev=>{if(ev.pointerId!==pointerId)return;const target=findTarget(ev.clientX,ev.clientY);cleanup();if(moving&&target){const pot=card.dataset.matchKind==='pot'?card:target,flower=card.dataset.matchKind==='flower'?card:target;gardenMatch(pot.dataset.matchId,flower.dataset.matchId)}else gardenChoose(card.dataset.matchKind,card.dataset.matchId)};
 const cancel=ev=>{if(ev.pointerId===pointerId)cleanup()};
 window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',up);window.addEventListener('pointercancel',cancel);
}
gardenPointer=numiGardenPointer;
const numiGardenRender=gardenRender;gardenRender=function(){numiGardenRender();const instruction=$('.garden-instruction');if(instruction)instruction.textContent=t('Kéo chậu hoặc hoa để ghép. Kéo khó? Chạm phép tính, rồi chạm hoa đáp án.','Drag a pot or flower to match. Hard to drag? Tap a question, then its answer flower.');};

// One companion profile is shared by every screen, not just the home page.
const NUMI_BUDDY_KEY='numi-buddy-profile-v1';
const numiAnimalOriginal=animal;
if(typeof window!=='undefined')window.numiAnimalOriginal=numiAnimalOriginal;
if(typeof global!=='undefined')global.numiAnimalOriginal=numiAnimalOriginal;
function numiBuddyPrefs(){
 let saved={};try{saved=JSON.parse(localStorage.getItem(NUMI_BUDDY_KEY)||'{}')||{}}catch{}
 const name=String(saved.name||state?.buddyName||'Numi').trim().slice(0,24)||'Numi';
 const avatar=['bunny','panda','fox','lion'].includes(saved.avatar)?saved.avatar:(['bunny','panda','fox','lion'].includes(state?.buddy)?state.buddy:'bunny');
 return {name,avatar};
}
animal=function(kind='lion',cls=''){
 const prefs=numiBuddyPrefs();
 return numiAnimalOriginal(kind==='bunny'||kind==='buddy'?prefs.avatar:kind,cls);
};
function numiCustomizeBuddy(){
 const current=numiBuddyPrefs(),choices=[['bunny','Thỏ'],['panda','Gấu trúc'],['fox','Cáo'],['lion','Sư tử']];
 modal(`<h2>${t('Tạo bạn đồng hành','Make your study buddy')}</h2><label for="numiBuddyName">${t('Tên bạn ấy','Buddy name')}</label><input id="numiBuddyName" maxlength="16" value="${esc(current.name)}"><p class="buddy-edit-label">${t('Chọn khuôn mặt','Choose an animal')}</p><div class="buddy-choices">${choices.map(([key,label])=>`<button type="button" data-buddy-avatar="${key}" aria-pressed="${current.avatar===key}">${numiAnimalOriginal(key)}<span>${t(label,label)}</span></button>`).join('')}</div><button id="numiBuddySave" class="primary wide">${t('Lưu bạn đồng hành','Save buddy')}</button>`);
 let avatar=current.avatar;$$('[data-buddy-avatar]').forEach(b=>b.onclick=()=>{avatar=b.dataset.buddyAvatar;$$('[data-buddy-avatar]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))});
 $('#numiBuddySave').onclick=()=>{const name=$('#numiBuddyName').value.trim().slice(0,16)||'Numi';try{localStorage.setItem(NUMI_BUDDY_KEY,JSON.stringify({name,avatar}))}catch{}state.buddy=avatar;state.buddyName=name;try{save()}catch{}$('#modal').close();if(!currentAuthUser()){openAccount('login')}else if(view==='home'){home()}else if(view==='quiz')showQuiz();else if(view==='garden')gardenRender();else if(view==='setup')setup();else if(view==='stats')stats();else home()};
}
// Bind clear-mistakes button if inline mistake banner is rendered inside setup.
const numiSetupBeforeFinal=setup;
setup=function(){numiSetupBeforeFinal();const b=$('#clearMistakesPractice');if(b)b.onclick=()=>{state.mistakes=[];save();setup()}};
const numiGardenRenderBeforeFinal=gardenRender;
gardenRender=function(){numiGardenRenderBeforeFinal();const instruction=$('.garden-instruction');if(instruction)instruction.textContent=t('Chạm một chậu, rồi chạm bông hoa để ghép.','Tap a pot, then tap its flower to match.');};
if(typeof syncUserGradeToConfig==='function')syncUserGradeToConfig();
if(!currentAuthUser()){openAccount('login')}else if(view==='home'){home()}

const numiBrand=$('.brand');if(numiBrand)numiBrand.innerHTML=`<span class="brand-word">Numi<span>Quick</span><small data-vi="Luyện tính nhẩm vui" data-en="Fun mental maths">${t('Luyện tính nhẩm vui','Fun mental maths')}</small></span>`;document.title='NumiQuick · Luyện tính nhẩm vui';

const numiShowQuizBeforeFinal=showQuiz;showQuiz=function(){numiShowQuizBeforeFinal();if(view!=='quiz'||!session||session.done)return;const box=$('.quiz-companion span');if(box)box.textContent=t('Cố lên '+numiBuddyPrefs().name+'! Tập trung tính thật cẩn thận nhé.','You can do it, '+numiBuddyPrefs().name+'! Take a deep breath and solve carefully.');};

// Keep the selected companion face and name consistent after every app screen render.
function numiAnimalEl(avatar,cls){
 const tpl=document.createElement('template');
 const markup=typeof animal==='function'?animal(avatar,cls):numiAnimalOriginal(avatar,cls);
 tpl.innerHTML=String(markup).trim();
 return tpl.content.firstElementChild;
}
function numiSyncBuddyIdentity(root=document.querySelector('#app')){
 if(!root)return;
 if((typeof isCurrentUserAdmin==='function'&&isCurrentUserAdmin())||(typeof view!=='undefined'&&view==='admin'))return;
 const prefs=numiBuddyPrefs(),avatar=prefs.avatar,name=prefs.name;
 const syncKey=`${avatar}:${state?.accessories?.equipped||''}:${typeof buyOrEquipAccessory==='function'?1:0}`;
 root.querySelectorAll('.animal').forEach(old=>{
  if(old.closest('.buddy-choices,.buddy-picker,.play-buddies,.student-avatar,.profile-buddy-chips,.buddy-chip-icon,.family-chip'))return;
  if(old.dataset.buddySync===syncKey)return;
  const replacement=numiAnimalEl(avatar);if(!replacement)return;
  replacement.setAttribute('class',old.getAttribute('class')||'animal');replacement.dataset.buddySync=syncKey;old.replaceWith(replacement);
 });
 const homeMark=root.querySelector('.home-v2-wordmark>span');if(homeMark)homeMark.textContent=name;
 if(name&&name!=='Numi'&&!/\bNumi\b/.test(name)&&!(typeof view!=='undefined'&&view==='guide')){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;const nodes=[];
  while(node=walker.nextNode()){if(node.parentElement?.closest('script,style,.brand,.buddy-choices,.buddy-picker,.play-buddies,.profile-buddy-chips,.buddy-chip-icon,.family-chip,.guide-view,.guide-cards,.guide-card,.guide-hero,.auth-gate-card'))continue;if(/\bNumi\b/.test(node.nodeValue))nodes.push(node)}
  for(const item of nodes){const next=item.nodeValue.replace(/\bNumi\b/g,()=>name);if(next!==item.nodeValue)item.nodeValue=next;}
 }
}
numiSyncBuddyIdentity();
const numiIdentityObserver=new MutationObserver(()=>numiSyncBuddyIdentity());
numiIdentityObserver.observe(document.querySelector('#app'),{childList:true,subtree:true,characterData:true});
