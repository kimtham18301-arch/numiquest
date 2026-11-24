'use strict';
// Add child-friendly regrouping and multi-term expression practice to the existing settings.
const plainGenerate=generate;
function generatedOptions(answer, near=[]){
  return antiTrickOptions(answer, near);
}
function safeEvalMath(expr) {
  const tokens = expr.match(/\d+(\.\d+)?|[+\-*/()]/g);
  if (!tokens) return NaN;
  const prec = { '+': 1, '-': 1, '*': 2, '/': 2 };
  const values = [];
  const ops = [];
  function applyOp() {
    const op = ops.pop();
    const b = values.pop();
    const a = values.pop();
    if (a === undefined || b === undefined) return;
    if (op === '+') values.push(a + b);
    else if (op === '-') values.push(a - b);
    else if (op === '*') values.push(a * b);
    else if (op === '/') values.push(b !== 0 ? a / b : NaN);
  }
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (/^\d/.test(tok)) {
      values.push(parseFloat(tok));
    } else if (tok === '(') {
      ops.push(tok);
    } else if (tok === ')') {
      while (ops.length && ops[ops.length - 1] !== '(') applyOp();
      ops.pop();
    } else if (prec[tok]) {
      while (ops.length && prec[ops[ops.length - 1]] >= prec[tok]) applyOp();
      ops.push(tok);
    }
  }
  while (ops.length) applyOp();
  return values.length === 1 ? values[0] : NaN;
}

