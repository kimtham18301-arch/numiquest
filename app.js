'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
// Feature flags: đặt true khi muốn bật lại các mục đang tạm ẩn
const NUMI_FEATURE_FLAGS={dailyQuests:false,accessoryShop:false};
if(typeof window!=='undefined')window.NUMI_FEATURE_FLAGS=NUMI_FEATURE_FLAGS;
if(typeof global!=='undefined')global.NUMI_FEATURE_FLAGS=NUMI_FEATURE_FLAGS;
const KEY='numiquest-v1';const fresh=()=>({version:1,lang:'vi',name:'Explorer',xp:0,selected:'VN',pieces:{},history:[],mistakes:[],mastery:{},best:0});let state=fresh();try{state={...state,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{}if(typeof window!=='undefined')window.state=state;if(typeof global!=='undefined')global.state=state;let lang=state.lang==='en'?'en':'vi',view='home',session=null,tick=null,raf=null,afterModal=null;const t=(vi,en)=>lang==='vi'?vi:en;const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function uid(){if(typeof crypto!=='undefined'&&typeof crypto.randomUUID==='function'){try{return crypto.randomUUID()}catch{}}return 'id-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10)}
if(typeof window!=='undefined')window.uid=uid;if(typeof global!=='undefined')global.uid=uid;
// Keep fractions as strings for arithmetic; render their numerators and denominators visually.
function mathMarkup(value){const text=String(value);let out='',last=0;const re=/(-?\d+)\/(\d+)/g;for(const m of text.matchAll(re)){out+=esc(text.slice(last,m.index));out+=`<span class="stacked-fraction" role="math" aria-label="${esc(m[1])} ${t('phần','over')} ${esc(m[2])}"><span class="fraction-numerator" aria-hidden="true">${esc(m[1])}</span><span class="fraction-denominator" aria-hidden="true">${esc(m[2])}</span></span>`;last=m.index+m[0].length}out+=esc(text.slice(last));return out.replace(/\^(\d+)/g,'<sup>$1</sup>')}
const countries=[
['VN','Việt Nam','Vietnam','🇻🇳','Hà Nội','Hanoi','Châu Á','Asia','Vịnh Hạ Long','Ha Long Bay','⛰️','Vịnh Hạ Long nổi tiếng với các đảo đá vôi.','Ha Long Bay is known for its limestone islands.'],
['JP','Nhật Bản','Japan','🇯🇵','Tokyo','Tokyo','Châu Á','Asia','Núi Phú Sĩ','Mount Fuji','🗻','Núi Phú Sĩ là ngọn núi cao nhất Nhật Bản.','Mount Fuji is the highest mountain in Japan.'],
['FR','Pháp','France','🇫🇷','Paris','Paris','Châu Âu','Europe','Tháp Eiffel','Eiffel Tower','🗼','Tháp Eiffel được xây dựng cho triển lãm thế giới năm 1889.','The Eiffel Tower was built for the 1889 world fair.'],
['EG','Ai Cập','Egypt','🇪🇬','Cairo','Cairo','Châu Phi','Africa','Kim tự tháp Giza','Pyramids of Giza','🔺','Sông Nile chảy qua Ai Cập.','The Nile flows through Egypt.'],
['AU','Úc','Australia','🇦🇺','Canberra','Canberra','Châu Đại Dương','Oceania','Nhà hát Sydney','Sydney Opera House','🎭','Thủ đô của Úc là Canberra, không phải Sydney.','Australia’s capital is Canberra, not Sydney.'],
['US','Hoa Kỳ','United States','🇺🇸','Washington, D.C.','Washington, D.C.','Bắc Mỹ','North America','Tượng Nữ thần Tự do','Statue of Liberty','🗽','Tượng Nữ thần Tự do là món quà từ nước Pháp.','The Statue of Liberty was a gift from France.'],
['BR','Brazil','Brazil','🇧🇷','Brasília','Brasília','Nam Mỹ','South America','Tượng Chúa Cứu Thế','Christ the Redeemer','⛰️','Phần lớn rừng Amazon nằm ở Brazil.','Most of the Amazon rainforest is in Brazil.'],
['IT','Ý','Italy','🇮🇹','Rome','Rome','Châu Âu','Europe','Đấu trường Colosseum','Colosseum','🏛️','Đấu trường Colosseum nằm ở thành phố Rome.','The Colosseum is in Rome.'],
['IN','Ấn Độ','India','🇮🇳','New Delhi','New Delhi','Châu Á','Asia','Taj Mahal','Taj Mahal','🕌','Taj Mahal nằm ở thành phố Agra.','The Taj Mahal is in Agra.'],
['GB','Vương quốc Anh','United Kingdom','🇬🇧','London','London','Châu Âu','Europe','Tháp đồng hồ Elizabeth','Elizabeth Tower','🕰️','Big Ben là tên quả chuông bên trong tháp.','Big Ben is the bell inside the tower.']];
const cname=c=>c[lang==='vi'?1:2],cap=c=>c[lang==='vi'?4:5],cont=c=>c[lang==='vi'?6:7],landmark=c=>c[lang==='vi'?8:9],fact=c=>c[lang==='vi'?11:12];
function save(){state.lang=lang;try{localStorage.setItem(KEY,JSON.stringify(state))}catch{toast(t('Không lưu được. Hãy xuất bản sao lưu.','Could not save. Please export a backup.'))}}
function translate(){
  document.documentElement.lang=lang;
  $$('[data-vi]').forEach(el=>el.textContent=el.dataset[lang]);
  $('#lang').textContent=lang==='vi'?'EN':'VI';
  $$('nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  const isMoreView=['guide','atlas','admin'].includes(view);
  const moreBtn=$('#navMoreBtn');
  if(moreBtn)moreBtn.classList.toggle('active',isMoreView);
  const sheetLangLabel=$('#sheetLangLabel');
  if(sheetLangLabel)sheetLangLabel.textContent=lang==='vi'?'Tiếng Việt':'English';
  if(typeof document!=='undefined'&&document.body){
    applyDarkMode(document.body.classList.contains('dark-mode'));
  }
}
function toast(msg){$('#toast')?.remove();const d=document.createElement('div');d.id='toast';d.textContent=msg;document.body.append(d);setTimeout(()=>d.remove(),3500)}
function modal(html,cb){
  $('#modalBody').innerHTML=html;
  afterModal=cb;
  const closeBtn=$('#closeModal');
  if(closeBtn){
    const hasCustomActions=Boolean($('#modalBody .actions, #modalBody .review-exit-actions, #modalBody #teaClaimDone, #modalBody #numiBuddySave'));
    closeBtn.hidden=hasCustomActions;
  }
  $('#modal').showModal();
}
$('#closeModal').onclick=()=>$('#modal').close();$('#modal').addEventListener('cancel',e=>e.preventDefault());$('#modal').addEventListener('close',()=>{const cb=afterModal;afterModal=null;cb?.()});
let quizAdvanceTimer=null,quizCountdownTimer=null;
function cancelQuizAdvance(){clearTimeout(quizAdvanceTimer);clearInterval(quizCountdownTimer);quizAdvanceTimer=null;quizCountdownTimer=null}
function stop(){cancelQuizAdvance();clearInterval(tick);tick=null;cancelAnimationFrame(raf);raf=null}
function nav(v){if(session&&!session.done&&['quiz','game','garden','battle'].includes(view)&&v!==view){if(!confirm(t('Rời lượt hiện tại? Câu sai đã lưu vẫn được giữ.','Leave this session? Saved mistakes will remain.')))return}stop();session=null;view=v;if(typeof window!=='undefined')window.view=v;if(typeof global!=='undefined')global.view=v;if(typeof document!=='undefined'&&document.body)document.body.dataset.view=v;({home,setup,atlas,stats,guide:()=>renderGuide(),profile:()=>renderProfile(),account:()=>typeof currentAuthUser==='function'&&!currentAuthUser()&&typeof openAccount==='function'?openAccount():renderProfile(),admin:()=>typeof renderAdmin==='function'?renderAdmin():renderProfile()}[v]||home)();translate();window.scrollTo(0,0)}
$$('[data-view]').forEach(b=>b.onclick=()=>nav(b.dataset.view));$('.brand').onclick=e=>{e.preventDefault();nav('home')};$('#lang').onclick=()=>{if(session&&!session.done){toast(t('Hãy hoàn thành lượt trước khi đổi ngôn ngữ.','Finish the session before switching languages.'));return}lang=lang==='vi'?'en':'vi';save();nav(view)};
function applyDarkMode(enabled){
  if(typeof document==='undefined'||!document.body)return;
  document.body.classList.toggle('dark-mode',!!enabled);
  const themeBtn=$('#themeModeBtn');
  if(themeBtn){
    themeBtn.textContent=enabled?(lang==='vi'?'Sáng':'Light'):(lang==='vi'?'Tối':'Dark');
    themeBtn.setAttribute('aria-pressed',String(!!enabled));
    themeBtn.title=enabled?(lang==='vi'?'Chuyển sang giao diện Sáng':'Switch to Light mode'):(lang==='vi'?'Chuyển sang giao diện Tối':'Switch to Dark mode');
  }
  const sheetLabel=$('#sheetDarkLabel');
  if(sheetLabel){
    sheetLabel.textContent=enabled?(lang==='vi'?'Đang bật · Chạm để tắt':'Active · Tap to turn off'):(lang==='vi'?'Bảo vệ mắt ban đêm':'Eye comfort mode');
  }
  const metaTheme=document.querySelector('meta[name="theme-color"]');
  if(metaTheme){
    metaTheme.setAttribute('content',enabled?'#18261f':'#34765c');
  }
}
function toggleDarkMode(){
  if(typeof document==='undefined'||!document.body)return;
  const isDark=document.body.classList.contains('dark-mode');
  const next=!isDark;
  try{localStorage.setItem('numi-dark-mode',next?'1':'0');}catch(_){}
  applyDarkMode(next);
}
function initDarkMode(){
  if(typeof window==='undefined'||typeof document==='undefined')return;
  let isDark=false;
  try{
    const saved=localStorage.getItem('numi-dark-mode');
    if(saved!==null){
      isDark=saved==='1';
    }else if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){
      isDark=true;
    }
  }catch(_){}
  applyDarkMode(isDark);
  const themeBtn=$('#themeModeBtn');
  if(themeBtn)themeBtn.onclick=()=>toggleDarkMode();
  const sheetDarkBtn=$('#sheetDarkModeBtn');
  if(sheetDarkBtn){
    sheetDarkBtn.onclick=()=>{
      toggleDarkMode();
    };
  }
}
function initMoreSheet(){
  const moreBtn=$('#navMoreBtn');
  const sheet=$('#moreSheet');
  const backdrop=$('#moreSheetBackdrop');
  const closeBtn=$('#closeMoreSheetBtn');
  if(!moreBtn||!sheet)return;
  function openSheet(){
    sheet.style.display='block';
    if(backdrop)backdrop.style.display='block';
    requestAnimationFrame(()=>{
      sheet.classList.add('open');
      if(backdrop)backdrop.classList.add('open');
    });
  }
  function closeSheet(){
    sheet.classList.remove('open');
    if(backdrop)backdrop.classList.remove('open');
    setTimeout(()=>{
      if(!sheet.classList.contains('open')){
        sheet.style.display='none';
        if(backdrop)backdrop.style.display='none';
      }
    },280);
  }
  moreBtn.onclick=e=>{
    e.preventDefault();
    if(sheet.classList.contains('open'))closeSheet();
    else openSheet();
  };
  if(backdrop)backdrop.onclick=closeSheet;
  if(closeBtn)closeBtn.onclick=closeSheet;
  $$('[data-sheet-view]').forEach(btn=>{
    btn.onclick=()=>{
      closeSheet();
      nav(btn.dataset.sheetView);
    };
  });
  const sheetLang=$('#sheetLangBtn');
  if(sheetLang){
    sheetLang.onclick=()=>{
      closeSheet();
      $('#lang')?.click();
    };
  }
  initDarkMode();
}
if(typeof window!=='undefined'){
  initDarkMode();
  if(document.readyState==='loading'){
    window.addEventListener('DOMContentLoaded',()=>{
      initMoreSheet();
      initDarkMode();
    });
  }else{
    initMoreSheet();
    initDarkMode();
  }
}
const totalPieces=()=>Object.values(state.pieces).reduce((a,b)=>a+b,0);const level=()=>1+Math.floor(state.xp/100);const avg=arr=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:0;
function getStreak(){if(!state.streak||typeof state.streak!=='object')state.streak={count:0,lastDate:''};return state.streak}
function updateStreak(){const s=getStreak(),today=new Date().toISOString().slice(0,10);if(s.lastDate===today)return s.count;if(s.lastDate){const last=new Date(s.lastDate+'T00:00:00'),cur=new Date(today+'T00:00:00');const diff=Math.round((cur-last)/86400000);if(diff===1)s.count++;else if(diff>1)s.count=1}else s.count=1;s.lastDate=today;save();return s.count}
const NUMI_GRADES={
  1:{id:1,name:'Lớp 1',enName:'Grade 1',icon:'',descVi:'Chuẩn GDPT 2018: Cộng, trừ KHÔNG NHỚ trong phạm vi 10, 20 và 100; số tròn chục (chưa có nhân, chia, số âm)',descEn:'MOET Grade 1: No-carry/no-borrow addition & subtraction within 10, 20, 100',ops:['+','-'],types:['natural'],digits:[1,2],seconds:20,count:10,inputMode:'choices'},
  2:{id:2,name:'Lớp 2',enName:'Grade 2',icon:'',descVi:'Chuẩn GDPT 2018: Cộng, trừ CÓ NHỚ trong phạm vi 100 & 1.000; bảng nhân 2, 5 và bảng chia 2, 5',descEn:'MOET Grade 2: Carry/borrow add & sub within 100 & 1,000; ×2, ×5, ÷2, ÷5 tables',ops:['+','-','*','/'],types:['natural'],digits:[1,2],seconds:18,count:10,inputMode:'choices'},
  3:{id:3,name:'Lớp 3',enName:'Grade 3',icon:'',descVi:'Chuẩn GDPT 2018: Bảng nhân chia 2–9, nhân/chia số 2–3 chữ số với 1 chữ số, chia có dư & biểu thức có ngoặc',descEn:'MOET Grade 3: Times tables 2–9, 2–3 digit ×/÷ 1 digit, division with remainders & brackets',ops:['+','-','*','/'],types:['natural','remainder'],digits:[1,2,3],seconds:16,count:10,inputMode:'choices'},
  4:{id:4,name:'Lớp 4',enName:'Grade 4',icon:'',descVi:'Chuẩn GDPT 2018: Số tự nhiên nhiều chữ số, tính bằng cách thuận tiện nhất (phân phối), phép tính phân số',descEn:'MOET Grade 4: Multi-digit natural numbers, distributive mental math & fractions (+, −, ×, ÷)',ops:['+','-','*','/'],types:['natural','fraction'],digits:[2,3],seconds:20,count:15,inputMode:'choices'},
  5:{id:5,name:'Lớp 5',enName:'Grade 5',icon:'',descVi:'Chuẩn GDPT 2018: Số thập phân (+, −, ×, ÷, nhân chia 10/100), tỉ số phần trăm (%) và ôn phân số',descEn:'MOET Grade 5: Decimals (+, −, ×, ÷, ×10/100), percentages (%) & fraction review',ops:['+','-','*','/'],types:['decimal','fraction','natural'],digits:[1,2],seconds:20,count:15,inputMode:'choices'},
  6:{id:6,name:'Lớp 6',enName:'Grade 6',icon:'',descVi:'Chuẩn GDPT 2018: Số nguyên âm Z (+, −, ×, ÷), lũy thừa số mũ tự nhiên (aⁿ), phân số & số thập phân',descEn:'MOET Grade 6: Signed integers Z, natural-exponent powers (aⁿ), signed fractions & decimals',ops:['+','-','*','/'],types:['negative','fraction','decimal','natural'],digits:[1,2],seconds:16,count:15,inputMode:'choices'},
  7:{id:7,name:'Lớp 7',enName:'Grade 7',icon:'',descVi:'Chuẩn GDPT 2018: Số hữu tỉ Q, lũy thừa, căn bậc hai số học (√), giá trị tuyệt đối & tính giá trị biểu thức',descEn:'MOET Grade 7: Rational numbers Q, powers, square roots (√), absolute value & algebraic expressions',ops:['+','-','*','/'],types:['negative','fraction','decimal'],digits:[1,2],seconds:16,count:15,inputMode:'choices'},
  8:{id:8,name:'Lớp 8',enName:'Grade 8',icon:'',descVi:'Chuẩn GDPT 2018: Tính nhanh bằng Hằng đẳng thức đáng nhớ (a²−b², (a±b)²), lũy thừa, phương trình bậc nhất một ẩn & ôn số hữu tỉ',descEn:'MOET Grade 8: Fast identities (a²−b², (a±b)²), powers, linear equations & rational review',ops:['+','-','*','/'],types:['negative','fraction','decimal'],digits:[2,3],seconds:15,count:15,inputMode:'choices'},
  9:{id:9,name:'Lớp 9',enName:'Grade 9',icon:'',descVi:'Chuẩn GDPT 2018: Biến đổi căn bậc hai (đưa thừa số ra ngoài dấu căn), căn bậc ba (∛), nhẩm nghiệm phương trình bậc hai (Vi-ét) ôn thi vào 10',descEn:'MOET Grade 9: Simplifying square roots, cube roots (∛), quadratic roots via Vieta & grade-10 entrance prep',ops:['+','-','*','/'],types:['negative','fraction','decimal'],digits:[2,3],seconds:14,count:20,inputMode:'choices'}
};
if(typeof window!=='undefined')window.NUMI_GRADES=NUMI_GRADES;
if(typeof global!=='undefined')global.NUMI_GRADES=NUMI_GRADES;
const defaults={grade:1,ops:['+','-'],type:'natural',types:['natural'],digits:[1],d1:1,d2:1,count:10,seconds:20,gameCount:3,inputMode:'choices'};let config={...defaults};
function syncUserGradeToConfig(overrideGrade){
  let gId=overrideGrade;
  if(!gId){
    try{
      const u=JSON.parse(localStorage.getItem('numi-current-user-v1')||'null');
      if(u&&u.grade)gId=Number(u.grade);
    }catch(_){}
  }
  if(gId&&NUMI_GRADES[gId]){
    const g=NUMI_GRADES[gId];
    config={
      ...defaults,
      grade:g.id,
      ops:[...g.ops],
      types:[...g.types],
      type:g.types[0],
      digits:[...g.digits],
      count:g.count,
      seconds:g.seconds,
      inputMode:g.inputMode
    };
    if(typeof window!=='undefined')window.config=config;
    if(typeof global!=='undefined')global.config=config;
    return config;
  }
  return config;
}
if(typeof window!=='undefined'){window.defaults=defaults;window.config=config;window.syncUserGradeToConfig=syncUserGradeToConfig;}
if(typeof global!=='undefined'){global.defaults=defaults;global.config=config;global.syncUserGradeToConfig=syncUserGradeToConfig;}
syncUserGradeToConfig();
const ri=(a,b)=>Math.floor(Math.random()*(b-a+1))+a, pick=a=>a[ri(0,a.length-1)],shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=ri(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);function frac(n,d){if(d<0){n=-n;d=-d}let g=gcd(n,d);return d/g===1?String(n/g):`${n/g}/${d/g}`}const fmt=n=>String(Math.round(n*10000)/10000).replace('.',lang==='vi'?',':'.');
// Anti-guessing options. Distractors are built so a child cannot pick the answer without solving:
//  • same last digit as the answer (for |answer| ≥ 20 or decimals) → working out only the units digit does not help
//  • same number of decimal places, same denominator for fractions
//  • the answer's position among the 4 sorted values is random → "pick the 2nd smallest" does not work
// cands = likely mistakes (forgot carry, sign error...) — used only when they don't give the answer away.
function antiTrickOptions(answer,cands=[],o={}){
  const ans=String(answer);
  const pickRanked=(v,pool,pref)=>{
    const B=pool.filter(x=>x<v).sort((x,y)=>y-x),A=pool.filter(x=>x>v).sort((x,y)=>x-y);
    const ranks=[0,1,2,3].filter(r=>r<=B.length&&3-r<=A.length);
    if(!ranks.length)return shuffle([...B,...A]).slice(0,3);
    const r=pick(ranks),out=[];   // r = how many options are smaller than the answer
    const fits=shuffle(pref.filter(x=>(x<v&&r>0)||(x>v&&r<3)));
    if(fits.length&&Math.random()<0.7)out.push(fits[0]);
    const take=(arr,k)=>shuffle(arr.filter(x=>!out.includes(x)).slice(0,k+2)).slice(0,k);
    const nb=r-out.filter(x=>x<v).length,na=3-r-out.filter(x=>x>v).length;
    out.push(...take(B,nb),...take(A,na));
    return out;
  };
  const fm=ans.match(/^(-?\d+)\/(\d+)$/);
  if(fm){
    const n=+fm[1],d=+fm[2],key=x=>x,seen=new Set();
    const okN=m=>m!==n&&m!==0&&gcd(Math.abs(m),d)===1&&(n<0||o.allowNegative||m>0);
    const pref=[];
    for(const c of cands){const cm=String(c).match(/^(-?\d+)\/(\d+)$/);if(cm&&+cm[2]===d&&okN(+cm[1])&&!seen.has(+cm[1])){seen.add(+cm[1]);pref.push(+cm[1])}}
    const pool=[...pref];
    for(let k=1;k<=12;k++)for(const m of [n+k,n-k])if(okN(m)&&!seen.has(m)){seen.add(m);pool.push(m)}
    const nums=pickRanked(n,pool,pref);
    if(nums.length===3)return shuffle([ans,...nums.map(m=>`${m}/${d}`)]);
  }
  const sep=ans.includes(',')?',':'.';
  if(!/^-?\d+([.,]\d+)?$/.test(ans)){
    const set=new Set([ans]);
    for(const c of cands){if(c!=null&&String(c))set.add(String(c));if(set.size>=4)break}
    return shuffle([...set].slice(0,4));
  }
  const v=Number(ans.replace(',','.')),dp=(ans.split(/[.,]/)[1]||'').length,scale=10**dp;
  const toS=x=>{const s=(Math.round(x*scale)/scale).toFixed(dp);return sep===','?s.replace('.',','):s};
  const allowNeg=o.allowNegative||v<0;
  const lastDigit=x=>Math.abs(Math.round(x*scale))%10;
  const big=dp>0||Math.abs(v)>=20;
  const map=new Map();
  const ok=x=>Number.isFinite(x)&&(allowNeg||x>=0)&&toS(x)!==ans&&(!big||lastDigit(x)===lastDigit(v));
  const add=x=>{if(ok(x)){x=Math.round(x*scale)/scale;if(!map.has(toS(x)))map.set(toS(x),x);return true}return false};
  const pref=[];
  for(const c of cands){const x=Number(String(c).replace(',','.'));if(add(x)&&!pref.includes(Math.round(x*scale)/scale))pref.push(Math.round(x*scale)/scale)}
  const step=big?10/scale:1;
  for(const k of [1,2,3,4,5,6,10])add(v+k*step),add(v-k*step);
  if(dp===0&&Math.abs(v)>=200)for(const k of [100,200])add(v+k),add(v-k);
  const nums=pickRanked(v,[...map.values()],pref);
  return shuffle([ans,...nums.map(toS)]);
}
if(typeof window!=='undefined')window.antiTrickOptions=antiTrickOptions;
if(typeof global!=='undefined')global.antiTrickOptions=antiTrickOptions;
function smartDistractors(a,b,op,type,val,displayFn){
  const cands=[];
  if(type==='negative'){cands.push(-val);if(op==='+'||op==='-')cands.push(Math.abs(a)+Math.abs(b),-(Math.abs(a)+Math.abs(b)),Math.abs(a)-Math.abs(b),-(Math.abs(a)-Math.abs(b)));}
  if(op==='+')cands.push(val-10,val+10);       // forgot / added a carry
  else if(op==='-')cands.push(val+10,val-10);  // forgot to borrow
  else if(op==='*')cands.push(val+10,val-10,val+20);  // carry slips in the tens (same units digit, close in size)
  return antiTrickOptions(displayFn(val),cands.map(x=>displayFn(x)),{allowNegative:type==='negative'});
}
function detailedExplanation(q,a,b,op,type,val,sym){
  if(type==='fraction'){
    if(op==='*') return `${q} = ${val}\n• `+t('Nhân hai phân số: Nhân tử số với tử số, nhân mẫu số với mẫu số rồi rút gọn phân số tối giản.','Multiply fractions: Multiply numerators together and denominators together, then simplify.');
    if(op==='/') return `${q} = ${val}\n• `+t('Chia hai phân số: Giữ nguyên phân số thứ nhất, nhân với phân số thứ hai đảo ngược rồi rút gọn.','Divide fractions: Keep first fraction, multiply by reciprocal of second, then simplify.');
    return `${q} = ${val}\n• `+t('Cộng/trừ phân số: Quy đồng mẫu số chung, cộng/trừ các tử số, giữ nguyên mẫu số chung rồi rút gọn phân số tối giản.','Add/subtract fractions: Find common denominator, add/subtract numerators, then simplify.');
  }
  if(type==='remainder'){const quotient=Math.floor(a/b),r=a%b;return `${a} ÷ ${b} = ${quotient} (${t('dư','r')} ${r})\n`+`${b} × ${quotient} = ${b*quotient} → ${a} − ${b*quotient} = ${r}`;}
  if(type==='negative'){
    const sa=a<0?`(${a})`:`${a}`,sb=b<0?`(${b})`:`${b}`;
    if(op==='*'||op==='/'){
      const sameSign=(a<0&&b<0)||(a>0&&b>0);
      const signRule=sameSign?t('Cùng dấu (+) × (+) hoặc (−) × (−) ra DƯƠNG (+)','Same signs yield POSITIVE (+)'):t('Khác dấu (+) × (−) hoặc (−) × (+) ra ÂM (−)','Different signs yield NEGATIVE (−)');
      return `${sa} ${sym} ${sb} = ${val}\n• ${t('Quy tắc dấu:','Sign rule:')} ${signRule}\n• ${t('Tính giá trị:','Magnitude:')} ${Math.abs(a)} ${sym} ${Math.abs(b)} = ${Math.abs(val)}`;
    }
    if(op==='+'){
      if(a<0&&b<0){
        return `${sa} + ${sb} = ${val}\n• ${t('Cộng hai số âm: Giữ dấu trừ, cộng hai giá trị tuyệt đối:','Adding two negative numbers: Keep minus sign and add:')} −(${Math.abs(a)} + ${Math.abs(b)}) = ${val}`;
      }
      const absA=Math.abs(a),absB=Math.abs(b);
      return `${sa} + ${sb} = ${val}\n• ${t('Cộng hai số khác dấu: Lấy số lớn trừ số bé, mang dấu của số có giá trị tuyệt đối lớn hơn:','Adding different signs: Subtract smaller magnitude from larger, take sign of larger:')} ${absA>=absB?(a<0?`−(${absA} − ${absB})`:`+(${absA} − ${absB})`):(b<0?`−(${absB} − ${absA})`:`+(${absB} − ${absA})`)} = ${val}`;
    }
    if(op==='-'){
      return `${sa} − ${sb} = ${val}\n• ${t('Quy tắc trừ số nguyên: Muốn trừ số b, ta cộng với số đối của b:','Subtracting integers: Add the opposite:')}\n  ${sa} − ${sb} = ${sa} + (${-b}) = ${val}`;
    }
  }
  const fa=typeof fmt==='function'?fmt(a):String(a), fb=typeof fmt==='function'?fmt(b):String(b);
  if(op==='+'){
    if(type==='natural'&&b>=10){const tens=Math.floor(b/10)*10,ones=b%10;return `${fa} + ${fb} = ${val}\n• ${t('Bước 1: Tách','Step 1: Split')} ${fb} = ${tens} + ${ones}\n• ${t('Bước 2: Cộng hàng chục:','Step 2: Add tens:')} ${fa} + ${tens} = ${fmt(a+tens)}\n• ${t('Bước 3: Cộng hàng đơn vị:','Step 3: Add ones:')} ${fmt(a+tens)} + ${ones} = ${val}`;}
    return `${fa} + ${fb} = ${val}`;
  }
  if(op==='-'){
    if(type==='natural'&&b>=10){const tens=Math.floor(b/10)*10,ones=b%10;return `${fa} − ${fb} = ${val}\n• ${t('Bước 1: Tách','Step 1: Split')} ${fb} = ${tens} + ${ones}\n• ${t('Bước 2: Trừ hàng chục:','Step 2: Subtract tens:')} ${fa} − ${tens} = ${fmt(a-tens)}\n• ${t('Bước 3: Trừ hàng đơn vị:','Step 3: Subtract ones:')} ${fmt(a-tens)} − ${ones} = ${val}`;}
    return `${fa} − ${fb} = ${val}`;
  }
  if(op==='*'){
    if(type==='natural'&&a>=10&&b<10){const tens=Math.floor(a/10)*10,ones=a%10;return `${fa} × ${fb} = ${val}\n• ${t('Tách','Split')} ${fa} = ${tens} + ${ones}\n• ${tens} × ${fb} = ${tens*b}\n• ${ones} × ${fb} = ${ones*b}\n• ${tens*b} + ${ones*b} = ${val}`;}
    return `${fa} × ${fb} = ${val}`;
  }
  if(op==='/')return `${fa} ÷ ${fb} = ${val}\n• ${t('Nhẩm ngược lại:','Multiply back:')} ${fb} × ${val} = ${fa}`;
  return `${q} = ${val}`;
}
function haptic(type='tap'){
  if(typeof navigator==='undefined'||!('vibrate' in navigator))return;
  try{
    if(type==='correct')navigator.vibrate(22);
    else if(type==='wrong')navigator.vibrate([35,45,35]);
    else if(type==='victory')navigator.vibrate([30,40,30,40,75]);
    else if(type==='tap')navigator.vibrate(8);
  }catch{}
}
function triggerConfetti(){
  if(typeof document==='undefined')return;
  const canvas=document.createElement('canvas');
  canvas.id='confettiCanvas';
  canvas.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999;';
  document.body.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;
  const colors=['#34765c','#ffbd2e','#e74c3c','#3498db','#2ecc71','#f39c12'];
  const pieces=Array.from({length:55},()=>({
    x:Math.random()*canvas.width,
    y:Math.random()*-canvas.height*0.5,
    size:Math.random()*8+6,
    color:colors[Math.floor(Math.random()*colors.length)],
    speedY:Math.random()*3+2.5,
    speedX:Math.random()*2-1,
    rot:Math.random()*360,
    rotSpeed:Math.random()*6-3
  }));
  let frame=0;
  function render(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p=>{
      p.y+=p.speedY;
      p.x+=p.speedX;
      p.rot+=p.rotSpeed;
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle=p.color;
      ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.65);
      ctx.restore();
    });
    frame++;
    if(frame<120)requestAnimationFrame(render);
    else canvas.remove();
  }
  requestAnimationFrame(render);
}
function track(q,correct,elapsed,mode){if(mode!=='review'){let m=state.mastery[q.skill]||[];m.push(correct?1:0);state.mastery[q.skill]=m.slice(-10)}if(!correct&&!state.mistakes.some(x=>x.id===q.id))state.mistakes.push(q);save()}
function generateUniqueQuestions(count,cfg){
  const out=[],seen=new Set();
  for(let i=0;i<count;i++){
    let q;
    for(let tries=0;tries<25;tries++){
      q=generate(cfg);
      if(!seen.has(q.q))break;
    }
    seen.add(q.q);
    out.push(q);
  }
  return out;
}
if(typeof window!=='undefined')window.generateUniqueQuestions=generateUniqueQuestions;
if(typeof global!=='undefined')global.generateUniqueQuestions=generateUniqueQuestions;
function startQuiz(){if(typeof currentAuthUser==='function'&&!currentAuthUser()){toast(t('Vui lòng đăng nhập để bắt đầu học và lưu tiến độ nhé!','Please sign in to learn and save your progress!'));if(typeof openAccount==='function')openAccount('login');return}stop();view='quiz';if(typeof window!=='undefined')window.config=config;if(typeof global!=='undefined')global.config=config;if(typeof document!=='undefined'&&document.body)document.body.dataset.view='quiz';session={kind:'practice',questions:generateUniqueQuestions(config.count,config),index:0,results:[],combo:0,done:false};if(typeof window!=='undefined')window.session=session;if(typeof global!=='undefined')global.session=session;if(typeof window!=='undefined'&&window.scrollTo)window.scrollTo(0,0);showQuiz()}
let currentNumpad='';
function handleNumpad(k,q){
  if(session?.answered)return;
  haptic('tap');
  if(k==='clear'){
    currentNumpad='';
  }else if(k==='backspace'){
    currentNumpad=currentNumpad.slice(0,-1);
  }else if(currentNumpad.length<14){
    if(k==='-'){
      if(currentNumpad.length===0)currentNumpad='-';
      else if(currentNumpad==='-')currentNumpad='';
    }else if(k===','||k==='.'){
      if(!currentNumpad.includes(',')&&!currentNumpad.includes('.')){
        currentNumpad+=(currentNumpad===''||currentNumpad==='-'?'0,':',');
      }
    }else if(k==='/'){
      if(currentNumpad!==''&&currentNumpad!=='-'&&!currentNumpad.includes('/')){
        currentNumpad+='/';
      }
    }else if(k!=='-'){
      currentNumpad+=k;
    }
  }
  const el=$('#numpadVal');
  if(el)el.textContent=currentNumpad||'?';
}
function formatQuestionPrompt(qStr){
  const s=String(qStr||'').trim();
  return (s.includes('?')||s.includes('='))?mathMarkup(s):`${mathMarkup(s)} = ?`;
}
if(typeof window!=='undefined')window.formatQuestionPrompt=formatQuestionPrompt;
if(typeof global!=='undefined')global.formatQuestionPrompt=formatQuestionPrompt;
function showQuiz(){
  cancelQuizAdvance();const s=session;s.answered=false;if(s.index>=s.questions.length){finishPractice();return}
  if(typeof document!=='undefined'&&document.activeElement&&typeof document.activeElement.blur==='function')document.activeElement.blur();
  if(typeof window!=='undefined'&&window.scrollTo)window.scrollTo(0,0);
  const q=s.questions[s.index];currentNumpad='';const type=q.skill.split(':')[0],isNumpad=config.inputMode==='numpad'&&s.kind!=='battle'&&type!=='remainder';
  const isLongQuestion=(q.q||'').length>11||q.q.includes('/')||q.q.includes('^')||q.q.includes('(')||q.q.includes('√');
  const qClass=isLongQuestion?'question question-compact':'question';

  const choicesHtml=`<div class="answers">${q.options.map((o,i)=>`<button class="answer" data-answer="${i}"><small>${'ABCD'[i]}</small>${mathMarkup(o)}</button>`).join('')}</div>`;
  const numpadHtml=`<div class="numpad-wrap">
    <div class="numpad-display">
      <span class="numpad-prompt">${t('Đáp án của em:','Your answer:')}</span>
      <span id="numpadVal" class="numpad-current-val">?</span>
    </div>
    <div class="numpad-grid">
      <button type="button" class="np-btn" data-np="1">1</button>
      <button type="button" class="np-btn" data-np="2">2</button>
      <button type="button" class="np-btn" data-np="3">3</button>
      <button type="button" class="np-btn np-act" data-np="backspace" title="${t('Xóa lùi','Backspace')}">⌫</button>

      <button type="button" class="np-btn" data-np="4">4</button>
      <button type="button" class="np-btn" data-np="5">5</button>
      <button type="button" class="np-btn" data-np="6">6</button>
      <button type="button" class="np-btn np-act" data-np="clear" title="${t('Xóa hết','Clear')}">C</button>

      <button type="button" class="np-btn" data-np="7">7</button>
      <button type="button" class="np-btn" data-np="8">8</button>
      <button type="button" class="np-btn" data-np="9">9</button>
      <button type="button" class="np-btn np-symbol" data-np="-" title="${t('Dấu âm','Negative')}">−</button>

      <button type="button" class="np-btn np-symbol" data-np="/" title="${t('Phân số','Fraction')}">/</button>
      <button type="button" class="np-btn" data-np="0">0</button>
      <button type="button" class="np-btn np-symbol" data-np="," title="${t('Dấu phẩy','Decimal')}">,</button>
      <button type="button" id="numpadSubmit" class="primary np-btn np-submit-key" title="${t('Trả lời','Submit')}">✔</button>
    </div>
  </div>`;

  const stepperDots=s.questions.map((_,i)=>{
    let st='is-pending',icon='';
    if(i<s.results.length){
      if(s.results[i].correct){st='is-correct';icon='✓';}
      else{st='is-wrong';icon='✕';}
    }else if(i===s.index){
      st='is-current';icon=`${i+1}`;
    }
    return `<span class="stepper-dot ${st}" title="${t('Câu','Question')} ${i+1}">${icon}</span>`;
  }).join('');

  $('#app').innerHTML=`<div class="narrow quiz-view-container">
    <div class="quiz-top-bar">
      <div class="quiz-meta-left">
        <button type="button" class="quiz-quit-btn" onclick="nav('setup')" title="${t('Rời bài luyện','Exit')}">✕</button>
        <span class="tag quiz-q-badge">${t('Câu','Question')} <b>${s.index+1}</b>/${s.questions.length}</span>
        ${s.combo>=2?`<span class="quiz-combo-pill animate-pop">Combo x${s.combo}!</span>`:''}
      </div>
      <strong class="timer" id="clock"></strong>
    </div>

    <div class="quiz-stepper" aria-label="Tiến độ">${stepperDots}</div>

    <div class="card quiz-card" id="quizCard">
      <div class="${qClass}">${formatQuestionPrompt(q.q)}</div>
      ${isNumpad?numpadHtml:choicesHtml}
      <p id="feedback" class="muted quiz-feedback" role="status" aria-live="polite"></p>
      <div id="workedAnswer" class="worked-example" hidden></div>
    </div>
  </div>`;

  if(isNumpad){
    $$('[data-np]').forEach(b=>b.onclick=()=>handleNumpad(b.dataset.np,q));
    $('#numpadSubmit').onclick=()=>{if(currentNumpad.trim())answerQuiz(currentNumpad.trim(),q.id)};
  }else{
    $$('[data-answer]').forEach(b=>b.onclick=()=>answerQuiz(q.options[+b.dataset.answer],q.id));
  }
  s.started=performance.now();s.extra=false;const qSec=q.topicSeconds||q.config?.seconds||config.seconds;startClock(qSec,()=>{if(s.kind==='challenge'){answerQuiz(null,q.id);return}modal(`<h2>${t('Hết giờ rồi','Time is up')}</h2><p>${t('Thêm thời gian hoặc bỏ qua để ôn lại trong game.','Add time or skip to review in the game.')}</p><div class="actions"><button id="extra">+${qSec}s</button><button id="skip">${t('Bỏ qua','Skip')}</button></div>`);$('#closeModal').hidden=true;$('#extra').onclick=()=>{s.extra=true;$('#closeModal').hidden=false;$('#modal').close();startClock(qSec,()=>timeoutAgain(qSec))};$('#skip').onclick=()=>{$('#closeModal').hidden=false;$('#modal').close();answerQuiz(null)}});translate();
  setTimeout(()=>{const curDot=$('.stepper-dot.is-current');if(curDot&&curDot.scrollIntoView)curDot.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});},40);
}
function timeoutAgain(sec){const addSec=sec||config.seconds;clearInterval(tick);modal(`<h2>${t('Cần thêm thời gian?','Need more time?')}</h2><div class="actions"><button id="extra">+${addSec}s</button><button id="skip">${t('Bỏ qua','Skip')}</button></div>`);$('#closeModal').hidden=true;$('#extra').onclick=()=>{$('#closeModal').hidden=false;$('#modal').close();startClock(addSec,()=>timeoutAgain(addSec))};$('#skip').onclick=()=>{$('#closeModal').hidden=false;$('#modal').close();answerQuiz(null)}}
function startClock(seconds,cb){clearInterval(tick);let end=performance.now()+seconds*1000;function update(){let left=Math.max(0,(end-performance.now())/1000);if($('#clock'))$('#clock').textContent=left.toFixed(1)+'s';if(left<=0){clearInterval(tick);cb()}}update();tick=setInterval(update,100)}
function parseMathValue(str){
  const s=String(str||'').trim().replace(/\s+/g,'').replace(/−/g,'-').replace(',','.');
  if(!s||/[a-zA-Z]/.test(s))return NaN;
  const fracMatch=s.match(/^(-?\d+)\/(-?\d+)$/);
  if(fracMatch){const n=Number(fracMatch[1]),d=Number(fracMatch[2]);return d!==0?n/d:NaN}
  if(/^-?\d+(\.\d+)?$/.test(s))return Number(s);
  return NaN;
}
function isAnswerMatch(ans,expected){
  if(ans===null||ans===undefined)return false;
  const norm=str=>String(str||'').trim().replace(/\s+/g,'').replace(/−/g,'-').replace('.',',').toLowerCase();
  if(norm(ans)===norm(expected))return true;
  const v1=parseMathValue(ans),v2=parseMathValue(expected);
  if(Number.isFinite(v1)&&Number.isFinite(v2)&&Math.abs(v1-v2)<1e-6)return true;
  return false;
}
function answerQuiz(ans,questionId){
  if(view!=='quiz'||!session||session.done||session.answered)return;const s=session,q=s.questions[s.index];if(questionId&&questionId!==q.id)return;
  s.answered=true;clearInterval(tick);cancelQuizAdvance();
  const norm=str=>String(str||'').trim().replace(/\s+/g,'').replace(/−/g,'-').replace('.',',').toLowerCase();
  const correct=isAnswerMatch(ans,q.answer),elapsed=(performance.now()-s.started)/1000;
  s.results.push({correct,elapsed,extra:s.extra});track(q,correct,elapsed,'practice');

  if(correct){
    s.combo=(s.combo||0)+1;
    haptic('correct');
  }else{
    s.combo=0;
    haptic('wrong');
  }

  const currentDot=$$('.stepper-dot')[s.index];
  if(currentDot){
    currentDot.className='stepper-dot '+(correct?'is-correct':'is-wrong');
    currentDot.textContent=correct?'✓':'✕';
  }
  const quizCard=$('#quizCard');
  if(quizCard){
    quizCard.classList.remove('quiz-card-pop','quiz-card-shake');
    void quizCard.offsetWidth;
    quizCard.classList.add(correct?'quiz-card-pop':'quiz-card-shake');
  }

  const isNumpad=config.inputMode==='numpad'&&s.kind!=='battle';
  if(isNumpad){
    const disp=$('#numpadVal');
    if(disp){
      const promptEl=disp.parentElement?.querySelector?.('.numpad-prompt');
      if(promptEl)promptEl.textContent=correct?t('Chính xác:','Correct:'):t('Em vừa nhập:','You entered:');
      disp.textContent=(ans!==null?ans:t('Hết giờ','Time out'))+(correct?' ✓':' ✕');
      if(disp.parentElement)disp.parentElement.className='numpad-display '+(correct?'is-correct':'is-wrong');
    }
    const sub=$('#numpadSubmit');if(sub)sub.disabled=true;$$('[data-np]').forEach(b=>b.disabled=true);
  }else{
    const buttons=$$('[data-answer]');buttons.forEach((b,i)=>{b.disabled=true;const option=q.options[i];if(norm(option)===norm(q.answer))b.classList.add('is-correct');if(ans!==null&&norm(option)===norm(ans)&&!correct)b.classList.add('is-wrong')});
  }
  const feedback=$('#feedback');if(feedback)feedback.textContent=correct?t('Đúng rồi, giỏi lắm!','That’s right! Well done!'):ans===null?t('Hết giờ. Đáp án đúng là: '+q.answer,'Time ran out. Correct answer: '+q.answer):t('Chưa đúng rồi. Đáp án đúng là: '+q.answer,'Not quite. Correct answer: '+q.answer);
  const explain=!correct;
  let hasNextBtn=false;
  if(explain){
    const panel=$('#workedAnswer');if(panel){panel.hidden=false;panel.innerHTML=`<b>${t('Hướng dẫn tính nhẩm:','Mental math steps:')}</b><br>${mathMarkup(hint(q)).replace(/\n/g,'<br>')}<br><button type="button" id="nextQuizBtn" class="primary" style="margin-top:12px;font-size:14px">${t('Đã hiểu, câu tiếp theo →','Got it, next question →')}</button>`;$('#nextQuizBtn').onclick=()=>{cancelQuizAdvance();showQuiz()};hasNextBtn=true}
  }
  s.index++;if(!hasNextBtn)quizAdvanceTimer=setTimeout(showQuiz,explain?4500:700);
}
function finishPractice(){
  session.done=true;let s=session,n=s.results.filter(x=>x.correct).length;if(n>0)updateStreak();
  state.history.push({date:new Date().toISOString(),mode:'practice',correct:n,total:s.results.length,time:avg(s.results.map(x=>x.elapsed)),extra:s.results.filter(x=>x.extra).length});
  state.history=state.history.slice(-200);state.xp+=n*3;save();
  const streak=getStreak();
  const pct=s.results.length>0?Math.round((n/s.results.length)*100):0;
  if(pct>=70){
    haptic('victory');
    triggerConfetti();
  }
  const avgSpeed=avg(s.results.map(x=>x.elapsed)).toFixed(1);

  $('#app').innerHTML=`<div class="narrow card quiz-finish-card">
    <h1 class="finish-title">${pct===100?t('Xuất sắc! Đúng toàn bộ!','Flawless! 100% Correct!'):pct>=70?t('Làm tốt lắm, tiếp tục nhé!','Great job, keep going!'):t('Cố gắng lên nhé!','Keep practicing!')}</h1>
    
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
        <small>${t('Tốc độ TB','Avg Speed')}</small>
        <strong>${avgSpeed}s</strong>
        <span>/${t('câu','question')}</span>
      </div>
    </div>

    <p class="finish-message">${state.mistakes.length?t('Numi đã lưu lại những câu chưa đúng vào Vườn hoa để em ôn tập thêm.','Missed questions are saved to your flower garden for review.'):t('Em không mắc lỗi nào trong lượt này!','Zero mistakes in this session!')}</p>

    <div class="finish-actions">
      ${state.mistakes.length?`<button class="primary wide" onclick="startReview()">${t('Ôn câu sai bằng Vườn hoa','Review in Flower Garden')} (${state.mistakes.length}) →</button>`:''}
      <button class="${state.mistakes.length?'':'primary'} wide" onclick="nav('setup')">${t('Luyện lượt tiếp theo','Practice Again')}</button>
      <button class="wide" onclick="nav('home')">${t('Về trang chủ','Back to Home')}</button>
    </div>
  </div>`;
  translate();
}
function hint(q){
  const [type,op]=q.skill.split(':');
  if(q.detail)return q.detail;
  return q.explanation||detailedExplanation(q.q,0,0,op,type,q.answer,op);
}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function renderStudentGuideHtml(){
  return `<div class="guide-cards">
    <div class="guide-card card">
      <div class="guide-step-header"><span class="guide-step-num">1</span><h3>${t('Chọn đúng Lớp học của em','Choose your Grade level')}</h3></div>
      <p>${t('Vào mục <b>Luyện tập</b>, bấm chọn từ <b>Lớp 1 đến Lớp 9</b>. Numi sẽ tự động chuẩn bị các bài toán đúng chuẩn kiến thức trên lớp (Tiểu học: cộng trừ, nhân chia, phân số, số thập phân; THCS Lớp 6–9: số nguyên âm, số hữu tỉ, luỹ thừa, biểu thức tính nhanh).','Head to <b>Practice</b> and tap your <b>Grade (1 to 9)</b>. Numi automatically selects questions matching what you learn at school (Primary: arithmetic, fractions, decimals; Middle School Grades 6–9: integers, rational numbers, powers, mental algebra).')}</p>
      <div class="guide-tip"><b>${t('Mẹo:','Tip:')}</b> ${t('Em cũng có thể bấm “Tùy chỉnh” để tự chọn số chữ số và phép tính theo ý thích.','You can also tap “Custom” to freely pick operations and number of digits.')}</div>
    </div>
    <div class="guide-card card">
      <div class="guide-step-header"><span class="guide-step-num">2</span><h3>${t('Hai cách trả lời: Trắc nghiệm hoặc Bàn phím số','Two Answer Modes: Multiple Choice or Numpad')}</h3></div>
      <p>${t('• <b>Trắc nghiệm 4 đáp án:</b> Chạm vào đáp án đúng hoặc bấm phím A, B, C, D (hoặc 1, 2, 3, 4) trên máy tính.<br>• <b>Bàn phím số:</b> Tự gõ đáp án để rèn luyện phản xạ tính toán sâu hơn. Hỗ trợ bấm phím số trên bàn phím thật, Enter để nộp bài và Esc để xóa.','• <b>Multiple Choice:</b> Tap the answer or press A, B, C, D (or 1, 2, 3, 4) on your keyboard.<br>• <b>Numpad Input:</b> Type your answer directly to sharpen recall. Supports physical keyboard number keys, Enter to submit, and Esc to clear.')}</p>
    </div>
    <div class="guide-card card">
      <div class="guide-step-header"><span class="guide-step-num">3</span><h3>${t('Xem hướng dẫn từng bước khi gặp câu khó','Step-by-step Explanations for Mistakes')}</h3></div>
      <p>${t('Đừng lo khi làm sai! Numi sẽ ngay lập tức hiện bảng hướng dẫn cách tách số nhẩm nhanh (ví dụ: tách số tròn chục, quy đồng mẫu số). Đọc kỹ hướng dẫn sẽ giúp em không bị nhầm ở các câu tiếp theo.','Don’t worry if you miss a question! Numi instantly shows mental math breakdown steps (like splitting tens or common denominators) so you master it next time.')}</p>
    </div>
    <div class="guide-card card">
      <div class="guide-step-header"><span class="guide-step-num">4</span><h3>${t('Vườn hoa sửa sai – Biến lỗi sai thành hoa đẹp','Flower Garden Review – Turn Mistakes into Blooms')}</h3></div>
      <p>${t('Mỗi câu em chưa làm đúng sẽ được chuyển vào <b>Vườn hoa</b> thành một chậu cây. Em chỉ cần ghép đúng chậu bài toán với bông hoa đáp án tương ứng. Khi ghép đúng, hoa sẽ nở rực rỡ và câu sai được xóa khỏi bộ nhớ!','Missed problems go to your <b>Flower Garden</b> as flower pots. Drag or tap to match each problem pot with its blooming answer flower!')}</p>
    </div>
    <div class="guide-card card">
      <div class="guide-step-header"><span class="guide-step-num">5</span><h3>${t('Nuôi chuỗi ngày học & Tích điểm XP','Keep Your Daily Streak & Earn XP')}</h3></div>
      <p>${t('• <b>Chuỗi ngày học:</b> Mỗi ngày làm ít nhất 1 bài để giữ chuỗi học tập liên tục không bị gián đoạn.<br>• <b>Bảng đặt tính & Tự luận:</b> Khi gặp phép tính nhiều chữ số hoặc số thập phân, bé dùng ngay <b>Bảng Đặt tính rồi tính</b> kẻ ô ly để tính thẳng cột từ phải sang trái!','• <b>Daily Streak:</b> Complete at least one practice session every day to keep your streak going.<br>• <b>Column Arithmetic & Free Input:</b> Use the interactive ruled column table to calculate multi-digit and decimal problems accurately!')}</p>
    </div>
  </div>`;
}
function renderParentGuideHtml(){
  return `<div class="guide-cards">
    <div class="guide-card card">
      <div class="guide-step-header"><span class="guide-step-num">1</span><h3>${t('Quản lý tài khoản riêng cho từng bé trên cùng một máy','Separate Child Profiles on One Device')}</h3></div>
      <p>${t('Nhà có nhiều bé học các lớp khác nhau? Phụ huynh có thể tạo cho mỗi bé một tài khoản riêng (ví dụ: Bé Anh Lớp 4, Bé Em Lớp 2) kèm mã PIN đơn giản. Điểm số, chuỗi ngày và lịch sử làm bài của từng bé được lưu riêng biệt hoàn toàn.','Have multiple children? Create individual profiles with simple PINs. Each child keeps their own grade level, history, streak, and flower review without overlapping.')}</p>
      <div class="guide-tip"><b>${t('Mẹo:','Tip:')}</b> ${t('Tại màn hình Đăng nhập có sẵn danh sách tên các bé, bé chỉ cần chạm vào tên mình và nhập mã PIN để vào học.','Quick user chips on the sign-in screen allow 1-tap switching between siblings.')}</div>
    </div>
    <div class="guide-card card">
      <div class="guide-step-header"><span class="guide-step-num">2</span><h3>${t('Theo dõi biểu đồ tiến bộ & Tốc độ phản xạ','Track 7-Day Progress & Reflex Speeds')}</h3></div>
      <p>${t('Bấm vào <b>Thành tích</b> trên thanh điều hướng để xem:<br>• Tỷ lệ làm đúng theo từng dạng toán (số tự nhiên, phân số, số thập phân, phép chia có dư).<br>• Tốc độ tính trung bình (số giây/câu) để biết con có tiến bộ về phản xạ nhanh hay không.<br>• Biểu đồ lịch sử 7 ngày gần nhất.','Open <b>Progress</b> in the navigation to view:<br>• Accuracy broken down by operation and number type.<br>• Average reaction speed (seconds/question).<br>• 7-day practice volume chart.')}</p>
    </div>
    <div class="guide-card card">
      <div class="guide-step-header"><span class="guide-step-num">3</span><h3>${t('Soạn đề in PDF khổ A4 & Giao bài tập cho lớp','Print A4 PDF Worksheets & Assign Homework')}</h3></div>
      <p>${t('• <b>Soạn & In đề PDF:</b> Phụ huynh và Thầy/Cô có thể ghép nhiều chuyên đề Lớp 1–9 rồi bấm <b>Soạn đề sẵn & In phiếu PDF (A4)</b> để xuất riêng 2 bản: <b>Đề phát học sinh (Không đáp án)</b> và <b>Bản Có đáp án & Lời giải</b>.<br>• <b>Không gian Giáo viên & Giao bài:</b> Thầy/Cô tạo lớp học riêng, cấp mã lớp cho học sinh tham gia, theo dõi điểm yếu từng em và giao bài tập ôn luyện qua link 1 chạm.','• <b>A4 PDF Worksheets:</b> Combine exam topics for Grades 1–9 and export separate Student Exam (no answers) and Answer Key PDFs.<br>• <b>Teacher Workspace & Homework:</b> Teachers create classes, share join codes, track weaknesses, and assign targeted practice.')}</p>
    </div>
    <div class="guide-card card">
      <div class="guide-step-header"><span class="guide-step-num">4</span><h3>${t('Chuẩn hóa theo Chương trình GDPT 2018','Aligned with Primary Math Standards (GDPT 2018)')}</h3></div>
      <p>${t('Hệ thống câu hỏi của NumiQuick được xây dựng bám sát định hướng phát triển năng lực tính toán của học sinh tiểu học Việt Nam:<br>• <b>Lớp 1:</b> Cộng trừ phạm vi 100 không nhớ, rèn cấu tạo số.<br>• <b>Lớp 2:</b> Cộng trừ có nhớ đến 100, bảng nhân chia 2 và 5.<br>• <b>Lớp 3:</b> Hoàn chỉnh bảng nhân chia 2–9, cộng trừ đến 1.000, phép chia có dư.<br>• <b>Lớp 4:</b> Số nhiều chữ số, 4 phép tính phân số.<br>• <b>Lớp 5:</b> Số thập phân, hỗn số, biểu thức tính nhanh.','Curriculum levels are calibrated to primary school development benchmarks from Grade 1 to 5, fostering genuine mental math fluency without cognitive overload.')}</p>
    </div>
  </div>`;
}
function renderGuide(activeTab = 'student'){
  stop();view='guide';document.body.dataset.view='guide';
  $$('nav button').forEach(b=>b.classList.toggle('active',b.dataset.view==='guide'));
  const studentActive=activeTab==='student';
  $('#app').innerHTML=`<section class="guide-view narrow">
    <div class="guide-hero card">
      <span class="eyebrow">NUMIQUICK · ${t('TRUNG TÂM HƯỚNG DẪN','USER GUIDE')}</span>
      <h1>${t('Hướng dẫn sử dụng NumiQuick','How to Use NumiQuick')}</h1>
      <p class="muted">${t('Bí kíp luyện tính nhanh, rèn tư duy và theo dõi tiến bộ dễ dàng mỗi ngày.','Everything you need to practice mental math, build confidence and track progress.')}</p>
      <div class="guide-role-tabs">
        <button type="button" class="guide-role-tab ${studentActive?'active':''}" id="guideTabStudent">${t('Dành cho Học sinh','For Students')}</button>
        <button type="button" class="guide-role-tab ${!studentActive?'active':''}" id="guideTabParent">${t('Dành cho Phụ huynh & Thầy cô','For Parents & Teachers')}</button>
      </div>
    </div>
    <div class="guide-content">
      ${studentActive?renderStudentGuideHtml():renderParentGuideHtml()}
    </div>
    <div class="guide-footer-actions">
      <button class="primary wide" onclick="nav('setup')">${t('Vào luyện tập ngay','Start practicing now')} →</button>
      <button class="wide" onclick="nav('home')" style="margin-top:8px">${t('Về trang chủ','Back to home')}</button>
    </div>
  </section>`;
  $('#guideTabStudent').onclick=()=>renderGuide('student');
  $('#guideTabParent').onclick=()=>renderGuide('parent');
  translate();
  window.scrollTo(0,0);
}
function startReview(){}
function award(n){state.pieces[state.selected]=(state.pieces[state.selected]||0)+n;save()}
function atlas(){if(typeof teaRenderGoals==='function')teaRenderGoals()}
function stats(){let h=state.history,correct=h.reduce((a,b)=>a+b.correct,0),total=h.reduce((a,b)=>a+b.total,0),weak=Object.entries(state.mastery).filter(([,a])=>a.length>=5&&avg(a)<.6);$('#app').innerHTML=`<span class="eyebrow">${t('NHẬT KÝ HÀNH TRÌNH','YOUR JOURNEY LOG')}</span><h1>${t('Giỏi hơn từng ngày.','Growing every day.')}</h1><div class="metrics"><div class="metric"><small>${t('Độ chính xác lần đầu','First-try accuracy')}</small><strong>${total?Math.round(correct/total*100):0}%</strong></div><div class="metric"><small>${t('Thời gian TB / câu','Average seconds / question')}</small><strong>${avg(h.map(x=>x.time)).toFixed(1)}s</strong></div><div class="metric"><small>${t('Cấp nhà thám hiểm','Explorer level')}</small><strong>${level()}</strong></div><div class="metric"><small>${t('Câu cần ôn','Pending review')}</small><strong>${state.mistakes.length}</strong>${state.mistakes.length?`<button type="button" class="primary" style="margin-top:8px;padding:6px 12px;min-height:34px;font-size:12px;width:100%" onclick="startReview()">${t('Ôn bằng Vườn hoa →','Review in Garden →')}</button>`:''}</div></div><div class="grid"><section class="card"><h3>${t('10 lượt gần nhất','Last 10 sessions')}</h3><div class="chart">${h.slice(-10).map(x=>`<div style="height:${Math.round(x.correct/x.total*100)}%" title="${x.correct}/${x.total}"></div>`).join('')}</div><p>${t('Chiều cao cột = tỉ lệ trả lời đúng.','Bar height = correct answer percentage.')}</p></section><section class="card"><h3>${t('Kỹ năng cần củng cố','Skills to strengthen')}</h3>${weak.length?weak.map(([k,a])=>`<p>${esc(skillName(k))}: ${Math.round(avg(a)*100)}%</p><button data-weak="${esc(k)}">${t('Ôn có hướng dẫn','Guided review')}</button><button data-retest="${esc(k)}">${t('Kiểm tra lại · 5 câu','Retest · 5 questions')}</button>`).join(''):`<p>${t('Chưa có kỹ năng yếu được xác định. Cần ít nhất 5 câu mỗi dạng để đánh giá.','No weak skills identified. At least 5 answers per skill are needed.')}</p>`}</section><section class="card"><h3>${t('Giữ lại hành trình','Keep your journey')}</h3><p>${t('Dữ liệu lưu trên trình duyệt này. Xuất bản sao lưu trước khi đổi máy hoặc xóa dữ liệu.','Progress is saved in this browser. Export before changing devices or clearing browser data.')}</p><button id="backup">↓ ${t('Xuất sao lưu','Export backup')}</button><button id="import">↑ ${t('Nhập sao lưu','Import backup')}</button></section></div>    <section class="card section"><h3>${t('Lịch sử luyện tập','Practice history')}</h3>${h.length?`<table class="history"><thead><tr><th>${t('Ngày','Date')}</th><th>${t('Chế độ','Mode')}</th><th>${t('Đúng','Correct')}</th><th>${t('TB','Avg')}</th><th>${t('Thêm giờ','Extra time')}</th></tr></thead><tbody>${h.slice(-20).reverse().map(x=>`<tr><td>${new Date(x.date).toLocaleDateString(lang==='vi'?'vi-VN':'en-US')}</td><td>${x.mode==='sprint60'?t('Thi đấu 60s','60s Sprint'):x.mode==='assigned'?t('Bài được giao','Assigned'):t('Tự luyện','Practice')}</td><td>${x.correct}/${x.total}</td><td>${x.time.toFixed(1)}s</td><td>${x.extra?x.extra+'×':'—'}</td></tr>`).join('')}</tbody></table>`:`<div class="empty">${t('Hành trình của em bắt đầu từ lượt đầu tiên.','Your journey starts with your first session.')}</div>`}</section>`;$('#backup').onclick=()=>download(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),'NumiQuest-backup.json');$('#import').onclick=()=>$('#restore').click();$$('[data-weak]').forEach(b=>b.onclick=()=>{let k=b.dataset.weak,q=generate({...defaults,type:k.split(':')[0],ops:[k.split(':')[1]]});modal(`<h2>${esc(skillName(k))}</h2><p style="white-space:pre-line">${esc(hint(q))}</p><p>${t('Sau khi đọc, em có thể làm bài kiểm tra lại 5 câu.','After reading, try a 5-question retest.')}</p>`)});$$('[data-retest]').forEach(b=>b.onclick=()=>{if(state.mistakes.length){startReview();return}let [type,op]=b.dataset.retest.split(':');const u=typeof currentAuthUser==='function'?currentAuthUser():null;const gId=config.grade||u?.grade||1;config={...defaults,...config,type,types:[type],ops:[op],count:5,grade:gId};startQuiz()})}
function skillName(k){let [type,op]=k.split(':');return ({natural:t('Số tự nhiên','Whole numbers'),remainder:t('Chia dư','Remainders'),decimal:t('Thập phân','Decimals'),negative:t('Số nguyên','Integers'),fraction:t('Phân số','Fractions')}[type]||type)+' '+({'+':'+','-':'−','*':'×','/':'÷',missing:t('Tìm số (?)','Missing (?)'),word:t('Toán đố','Word problem'),convenient:t('Tính thuận tiện','Regrouping'),expression:t('Biểu thức','Expression')}[op]||op)}
function validBackup(x){
  if(!x||typeof x!=='object'||x.version!==1)return false;
  if(x.history!==undefined&&!Array.isArray(x.history))return false;
  if(x.mistakes!==undefined&&(!Array.isArray(x.mistakes)||x.mistakes.length>10000))return false;
  if(typeof x.name!=='string'||x.name.length>50||!Number.isFinite(x.xp)||x.xp<0)return false;
  if(x.best!==undefined&&!Number.isFinite(x.best))return false;
  if(x.pieces&&typeof x.pieces==='object'){
    if(!Object.values(x.pieces).every(n=>Number.isSafeInteger(n)&&n>=0))return false;
  }else{
    x.pieces={};
  }
  if(x.mastery&&typeof x.mastery==='object'){
    if(!Object.values(x.mastery).every(a=>Array.isArray(a)&&a.every(n=>n===0||n===1)))return false;
  }else{
    x.mastery={};
  }
  if(Array.isArray(x.history)){
    if(!x.history.every(h=>h&&typeof h.date==='string'&&Number.isFinite(h.correct)&&Number.isFinite(h.total)&&h.total>0&&h.correct>=0&&h.correct<=h.total&&Number.isFinite(h.time)))return false;
    if(x.history.length>200)x.history=x.history.slice(-200);
  }else{
    x.history=[];
  }
  if(Array.isArray(x.mistakes)){
    if(!x.mistakes.every(q=>q&&typeof q.id==='string'&&typeof q.q==='string'&&typeof q.answer==='string'))return false;
    x.mistakes=x.mistakes.map(q=>{
      const ans=String(q.answer);
      const opts=Array.isArray(q.options)&&q.options.length===4&&q.options.includes(ans)?q.options:[ans,String((parseFloat(ans)||0)+1),String((parseFloat(ans)||0)+2),String(Math.max(0,(parseFloat(ans)||2)-1))];
      const cfg=(q.config&&typeof q.config==='object')?{...defaults,...q.config,seconds:Math.min(120,Math.max(5,+q.config.seconds||15))}:{...defaults,seconds:15};
      return {...q,options:opts,config:cfg,skill:q.skill||'natural:+'};
    });
  }else{
    x.mistakes=[];
  }
  return true;
}
$('#restore').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>5000000)throw Error();const x=JSON.parse(await file.text());if(!validBackup(x))throw Error();if(!confirm(t('Thay toàn bộ tiến độ hiện tại bằng bản sao lưu?','Replace current progress with this backup?')))return;state={...fresh(),...x};lang=state.lang==='en'?'en':'vi';save();nav('stats');toast(t('Đã khôi phục tiến độ.','Progress restored.'))}catch{toast(t('File sao lưu không hợp lệ. Dữ liệu hiện tại được giữ nguyên.','Invalid backup. Current progress is unchanged.'))}finally{e.target.value=''}};
// Zoo experience v0.2. Storage key is unchanged to preserve existing progress.
function animal(kind='lion',cls=''){const eyes='<ellipse cx="65" cy="82" rx="4" ry="6" fill="#405249"/><ellipse cx="95" cy="82" rx="4" ry="6" fill="#405249"/><ellipse cx="54" cy="94" rx="10" ry="6" fill="#f3b3a1"/><ellipse cx="106" cy="94" rx="10" ry="6" fill="#f3b3a1"/><path d="M75 94Q80 90 85 94L80 100Z" fill="#715443"/><path d="M72 104Q80 112 88 104" stroke="#715443" stroke-width="3" fill="none" stroke-linecap="round"/>';let parts=kind==='panda'?'<circle cx="38" cy="42" r="21" fill="#405b53"/><circle cx="122" cy="42" r="21" fill="#405b53"/><ellipse cx="80" cy="85" rx="62" ry="53" fill="#fffdf0"/><ellipse cx="60" cy="78" rx="15" ry="19" fill="#405b53" transform="rotate(20 60 78)"/><ellipse cx="100" cy="78" rx="15" ry="19" fill="#405b53" transform="rotate(-20 100 78)"/><circle cx="63" cy="77" r="4" fill="white"/><circle cx="97" cy="77" r="4" fill="white"/><ellipse cx="80" cy="98" rx="8" ry="6" fill="#405b53"/><path d="M72 110Q80 117 88 110" stroke="#405b53" stroke-width="3" fill="none"/>':kind==='bunny'?'<ellipse cx="54" cy="35" rx="16" ry="33" fill="#f8eee3" transform="rotate(-12 54 35)"/><ellipse cx="107" cy="35" rx="16" ry="33" fill="#f8eee3" transform="rotate(12 107 35)"/><ellipse cx="54" cy="32" rx="7" ry="22" fill="#f1c0b9" transform="rotate(-12 54 32)"/><ellipse cx="107" cy="32" rx="7" ry="22" fill="#f1c0b9" transform="rotate(12 107 32)"/><ellipse cx="80" cy="91" rx="57" ry="46" fill="#fff9f0"/>'+eyes:kind==='fox'?'<path d="M28 66L23 13L64 45M94 45L136 13L131 68" fill="#e9a06b"/><path d="M31 44L30 27L48 47M111 47L128 27L128 46" fill="#f9d7c0"/><ellipse cx="80" cy="85" rx="60" ry="49" fill="#e9a06b"/><path d="M22 79Q56 70 80 102Q104 70 138 79Q129 132 80 134Q31 132 22 79" fill="#fff3da"/>'+eyes:'<circle cx="80" cy="81" r="71" fill="#cf9254"/><circle cx="38" cy="39" r="19" fill="#edba6e"/><circle cx="122" cy="39" r="19" fill="#edba6e"/><circle cx="80" cy="84" r="52" fill="#ffdb8b"/><ellipse cx="80" cy="105" rx="24" ry="18" fill="#fff0c8"/>'+eyes;return `<svg class="animal ${cls}" viewBox="0 0 160 160" aria-hidden="true">${parts}</svg>`}
const buddies=[['lion','Leo',t('Sư tử ham học','Curious lion')],['bunny','Mimi',t('Thỏ nhanh trí','Quick-thinking bunny')],['panda','Bamboo',t('Gấu trúc kiên trì','Patient panda')],['fox','Finn',t('Cáo tinh anh','Clever fox')]];const buddy=()=>state.buddy||'lion';
function welcomeName(){return state.name==='Explorer'?t('bạn nhỏ','little explorer'):esc(state.name)}
let soundEnabled=state.sound!==false,audioContext;function chime(ok){if(!soundEnabled)return;try{audioContext=audioContext||new(window.AudioContext||window.webkitAudioContext)();audioContext.resume();[ok?523:280,ok?659:230,ok?784:200].forEach((f,i)=>{const osc=audioContext.createOscillator(),gain=audioContext.createGain(),at=audioContext.currentTime+i*.09;osc.type='sine';osc.frequency.value=f;gain.gain.setValueAtTime(.045,at);gain.gain.exponentialRampToValueAtTime(.001,at+.18);osc.connect(gain);gain.connect(audioContext.destination);osc.start(at);osc.stop(at+.2)})}catch{}}
const originalAnswer=answerQuiz;answerQuiz=function(ans,questionId){if(view!=='quiz'||!session||session.done||session.answered)return;const q=session.questions[session.index];if(questionId&&questionId!==q.id)return;chime(isAnswerMatch(ans,q.answer));originalAnswer(ans,questionId)};
const originalShowQuiz=showQuiz;showQuiz=function(){originalShowQuiz();if(view!=='quiz'||session.done)return;const card=$('.narrow .card');if(!card)return;const guide=document.createElement('div');guide.className='quiz-companion';guide.innerHTML=`${animal(buddy())}<span>${t('Cứ từ từ, em làm được mà!','Take your time. You’ve got this!')}</span>`;card.prepend(guide);$$('[data-answer]').forEach((b,i)=>b.classList.add('answer-'+i));$('#clock')?.setAttribute('aria-live','off')};
// Retry with shuffled choices rather than keeping the correct location fixed.
function hint(q){if(q.detail)return q.detail;if(q.explanation)return q.explanation;const [type,op]=q.skill.split(':'),eq=q.explanation;if(type==='fraction')return eq+'\n'+(op==='+'||op==='-'?t('Quy đồng hai mẫu số, cộng hoặc trừ tử số, giữ mẫu số chung rồi rút gọn.','Find a common denominator, add or subtract the numerators, then simplify.'):op==='*'?t('Nhân tử với tử, mẫu với mẫu rồi rút gọn.','Multiply numerators and denominators, then simplify.'):t('Giữ phân số thứ nhất, đảo tử và mẫu phân số thứ hai rồi nhân.','Keep the first fraction, invert the second, then multiply.'));const match=q.q.match(/^(\d+) ([+−×÷]) (\d+)$/);if(match){const a=+match[1],b=+match[3];if(op==='+'&&b>=10){let tens=Math.floor(b/10)*10,ones=b%10;return `${eq}\n${a} + ${tens} = ${a+tens}\n${a+tens} + ${ones} = ${a+b}`};if(op==='-'&&b>=10){let tens=Math.floor(b/10)*10,ones=b%10;return `${eq}\n${a} − ${tens} = ${a-tens}\n${a-tens} − ${ones} = ${a-b}`};if(op==='*'&&b>=10){let tens=Math.floor(b/10)*10,ones=b%10;return `${eq}\n${a} × ${tens} = ${a*tens}\n${a} × ${ones} = ${a*ones}\n${a*tens} + ${a*ones} = ${a*b}`};if(op==='/')return `${eq}\n${b} × ${Math.floor(a/b)} = ${b*Math.floor(a/b)}${a%b?'\n'+a+' − '+b*Math.floor(a/b)+' = '+a%b:''}`;if(op==='*'&&b<=9)return eq+'\n'+Array.from({length:b},()=>a).join(' + ')+' = '+a*b}return eq+'\n'+(op==='+'?t('Tách thành phần nguyên và phần lẻ, rồi cộng từng phần.','Split into whole and fractional parts, then add.'):op==='-'?t('Tìm khoảng cách giữa hai số. Chú ý dấu âm và dấu phẩy.','Find the difference. Watch negative signs and decimal places.'):op==='*'?t('Tách một thừa số thành các phần nhỏ, nhân rồi cộng lại.','Split one factor, multiply each part, then add.'):t('Nhân ngược lại để kiểm tra kết quả.','Multiply back to check the answer.'))}
const zooNav=nav;nav=function(v){zooNav(v);$('#app').classList.toggle('game-layout',view==='game');document.body.dataset.view=view};
function initializeZoo(){document.title='NumiQuick · Luyện tính nhẩm vui';$('.brand').innerHTML=`<span class="brand-word">Numi<span>Quick</span><small data-vi="Luyện tính nhẩm vui" data-en="Fun mental maths"></small></span>`;document.body.dataset.view='home';translate()}
window.addEventListener('keydown',e=>{
  if($('#modal')?.open||e.ctrlKey||e.metaKey||e.altKey||['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;
  const sheet=$('#moreSheet');
  if(sheet?.classList.contains('open')){
    if(e.key==='Escape'){e.preventDefault();$('#closeMoreSheetBtn')?.click();}
    return;
  }
  if(view==='quiz'){
    if(session?.answered&&(e.key==='Enter'||e.key===' ')){
      const nextBtn=$('#nextQuizBtn');
      if(nextBtn){e.preventDefault();nextBtn.click();return}
    }
    const q=session?.questions?.[session?.index];
    const type=q?.skill?.split(':')?.[0];
    const isNumpad=config.inputMode==='numpad'&&session?.kind!=='battle'&&type!=='remainder';
    if(isNumpad){
      if(e.key==='Enter'){e.preventDefault();$('#numpadSubmit')?.click();return}
      if(e.key==='Backspace'){e.preventDefault();$('[data-np="backspace"]')?.click();return}
      if(e.key==='Escape'||e.key==='Delete'){e.preventDefault();$('[data-np="clear"]')?.click();return}
      if(e.key==='.'||e.key===','){e.preventDefault();$('[data-np=","]')?.click();return}
      const b=$(`[data-np="${e.key}"]`);if(b&&!b.disabled){e.preventDefault();b.click();return}
    }else{
      const k=e.key.toLowerCase();
      let i='abcd'.indexOf(k);
      if(i<0)i='1234'.indexOf(k);
      if(i>=0){const b=$$('[data-answer]')[i];if(b&&!b.disabled){e.preventDefault();b.click()}}
    }
  }else if(view==='battle'){
    const k=e.key.toLowerCase();
    let i='abcd'.indexOf(k);
    if(i<0)i='1234'.indexOf(k);
    if(i>=0){const b=$$('[data-battle]')[i];if(b&&!b.disabled){e.preventDefault();b.click()}}
  }
});

// Mistake review: match flowers and pots in either direction.
let garden=null,gardenTimer=null,gardenSelection=null,gardenGhost=null;
function gardenFlower(open=false,variant=0){const colors=['#ddb58c','#b4c699','#e3c6a0'];let c=colors[variant%3];return `<svg class="garden-flower ${open?'is-open':''}" viewBox="0 0 100 130" aria-hidden="true"><path d="M50 112V52" stroke="#739461" stroke-width="5" stroke-linecap="round"/><path d="M49 91Q22 92 25 74Q44 73 49 91M51 101Q75 99 78 82Q57 80 51 101" fill="#a7bd8f"/><g class="petals" fill="${c}"><ellipse cx="50" cy="28" rx="14" ry="22"/><ellipse cx="50" cy="28" rx="14" ry="22" transform="rotate(60 50 50)"/><ellipse cx="50" cy="28" rx="14" ry="22" transform="rotate(120 50 50)"/><ellipse cx="50" cy="28" rx="14" ry="22" transform="rotate(180 50 50)"/><ellipse cx="50" cy="28" rx="14" ry="22" transform="rotate(240 50 50)"/><ellipse cx="50" cy="28" rx="14" ry="22" transform="rotate(300 50 50)"/></g><circle class="flower-center" cx="50" cy="50" r="15" fill="#f5e7b6"/><path class="flower-smile" d="M43 51Q50 59 57 51" stroke="#998455" stroke-width="2" stroke-linecap="round" fill="none"/><g class="bud"><path d="M50 66Q26 54 36 30Q47 26 50 36Q55 24 66 29Q77 53 50 66Z" fill="${c}"/><path d="M50 64Q36 63 31 51Q45 48 50 58Q57 46 69 49Q66 64 50 64Z" fill="#9bb482"/></g></svg>`}
function gardenPot(){return `<svg class="garden-pot" viewBox="0 0 140 105" aria-hidden="true"><path d="M24 30L35 88Q70 103 105 88L116 30Z" fill="#d6ae86"/><path d="M36 40L44 80" stroke="#e7c7a5" stroke-width="6" stroke-linecap="round"/><rect x="16" y="17" width="108" height="25" rx="7" fill="#e3c29f"/><ellipse cx="70" cy="19" rx="49" ry="7" fill="#9f805e"/><path d="M59 62Q70 47 81 62Q70 76 59 62Z" fill="#ead2b6"/></svg>`}
startReview=function(){if(!state.mistakes.length){toast(t('Không có câu sai cần ôn. Em làm tốt lắm!','No mistakes to review. Well done!'));return}stop();view='garden';document.body.dataset.view='garden';$('#app').classList.remove('game-layout');const qs=state.mistakes.map(q=>({...q,options:[...q.options]}));garden={questions:qs,offset:0,perPage:Math.min(6,qs.length),lives:3,done:new Set(),used:new Set(),active:null,deadline:0,remaining:{},busy:false};session={kind:'garden',done:false};gardenSelection=null;gardenRender();if(!state.gardenIntroSeen){clearInterval(gardenTimer);modal(`<div class="intro-animal">${animal('bunny')}</div><h2>${t('Giúp hoa tìm đúng chậu nhé!','Help each flower find its pot!')}</h2><p>${t('Mỗi chậu là một phép tính em cần ôn. Hoa mang đáp án. Kéo hoa vào chậu đúng — hoa sẽ nở! Em cũng có thể kéo chậu sang hoa.','Each pot holds a question to review. Flowers carry answers. Drag a flower to its matching pot and watch it bloom! You can also drag a pot to a flower.')}</p><div class="notice">${t('Trên điện thoại: chạm hoa, rồi chạm chậu để ghép. Nhìn viền xanh để biết câu đang tính giờ.','On a phone: tap a flower, then a pot. The green outline shows the question being timed.')}</div>`,()=>{state.gardenIntroSeen=true;save();gardenActivate(garden.questions[garden.offset].id)})}else gardenActivate(garden.questions[garden.offset].id);translate()};
function gardenPage(){return garden.questions.slice(garden.offset,garden.offset+garden.perPage)}
function gardenRender(){clearInterval(gardenTimer);gardenSelection=null;const qs=gardenPage();if(!garden.answers||garden.pageOffset!==garden.offset){garden.answers=shuffle(qs.map(q=>({id:q.id,answer:q.answer})));garden.pageOffset=garden.offset}$('#app').innerHTML=`<div class="garden-shell"><div class="garden-heading"><div><span class="eyebrow">${t('ÔN CÂU SAI · VƯỜN HOA ĐÁP ÁN','MISTAKE REVIEW · THE ANSWER GARDEN')}</span><h1>${t('Ghép đúng, hoa nở.','Match it. Watch it bloom.')}</h1></div><div class="garden-buddy">${animal(buddy())}</div></div><div class="garden-toolbar"><span class="garden-count">${t('Đã ôn','Reviewed')} <b>${garden.done.size}/${garden.questions.length}</b></span><span class="garden-lives" id="gardenLives" aria-label="${garden.lives} ${t('mạng','lives')}">${Array.from({length:3},(_,i)=>`<span class="heart ${i<garden.lives?'full':''}">♡</span>`).join('')}</span><span id="gardenClock" class="timer"></span></div><div class="progress"><div style="width:${garden.done.size/garden.questions.length*100}%"></div></div><p class="garden-instruction">${t('Kéo hoa vào chậu đúng. Hoặc chạm một bên, rồi chạm bên kia.','Drag a flower to its matching pot. Or tap one side, then the other.')}</p><div class="garden-board"><div class="garden-column pots-column"><div class="garden-column-label"><span>01</span>${t('Chậu phép tính','Question pots')}</div>${qs.map((q,i)=>`<button class="garden-item pot-item ${garden.done.has(q.id)?'matched':''}" data-match-kind="pot" data-match-id="${q.id}" aria-label="${esc(q.q)}" ${garden.done.has(q.id)?'disabled':''}><span class="pot-scene">${garden.done.has(q.id)?gardenFlower(true,i):''}${gardenPot()}</span><span class="pot-equation">${(q.q||'').includes('?')?(garden.done.has(q.id)?mathMarkup(q.q.replace('?',q.answer)):mathMarkup(q.q)):`${mathMarkup(q.q)}<small>${garden.done.has(q.id)?'= '+mathMarkup(q.answer):'= ?'}</small>`}</span>${garden.done.has(q.id)?'<span class="match-check">✓</span>':''}</button>`).join('')}</div><div class="garden-column flowers-column"><div class="garden-column-label"><span>02</span>${t('Hoa đáp án','Answer flowers')}</div>${garden.answers.map((a,i)=>`<button class="garden-item flower-item ${garden.used.has(a.id)?'used':''}" data-match-kind="flower" data-match-id="${a.id}" aria-label="${t('Đáp án','Answer')} ${esc(a.answer)}" ${garden.used.has(a.id)?'disabled':''}>${gardenFlower(false,i)}<span class="flower-answer">${mathMarkup(a.answer)}</span><span class="drag-handle" aria-hidden="true">⠿</span></button>`).join('')}</div></div><div class="garden-footer"><span>${t('Ghép sai hoặc hết giờ: mất 1 mạng. Hết mạng sẽ có hướng dẫn.','A wrong match or timeout costs a life. Guidance appears when lives run out.')}</span><button id="gardenHelp">${t('Xem cách chơi','How to play')}</button></div></div>`;$$('[data-match-kind]').forEach(card=>{if(card.disabled)return;card.onpointerdown=e=>gardenPointer(e,card);card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();gardenChoose(card.dataset.matchKind,card.dataset.matchId)}}});$('#gardenHelp').onclick=()=>{gardenPause();modal(`<h2>${t('Cùng ghép hoa nhé','Let’s match the flowers')}</h2><p>${t('Chọn một phép tính bên trái, tìm kết quả ở bông hoa bên phải. Kéo hai thẻ lại với nhau, hoặc chạm lần lượt vào chúng. Chỉ những câu sai của em xuất hiện ở đây.','Choose a question on the left and find its answer on the right. Drag the two cards together or tap them in turn. Only your mistakes appear here.')}</p>`,()=>gardenResume())};translate()}
function gardenPause(){clearInterval(gardenTimer);if(garden?.active&&garden.deadline)garden.remaining[garden.active]=Math.max(.1,(garden.deadline-performance.now())/1000);garden.deadline=0}
function gardenResume(){if(view!=='garden'||!garden||session.done)return;let q=garden.questions.find(q=>q.id===garden.active&&!garden.done.has(q.id))||gardenPage().find(q=>!garden.done.has(q.id));if(q)gardenActivate(q.id)}
function gardenActivate(id){if(view!=='garden'||garden.busy||garden.done.has(id))return;gardenPause();garden.active=id;const q=garden.questions.find(q=>q.id===id);const budget=garden.remaining[id]??q.config?.seconds??15;garden.deadline=performance.now()+budget*1000;$$('.pot-item').forEach(b=>b.classList.toggle('timed',b.dataset.matchId===id));function update(){if(view!=='garden'){clearInterval(gardenTimer);return}const seconds=Math.max(0,(garden.deadline-performance.now())/1000);if($('#gardenClock'))$('#gardenClock').textContent=seconds.toFixed(1)+'s';if(seconds<=0){clearInterval(gardenTimer);gardenError(q,true)}}update();gardenTimer=setInterval(update,100)}
function gardenChoose(kind,id){if(garden.busy||view!=='garden')return;if(kind==='pot')gardenActivate(id);if(gardenSelection&&gardenSelection.kind!==kind){const potId=kind==='pot'?id:gardenSelection.id,flowerId=kind==='flower'?id:gardenSelection.id;gardenSelection=null;gardenMatch(potId,flowerId);return}gardenSelection={kind,id};$$('[data-match-kind]').forEach(b=>{const selected=b.dataset.matchKind===kind&&b.dataset.matchId===id;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected))})}
function gardenPointer(e,card){if(e.button!==0||garden.busy||card.disabled)return;e.preventDefault();const startX=e.clientX,startY=e.clientY;let moving=false;card.setPointerCapture(e.pointerId);card.onpointermove=ev=>{if(Math.hypot(ev.clientX-startX,ev.clientY-startY)>8&&!moving){moving=true;gardenGhost=card.cloneNode(true);gardenGhost.classList.add('garden-ghost');gardenGhost.removeAttribute('data-match-kind');gardenGhost.removeAttribute('data-match-id');gardenGhost.style.width=card.offsetWidth+'px';document.body.append(gardenGhost);card.classList.add('dragging')}if(gardenGhost){gardenGhost.style.left=ev.clientX+'px';gardenGhost.style.top=ev.clientY+'px';$$('.drop-target').forEach(x=>x.classList.remove('drop-target'));const target=document.elementFromPoint(ev.clientX,ev.clientY)?.closest('[data-match-kind]');if(target&&!target.disabled&&target.dataset.matchKind!==card.dataset.matchKind)target.classList.add('drop-target')}};card.onpointerup=ev=>{card.onpointermove=null;card.onpointerup=null;card.onpointercancel=null;gardenGhost?.remove();gardenGhost=null;card.classList.remove('dragging');$$('.drop-target').forEach(x=>x.classList.remove('drop-target'));if(moving){const target=document.elementFromPoint(ev.clientX,ev.clientY)?.closest('[data-match-kind]');if(target&&!target.disabled&&target.dataset.matchKind!==card.dataset.matchKind){const pot=card.dataset.matchKind==='pot'?card:target,flower=card.dataset.matchKind==='flower'?card:target;gardenMatch(pot.dataset.matchId,flower.dataset.matchId)}}else gardenChoose(card.dataset.matchKind,card.dataset.matchId)};card.onpointercancel=()=>{gardenGhost?.remove();gardenGhost=null;card.classList.remove('dragging');$$('.drop-target').forEach(x=>x.classList.remove('drop-target'))}}
function gardenMatch(potId,flowerId){if(garden.busy||garden.done.has(potId)||garden.used.has(flowerId))return;const q=garden.questions.find(q=>q.id===potId),flower=garden.answers.find(a=>a.id===flowerId);if(!q||!flower)return;gardenPause();garden.active=potId;if(q.answer!==flower.answer){gardenError(q,false);return}garden.busy=true;chime(true);garden.done.add(potId);garden.used.add(flowerId);state.mistakes=state.mistakes.filter(x=>x.id!==q.id);state.xp+=5;const completedPage=gardenPage().every(x=>garden.done.has(x.id));save();const pot=$(`[data-match-kind="pot"][data-match-id="${potId}"]`),bud=$(`[data-match-kind="flower"][data-match-id="${flowerId}"]`);pot.classList.remove('timed','selected');pot.classList.add('matched','bloom-now');pot.disabled=true;pot.querySelector('.pot-scene').insertAdjacentHTML('afterbegin',gardenFlower(true,garden.answers.indexOf(flower)));pot.querySelector('.pot-equation small').innerHTML='= '+mathMarkup(q.answer);pot.insertAdjacentHTML('beforeend','<span class="match-check">✓</span>');bud.classList.add('used');bud.disabled=true;$$('.selected').filter(x=>x.matches('[data-match-kind]')).forEach(x=>x.classList.remove('selected'));$('.garden-count b').textContent=`${garden.done.size}/${garden.questions.length}`;$('.garden-shell .progress>div').style.width=garden.done.size/garden.questions.length*100+'%';setTimeout(()=>{if(view!=='garden')return;garden.busy=false;if(gardenPage().every(x=>garden.done.has(x.id))){garden.offset+=garden.perPage;if(garden.offset>=garden.questions.length){session.done=true;gardenFinish();return}modal(`<h2>${t('Một góc vườn đã nở hoa!','Your little garden is blooming!')}</h2><p>${t('Cùng chăm những bông hoa tiếp theo nhé. Mỗi câu ôn đúng giúp em nhớ bài lâu hơn!','Let’s care for the next flowers. Each reviewed question strengthens your memory!')}</p>`,()=>{gardenRender();gardenResume()})}else gardenResume()},800)}
function gardenError(q,timeout){if(garden.busy)return;gardenPause();garden.busy=true;garden.lives--;garden.remaining[q.id]=q.config?.seconds||15;chime(false);if(garden.lives<=0){modal(`<div class="intro-animal">${animal('bunny')}</div><h2>${t('Mimi cùng em tính lại nhé','Let’s work it out with Mimi')}</h2><p class="worked-example">${mathMarkup(hint(q)).replace(/\n/g,'<br>')}</p><p>${t('Em nhận lại 3 mạng, tiếp tục chăm vườn hoa nhé.','Your 3 lives are restored. Keep growing your garden.')}</p>`,()=>{garden.lives=3;garden.busy=false;gardenRender();gardenResume()})}else{modal(`<h2>${timeout?t('Hết giờ câu này rồi','Time is up for this question'):t('Chưa đúng chậu rồi','Not quite the right pot')}</h2><p>${t('Không sao, mình thử lại nhé. Em còn','That’s okay. Try again! You have')} ${garden.lives} ${t('mạng.','lives.')}</p>`,()=>{garden.busy=false;gardenRender();gardenResume()})}}
function gardenFinish(){clearInterval(gardenTimer);garden.active=null;$('#app').innerHTML=`<div class="narrow card garden-finish"><div class="finished-bouquet">${gardenFlower(true,0)}${gardenFlower(true,1)}${gardenFlower(true,2)}</div><span class="eyebrow">${t('KHU VƯỜN ĐÃ NỞ HOA','YOUR GARDEN IS IN BLOOM')}</span><h1>${t('Em đã làm được rồi!','You did it!')}</h1><p>${t('Đã ôn đúng','Reviewed')} <b>${garden.done.size}</b> ${t('câu từng làm sai. Một khu vườn nhỏ, một bước tiến lớn.','previously missed questions. A little garden, a big step forward.')}</p><p class="reward-label">${t('Em đã ôn xong câu sai. Cùng tiếp tục học nhé.','Your mistakes are reviewed. Keep learning!')}</p><div class="actions"><button class="primary" onclick="nav('setup')">${t('Luyện lượt mới','Practice again')}</button><button onclick="nav('home')">${t('Về trang chủ','Back to Home')}</button></div></div>`;translate()}
const navBeforeGarden=nav;nav=function(v){if(view==='garden'&&session&&!session.done){if(!confirm(t('Rời vườn hoa? Những câu đã ôn đúng vẫn được lưu.','Leave the garden? Completed matches will remain saved.')))return;session.done=true}if(view==='garden'){clearInterval(gardenTimer);gardenGhost?.remove();gardenGhost=null}navBeforeGarden(v)};
function home(){}
function setup(){
  if(state.mistakes.length){
    $('#app').innerHTML=`<div class="narrow card"><div class="intro-animal">${animal(buddy())}</div><h2>${t('Cùng chăm những chậu hoa còn lại nhé!','Let’s help the remaining flowers bloom!')}</h2><p>${state.mistakes.length} ${t('câu cần ôn. Sai bao nhiêu câu, mình ghép bấy nhiêu chậu.','questions to review. Each missed question gets its own pot.')}</p><button class="primary wide" onclick="startReview()">${t('Vào vườn hoa','Visit the flower garden')}</button></div>`;
    return;
  }
  const curGrade = config.grade && NUMI_GRADES[config.grade] ? config.grade : 'custom';
  const gradeInfo = NUMI_GRADES[curGrade];
  const chosenTypes = config.types || [config.type || 'natural'];
  const chosenDigits = config.digits || [1];
  let activeLevel = curGrade === 'custom' ? 'custom' : (curGrade >= 6 ? 'secondary' : 'primary');

  function renderGradeButtons(lvl, current){
    if(lvl === 'custom'){
      return `<div class="grade-custom-banner"><div><b>${t('Chế độ Tùy chỉnh tự do','Free Custom Mode')}</b><p>${t('Tự do kết hợp phép tính (+, −, ×, ÷), loại số và số chữ số ở các mục 1–5 bên dưới.','Freely combine operations (+, −, ×, ÷), number types and digits in sections 1–5 below.')}</p></div></div>`;
    }
    const grades = lvl === 'secondary' ? [6,7,8,9] : [1,2,3,4,5];
    return grades.map(g=>`<button type="button" class="grade-tab ${current===g?'active':''}" data-grade="${g}">${lang==='vi'?NUMI_GRADES[g].name:NUMI_GRADES[g].enName}</button>`).join('');
  }

  $('#app').innerHTML=`<div class="narrow">
    <div class="guide-bubble">${animal(buddy())}<div><b>${t('Mình chọn bài rồi cùng học nhé!','Pick your questions and let’s learn!')}</b><p>${t('Chọn nhanh theo Lớp học hoặc tùy ý điều chỉnh bên dưới.','Quickly select by Grade or customize freely below.')}</p></div></div>
    
    <div class="grade-picker-box card">
      <div class="grade-header">
        <span class="grade-title">${t('Lớp học theo chuẩn GDPT 2018:','Grade level (Curriculum Grades 1–9):')}</span>
        <span class="grade-badge" id="gradeActiveBadge">${gradeInfo ? (lang==='vi'?gradeInfo.name:gradeInfo.enName) : t('Tùy chỉnh','Custom')}</span>
      </div>
      <div class="level-seg-control" role="tablist" aria-label="${t('Bậc học','Education level')}">
        <button type="button" class="level-seg-btn ${activeLevel==='primary'?'active':''}" data-level="primary" role="tab" aria-selected="${activeLevel==='primary'}">${t('Tiểu học <span class="seg-sub">(Lớp 1–5)</span>','Primary <span class="seg-sub">(Grades 1–5)</span>')}</button>
        <button type="button" class="level-seg-btn ${activeLevel==='secondary'?'active':''}" data-level="secondary" role="tab" aria-selected="${activeLevel==='secondary'}">${t('THCS <span class="seg-sub">(Lớp 6–9)</span>','Secondary <span class="seg-sub">(Grades 6–9)</span>')}</button>
        <button type="button" class="level-seg-btn ${activeLevel==='custom'?'active':''}" data-level="custom" role="tab" aria-selected="${activeLevel==='custom'}">${t('Tùy chỉnh','Custom')}</button>
      </div>
      <div class="grade-subgrid" id="gradeSubgrid">
        ${renderGradeButtons(activeLevel, curGrade)}
      </div>
      <p class="grade-desc" id="gradeDesc">${gradeInfo ? (lang==='vi'?gradeInfo.descVi:gradeInfo.descEn) : t('Tùy ý kết hợp các phép tính, loại số và số chữ số.','Freely combine operations, number types and digits.')}</p>
    </div>

    <form id="config" class="card lesson-settings">
      <fieldset>
        <legend><span>1</span>${t('Em muốn tính gì?','What shall we practice?')}</legend>
        <div class="checks operation-picks">
          ${['+','−','×','÷'].map((symbol,i)=>`<label><input type="checkbox" name="op" value="${['+','-','*','/'][i]}" ${config.ops.includes(['+','-','*','/'][i])?'checked':''}><span>${symbol}</span></label>`).join('')}
        </div>
      </fieldset>
      
      <fieldset>
        <legend><span>2</span>${t('Chọn loại số','Choose number types')}</legend>
        <p class="settings-hint">${t('Chọn một hoặc nhiều loại để trộn câu hỏi.','Choose one or more to mix question types.')}</p>
        <div class="type-picks">
          ${[['natural','Số tự nhiên','Whole numbers'],['negative','Số âm','Negative numbers'],['decimal','Số thập phân','Decimals'],['fraction','Phân số','Fractions'],['remainder','Chia có dư','Division with remainders']].map(([key,vi,en])=>`<label><input type="checkbox" name="type" value="${key}" ${chosenTypes.includes(key)?'checked':''}><span>${t(vi,en)}</span></label>`).join('')}
        </div>
      </fieldset>

      <fieldset>
        <legend><span>3</span>${t('Số có mấy chữ số?','How many digits?')}</legend>
        <p class="settings-hint">${t('Chọn 2 nghĩa là số từ 10 đến 99. Chọn nhiều ô để trộn độ dài hai số.','Choose 2 for numbers from 10 to 99. Choose several to mix the lengths of both numbers.')}</p>
        <div class="digit-picks">
          ${[1,2,3,4,5,6].map(n=>`<label><input type="checkbox" name="digits" value="${n}" ${chosenDigits.includes(n)?'checked':''}><span>${n}</span></label>`).join('')}
          <button id="randomDigits" type="button">${t('Ngẫu nhiên 1–6','Random 1–6')}</button>
        </div>
        <p class="settings-hint small">${t('Thập phân: tính chữ số ở phần nguyên. Phân số: tính chữ số của tử số. Chia có dư luôn dùng phép chia.','Decimals: digits in the whole-number part. Fractions: digits in the numerator. Remainder questions always use division.')}</p>
      </fieldset>

      <fieldset class="session-size">
        <legend><span>4</span>${t('Mình luyện bao lâu?','How much shall we practice?')}</legend>
        <div class="formgrid">
          <div>
            <label for="lessonCount">${t('Số câu trong lượt luyện','Questions per session')}</label>
            <div class="chip-row">${[5,8,10,12,15,20].map(n=>`<button type="button" data-count="${n}">${n}</button>`).join('')}</div>
            <input id="lessonCount" name="count" type="number" min="1" max="100" value="${config.count||10}" required inputmode="numeric" aria-describedby="countHelp">
            <small id="countHelp">${t('Chọn nhanh hoặc nhập từ 1–100 câu.','Pick above or enter 1–100 questions.')}</small>
          </div>
          <div>
            <label for="lessonSeconds">${t('Số giây mỗi câu','Seconds per question')}</label>
            <div class="chip-row">${[15,25,30,40,45,60].map(n=>`<button type="button" data-seconds="${n}">${n}s</button>`).join('')}</div>
            <input id="lessonSeconds" name="seconds" type="number" min="5" max="120" value="${config.seconds||15}" required inputmode="numeric" aria-describedby="secondsHelp">
            <small id="secondsHelp">${t('Chọn nhanh hoặc nhập từ 5–120 giây.','Pick above or enter 5–120 seconds.')}</small>
          </div>
        </div>
      </fieldset>

      <fieldset class="answer-mode-fieldset">
        <legend><span>5</span>${t('Cách trả lời','Answer mode')}</legend>
        <div class="type-picks">
          <label><input type="radio" name="inputMode" value="choices" ${config.inputMode!=='numpad'?'checked':''}><span>${t('Trắc nghiệm (4 đáp án)','Multiple choice (4 options)')}</span></label>
          <label><input type="radio" name="inputMode" value="numpad" ${config.inputMode==='numpad'?'checked':''}><span>${t('Tự luận (Gõ phím / Bấm số)','Free input (Keyboard / Numpad)')}</span></label>
        </div>
      </fieldset>

      <div id="lessonSummary" class="lesson-summary" aria-live="polite"></div>
      <button type="submit" class="primary wide">${t('Bắt đầu học','Let’s start')} →</button>
      <p class="settings-hint small">${t('Câu sai tự vào vườn hoa. Không cần chọn số chậu.','Missed questions automatically become flower pots. No pot settings needed.')}</p>
    </form>
    <div class="setup-sticky-cta" id="setupStickyBar">
      <div class="setup-sticky-meta">
        <span id="stickyGradePill" class="sticky-grade-pill">${config.grade && NUMI_GRADES[config.grade] ? (lang==='vi'?NUMI_GRADES[config.grade].name:NUMI_GRADES[config.grade].enName) : t('Tùy chỉnh','Custom')}</span>
        <span id="stickySummaryText" class="sticky-sub-text">${config.count||10} ${t('câu','questions')} · ${config.seconds||15}s</span>
      </div>
      <button type="button" id="stickyStartBtn" class="primary setup-sticky-btn">${t('Bắt đầu học','Start Practice')} →</button>
    </div>
  </div>`;

  const form=$('#config');
  function refresh(){
    const f=new FormData(form),count=+f.get('count'),seconds=+f.get('seconds'),digits=f.getAll('digits'),types=f.getAll('type'),ops=f.getAll('op'),modeLabel=f.get('inputMode')==='numpad'?t('Tự nhập','Numpad'):t('Trắc nghiệm','Choices');
    $$('[data-count]').forEach(b=>b.classList.toggle('chosen',+b.dataset.count===count));
    $$('[data-seconds]').forEach(b=>b.classList.toggle('chosen',+b.dataset.seconds===seconds));
    $('#randomDigits').classList.toggle('chosen',digits.length===6);
    const gradeBadge = config.grade && NUMI_GRADES[config.grade] ? (lang==='vi'?NUMI_GRADES[config.grade].name:NUMI_GRADES[config.grade].enName) : t('Tùy chỉnh','Custom');
    const isPresetGrade = Boolean(config.grade && NUMI_GRADES[config.grade]);
    $('#lessonSummary').textContent = isPresetGrade
      ? `${gradeBadge} · ${count} ${t('câu','questions')} · ${seconds}s/${t('câu','question')} · ${modeLabel}`
      : `${gradeBadge} · ${count} ${t('câu','questions')} · ${seconds}s/${t('câu','question')} · ${digits.length?digits.join(', ')+' '+t('chữ số','digits'):t('Chưa chọn chữ số','Choose digits')} · ${types.length} ${t('loại số','number types')} · ${modeLabel}`;
    if(ops.length===0)$('#lessonSummary').textContent+=' · '+t('Hãy chọn phép tính','Choose an operation');
    const stickyGrade=$('#stickyGradePill');
    const stickySub=$('#stickySummaryText');
    if(stickyGrade&&stickySub){
      stickyGrade.textContent=gradeBadge;
      stickySub.textContent=`${count} ${t('câu','qs')} · ${seconds}s`;
    }
  }

  function bindGradeEvents(){
    $$('.grade-tab').forEach(b=>b.onclick=()=>applyGrade(b.dataset.grade));
  }
  function updateLevelSegButtons(lvl){
    $$('.level-seg-btn').forEach(b=>{
      const isAct=b.dataset.level===lvl;
      b.classList.toggle('active',isAct);
      b.setAttribute('aria-selected',String(isAct));
    });
  }

  function applyGrade(gradeKey){
    if(gradeKey==='custom'||!NUMI_GRADES[gradeKey]){
      config.grade='custom';
      if(typeof window!=='undefined')window.config=config;
      if(typeof global!=='undefined')global.config=config;
      activeLevel='custom';
      updateLevelSegButtons('custom');
      const subgrid=$('#gradeSubgrid');
      if(subgrid)subgrid.innerHTML=renderGradeButtons('custom','custom');
      $('#gradeActiveBadge').textContent=t('Tùy chỉnh','Custom');
      $('#gradeDesc').textContent=t('Tùy ý kết hợp các phép tính, loại số và số chữ số.','Freely combine operations, number types and digits.');
      if(typeof window!=='undefined'&&typeof window.onGradeApplied==='function')window.onGradeApplied('custom');
      refresh();
      return;
    }
    const g=NUMI_GRADES[gradeKey];
    config.grade=g.id;
    config.ops=[...g.ops];
    config.types=[...g.types];
    config.type=g.types[0];
    config.digits=[...g.digits];
    config.count=g.count;
    config.seconds=g.seconds;
    config.inputMode=g.inputMode;
    if(typeof window!=='undefined')window.config=config;
    if(typeof global!=='undefined')global.config=config;
    activeLevel=g.id>=6?'secondary':'primary';
    updateLevelSegButtons(activeLevel);
    const subgrid=$('#gradeSubgrid');
    if(subgrid){
      subgrid.innerHTML=renderGradeButtons(activeLevel,g.id);
      bindGradeEvents();
    }
    $('#gradeActiveBadge').textContent=lang==='vi'?g.name:g.enName;
    $('#gradeDesc').textContent=lang==='vi'?g.descVi:g.descEn;
    $$('[name=op]').forEach(cb=>{cb.checked=g.ops.includes(cb.value)});
    $$('[name=type]').forEach(cb=>{cb.checked=g.types.includes(cb.value)});
    $$('[name=digits]').forEach(cb=>{cb.checked=g.digits.includes(+cb.value)});
    if($('#lessonCount'))$('#lessonCount').value=g.count;
    if($('#lessonSeconds'))$('#lessonSeconds').value=g.seconds;
    const r=$(`[name=inputMode][value="${g.inputMode}"]`);if(r)r.checked=true;
    if(typeof window!=='undefined'&&typeof window.onGradeApplied==='function')window.onGradeApplied(g.id);
    refresh();
  }
  if(typeof window!=='undefined')window.applyGrade=applyGrade;
  if(typeof global!=='undefined')global.applyGrade=applyGrade;

  $$('.level-seg-btn').forEach(btn=>{
    btn.onclick=()=>{
      const lvl=btn.dataset.level;
      if(lvl==='custom'){
        applyGrade('custom');
      }else if(lvl==='secondary'){
        const nextG = (config.grade>=6 && config.grade<=9) ? config.grade : 6;
        applyGrade(nextG);
      }else{
        const nextG = (config.grade>=1 && config.grade<=5) ? config.grade : 1;
        applyGrade(nextG);
      }
    };
  });
  bindGradeEvents();

  form.oninput=()=>{
    const f=new FormData(form),currentOps=f.getAll('op'),currentTypes=f.getAll('type'),currentDigits=f.getAll('digits').map(Number);
    const g=NUMI_GRADES[config.grade];
    if(g){
      const opsMatch=g.ops.length===currentOps.length&&g.ops.every(o=>currentOps.includes(o));
      const typesMatch=g.types.length===currentTypes.length&&g.types.every(t=>currentTypes.includes(t));
      const digitsMatch=g.digits.length===currentDigits.length&&g.digits.every(d=>currentDigits.includes(d));
      if(!opsMatch||!typesMatch||!digitsMatch){
        config.grade='custom';
        activeLevel='custom';
        updateLevelSegButtons('custom');
        const subgrid=$('#gradeSubgrid');
        if(subgrid)subgrid.innerHTML=renderGradeButtons('custom','custom');
        $('#gradeActiveBadge').textContent=t('Tùy chỉnh','Custom');
        $('#gradeDesc').textContent=t('Tùy ý kết hợp các phép tính, loại số và số chữ số.','Freely combine operations, number types and digits.');
        if(typeof window!=='undefined'&&typeof window.onGradeApplied==='function')window.onGradeApplied('custom');
      }
    }
    refresh();
  };
  form.onchange=form.oninput;
  $$('[data-count]').forEach(b=>b.onclick=()=>{$('#lessonCount').value=b.dataset.count;refresh()});
  $$('[data-seconds]').forEach(b=>b.onclick=()=>{$('#lessonSeconds').value=b.dataset.seconds;refresh()});
  $('#randomDigits').onclick=()=>{$$('[name=digits]').forEach(x=>x.checked=true);refresh()};
  form.onsubmit=e=>{
    e.preventDefault();
    const f=new FormData(form),ops=f.getAll('op'),types=f.getAll('type'),digits=f.getAll('digits').map(Number);
    if(!ops.length||!types.length||!digits.length){
      toast(t('Chọn ít nhất một phép tính, loại số và số chữ số nhé.','Choose at least one operation, number type and digit length.'));
      return;
    }
    config={...defaults,ops,types,type:types[0]||'natural',digits,count:+f.get('count'),seconds:+f.get('seconds'),inputMode:f.get('inputMode')||'choices',grade:config.grade,topic:config.topic||'all',topics:Array.isArray(config.topics)?[...config.topics]:[]};
    if(typeof window!=='undefined')window.config=config;
    if(typeof global!=='undefined')global.config=config;
    startQuiz();
  };
  const stickyBtn=$('#stickyStartBtn');
  if(stickyBtn){
    stickyBtn.onclick=()=>{
      if(form.requestSubmit)form.requestSubmit();
      else form.dispatchEvent(new Event('submit',{cancelable:true}));
    };
  }
  refresh();
}

