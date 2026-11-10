'use strict';
// Replace the geography collection with an optional, cumulative bubble-tea goal.
const teaSizes={S:30,M:50,L:70};
function teaState(){
  if(!state.tea||typeof state.tea!=='object')state.tea={pearls:0,size:'S',cups:{S:0,M:0,L:0},stickers:0};
  const x=state.tea;
  if(!Number.isSafeInteger(x.pearls)||x.pearls<0)x.pearls=0;
  if(!teaSizes[x.size])x.size='S';
  if(!x.cups||typeof x.cups!=='object')x.cups={};
  Object.keys(teaSizes).forEach(s=>{if(!Number.isSafeInteger(x.cups[s])||x.cups[s]<0)x.cups[s]=0});
  if(!Number.isSafeInteger(x.stickers)||x.stickers<0)x.stickers=0;
  return x;
}
function teaIcon(size='S',lid=true){const scale=size==='L'?1.12:size==='M'?1.05:1;
 return `<svg class="tea-cup size-${size.toLowerCase()}" style="--cup-scale:${scale}" viewBox="0 0 150 170" role="img" aria-label="${t('Ly trà sữa size '+size,'Size '+size+' milk tea')}"><path d="M39 49h73l-8 101a9 9 0 0 1-9 8H56a9 9 0 0 1-9-8Z" fill="#f6a6bd" stroke="#bd557a" stroke-width="5"/><path d="M44 80h63l-5 65H50Z" fill="#ffedbd"/><path d="M44 80h63l-2 26H46Z" fill="#8b5549"/><path d="M61 68 72 20" stroke="#7a567c" stroke-width="8" stroke-linecap="round"/>${lid?'<path d="M34 54q41-16 84 0l-3 14H37Z" fill="#78c9bb" stroke="#438f89" stroke-width="4"/>':''}<path d="M44 55q8-12 17 0t17 0 17 0 17 0" fill="none" stroke="#fff4dc" stroke-width="6"/><g fill="#59443f"><circle cx="56" cy="132" r="7"/><circle cx="76" cy="139" r="7"/><circle cx="94" cy="128" r="7"/><circle cx="67" cy="117" r="6"/><circle cx="87" cy="114" r="6"/></g><path d="M26 159h98" stroke="#be6582" stroke-width="5" stroke-linecap="round"/><circle cx="111" cy="93" r="13" fill="#ffd564"/><path d="M106 93h10m-5-5v10" stroke="#9b6a2c" stroke-width="2" stroke-linecap="round"/></svg>`}
