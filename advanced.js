'use strict';
// Add child-friendly regrouping and multi-term expression practice to the existing settings.
const plainGenerate=generate;
function generatedOptions(answer, near=[]){
  const out=[String(answer)];
  const fraction=String(answer).match(/^(-?\d+)\/(\d+)$/);if(fraction){const n=+fraction[1],d=+fraction[2];for(const v of [frac(n+1,d),frac(n,d+1),frac(n-1,d)])if(!out.includes(v))out.push(v);return shuffle(out.slice(0,4))}
  for(const n of near)if(Number.isFinite(n)&&!out.includes(String(n)))out.push(String(n));
  for(let d=1;out.length<4;d++)for(const n of [Number(answer)+d,Number(answer)-d])if(Number.isFinite(n)&&!out.includes(String(n)))out.push(String(Math.round(n*1000)/1000));
  return shuffle(out.slice(0,4));
}
function customGenerate(c=config){
  if(c.questionStyle==='normal')return plainGenerate(c);
  const selectedType=pick(c.types?.length?c.types:[c.type||'natural']);
  const terms=Math.max(2,Math.min(6,+c.termCount||3)),digits=c.digits?.length?c.digits:[1],digit=pick(digits),lo=10**(digit-1),hi=10**digit-1,rand=()=>ri(lo,hi);
  if(c.questionStyle==='expression'&&selectedType==='fraction'){
    const values=Array.from({length:terms},()=>({n:ri(1,9),d:ri(2,12)}));let n=values[0].n,d=values[0].d;for(const v of values.slice(1)){n=n*v.d+v.n*d;d*=v.d}const answer=frac(n,d);let readable=values.map(v=>`${v.n}/${v.d}`).join(' + ');const pairs=(c.brackets||'none').split(',');if(pairs[0]!=='none'){const open={round:'(',square:'[',curly:'{'},close={round:')',square:']',curly:'}'};for(const pair of pairs)if(open[pair])readable=`${open[pair]}${readable}${close[pair]}`}return {id:crypto.randomUUID(),q:readable,answer,options:generatedOptions(answer,[frac(n+1,d),frac(n-1,d),frac(n,d+1)]),skill:'fraction:+',config:{...c,type:'fraction'},explanation:`${readable} = ${answer}`};
  }
  if(selectedType!=='natural')return plainGenerate(c);
  if(c.questionStyle==='convenient'){
    const factor=ri(2,9),pair=pick([[1,9],[2,8],[3,7],[4,6]]),a=pair[0],b=pair[1];
    const answer=factor*10, q=`${factor} × ${a} + ${factor} × ${b}`;
    const naive=factor*a+factor+b;
    return {id:crypto.randomUUID(),q,answer:String(answer),options:generatedOptions(answer,[naive,factor*(a+b-1),factor*(a+b+1)]),skill:'natural:convenient',config:{...c,type:'natural'},explanation:`${factor} × ${a} + ${factor} × ${b} = ${factor} × (${a} + ${b}) = ${factor} × 10 = ${answer}`};
  }
  if(c.questionStyle==='expression'){
    const ops=(c.ops||['+','-','*']).filter(op=>['+','-','*','/'].includes(op));
    const values=Array.from({length:terms},rand), chosen=Array.from({length:terms-1},()=>pick(ops.length?ops:['+','-','*']));
    // For division, choose divisible values so young learners see exact answers.
    for(let i=0;i<chosen.length;i++)if(chosen[i]==='/')values[i+1]=Math.max(1,Math.floor(values[i]/Math.max(1,values[i+1])));
    const glyph={'*':'×','/':'÷','+':'+','-':'−'};
    let raw=String(values[0]);for(let i=0;i<chosen.length;i++)raw+=` ${glyph[chosen[i]]} ${values[i+1]}`;
    let readable=raw;
    const brackets=c.brackets||'none';
    if(brackets!=='none'&&terms>=2){const open={round:'(',square:'[',curly:'{'},close={round:')',square:']',curly:'}'};const pairs=brackets.split(',');let grouped=`${values[0]} ${glyph[chosen[0]]} ${values[1]}`;for(const pair of pairs)if(open[pair])grouped=`${open[pair]}${grouped}${close[pair]}`;readable=grouped;for(let i=1;i<chosen.length;i++)readable+=` ${glyph[chosen[i]]} ${values[i+1]}`}
    const js=readable.replaceAll('−','-').replaceAll('×','*').replaceAll('÷','/').replaceAll('[','(').replaceAll(']',')').replaceAll('{','(').replaceAll('}',')');
    let value;try{value=Function(`"use strict";return (${js})`)()}catch{return plainGenerate(c)}
    if(!Number.isFinite(value)||Math.abs(value)>999999)return plainGenerate(c);
    const answer=String(Math.round(value*1000)/1000);
    const left=values.reduce((acc,n,i)=>i?acc+({'+':n,'-':-n,'*':n,'/':1}[chosen[i-1]]||n):n,0);
    return {id:crypto.randomUUID(),q:readable,answer,options:generatedOptions(answer,[Math.round(left),value+1,value-1]),skill:'natural:expression',config:{...c,type:'natural'},explanation:`${readable} = ${answer}`};
  }
  return plainGenerate(c);
}
generate=customGenerate;