// 4 distinct anti-guessing options for the special question kinds
function opts4(answer,cands,allowNegative){return antiTrickOptions(answer,cands,{allowNegative:!!allowNegative})}
// Grade 4 (GDPT 2018): add/subtract fractions only when one denominator divides the other.
function pickGrade4Denominator(da){
  // ~35% same denominator (learned first), the rest need one-step common denominator
  if(Math.random()<0.35)return da;
  const cands=[];
  for(let k=2;da*k<=24;k++)cands.push(da*k);          // multiples: 1/3 + 5/6
  for(let d=2;d<da;d++)if(da%d===0)cands.push(d);      // divisors: 5/6 + 1/3
  return cands.length?pick(cands):da;
}
function generate(c){
  const cfg=c||(typeof window!=='undefined'&&window.config)||config;
  const grade=cfg.grade?Number(cfg.grade):null;
  let allowedOps=cfg.ops?.length?cfg.ops:['+'];
  if(grade===1){
    allowedOps=allowedOps.filter(o=>o==='+'||o==='-');
    if(!allowedOps.length)allowedOps=['+'];
  }
  let allowedTypes=cfg.types?.length?cfg.types:[cfg.type||'natural'];
  if(grade===1||grade===2)allowedTypes=['natural'];
  else if(grade===3)allowedTypes=allowedTypes.filter(t=>t==='natural'||t==='remainder');
  if(!allowedTypes.length)allowedTypes=['natural'];

  let type=pick(allowedTypes);
  // Grade 3: division with remainder ~20–25% instead of 50%
  if(grade===3&&type==='remainder'&&Math.random()<0.55)type='natural';
  // Integers are the core of Grade 6 only; Grades 7–9 keep them as review
  if(grade===6&&allowedTypes.includes('negative')&&Math.random()<0.45){
    type='negative';
  }
  const digits=cfg.digits?.length?cfg.digits:null;
  let d1=digits?pick(digits):cfg.d1||1,d2=digits?pick(digits):cfg.d2||1;
  d1=Math.min(6,Math.max(1,d1));d2=Math.min(6,Math.max(1,d2));
  const range=d=>[10**(d-1),10**d-1],number=d=>ri(...range(d));
  let a=number(d1),b=number(d2);
  let op=type==='remainder'?'/':pick(allowedOps);

  if(grade===5&&Math.random()<0.28){
    if(Math.random()<0.55){
      const pct=pick([10,20,25,50,75]);
      const basePool=pct===25||pct===75?[4,8,12,16,20,40,80,100,120,200]:pct===20?[5,10,15,20,25,50,100,150,200]:[10,20,30,40,50,60,80,100,120,200];
      const base=pick(basePool);
      const val=(pct*base)/100;
      const ansStr=fmt(val);
      const qStr=t(`${pct}% của ${base}`,`${pct}% of ${base}`);
      const opts=smartDistractors(pct,base,'*','natural',val,fmt);
      const expText=`${qStr} = ${ansStr}\n• ${t(`Tính ${pct}% của ${base}: lấy ${base} × ${pct} ÷ 100 = ${ansStr}`,`Find ${pct}% of ${base}: ${base} × ${pct} ÷ 100 = ${ansStr}`)}`;
      return {id:uid(),q:qStr,answer:ansStr,options:opts,skill:'percent:%',config:{...cfg,type:'decimal',grade},explanation:expText};
    }else{
      const dec=Number((ri(1,95)/10).toFixed(1));
      const mul=pick([10,100]);
      const val=Math.round(dec*mul*100)/100;
      const ansStr=fmt(val);
      const qStr=`${fmt(dec)} × ${mul}`;
      const opts=smartDistractors(dec,mul,'*','natural',val,fmt);
      const shifts=mul===10?1:2;
      const expText=`${qStr} = ${ansStr}\n• ${t(`Nhân nhẩm số thập phân với ${mul}: chuyển dấu phẩy sang phải ${shifts} chữ số.`,`Multiply decimal by ${mul}: shift decimal point ${shifts} place(s) right.`)}`;
      return {id:uid(),q:qStr,answer:ansStr,options:opts,skill:'decimal:*',config:{...cfg,type:'decimal',grade},explanation:expText};
    }
  }
  if(grade===6&&Math.random()<0.15){
    const base=ri(2,9);
    const exp=base<=3?ri(2,4):base<=5?ri(2,3):2;
    const val=base**exp;
    const qStr=`${base}^${exp}`;
    const ansStr=String(val);
    const opts=new Set([ansStr,String(base*exp),String(val+base),String(Math.max(1,val-base)),String(val+1)]);
    const expText=`${qStr} = ${ansStr}\n• ${t(`Lũy thừa bậc ${exp} của ${base}: nhân ${exp} thừa số ${base} với nhau (${Array(exp).fill(base).join(' × ')} = ${ansStr}).`,`${base} to the power of ${exp}: multiply ${exp} factors of ${base} = ${ansStr}.`)}`;
    return {id:uid(),q:qStr,answer:ansStr,options:opts4(ansStr,[...opts],grade>=6),skill:'power:^',config:{...cfg,type:'natural',grade},explanation:expText};
  }
  if(grade===7&&Math.random()<0.3){
    const kind=pick(['sqrt','abs','alg','ratpow']);
    if(kind==='ratpow'){
      const [n,d]=pick([[1,2],[-1,2],[2,3],[-2,3],[1,3],[3,2],[3,4],[-3,4],[-1,3]]);
      const e=Math.abs(n)<=2&&d<=3&&Math.random()<0.5?3:2;
      const ansStr=frac(n**e,d**e);
      const qStr=`(${n}/${d})^${e}`;
      const opts=opts4(ansStr,[frac(n**e,d),frac(n,d**e),frac(-(n**e),d**e),frac(n*e,d*e),frac(n**e,d*e),frac(d**e,n**e),frac(n**e,d**e+1)],true);
      const expText=`${qStr} = ${n<0?`(${n})`:n}^${e} / ${d}^${e} = ${ansStr}\n• ${t('Lũy thừa của một thương: (a/b)ⁿ = aⁿ/bⁿ. Số âm mũ chẵn ra dương, mũ lẻ ra âm.','Power of a quotient: (a/b)ⁿ = aⁿ/bⁿ. A negative base gives + for even powers, − for odd.')}`;
      return {id:uid(),q:qStr,answer:ansStr,options:opts,skill:'power:rational',config:{...cfg,type:'fraction',grade},explanation:expText};
    }
    if(kind==='sqrt'){
      const root=ri(2,12),sq=root*root;
      const qStr=`√${sq}`,ansStr=String(root);
      const opts=new Set([ansStr,String(root+1),String(Math.max(1,root-1)),String(Math.round(sq/2)),String(root+2)]);
      const expText=`${qStr} = ${ansStr}\n• ${t(`Căn bậc hai số học của ${sq} là ${root} (vì ${root} > 0 và ${root}² = ${sq}).`,`Arithmetic square root of ${sq} is ${root} (since ${root}² = ${sq}).`)}`;
      return {id:uid(),q:qStr,answer:ansStr,options:opts4(ansStr,[...opts],grade>=6),skill:'sqrt:√',config:{...cfg,type:'natural',grade},explanation:expText};
    }else if(kind==='abs'){
      const a=-ri(3,25),b=ri(2,15),val=Math.abs(a)+b;
      const qStr=`|${a}| + ${b}`,ansStr=String(val);
      const opts=new Set([ansStr,String(a+b),String(Math.abs(a)-b),String(val+2),String(val-1)]);
      const expText=`${qStr} = ${Math.abs(a)} + ${b} = ${ansStr}\n• ${t(`Giá trị tuyệt đối của số âm là số đối dương: |${a}| = ${Math.abs(a)}.`,`Absolute value makes a negative number positive: |${a}| = ${Math.abs(a)}.`)}`;
      return {id:uid(),q:qStr,answer:ansStr,options:opts4(ansStr,[...opts],grade>=6),skill:'negative:abs',config:{...cfg,type:'negative',grade},explanation:expText};
    }else{
      const k=ri(2,5),c=ri(1,9),xVal=ri(2,8),val=k*xVal+c;
      const qStr=t(`Tính ${k}x + ${c} khi x = ${xVal}`,`Find ${k}x + ${c} when x = ${xVal}`);
      const ansStr=String(val);
      const opts=opts4(ansStr,[k+xVal+c,val+k,Math.max(1,val-k),k*(xVal+c)]);
      const expText=`${k} × ${xVal} + ${c} = ${k*xVal} + ${c} = ${ansStr}\n• ${t(`Thay x = ${xVal} vào biểu thức, thực hiện phép nhân trước rồi cộng.`,`Substitute x = ${xVal}, multiply first then add.`)}`;
      return {id:uid(),q:qStr,answer:ansStr,options:opts,skill:'algebra:eval',config:{...cfg,type:'natural',grade},explanation:expText};
    }
  }
  if(grade===8&&Math.random()<0.4){
    const kind=pick(['diffSq','sqSum','power','linEq']);
    if(kind==='linEq'){
      // GDPT 2018: phương trình bậc nhất một ẩn học ở Lớp 8
      const aCoef=ri(2,6),xRoot=ri(-6,9)||3,bConst=ri(2,18),rhs=aCoef*xRoot+bConst;
      const qStr=t(`Tìm x: ${aCoef}x + ${bConst} = ${rhs}`,`Solve: ${aCoef}x + ${bConst} = ${rhs}`);
      const ansStr=String(xRoot);
      const opts=opts4(ansStr,[xRoot+1,xRoot-1,-xRoot,xRoot+2],true);
      const expText=`${aCoef}x = ${rhs} − ${bConst} = ${rhs-bConst} → x = ${rhs-bConst} ÷ ${aCoef} = ${xRoot}\n• ${t('Chuyển vế đổi dấu rồi chia hai vế cho hệ số của x.','Isolate x by subtracting the constant, then divide by the coefficient.')}`;
      return {id:uid(),q:qStr,answer:ansStr,options:opts,skill:'equation:x',config:{...cfg,type:'negative',grade},explanation:expText};
    }
    if(kind==='diffSq'){
      const b=ri(2,15),diff=pick([10,20]),a=b+diff;
      const val=a*a-b*b;
      const qStr=`${a}^2 − ${b}^2`,ansStr=String(val);
      const opts=new Set([ansStr,String((a-b)*(a-b)),String(val+10),String(val-10),String(a+b)]);
      const expText=`${a}² − ${b}² = (${a} − ${b}) × (${a} + ${b}) = ${a-b} × ${a+b} = ${ansStr}\n• ${t('Áp dụng Hằng đẳng thức hiệu hai bình phương: a² − b² = (a − b)(a + b).','Difference of squares identity: a² − b² = (a − b)(a + b).')}`;
      return {id:uid(),q:qStr,answer:ansStr,options:opts4(ansStr,[...opts],grade>=6),skill:'identity:diffSq',config:{...cfg,type:'natural',grade},explanation:expText};
    }else if(kind==='sqSum'){
      const base=pick([20,30,40,50]),d=pick([-1,1,2,-2]),n=base+d,val=n*n;
      const qStr=`${n}^2`,ansStr=String(val);
      const opts=new Set([ansStr,String(base*base+d*d),String(val+10),String(val-10),String(n*2)]);
      const sign=d>0?'+':'−',ad=Math.abs(d);
      const expText=`${n}² = (${base} ${sign} ${ad})² = ${base}² ${sign} 2×${base}×${ad} + ${ad}² = ${base*base} ${sign} ${2*base*ad} + ${ad*ad} = ${ansStr}\n• ${t('Áp dụng Hằng đẳng thức bình phương của tổng/hiệu.','Apply square of sum/difference identity.')}`;
      return {id:uid(),q:qStr,answer:ansStr,options:opts4(ansStr,[...opts],grade>=6),skill:'identity:sq',config:{...cfg,type:'natural',grade},explanation:expText};
    }else{
      const base=type==='negative'&&Math.random()<0.5?(-ri(2,5)):ri(2,6);
      const exp=Math.abs(base)>=5?2:ri(2,3);
      const val=base**exp;
      const qStr=base<0?`(${base})^${exp}`:`${base}^${exp}`;
      const ansStr=String(val);
      const opts=new Set([ansStr,String(base*exp),String(-val),String(val+ri(1,3)),String(val-ri(1,3))]);
      opts.delete('');
      const expText=`${qStr} = ${ansStr}\n• ${t('Lũy thừa bậc '+exp+': nhân '+exp+' thừa số '+base+' với nhau.','Power of '+exp+': multiply '+exp+' factors of '+base+' together.')}`;
      return {id:uid(),q:qStr,answer:ansStr,options:opts4(ansStr,[...opts],grade>=6),skill:'power:^',config:{...cfg,type,grade},explanation:expText};
    }
  }
  if(grade===9&&Math.random()<0.36){
    const kind=pick(['sqrtCombo','simplify','cbrt','quad']);
    if(kind==='simplify'){
      const k=ri(2,6),m=pick([2,3,5,6,7]),inside=k*k*m;
      const qStr=t(`√${inside} = a√${m}. Tìm a`,`√${inside} = a√${m}. Find a`),ansStr=String(k);
      const opts=opts4(ansStr,[k+1,k*k,Math.max(2,k-1),m]);
      const expText=`√${inside} = √(${k*k} × ${m}) = ${k}√${m}\n• ${t('Đưa thừa số ra ngoài dấu căn: √(A²B) = A√B (A ≥ 0).','Take a factor out of the root: √(A²B) = A√B (A ≥ 0).')}`;
      return {id:uid(),q:qStr,answer:ansStr,options:opts,skill:'sqrt:simplify',config:{...cfg,type:'natural',grade},explanation:expText};
    }
    if(kind==='quad'){
      // Nhẩm nghiệm bằng Vi-ét: biết một nghiệm, tìm nghiệm còn lại
      let x1=ri(-5,9)||2,x2=ri(-5,9)||3;if(x1===x2)x2=x1+1;
      const S=x1+x2,P=x1*x2;
      const sx=S===0?'':S>0?` − ${S===1?'':S}x`:` + ${S===-1?'':-S}x`;
      const sp=P===0?'':P>0?` + ${P}`:` − ${-P}`;
      const eq=`x²${sx}${sp} = 0`;
      const qStr=t(`${eq} có một nghiệm x = ${x1}. Nghiệm còn lại?`,`${eq} has a root x = ${x1}. Find the other root.`);
      const ansStr=String(x2);
      const opts=opts4(ansStr,[-x2,S,P,x2+1],true);
      const expText=`${t('Vi-ét','Vieta')}: x₁ + x₂ = ${S} → x₂ = ${S} − (${x1}) = ${x2}\n• ${t('Với x² + bx + c = 0: tổng hai nghiệm = −b, tích = c.','For x² + bx + c = 0: sum of roots = −b, product = c.')}`;
      return {id:uid(),q:qStr,answer:ansStr,options:opts,skill:'equation:quad',config:{...cfg,type:'negative',grade},explanation:expText};
    }
    if(kind==='sqrtCombo'){
      const r1=ri(3,14),r2=ri(2,12),sign=pick(['+','-']);
      const val=sign==='+'?r1+r2:r1-r2;
      const qStr=`√${r1*r1} ${sign==='-'?'−':'+'} √${r2*r2}`,ansStr=String(val);
      const opts=new Set([ansStr,String(r1+r2+(sign==='-'?1:-1)),String(val+2),String(val-2),String(r1*r2)]);
      const expText=`${qStr} = ${r1} ${sign==='-'?'−':'+'} ${r2} = ${ansStr}\n• ${t(`Khai phương từng căn bậc hai: √${r1*r1} = ${r1} và √${r2*r2} = ${r2}.`,`Evaluate each square root first: √${r1*r1} = ${r1}, √${r2*r2} = ${r2}.`)}`;
      return {id:uid(),q:qStr,answer:ansStr,options:opts4(ansStr,[...opts],grade>=6),skill:'sqrt:√',config:{...cfg,type:'negative',grade},explanation:expText};
    }else if(kind==='cbrt'){
      const r=pick([-4,-3,-2,2,3,4,5]),cube=r*r*r;
      const qStr=`∛(${cube})`,ansStr=String(r);
      const opts=new Set([ansStr,String(-r),String(r+1),String(r-1),String(r*r)]);
      const expText=`∛(${cube}) = ${r}\n• ${t(`Căn bậc ba: vì (${r})³ = ${cube} nên ∛(${cube}) = ${r}.`,`Cube root: since (${r})³ = ${cube}, ∛(${cube}) = ${r}.`)}`;
      return {id:uid(),q:qStr,answer:ansStr,options:opts4(ansStr,[...opts],grade>=6),skill:'cbrt:∛',config:{...cfg,type:'negative',grade},explanation:expText};
    }
  }

  if(grade===1){
    if(op==='+'){
      const mode1=Math.random();
      if(mode1<0.3){
        a=ri(1,9);b=ri(1,10-a);
      }else if(mode1<0.55){
        a=ri(1,8)*10;b=ri(1,Math.floor((100-a)/10))*10;
      }else{
        const a10=ri(1,8),a1=ri(0,8);
        const b10=ri(0,9-a10),b1=ri(1,9-a1);
        a=a10*10+a1;b=b10*10+b1;
      }
    }else{
      const mode1=Math.random();
      if(mode1<0.3){
        a=ri(2,10);b=ri(1,a);
      }else if(mode1<0.55){
        a=ri(2,9)*10;b=ri(1,a/10-1)*10;
      }else{
        const a10=ri(1,9),a1=ri(1,9);
        const b10=ri(0,a10),b1=ri(0,a1);
        a=a10*10+a1;b=Math.max(1,b10*10+b1);
        if(b>a)b=a1;
      }
    }
  }else if(grade===2){
    if(op==='*'){
      const factor=pick([2,5]),other=ri(1,10);
      a=factor;b=other;
    }else if(op==='/'){
      const divisor=pick([2,5]),quotient=ri(1,10);
      a=divisor*quotient;b=divisor;
    }else if(op==='+'){
      if(Math.random()<0.3){
        a=ri(1,7)*100+pick([0,10,20,50]);b=ri(1,Math.max(1,Math.floor((950-a)/100)))*100;
      }else{
        a=ri(12,84);b=ri(5,Math.min(99-a,45));
      }
    }else if(op==='-'){
      if(Math.random()<0.3){
        a=ri(3,9)*100;b=ri(1,Math.floor(a/100)-1)*100;
      }else{
        a=ri(15,99);b=ri(4,a-1);
      }
    }
  }else if(grade===3){
    if(op==='*'&&type==='natural'){
      if(Math.random()<0.6){a=ri(2,9);b=ri(2,10);}
      else{a=ri(12,250);b=ri(2,9);}
    }else if(op==='/'&&type==='natural'){
      b=ri(2,9);
      const qMax=Math.random()<0.65?10:50;
      a=b*ri(2,qMax);
    }else if((op==='+'||op==='-')&&type==='natural'){
      a=ri(50,950);b=ri(20,op==='-'?a-10:450);
    }
  }else if(grade===4&&type==='natural'){
    if(op==='*'){a=ri(12,180);b=Math.random()<0.7?ri(2,9):pick([10,11,20,25,50]);}
    else if(op==='/'){b=Math.random()<0.7?ri(2,9):pick([10,11,12,15,20,25]);a=b*ri(3,45);}
  }else if(grade===5&&type==='natural'){
    // Grade 5 natural numbers: review at 3-digit level, × with "nice" factors
    if(op==='+'){a=ri(120,980);b=ri(110,890);}
    else if(op==='-'){a=ri(300,999);b=ri(110,a-50);}
    else if(op==='*'){a=ri(12,99);b=pick([2,3,4,5,6,7,8,9,10,11,25,100]);}
  }
  // Values set above by the grade blocks must not be re-randomised further down
  const preset=type==='natural'&&(
    grade===2||grade===3||
    (grade===4&&(op==='*'||op==='/'))||
    (grade===5&&op!=='/'));

  let answer,q,options=[],explanation='';
  const sym={'+':'+','-':'−','*':'×','/':'÷'}[op];
  if(type==='fraction'){
    let da=ri(2,12),db=ri(2,12);
    if(grade===4&&(op==='+'||op==='-'))db=pickGrade4Denominator(da);
    // Operands are always in lowest terms (no 8/2, 5/5 ...)
    const lowest=d=>{let n;do{n=ri(1,9)}while(gcd(n,d)>1);return n};
    let na=lowest(da),nb=lowest(db);
    if(grade>=6&&Math.random()<0.4)na=-na;
    if(grade>=6&&Math.random()<0.3)nb=-nb;
    if((grade===4||grade===5||!grade)&&op==='-'){
      if(na*db<nb*da){
        [na,nb]=[nb,na];
        [da,db]=[db,da];
      }
    }
    let n,d;
    if(op==='+'){n=na*db+nb*da;d=da*db}
    else if(op==='-'){n=na*db-nb*da;d=da*db}
    else if(op==='*'){n=na*nb;d=da*db}
    else{
      if(nb===0)nb=1;
      n=na*db;d=da*nb;
    }
    answer=frac(n,d);
    const opA=na<0?`(${na}/${da})`:`${na}/${da}`;
    const opB=nb<0?`(${nb}/${db})`:`${nb}/${db}`;
    q=`${opA} ${sym} ${opB}`;
    const opts=new Set([answer]);
    if(op==='-'&&Math.abs(da-db)>0)opts.add(frac(na-nb,Math.abs(da-db)));
    if(op==='*'&&da*nb>0)opts.add(frac(na*db,da*nb));
    opts.add(frac(n+1,d));opts.add(frac(n-1,d));opts.add(frac(n+d,d));opts.add(frac(Math.abs(n-d),d));
    for(let i=1;opts.size<4&&i<50;i++){
      opts.add(frac(n+i,d));
      opts.add(frac(n-i,d));
    }
    options=antiTrickOptions(answer,[...opts],{allowNegative:grade>=6});
    explanation=detailedExplanation(q,na,nb,op,type,answer,sym);
  }else if(type==='remainder'){
    const divisor=ri(2,9);
    const maxQuotient=(grade===3||d1<=2)?ri(3,25):ri(10,50);
    const quotient=maxQuotient;
    const r=ri(1,divisor-1);
    a=divisor*quotient+r;
    b=divisor;
    answer=`${quotient} ${t('dư','r')} ${r}`;
    q=`${a} ÷ ${b}`;
    // Every option keeps a valid remainder (< divisor) and shares parts with the answer, so none can be ruled out at a glance
    const R=(qq,rr)=>`${qq} ${t('dư','r')} ${rr}`;
    const otherR=[];for(let x=1;x<divisor;x++)if(x!==r)otherR.push(x);
    const pool=[R(quotient+1,r),R(quotient-1,r),R(quotient+10,r),R(quotient-10,r)].filter(s=>!/^-|^0 /.test(s));
    if(otherR.length)pool.push(R(quotient,pick(otherR)),R(quotient+1,pick(otherR)),R(quotient-1,pick(otherR)));
    options=[answer,...shuffle(pool.filter(s=>!/^-|^0 /.test(s))).filter((s,i,a)=>a.indexOf(s)===i&&s!==answer).slice(0,3)];
    explanation=detailedExplanation(q,a,b,op,type,answer,sym);
  }else{
    // Grades 5–9: keep numbers mental-math sized (× by a 1-digit factor, decimals ≤ 2 integer digits)
    if(grade>=5&&!preset){
      if(op==='*'){d1=Math.min(d1,2);d2=1;a=number(d1);b=Math.max(2,number(1));}
      else if(type==='decimal'){d1=Math.min(d1,2);d2=Math.min(d2,2);a=number(d1);b=number(d2);}
    }
    if(op==='/'&&!preset){
      // Dividend has more digits than divisor and quotient ≥ 2, so no trivial x ÷ x = 1
      if(d1<d2)[d1,d2]=[d2,d1];
      if(grade)d2=Math.min(d2,2);
      if(d1===d2)d1=Math.min(6,d2+1);
      const [lo,hi]=range(d1);
      b=Math.max(2,number(d2));
      const low=Math.max(2,Math.ceil(lo/b));
      let high=Math.max(low,Math.floor(hi/b));
      if(grade)high=Math.max(low,Math.min(high,25));
      a=b*ri(low,high);
      if(type==='decimal'){
        b=pick([2,4,5,10]);
        const cleanQuotient=ri(11,250)/10;
        a=Number((cleanQuotient*b).toFixed(2));
      }
    }else if(type==='decimal'){
      a+=ri(1,9)/10;b+=ri(1,9)/10;
      // decimal × decimal of two 2-digit numbers is too heavy: multiply by a whole digit or by 0,x
      if(op==='*'&&grade>=5)b=Math.random()<0.7?ri(2,9):ri(1,9)/10;
    }
    if(type==='negative'){
      a=-a;if(Math.random()<.5)b=-b;
    }
    if(op==='-'&&(type==='natural'||((grade<6||!grade)&&type==='decimal'))&&a<b)[a,b]=[b,a];
    const val=op==='+'?a+b:op==='-'?a-b:op==='*'?a*b:a/b;
    const display=n=>{
      const precision=type==='decimal'?(op==='/'?Math.max(4,d2):op==='*'?2:1):0;
      return Number(n.toFixed(precision)).toLocaleString(lang==='vi'?'vi-VN':'en-US',{useGrouping:false,maximumFractionDigits:precision});
    };
    answer=display(val);
    const operand=n=>n<0?'('+display(n)+')':display(n);
    q=`${operand(a)} ${sym} ${operand(b)}`;
    options=smartDistractors(a,b,op,type,val,display);
    explanation=detailedExplanation(q,a,b,op,type,answer,sym);
  }
  return {id:uid(),q,answer,options:shuffle(options),skill:type+':'+op,config:{...cfg,type,grade},explanation};
}
if(typeof window!=='undefined')window.generate=generate;
if(typeof global!=='undefined')global.generate=generate;

initializeZoo();
