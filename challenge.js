'use strict';
// Three mastered levels unlock one badge. Progress is part of the existing backup.
function challengeProgress(){
  if(!state.challenge||!Number.isSafeInteger(state.challenge.completed)||state.challenge.completed<0)
    state.challenge={completed:0,pending:null,best:{}};
  state.challenge.best=state.challenge.best||{};
  return state.challenge;
}
function challengeSpec(index=challengeProgress().completed){
  const chapter=Math.floor(index/3),step=index%3;
  const tracks=[
    ['Cà rốt đầu mùa','First carrots',['natural'],['+','-'],[1],20],
    ['Luống rau khéo léo','Clever veggie patch',['natural'],['+','-'],[2],25],
    ['Giỏ hạt thông minh','Clever seed basket',['natural'],['*','/'],[1],20],
    ['Chuyến xe thu hoạch','Harvest wagon',['natural'],['+','-','*','/'],[1,2],28],
    ['Vườn số âm','Negative number garden',['negative'],['+','-'],[1,2],25],
    ['Quầy trái cây','Fruit stall',['decimal'],['+','-','*','/'],[1,2],30],
    ['Bánh chia phần','Sharing pies',['fraction'],['+','-','*','/'],[1],35],
    ['Kho hạt có dư','Remainder granary',['remainder'],['/'],[2],25]
  ];
  const tier=Math.max(0,chapter-tracks.length+1),r=tracks[Math.min(chapter,tracks.length-1)];
  const digits=chapter<tracks.length?r[4]:[Math.min(6,2+Math.floor(tier/2))];
  return {index,chapter,step,title:chapter<tracks.length?t(r[0],r[1]):t('Nhà nông tinh anh','Expert farmer'),ops:chapter<tracks.length?r[3]:['+','-','*','/'],types:chapter<tracks.length?r[2]:['natural','negative','decimal','fraction','remainder'],digits,
    count:step===2?15:10,seconds:Math.max(8,r[5]-step*4-Math.min(tier,6)),type:r[2][0]};
}
function challengeStatus(reward=false){const p=challengeProgress();return reward?
  t('Qua đủ 3 level! Em nhận một huy hiệu mới.','Three levels cleared! You earned a new badge.'):
  `${p.completed%3}/3 ${t('level đã qua để nhận huy hiệu tiếp theo.','levels cleared toward the next badge.')}`}