const setupBeforeAdvanced=setup;
setup=function(){
  setupBeforeAdvanced();
  const form=$('#config');if(!form)return;
  const field=document.createElement('fieldset');field.className='advanced-picks';
  field.innerHTML=`<legend><span>4</span>${t('Kiểu bài nâng cao','Challenge style')}</legend><div class="formgrid"><label>${t('Dạng luyện','Practice mode')}<select name="questionStyle"><option value="normal">${t('Tính từng phép tính','One calculation at a time')}</option><option value="convenient">${t('Tính thuận tiện · gộp số tròn','Regroup to make round numbers')}</option><option value="expression">${t('Biểu thức nhiều số và dấu ngoặc','Multi-term expressions')}</option></select></label><label>${t('Số hạng trong biểu thức','Terms in an expression')}<select name="termCount">${[2,3,4,5,6].map(n=>`<option value="${n}">${n}</option>`).join('')}</select></label><label>${t('Cách dùng dấu ngoặc','Bracket grouping')}<select name="brackets"><option value="none">${t('Không dùng ngoặc','No brackets')}</option><option value="round">( )</option><option value="round,square">( ) lồng trong [ ]</option><option value="round,square,curly">( ), [ ], { }</option></select></label></div><p class="settings-hint small">${t('Bài tính thuận tiện dùng cách phân phối để tạo số tròn. Biểu thức có thể có 2–6 số hạng; dấu ngoặc vuông và ngoặc nhọn lồng ngoài ngoặc tròn.','Convenient problems use regrouping to make round numbers. Expressions use 2–6 terms; square and curly brackets nest outside parentheses.')}</p>`;
  form.insertBefore(field,form.querySelector('.session-size'));
  const oldSubmit=form.onsubmit;
  form.onsubmit=e=>{e.preventDefault();const f=new FormData(form),ops=f.getAll('op'),types=f.getAll('type'),digits=f.getAll('digits').map(Number),style=f.get('questionStyle');if(!ops.length||!types.length||!digits.length){toast(t('Chọn ít nhất một phép tính, loại số và số chữ số nhé.','Choose at least one operation, number type and digit length.'));return}if(style==='convenient'&&types.some(x=>x!=='natural')){toast(t('Bài tính thuận tiện hiện dùng số tự nhiên. Hãy chọn riêng “Số tự nhiên” nhé.','Convenient regrouping currently uses whole numbers. Select only “Whole numbers.”'));return}if(style==='expression'&&types.some(x=>!['natural','fraction'].includes(x))){toast(t('Biểu thức nhiều số hiện dùng số tự nhiên hoặc phân số. Hãy bỏ chọn loại số khác nhé.','Multi-term expressions currently use whole numbers or fractions. Uncheck other number types.'));return}config={...defaults,ops,types,digits,count:+f.get('count'),seconds:+f.get('seconds'),questionStyle:style,termCount:+f.get('termCount'),brackets:f.get('brackets')};startQuiz()};
  const style=form.elements.questionStyle,terms=form.elements.termCount,brackets=form.elements.brackets;
  style.value=config.questionStyle||'normal';terms.value=config.termCount||3;brackets.value=config.brackets||'none';
  style.onchange=()=>{terms.disabled=style.value==='normal';brackets.disabled=style.value!=='expression'};style.onchange();
};