function customGenerate(c){
  const cfg=c||(typeof window!=='undefined'&&window.config)||config;
  if(cfg.questionStyle==='normal')return plainGenerate(cfg);
  const selectedType=pick(cfg.types?.length?cfg.types:[cfg.type||'natural']);
  const terms=Math.max(2,Math.min(6,+cfg.termCount||3)),digits=cfg.digits?.length?cfg.digits:[1],digit=pick(digits),lo=10**(digit-1),hi=10**digit-1,rand=()=>ri(lo,hi);
  if(cfg.questionStyle==='expression'&&selectedType==='fraction'){
    const values=Array.from({length:terms},()=>({n:ri(1,9),d:ri(2,12)}));let n=values[0].n,d=values[0].d;for(const v of values.slice(1)){n=n*v.d+v.n*d;d*=v.d}const answer=frac(n,d);let readable=values.map(v=>`${v.n}/${v.d}`).join(' + ');const pairs=(cfg.brackets||'none').split(',');if(pairs[0]!=='none'){const open={round:'(',square:'[',curly:'{'},close={round:')',square:']',curly:'}'};for(const pair of pairs)if(open[pair])readable=`${open[pair]}${readable}${close[pair]}`}return {id:uid(),q:readable,answer,options:generatedOptions(answer,[frac(n+1,d),frac(n-1,d),frac(n,d+1)]),skill:'fraction:+',config:{...cfg,type:'fraction'},explanation:`${readable} = ${answer}`};
  }
  if(selectedType!=='natural')return plainGenerate(cfg);
  if(cfg.questionStyle==='convenient'){
    const g=cfg.grade?Number(cfg.grade):null;
    // Grade 1-2 (MOET GDPT 2018): No brackets / no distributive multiplication — use regrouping to make 10 or round tens!
    if(g===1||g===2){
      const pair=pick([[1,9],[2,8],[3,7],[4,6]]);
      if(g===1){
        const a=pair[0],b=pair[1],mid=ri(1,9),answer=10+mid;
        const q=`${a} + ${mid} + ${b}`;
        return {id:uid(),q,answer:String(answer),options:generatedOptions(answer,[answer+1,answer-1,answer+10]),skill:'natural:convenient',config:{...cfg,type:'natural'},explanation:`${t('Gộp cặp tròn 10 trước:','Group a pair making 10 first:')}\n(${a} + ${b}) + ${mid} = 10 + ${mid} = ${answer}`};
      }
      const tensA=ri(1,3)*10,tensB=ri(1,3)*10,a=tensA+pair[0],b=tensB+pair[1],mid=ri(5,25);
      const roundSum=a+b,answer=roundSum+mid;
      const q=`${a} + ${mid} + ${b}`;
      return {id:uid(),q,answer:String(answer),options:generatedOptions(answer,[answer+10,answer-10,answer+1]),skill:'natural:convenient',config:{...cfg,type:'natural'},explanation:`${t('Gộp hai số có hàng đơn vị cộng thành 10:','Group two numbers whose ones make 10:')}\n(${a} + ${b}) + ${mid} = ${roundSum} + ${mid} = ${answer}`};
    }
    // Grade 3: Addition regrouping or 2 × n × 5 = 10 × n
    if(g===3){
      if(Math.random()<0.5){
        const mid=ri(3,9),answer=10*mid,q=`2 × ${mid} × 5`;
        return {id:uid(),q,answer:String(answer),options:generatedOptions(answer,[answer+10,answer-10,2*mid+5]),skill:'natural:convenient',config:{...cfg,type:'natural'},explanation:`${t('Nhóm 2 × 5 = 10 trước:','Group 2 × 5 = 10 first:')}\n(2 × 5) × ${mid} = 10 × ${mid} = ${answer}`};
      }
      const pair=pick([[1,9],[2,8],[3,7],[4,6]]),a=ri(1,4)*10+pair[0],b=ri(1,4)*10+pair[1],mid=ri(12,35);
      const roundSum=a+b,answer=roundSum+mid,q=`${a} + ${mid} + ${b}`;
      return {id:uid(),q,answer:String(answer),options:generatedOptions(answer,[answer+10,answer-10,answer+2]),skill:'natural:convenient',config:{...cfg,type:'natural'},explanation:`${t('Gộp thành số tròn chục trước:','Group into a round ten first:')}\n(${a} + ${b}) + ${mid} = ${roundSum} + ${mid} = ${answer}`};
    }
    // Grade 4+ / Custom: Real distributive property (a × b + a × c) OR associative (25 × n × 4) OR round-100 sum
    const variant=pick(['dist','assocMul','assocAdd']);
    if(variant==='dist'){
      const factor=ri(2,9),pair=pick([[1,9],[2,8],[3,7],[4,6]]),a=pair[0],b=pair[1];
      const answer=factor*10,q=`${factor} × ${a} + ${factor} × ${b}`;
      return {id:uid(),q,answer:String(answer),options:generatedOptions(answer,[factor*(a+b-1),factor*(a+b+1),factor*a+b]),skill:'natural:convenient',config:{...cfg,type:'natural'},explanation:`${t('Áp dụng tính chất phân phối (nhóm thừa số chung):','Apply distributive property (factor out common multiplier):')}\n${factor} × ${a} + ${factor} × ${b} = ${factor} × (${a} + ${b}) = ${factor} × 10 = ${answer}`};
    }
    if(variant==='assocMul'){
      const mid=ri(3,9),answer=100*mid,q=`25 × ${mid} × 4`;
      return {id:uid(),q,answer:String(answer),options:generatedOptions(answer,[answer+100,answer-100,25*mid+4]),skill:'natural:convenient',config:{...cfg,type:'natural'},explanation:`${t('Áp dụng tính chất giao hoán & kết hợp:','Apply commutative & associative properties:')}\n(25 × 4) × ${mid} = 100 × ${mid} = ${answer}`};
    }
    const a=ri(12,78),b=100-a,mid=ri(15,65),answer=100+mid,q=`${a} + ${mid} + ${b}`;
    return {id:uid(),q,answer:String(answer),options:generatedOptions(answer,[answer+10,answer-10,answer+100]),skill:'natural:convenient',config:{...cfg,type:'natural'},explanation:`${t('Gộp cặp tròn 100 trước:','Group a pair making 100 first:')}\n(${a} + ${b}) + ${mid} = 100 + ${mid} = ${answer}`};
  }
  if(cfg.questionStyle==='expression'){
    const g=cfg.grade?Number(cfg.grade):null;
    // Grade 1 (MOET GDPT 2018): Two-step +/- from left to right, NO brackets, NO ×/÷, small numbers
    if(g===1){
      const a=ri(5,15),b=ri(1,9),c=ri(1,Math.min(9,a+b-1));
      const op2=pick(['+','-']);
      const ans=op2==='+'?a+b+c:a+b-c;
      const q=`${a} + ${b} ${op2==='-'?'−':'+'} ${c}`;
      return {id:uid(),q,answer:String(ans),options:generatedOptions(ans,[ans+1,ans-1,ans+2]),skill:'natural:expression',config:{...cfg,type:'natural'},explanation:`${t('Tính lần lượt từ trái sang phải:','Calculate from left to right:')}\n${a} + ${b} = ${a+b} → ${a+b} ${op2==='-'?'−':'+'} ${c} = ${ans}`};
    }
    const ops=(cfg.ops||['+','-','*']).filter(op=>g===2?['+','-'].includes(op):['+','-','*','/'].includes(op));
    const values=Array.from({length:terms},()=>g===2?ri(2,20):g===3?ri(2,15):rand()), chosen=Array.from({length:terms-1},()=>pick(ops.length?ops:['+','-']));
    // For division, choose divisible values so young learners see exact answers.
    for(let i=0;i<chosen.length;i++)if(chosen[i]==='/'){const maxDiv=Math.min(hi,Math.floor(values[i]/2));const divisors=[];for(let d=2;d<=maxDiv;d++)if(values[i]%d===0)divisors.push(d);if(divisors.length)values[i+1]=pick(divisors);else{const alternatives=ops.filter(x=>x!=='/');if(alternatives.length)chosen[i]=pick(alternatives);else{values[i]=Math.max(4,values[i]);values[i+1]=2;chosen[i]='/'}}}
    const glyph={'*':'×','/':'÷','+':'+','-':'−'};
    let raw=String(values[0]);for(let i=0;i<chosen.length;i++)raw+=` ${glyph[chosen[i]]} ${values[i+1]}`;
    let readable=raw;
    // Brackets are taught starting from Grade 3 in MOET GDPT 2018 (never Grade 1-2)
    if(terms>=3&&(!g||g>=3)){let grouped=`(${values[0]} ${glyph[chosen[0]]} ${values[1]})`;for(let i=1;i<chosen.length;i++)grouped+=` ${glyph[chosen[i]]} ${values[i+1]}`;readable=grouped}
    const js=readable.replaceAll('−','-').replaceAll('×','*').replaceAll('÷','/').replaceAll('[','(').replaceAll(']',')').replaceAll('{','(').replaceAll('}',')');
    let value;
    try {
      value = safeEvalMath(js);
    } catch {
      return plainGenerate(cfg);
    }
    if(!Number.isFinite(value)||value<0||Math.abs(value)>999999)return plainGenerate(cfg);
    const answer=typeof fmt==='function'?fmt(value):String(Math.round(value*1000)/1000);
    const left=values.reduce((acc,n,i)=>i?acc+({'+':n,'-':-n,'*':n,'/':1}[chosen[i-1]]||n):n,0);
    const stepHint=readable.includes('(')?`${t('Tính trong ngoặc trước, sau đó thực hiện nhân/chia trước cộng/trừ:','Calculate inside brackets first, then multiply/divide before add/subtract:')}\n${readable} = ${answer}`:`${readable} = ${answer}`;
    return {id:uid(),q:readable,answer,options:generatedOptions(answer,[Math.round(left),value+1,value-1]),skill:'natural:expression',config:{...cfg,type:'natural'},explanation:stepHint};
  }
  return plainGenerate(cfg);
}
generate=customGenerate;
if(typeof window!=='undefined')window.generate=generate;
if(typeof global!=='undefined')global.generate=generate;