function teaTotalCups(x=teaState()){return Object.values(x.cups).reduce((a,b)=>a+b,0)}
function teaGoal(){const x=teaState(),target=teaSizes[x.size];return {x,target,progress:Math.min(100,x.pearls/target*100),ready:x.pearls>=target}}
function teaRenderGoals(){
 const {x,target,progress,ready}=teaGoal();
 $('#app').innerHTML=`<section class="tea-goals"><div class="tea-heading"><div><span class="tea-eyebrow">${t('MỤC TIÊU CỦA EM','YOUR LITTLE GOAL')}</span><h1>${t('Rủ Numi làm trà sữa!','Make bubble tea with Numi!')}</h1><p>${t('Mỗi câu đúng góp một viên trân châu. Tích lũy qua nhiều buổi nhé!','Each correct answer earns a pearl. Your progress adds up across sessions!')}</p></div><div class="tea-mascot">${farmRabbit()}<span>${esc(farmState().name)}</span></div></div><div class="tea-progress-card"><div class="tea-progress-visual">${teaIcon(x.size)}${[0,1,2,3].map((_,i)=>`<span class="floating-pearl pearl-${i}">●</span>`).join('')}</div><div class="tea-progress-info"><span class="tea-eyebrow">${t('LY ĐANG LÀM','CUP IN PROGRESS')}</span><h2>${t('Size','Size')} ${x.size} <small>${target} ${t('viên','pearls')}</small></h2><div class="tea-count"><strong>${Math.min(target,x.pearls)}</strong><span>/ ${target} ${t('viên trân châu','tapioca pearls')}</span></div><progress max="${target}" value="${Math.min(target,x.pearls)}" aria-label="${x.pearls}/${target}"></progress>${ready?`<button class="tea-claim" id="teaClaim">${t('Ly đầy rồi! Nhận huy hiệu','Your cup is ready! Claim it')} →</button>`:`<button class="primary" onclick="nav('home')">${t('Luyện để lấy trân châu','Practice for pearls')} →</button><small>${t('Còn','Only')} ${target-x.pearls} ${t('câu đúng nữa thôi','more correct answers to go')}</small>`}</div></div><h2 class="tea-size-title">${t('Chọn chiếc ly của em','Choose your cup')}</h2><div class="tea-size-grid">${Object.entries(teaSizes).map(([s,n])=>`<button class="tea-size-option ${s===x.size?'selected':''}" data-tea-size="${s}" aria-pressed="${s===x.size}">${teaIcon(s)}<b>${t('Size','Size')} ${s}</b><span>${n} ${t('câu đúng','correct answers')}</span><small>${x.cups[s]||0} ${t('ly đã làm','cups completed')}</small></button>`).join('')}</div><div class="tea-gift-note">${animal('bunny')}<p>${t('Mỗi ly hoàn thành mở một huy hiệu đáng yêu. Bé có thể khoe với bố mẹ; bố mẹ sẽ quyết định phần thưởng ngoài đời nhé!','Each cup earns a cute badge. Show your family, and let a grown-up decide on any real-world treat!')}</p></div><button class="tea-back" onclick="nav('home')">← ${t('Về luyện tập','Back to practice')}</button></section>`;
 $$('[data-tea-size]').forEach(b=>b.onclick=()=>{x.size=b.dataset.teaSize;save();teaRenderGoals()});
 if(ready)$('#teaClaim').onclick=()=>teaClaimCup();
 translate();
}
function teaClaimCup(){const {x,target,ready}=teaGoal();if(!ready)return;const size=x.size;x.pearls-=target;x.cups[size]++;const total=teaTotalCups(x);let badge='';if(total%3===0){x.stickers++;badge=t(' Em còn mở thêm một huy hiệu Numi nữa!',' You also unlocked a Numi sticker!')};save();modal(`<div class="tea-claimed-art">${teaIcon(size)}</div><span class="tea-eyebrow">${t('MỤC TIÊU HOÀN THÀNH','GOAL COMPLETE')}</span><h2>${t('Ly trà sữa size','Size')} ${size} ${t('đã đầy!','is ready!')}</h2><p>${t('Bé đã trả lời đúng','You answered')} ${target} ${t('câu để gom đủ trân châu. Tiến độ còn dư vẫn được giữ.','questions correctly to collect these pearls. Extra pearls stay in your basket.')}${badge}</p><div class="notice">${total} ${t('ly hoàn thành ·','cups completed ·')} ${x.stickers} ${t('huy hiệu','stickers')}</div><p class="tea-parent-note">${t('Cho bố mẹ xem thành tích nhé. Bố mẹ sẽ cùng em chọn phần thưởng ngoài đời.','Show your grown-up your progress and choose a real-world reward together.')}</p><button class="primary wide" id="teaClaimDone">${t('Tiếp tục luyện','Keep practicing')}</button>`);$('#teaClaimDone').onclick=()=>{$('#modal').close();teaRenderGoals()};}
atlas=teaRenderGoals;
// Correct answers, including a first-time correct flower review, earn exactly one pearl.
farmEarn=function(food,review=false){const x=teaState();x.pearls++;if(session){session.pearlsEarned=(session.pearlsEarned||0)+1;session.farmEarned=(session.farmEarned||0)+1}save()};
const teaFinishPractice=finishPractice;
finishPractice=function(){teaFinishPractice();const s=session;if(s.kind==='challenge')return;const earned=s.pearlsEarned||0,el=$('.simple-earned');if(el){el.innerHTML=`${teaIcon(teaState().size)}<b>+${earned}</b><span>${t('viên trân châu','tapioca pearls')}</span>`}const status=$('#simpleFeedStatus');if(status)status.textContent=t('Bấm “Mục tiêu” để xem ly đã đầy bao nhiêu nhé.','Tap Goals to see how full your cup is.');const feed=$('#simpleResultFeed');if(feed){feed.disabled=false;feed.textContent=t('Xem ly trà sữa của em','View your milk tea goal')+' →';feed.onclick=()=>nav('atlas')}}
;
// Keep the game focused on practice; goals replace the former geography tab.
const teaNavTranslate=translate;
translate=function(){teaNavTranslate();const b=$('[data-view="atlas"] i');if(b)b.textContent=t('Mục tiêu','Goals');const c=$('[data-view="setup"] i');if(c)c.textContent=t('Bài luyện','Practice')};
function teaPatchHome(){
 const title=$('.simple-copy h1');if(title)title.innerHTML=t('Cùng Numi<br>gom trân châu!','Collect pearls<br>with Numi!');
 const desc=$('.simple-copy p');if(desc)desc.innerHTML=t('Luyện tính nhẩm và nhận một viên trân châu cho mỗi câu đúng.','Practice mental maths and earn one tapioca pearl for each correct answer.');
 const care=$('.simple-care');if(care){const x=teaState(),target=teaSizes[x.size];care.innerHTML=`<div class="simple-basket">${teaIcon(x.size)}<span><b>${x.pearls}/${target} ${t('viên trân châu','tapioca pearls')}</b><small>${t('Còn','Only')} ${Math.max(0,target-x.pearls)} ${t('viên đến ly size','pearls until size')} ${x.size}</small></span></div><div class="simple-growth tea-home-progress"><span>${t('Tiến độ ly trà sữa','Milk tea goal')} <b>${x.cups[x.size]||0} ${t('ly đã hoàn thành','cups completed')}</b></span><progress max="${target}" value="${Math.min(target,x.pearls)}"></progress></div><button onclick="nav('atlas')">${x.pearls>=target?t('Nhận ly','Claim cup'):t('Xem mục tiêu','View goal')} →</button>`}
 const extras=$('.simple-extras');if(extras)extras.innerHTML=`<button onclick="nav('atlas')"><b>${t('Mục tiêu trà sữa','Milk tea goals')}</b><small>${t('Tích trân châu và nhận huy hiệu','Collect pearls and earn stickers')} →</small></button><button onclick="farmRename()"><b>${t('Bạn đồng hành','Your companion')}</b><small>${t('Đổi tên','Change name')} ${esc(farmState().name)} →</small></button><button onclick="nav('stats')"><b>${t('Lịch sử luyện tập','Practice history')}</b><small>${t('Xem kết quả của em','See your results')} →</small></button>`;
 const p=$('.simple-pet-note');if(p)p.textContent=t('Bạn thú chăm chỉ','Your study buddy');
}
const teaHome=home;
home=function(){teaHome();teaPatchHome()};
// Replace the oversized country/cup count previously shown beside the brand.
const teaInitialise=initializeZoo;
initializeZoo=function(){teaInitialise();const pp=$('.little-passport');if(pp)pp.remove()};
function teaPearlShortcut(){const b=$('[data-view="atlas"]');if(b)b.setAttribute('aria-label',t('Mục tiêu trà sữa','Milk tea goals'))}
teaState();document.title=t('Numi · Luyện tính nhẩm','Numi · Mental maths practice');
if(view==='home'){home();teaPearlShortcut()}