// Do not show the old geography collection or award country pieces in the learning path.
const challengeBase=challenge;
challenge=function(){challengeBase();const kicker=$('.challenge-shell .farm-kicker');if(kicker)kicker.textContent=t('LEVEL THỬ THÁCH · NHẬN HUY HIỆU','CHALLENGE LEVELS · EARN BADGES');const intro=$('.challenge-shell>p');if(intro)intro.textContent=t('Vượt qua từng chặng để mở huy hiệu mới. Sai nhiều câu thì Numi gợi ý mình ôn lại.','Clear each stage to earn a new badge. If several answers are missed, Numi suggests a review.');const status=$('.challenge-rules .notice');if(status)status.textContent=`${challengeProgress().completed%3}/3 ${t('level đã qua để nhận huy hiệu tiếp theo.','levels cleared toward the next badge.')}`};
const homeBeforeAdvanced=home;
home=function(){homeBeforeAdvanced();const extras=$('.simple-extras');if(extras)extras.innerHTML=`<button onclick="nav('challenge')"><b>${t('Level thử thách','Challenge levels')}</b><small>${challengeProgress().completed} ${t('level đã qua','levels cleared')} · ${state.badges||0} ${t('huy hiệu','badges')} →</small></button><button onclick="nav('atlas')"><b>${t('Mục tiêu trà sữa','Milk tea goals')}</b><small>${t('Gom trân châu và nhận huy hiệu','Collect pearls and earn badges')} →</small></button><button onclick="farmRename()"><b>${t('Bạn đồng hành','Your companion')}</b><small>${t('Đổi tên thỏ','Rename your bunny')} · ${esc(farmState().name)} →</small></button><button onclick="nav('stats')"><b>${t('Nhật ký học','Learning journal')}</b><small>${t('Xem kết quả và tiến bộ','See results and progress')} →</small></button>`;advancedResumeCard()};
const finishBeforeBadge=finishPractice;
finishPractice=function(){const s=session;finishBeforeBadge();const p=$('.farm-result>p:nth-of-type(2)');if(p&&s?.kind!=='challenge')p.textContent=t('Mỗi câu đúng giúp em gần hơn với huy hiệu tiếp theo.','Every correct answer brings you closer to your next badge.')};
showFarmCertificate=function(){const p=challengeProgress();if(!(state.badges||0)){toast(t('Vượt qua 3 level để nhận huy hiệu đầu tiên nhé!','Clear 3 levels to earn your first badge!'));return}const name=state.name==='Explorer'?t('Nhà thám hiểm nhỏ','Little explorer'):state.name;modal(`<div class="farm-certificate"><span class="farm-kicker">NUMIQUEST · ${t('NÔNG TRẠI NUMI','NUMI’S FARM')}</span><div class="certificate-seal">🏅</div><h2>${t('BẰNG KHEN CHINH PHỤC','CHALLENGE CERTIFICATE')}</h2><p>${t('Trao tặng','Awarded to')}</p><h3>${esc(name)}</h3><p>${p.completed} ${t('level đã chinh phục','levels cleared')} · ${state.badges} ${t('huy hiệu','badges')}</p><small>${t('Chăm chỉ mỗi ngày, lớn lên cùng Numi.','Learn a little. Grow together with Numi.')}</small></div><div class="actions"><button class="primary" id="badgeCertificateDone">${t('Đẹp quá!','Lovely!')}</button></div>`);$('#badgeCertificateDone').onclick=()=>$('#modal').close()};
const PAUSED_LESSON_KEY='numi-paused-lesson-v1';
const startBeforePause=startQuiz;
startQuiz=function(){const baseline=JSON.stringify(state);startBeforePause();if(session)session.baseline=baseline};
function advancedResumeCard(){const host=$('.simple-home');if(!host)return;let saved;try{saved=JSON.parse(localStorage.getItem(PAUSED_LESSON_KEY)||'null')}catch{}if(!saved?.session)return;const box=document.createElement('section');box.className='paused-lesson-card';const remaining=Math.max(0,Math.ceil((saved.readyAt-Date.now())/60000));box.innerHTML=`<b>${t('Bài luyện đang tạm nghỉ','Your practice is paused')}</b><p>${remaining?t(`Em nghỉ thêm khoảng ${remaining} phút rồi quay lại nhé.`,'Take about '+remaining+' more minutes, then come back.') :t('Bài đã sẵn sàng để làm tiếp.','Your lesson is ready to resume.')}</p><div class="actions"><button class="primary" id="resumePaused" ${remaining?'disabled':''}>${t('Làm tiếp câu đang dở','Resume this lesson')} →</button><button id="discardPaused">${t('Bỏ bài đang dở','Discard this lesson')}</button></div>`;host.prepend(box);$('#resumePaused').onclick=()=>{if(Date.now()<saved.readyAt)return;try{state={...fresh(),...saved.state};lang=state.lang==='en'?'en':'vi';save()}catch{}config=saved.config||config;session=saved.session;view='quiz';const q=session.questions[session.index];if(q?.config)q.config.seconds=saved.remaining||q.config.seconds||config.seconds;localStorage.removeItem(PAUSED_LESSON_KEY);showQuiz()};$('#discardPaused').onclick=()=>{const baseline=saved.session.baseline;try{if(baseline)state={...fresh(),...JSON.parse(baseline)};save()}catch{}localStorage.removeItem(PAUSED_LESSON_KEY);home()}}
const navBeforePause=nav;
nav=function(nextView){if(session&&!session.done&&view==='quiz'&&nextView!==view){modal(`<h2>${t('Mình tạm dừng nhé?','Take a break?')}</h2><p>${t('Bài đang làm có thể giữ lại để em quay lại sau. Em chọn thời gian nghỉ:','Your lesson can wait here while you take a break. Choose how long:')}</p><div class="actions">${[1,3,5].map(h=>`<button class="pause-choice" data-pause="${h}">${h} ${t('giờ','hours')}</button>`).join('')}</div><p>${t('Hoặc bỏ riêng lượt đang dở. Những tiến độ đã hoàn thành trước đó vẫn được giữ.','Or discard only the unfinished lesson. Your earlier progress stays.')}</p><div class="actions"><button id="discardCurrent">${t('Bỏ lượt đang dở','Discard unfinished lesson')}</button><button id="stayCurrent">${t('Ở lại làm tiếp','Stay and continue')}</button></div>`);$('#stayCurrent').onclick=()=>$('#modal').close();$$('[data-pause]').forEach(b=>b.onclick=()=>{const left=parseFloat($('#clock')?.textContent)||config.seconds,copy=JSON.parse(JSON.stringify(session)),q=copy.questions[copy.index];if(q?.config)q.config.seconds=Math.max(5,Math.ceil(left));localStorage.setItem(PAUSED_LESSON_KEY,JSON.stringify({session:copy,config,state,remaining:Math.max(5,Math.ceil(left)),readyAt:Date.now()+(+b.dataset.pause)*3600000}));stop();session=null;$('#modal').close();navBeforePause(nextView)});$('#discardCurrent').onclick=()=>{const baseline=session.baseline;try{if(baseline)state={...fresh(),...JSON.parse(baseline)};save()}catch{}localStorage.removeItem(PAUSED_LESSON_KEY);stop();session=null;$('#modal').close();navBeforePause(nextView)};return}navBeforePause(nextView)};
window.addEventListener('beforeunload',e=>{if(session&&!session.done&&['quiz','garden','battle'].includes(view)){e.preventDefault();e.returnValue=''}});
if(view==='home')home();