const setupBeforeAdvanced=setup;
setup=function(){
  setupBeforeAdvanced();
  const form=$('#config');if(!form)return;
  const field=document.createElement('fieldset');field.className='advanced-picks';
  field.innerHTML=`<legend><span>4</span>${t('Kiểu bài nâng cao','Challenge style')}</legend><div class="formgrid"><label>${t('Dạng luyện','Practice mode')}<select name="questionStyle"><option value="normal">${t('Tính từng phép tính','One calculation at a time')}</option><option value="convenient">${t('Tính thuận tiện · gộp số tròn','Regroup to make round numbers')}</option><option value="expression">${t('Biểu thức nhiều phép tính','Multi-operation expressions')}</option></select></label><label>${t('Số phép tính','Number of operations')}<select name="termCount">${[2,3,4,5,6].map(n=>`<option value="${n}">${n}</option>`).join('')}</select></label></div><p class="settings-hint small">${t('App tự thêm ngoặc khi cần để biểu thức dễ đọc. Bé chỉ cần tự tính.','The app adds brackets when useful to make expressions clear. Just work them out.')}</p>`;
  form.insertBefore(field,form.querySelector('.session-size'));
  const stepSpans=form.querySelectorAll('fieldset legend span');
  if(stepSpans&&stepSpans.length){
    stepSpans.forEach((sp,idx)=>{sp.textContent=String(idx+1)});
  }else{
    const sizeStep=form.querySelector('.session-size legend span');
    if(sizeStep)sizeStep.textContent='5';
  }
  const oldSubmit=form.onsubmit;
  form.onsubmit=e=>{
    e.preventDefault();
    const f=new FormData(form),ops=f.getAll('op'),rawTypes=f.getAll('type'),digits=f.getAll('digits').map(Number),style=f.get('questionStyle');
    if(!ops.length||!rawTypes.length||!digits.length){
      toast(t('Chọn ít nhất một phép tính, loại số và số chữ số nhé.','Choose at least one operation, number type and digit length.'));
      return;
    }
    let types=[...rawTypes];
    if(style==='convenient'){
      types=['natural'];
    }else if(style==='expression'){
      types=types.filter(x=>['natural','fraction'].includes(x));
      if(!types.length)types=['natural'];
    }
    config={...defaults,ops,types,type:types[0]||'natural',digits,count:+f.get('count'),seconds:+f.get('seconds'),inputMode:f.get('inputMode')||config.inputMode||'choices',questionStyle:style,termCount:+f.get('termCount'),grade:config.grade};
    if(typeof window!=='undefined')window.config=config;
    if(typeof global!=='undefined')global.config=config;
    startQuiz();
  };
  const style=form.elements.questionStyle,terms=form.elements.termCount;
  style.value=config.questionStyle||'normal';terms.value=config.termCount||3;
  style.onchange=()=>{terms.disabled=style.value==='normal'};style.onchange();
};