function completeChallenge(index){
  const p=challengeProgress();if(index!==p.completed)return null;
  p.completed++;p.pending=null;
  const reward=p.completed%3===0;
  if(reward){state.badges=(Number.isSafeInteger(state.badges)?state.badges:0)+1;p.lastAward={completed:p.completed,badge:state.badges,date:new Date().toISOString()}}
  save();return {reward,index,completed:p.completed};
}
function challenge(){
  const p=challengeProgress(),spec=challengeSpec(),base=Math.floor(p.completed/3)*3;
  $('#app').innerHTML=`<section class="narrow challenge-shell"><div class="farm-kicker">${t('CHINH PHỤC · KIẾM MẢNH VIỆT NAM','CHALLENGES · VIETNAM PIECES')}</div><h1>${spec.title}</h1><p>${t('Tính chắc rồi tính nhanh. Ba bước nhỏ, một khám phá mới!','Accuracy first, then speed. Three steps, one discovery!')}</p><div class="level-path">${[0,1,2].map(i=>{const n=base+i,done=n<p.completed,active=n===p.completed;return `<div class="level-stop ${done?'cleared':active?'current':'locked'}"><span>${done?'✓':n+1}</span><b>${t('Level','Level')} ${n+1}</b><small>${done?t('Đã qua','Cleared'):active?t('Đang chờ em','Your next step'):t('Chưa mở','Locked')}</small></div>`}).join('')}</div><div class="card challenge-rules"><h2>${t('Nhiệm vụ hiện tại','Your next mission')} · ${t('Level','Level')} ${p.completed+1}</h2><div class="challenge-facts"><span><b>${spec.count}</b>${t('câu','questions')}</span><span><b>${spec.seconds}s</b>${t('mỗi câu','per question')}</span><span><b>80%</b>${t('đúng để qua','to pass')}</span></div><p>${t('Đề cố định độ khó theo level, không thêm giờ. Hết giờ tính là câu sai. Ôn hết câu sai trước khi mở level tiếp theo.','Difficulty is fixed for each level, without extra time. A timeout counts as a mistake. Review all mistakes before moving on.')}</p><div class="notice">${challengeStatus()}</div>${state.mistakes.length?`<p>${state.mistakes.length} ${t('câu cần ôn trước khi tiếp tục.','questions need review first.')}</p><button class="primary wide" onclick="startReview()">${t('Chăm vườn hoa câu sai','Review in the flower garden')}</button>`:`<button class="primary wide" onclick="startChallengeQuiz()">${t('Cùng Numi chinh phục','Start with Numi')} →</button>`}<button class="wide farm-back" onclick="nav('home')">${t('Về nông trại','Back to the farm')}</button></div><p class="muted">${t('Đã có mảnh từ bản cũ? Tất cả vẫn được giữ. Lộ trình mới bắt đầu từ level 1.','Existing pieces stay in your collection. The new path starts at level 1.')}</p>${p.completed>=3?`<button onclick="showFarmCertificate()">${t('Xem bằng khen gần nhất','View your latest certificate')}</button>`:''}</section>`;
  translate();
}
function startChallengeQuiz(){
  if(state.mistakes.length){startReview();return}
  const spec=challengeSpec();stop();view='quiz';
  session={kind:'challenge',challengeIndex:spec.index,questions:Array.from({length:spec.count},()=>generate({...defaults,...spec})),index:0,results:[],done:false};
  showQuiz();
}
finishPractice=function(){
  stop();const s=session;s.done=true;
  const n=s.results.filter(x=>x.correct).length,total=s.results.length,isChallenge=s.kind==='challenge';
  const h={date:new Date().toISOString(),mode:isChallenge?'challenge':'practice',correct:n,total,time:avg(s.results.map(x=>x.elapsed)),extra:s.results.filter(x=>x.extra).length};
  state.history.push(h);state.history=state.history.slice(-200);state.xp+=n*3;
  let result=null,passed=false;
  if(isChallenge){const p=challengeProgress();passed=n>=Math.ceil(total*.8)&&h.extra===0;p.best[s.challengeIndex]=Math.max(p.best[s.challengeIndex]||0,n/total);p.pending=passed?{index:s.challengeIndex}:null;if(passed&&!state.mistakes.length)result=completeChallenge(s.challengeIndex)}
  save();
  $('#app').innerHTML=`<div class="narrow card farm-result"><div class="intro-animal">${animal('bunny')}</div><h1>${isChallenge?(passed?t('Giỏi lắm, nhà nông nhỏ!','Well done, little farmer!'):t('Mình luyện thêm một chút nhé!','Let’s practice a little more!')):t('Giỏ đồ ăn đầy thêm rồi!','Your food basket is growing!')}</h1><p>${n}/${total} ${t('câu đúng lần đầu','correct on the first try')} · ${h.time.toFixed(1)}s/${t('câu','question')}</p><div class="notice">${typeof farmSessionSummary==='function'?farmSessionSummary(s):''}</div><p>${isChallenge?(passed?(state.mistakes.length?t('Đủ 80% rồi! Ôn hết câu sai để hoàn thành level này.','80% reached! Review the mistakes to complete this level.'):challengeStatus(result?.reward)):t('Cần đúng ít nhất 80%. Ôn câu sai rồi thử lại level này; em vẫn giữ đồ ăn đã kiếm được.','You need at least 80%. Review your mistakes and retry this level; your earned food stays.')):t('Mang đồ ăn về chăm Numi nhé. Vào Chinh phục để kiếm mảnh khám phá.','Bring your food home to Numi. Visit Challenges to earn discovery pieces.')}</p><div class="actions">${state.mistakes.length?`<button class="primary" onclick="startReview()">${t('Ôn câu sai · nhận cỏ','Review mistakes · earn hay')}</button>`:`<button class="primary" onclick="nav('${isChallenge?'challenge':'home'}')">${isChallenge?t('Xem đường level','View level path'):t('Về cho Numi ăn','Feed Numi at home')}</button>`}${result?.reward?`<button onclick="showFarmCertificate()">${t('Nhận bằng khen','Open certificate')}</button>`:''}<button onclick="nav('home')">${t('Về nông trại','Back to the farm')}</button></div></div>`;translate();
};
gardenFinish=function(){
  clearInterval(gardenTimer);garden.active=null;
  const p=challengeProgress(),pending=p.pending,result=pending&&!state.mistakes.length?completeChallenge(pending.index):null;
  $('#app').innerHTML=`<div class="narrow card garden-finish"><div class="finished-bouquet">${gardenFlower(true,0)}${gardenFlower(true,1)}${gardenFlower(true,2)}</div><h1>${t('Vườn hoa đã nở rồi!','Your garden is blooming!')}</h1><p>${t('Đã ôn đúng','Reviewed')} ${garden.done.size} ${t('câu và thu thêm','questions and collected')} ${garden.done.size} ${t('bó cỏ cho Numi.','bundles of hay for Numi.')}</p>${result?`<div class="notice">${challengeStatus(result.reward)}</div>`:''}<div class="actions"><button class="primary" onclick="nav('home')">${t('Về chăm Numi','Care for Numi')}</button><button onclick="nav('challenge')">${t('Tiếp tục Chinh phục','Continue Challenges')}</button>${result?.reward?`<button onclick="showFarmCertificate()">${t('Xem bằng khen','View certificate')}</button>`:''}</div></div>`;translate();
};