const PAUSED_LESSON_KEY='numi-paused-lesson-v1';
function restoreProgressBaseline(baselineJson){
  if(!baselineJson)return;
  try{
    const snap=JSON.parse(baselineJson);
    const keepKeys=['xp','best','pieces','streak','history','mistakes','mastery','badges','milktea'];
    for(const k of keepKeys){if(Object.prototype.hasOwnProperty.call(snap,k))state[k]=snap[k]}
    save();
  }catch{}
}
const startBeforePause=startQuiz;
startQuiz=function(){const baseline=JSON.stringify(state);startBeforePause();if(session)session.baseline=baseline};
function advancedResumeCard(){const host=$('.simple-home');if(!host)return;let saved;try{saved=JSON.parse(localStorage.getItem(PAUSED_LESSON_KEY)||'null')}catch{}if(!saved?.session)return;const box=document.createElement('section');box.className='paused-lesson-card';const remaining=Math.max(0,Math.ceil((saved.readyAt-Date.now())/60000));box.innerHTML=`<b>${t('Bài luyện đang tạm nghỉ','Your practice is paused')}</b><p>${remaining?t(`Em nghỉ thêm khoảng ${remaining} phút rồi quay lại nhé.`,'Take about '+remaining+' more minutes, then come back.') :t('Bài đã sẵn sàng để làm tiếp.','Your lesson is ready to resume.')}</p><div class="actions"><button class="primary" id="resumePaused" ${remaining?'disabled':''}>${t('Làm tiếp câu đang dở','Resume this lesson')} →</button><button id="discardPaused">${t('Bỏ bài đang dở','Discard this lesson')}</button></div>`;host.prepend(box);$('#resumePaused').onclick=()=>{if(Date.now()<saved.readyAt)return;try{state={...fresh(),...saved.state};lang=state.lang==='en'?'en':'vi';save()}catch{}config=saved.config||config;session=saved.session;view='quiz';const q=session.questions[session.index];if(q?.config)q.config.seconds=saved.remaining||q.config.seconds||config.seconds;localStorage.removeItem(PAUSED_LESSON_KEY);showQuiz()};$('#discardPaused').onclick=()=>{restoreProgressBaseline(saved.session.baseline);localStorage.removeItem(PAUSED_LESSON_KEY);home()}}
const navBeforePause=nav;
nav=function(nextView){if(session&&!session.done&&view==='quiz'&&nextView!==view){modal(`<h2>${t('Mình tạm dừng nhé?','Take a break?')}</h2><p>${t('Bài đang làm có thể giữ lại để em quay lại sau. Em chọn thời gian nghỉ:','Your lesson can wait here while you take a break. Choose how long:')}</p><div class="actions">${[1,3,5].map(h=>`<button class="pause-choice" data-pause="${h}">${h} ${t('giờ','hours')}</button>`).join('')}</div><p>${t('Hoặc bỏ riêng lượt đang dở. Những tiến độ đã hoàn thành trước đó vẫn được giữ.','Or discard only the unfinished lesson. Your earlier progress stays.')}</p><div class="actions"><button id="discardCurrent">${t('Bỏ lượt đang dở','Discard unfinished lesson')}</button><button id="stayCurrent">${t('Ở lại làm tiếp','Stay and continue')}</button></div>`);$('#stayCurrent').onclick=()=>$('#modal').close();$$('[data-pause]').forEach(b=>b.onclick=()=>{const left=parseFloat($('#clock')?.textContent)||config.seconds,copy=JSON.parse(JSON.stringify(session)),q=copy.questions[copy.index];if(q?.config)q.config.seconds=Math.max(5,Math.ceil(left));localStorage.setItem(PAUSED_LESSON_KEY,JSON.stringify({session:copy,config,state,remaining:Math.max(5,Math.ceil(left)),readyAt:Date.now()+(+b.dataset.pause)*3600000}));stop();session=null;$('#modal').close();navBeforePause(nextView)});$('#discardCurrent').onclick=()=>{restoreProgressBaseline(session.baseline);localStorage.removeItem(PAUSED_LESSON_KEY);stop();session=null;$('#modal').close();navBeforePause(nextView)};return}navBeforePause(nextView)};
window.addEventListener('beforeunload',e=>{if(session&&!session.done&&['quiz','garden','battle'].includes(view)){e.preventDefault();e.returnValue=''}});
