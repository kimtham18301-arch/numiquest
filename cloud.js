'use strict';
let cloudSession=null,cloudReady=false,cloudRevision=null,cloudDirty=false,cloudTimer=null,cloudBusy=false,cloudRecovering=false,cloudStatus='local';
const CLOUD_SESSION_KEY='numi-cloud-session-v1',CLOUD_OWNER_KEY='numi-cloud-owner-v1';

const NUMI_MIN_PIN=6; // shortest PIN/password accepted when creating or changing one
function currentAuthUser(){
  if(cloudSession&&cloudSession.user){
    // Username accounts linked to cloud keep their local profile (name, role, grade) as the identity.
    try{
      const saved=JSON.parse(localStorage.getItem('numi-current-user-v1')||'null');
      if(saved&&saved.username&&String(cloudSession.user.email||'').toLowerCase()===saved.username+'@numiquick.app')return saved;
    }catch{}
  }
  if(cloudSession&&cloudSession.user)return {type:'cloud',id:cloudSession.user.id,name:cloudSession.user.email,username:cloudSession.user.email,email:cloudSession.user.email,avatar:state.buddy||'bunny'};
  try{
    const saved=JSON.parse(localStorage.getItem('numi-current-user-v1')||'null');
    if(saved&&saved.username)return saved;
  }catch{}
  return null;
}

function getLocalUsers(){
  try{
    const users=JSON.parse(localStorage.getItem('numi-local-users-v1')||'{}')||{};
    let changed=false;
    if(!users['admin']){
      users['admin']={
        username:'admin',
        name:'Quản trị viên (Admin)',
        hash:'144e7cab4a51c153fd3a64384b0edb1feb5190470f3f4d3f0ac352137bd04347',
        role:'admin',
        avatar:'lion',
        grade:5,
        createdAt:new Date().toISOString(),
        lastLoginAt:null,
        loginCount:0
      };
      changed=true;
    }
    // Seed sample students only once so deleting students stays permanent
    if(Object.keys(users).length===1&&!localStorage.getItem('numi-sample-seeded-v1')){
      const defaultStudentHash='77efd557dd7880dfc9b22f85c497f6b76682ed594bb6fe1ac87463a47179272c';
      users['minhkhoi']={username:'minhkhoi',name:'Minh Khôi',hash:defaultStudentHash,role:'student',avatar:'fox',grade:4,createdAt:new Date(Date.now()-86400000*5).toISOString(),lastLoginAt:new Date(Date.now()-3600000*2).toISOString(),loginCount:8};
      users['baoan']={username:'baoan',name:'Bảo An',hash:defaultStudentHash,role:'student',avatar:'bunny',grade:2,createdAt:new Date(Date.now()-86400000*3).toISOString(),lastLoginAt:new Date(Date.now()-3600000*12).toISOString(),loginCount:4};
      users['haidang']={username:'haidang',name:'Hải Đăng',hash:defaultStudentHash,role:'student',avatar:'panda',grade:7,createdAt:new Date(Date.now()-86400000*7).toISOString(),lastLoginAt:new Date(Date.now()-3600000*26).toISOString(),loginCount:12};
      try{localStorage.setItem('numi-sample-seeded-v1','1')}catch{}
      changed=true;
      try{
        if(!localStorage.getItem('numi-user-state-minhkhoi')){
          localStorage.setItem('numi-user-state-minhkhoi', JSON.stringify({
            version:1,lang:'vi',name:'Minh Khôi',buddy:'fox',xp:380,best:850,pieces:{},mastery:{},streak:{count:5,lastDate:new Date().toISOString().slice(0,10)},
            history:[
              {date:new Date(Date.now()-3600000*48).toISOString(),mode:'practice',correct:10,total:10,time:8.5,extra:0},
              {date:new Date(Date.now()-3600000*24).toISOString(),mode:'practice',correct:13,total:15,time:7.2,extra:1},
              {date:new Date(Date.now()-3600000*2).toISOString(),mode:'practice',correct:14,total:15,time:6.8,extra:0}
            ],
            mistakes:[{id:'m1',q:'3/4 + 1/2',answer:'5/4',options:['5/4','4/6','3/6','7/4'],config:{seconds:20,type:'fraction'},explanation:'Quy đồng mẫu số chung là 4: 3/4 + 2/4 = 5/4',skill:'fraction:+'}]
          }));
        }
        if(!localStorage.getItem('numi-user-state-baoan')){
          localStorage.setItem('numi-user-state-baoan', JSON.stringify({
            version:1,lang:'vi',name:'Bảo An',buddy:'bunny',xp:160,best:720,pieces:{},mastery:{},streak:{count:3,lastDate:new Date().toISOString().slice(0,10)},
            history:[
              {date:new Date(Date.now()-3600000*20).toISOString(),mode:'practice',correct:9,total:10,time:10.2,extra:0},
              {date:new Date(Date.now()-3600000*12).toISOString(),mode:'practice',correct:10,total:10,time:9.1,extra:0}
            ],
            mistakes:[]
          }));
        }
        if(!localStorage.getItem('numi-user-state-haidang')){
          localStorage.setItem('numi-user-state-haidang', JSON.stringify({
            version:1,lang:'vi',name:'Hải Đăng',buddy:'panda',xp:560,best:950,pieces:{},mastery:{},streak:{count:7,lastDate:new Date().toISOString().slice(0,10)},
            history:[
              {date:new Date(Date.now()-3600000*50).toISOString(),mode:'practice',correct:14,total:15,time:6.2,extra:0},
              {date:new Date(Date.now()-3600000*26).toISOString(),mode:'practice',correct:15,total:15,time:5.4,extra:0}
            ],
            mistakes:[{id:'m2',q:'(-15) − (-8)',answer:'-7',options:['-7','-23','7','23'],config:{seconds:15,type:'negative'},explanation:'Trừ số nguyên là cộng với số đối: (-15) + 8 = -7',skill:'negative:-'}]
          }));
        }
      }catch{}
    }
    if(changed)saveLocalUsers(users);
    return users;
  }catch{return{}}
}
function saveLocalUsers(users){
  try{localStorage.setItem('numi-local-users-v1',JSON.stringify(users))}catch{}
}

function sha256Fallback(str){
  const bytes=new TextEncoder().encode(str);
  const K=[
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
  ];
  const H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const bitLen=bytes.length*8;
  const padLen=((bytes.length+9+63)>>6)<<6;
  const padded=new Uint8Array(padLen);
  padded.set(bytes);
  padded[bytes.length]=0x80;
  const dv=new DataView(padded.buffer);
  dv.setUint32(padLen-8,Math.floor(bitLen/0x100000000),false);
  dv.setUint32(padLen-4,bitLen>>>0,false);
  const W=new Uint32Array(64);
  const rotr=(x,n)=>(x>>>n)|(x<<(32-n));
  for(let off=0;off<padLen;off+=64){
    for(let i=0;i<16;i++)W[i]=dv.getUint32(off+i*4,false);
    for(let i=16;i<64;i++){
      const s0=rotr(W[i-15],7)^rotr(W[i-15],18)^(W[i-15]>>>3);
      const s1=rotr(W[i-2],17)^rotr(W[i-2],19)^(W[i-2]>>>10);
      W[i]=(W[i-16]+s0+W[i-7]+s1)>>>0;
    }
    let [a,b,c,d,e,f,g,h]=H;
    for(let i=0;i<64;i++){
      const S1=rotr(e,6)^rotr(e,11)^rotr(e,25);
      const ch=(e&f)^(~e&g);
      const t1=(h+S1+ch+K[i]+W[i])>>>0;
      const S0=rotr(a,2)^rotr(a,13)^rotr(a,22);
      const maj=(a&b)^(a&c)^(b&c);
      const t2=(S0+maj)>>>0;
      h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;
    }
    H[0]=(H[0]+a)>>>0;H[1]=(H[1]+b)>>>0;H[2]=(H[2]+c)>>>0;H[3]=(H[3]+d)>>>0;
    H[4]=(H[4]+e)>>>0;H[5]=(H[5]+f)>>>0;H[6]=(H[6]+g)>>>0;H[7]=(H[7]+h)>>>0;
  }
  return H.map(v=>v.toString(16).padStart(8,'0')).join('');
}

function legacyFbHash(pwd){
  const s=String(pwd||'');
  let h=0x811c9dc5;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193);}
  return 'fb_'+(h>>>0).toString(16);
}

async function hashPassword(pwd){
  const s=String(pwd||'');
  const salted='numi_salt_v1:'+s;
  const subtle=(typeof window!=='undefined'&&window.crypto&&window.crypto.subtle)||(typeof crypto!=='undefined'&&crypto&&crypto.subtle)||null;
  if(subtle){
    try{
      const buf=await subtle.digest('SHA-256',new TextEncoder().encode(salted));
      return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
    }catch{}
  }
  return sha256Fallback(salted);
}

async function localSignIn(username,password){
  const users=getLocalUsers(),key=String(username||'').trim().toLowerCase();
  const user=users[key];
  if(!user)throw Error(t('Không tìm thấy tài khoản này. Vui lòng kiểm tra lại hoặc tạo tài khoản mới.','Account not found. Please check or create a new account.'));
  const hash=await hashPassword(password);
  const isMatch=(user.hash===hash)||(user.hash===legacyFbHash(password))||(user.password&&user.password===password);
  if(!isMatch)throw Error(t('Mật khẩu chưa đúng. Em thử lại nhé!','Incorrect password. Please try again!'));
  delete user.password;
  user.hash=hash;
  user.lastLoginAt=new Date().toISOString();
  user.loginCount=(user.loginCount||0)+1;
  if(String(password||'').length<NUMI_MIN_PIN)user.weakPin=true; // remembered so a page reload cannot skip the change
  saveLocalUsers(users);
  const role=user.role||(user.username==='admin'?'admin':'student');
  const activeUser={id:user.username,username:user.username,name:user.name,avatar:user.avatar||'bunny',grade:user.grade||1,role,type:'local'};
  localStorage.setItem('numi-current-user-v1',JSON.stringify(activeUser));
  try{
    localStorage.setItem('numi-buddy-profile-v1',JSON.stringify({name:user.name,avatar:user.avatar||'bunny'}));
    const savedState=JSON.parse(localStorage.getItem('numi-user-state-'+user.username)||'null');
    if(savedState&&validBackup(savedState)){
      state={...fresh(),...savedState};
      lang=state.lang==='en'?'en':'vi';
    }else{
      state={...fresh(),name:user.name,buddy:user.avatar||'bunny'};
    }
    if(typeof window!=='undefined')window.state=state;if(typeof global!=='undefined')global.state=state;
    save();
  }catch{
    state={...fresh(),name:user.name,buddy:user.avatar||'bunny'};
    if(typeof window!=='undefined')window.state=state;if(typeof global!=='undefined')global.state=state;
  }
  if(user.grade&&typeof NUMI_GRADES!=='undefined'&&NUMI_GRADES[user.grade]){
    const gDef=NUMI_GRADES[user.grade];
    config={...defaults,...gDef,grade:gDef.id,ops:[...gDef.ops],types:[...gDef.types],type:gDef.types[0],digits:[...gDef.digits]};
    if(typeof window!=='undefined')window.config=config;if(typeof global!=='undefined')global.config=config;
  }
  cloudBadge();
  nav(role==='admin'?'admin':role==='teacher'?'teacher':'home');
  toast(t('Chào mừng '+user.name+' đã trở lại!','Welcome back, '+user.name+'!'));
  if(user.weakPin)forcePinChange();
}

// Accounts made before v2.5.3 may still have a 4-digit PIN: they must pick a 6+ character one before studying.
function forcePinChange(){
  if(typeof document==='undefined'||!$('#modal'))return;
  modal(`<h2>${t('Đổi mã PIN mới','Choose a new PIN')}</h2>
    <p class="muted">${t('Mã PIN của em đang quá ngắn. Hãy đặt mã mới có ít nhất 6 ký tự để bảo vệ tiến độ học tập nhé!','Your PIN is too short. Please choose a new one with at least 6 characters to protect your progress!')}</p>
    <form id="forcePinForm">
      <input type="password" id="forcePin1" minlength="6" required autocomplete="new-password" placeholder="${t('Mã PIN mới','New PIN')}" style="width:100%;font-size:17px;padding:10px;margin:8px 0;border-radius:10px;border:1.5px solid #d5e4c7">
      <input type="password" id="forcePin2" minlength="6" required autocomplete="new-password" placeholder="${t('Nhập lại mã PIN','Repeat PIN')}" style="width:100%;font-size:17px;padding:10px;margin:8px 0;border-radius:10px;border:1.5px solid #d5e4c7">
      <p id="forcePinMsg" class="danger" role="status" style="margin:6px 0;font-weight:700"></p>
      <div class="actions"><button type="submit" class="primary">${t('Lưu mã PIN','Save PIN')}</button><button type="button" id="forcePinSignOut">${t('Đăng xuất','Sign out')}</button></div>
    </form>`);
  $('#forcePinSignOut').onclick=()=>{$('#modal').close();localSignOut()};
  $('#forcePinForm').onsubmit=async e=>{
    e.preventDefault();
    const p1=$('#forcePin1').value.trim(),p2=$('#forcePin2').value.trim(),msg=$('#forcePinMsg');
    if(p1.length<NUMI_MIN_PIN){msg.textContent=t('Mã PIN cần ít nhất 6 ký tự.','PIN must be at least 6 characters.');return}
    if(p1!==p2){msg.textContent=t('Hai mã PIN chưa khớp.','The two PINs do not match.');return}
    try{await updateUserPassword(p1);$('#modal').close();toast(t('Đã đổi mã PIN. Nhớ mã mới nhé!','PIN changed. Remember your new PIN!'))}
    catch(err){msg.textContent=err.message||t('Chưa đổi được mã PIN. Thử lại nhé.','Could not change the PIN. Please try again.')}
  };
}
function checkWeakPinOnLoad(){
  const u=currentAuthUser();
  if(u&&getLocalUsers()[u.username]?.weakPin)forcePinChange();
}

async function localSignUp(name,username,password,avatar='bunny',grade=1){
  name=String(name||'').trim().slice(0,30);
  if(!name)throw Error(t('Vui lòng nhập tên của em.','Please enter your name.'));
  username=String(username||'').trim().toLowerCase().replace(/\s+/g,'');
  if(!username||username.length<2)throw Error(t('Tên đăng nhập cần ít nhất 2 ký tự.','Username must be at least 2 characters.'));
  if(!/^[a-z0-9_.-]+$/.test(username))throw Error(t('Tên đăng nhập chỉ gồm chữ cái không dấu, số hoặc dấu gạch.','Username can only contain letters, numbers, or dashes.'));
  if(!password||password.length<NUMI_MIN_PIN)throw Error(t('Mật khẩu / PIN cần ít nhất 6 ký tự.','Password / PIN must be at least 6 characters.'));
  grade=Number(grade)||1;
  const users=getLocalUsers();
  if(users[username])throw Error(t('Tên đăng nhập này đã có bạn dùng rồi. Hãy chọn tên khác nhé!','This username is already taken. Please choose another!'));
  const hash=await hashPassword(password);
  users[username]={username,name,hash,avatar,grade,role:'student',createdAt:new Date().toISOString()};
  saveLocalUsers(users);
  const activeUser={id:username,username,name,avatar,grade,type:'local'};
  localStorage.setItem('numi-current-user-v1',JSON.stringify(activeUser));
  try{localStorage.setItem('numi-buddy-profile-v1',JSON.stringify({name,avatar}))}catch{}
  state={...fresh(),name,buddy:avatar};
  save();
  localStorage.setItem('numi-user-state-'+username,JSON.stringify(state));
  if(typeof NUMI_GRADES!=='undefined'&&NUMI_GRADES[grade]){
    const gDef=NUMI_GRADES[grade];
    config={...defaults,...gDef,grade:gDef.id,ops:[...gDef.ops],types:[...gDef.types],type:gDef.types[0],digits:[...gDef.digits]};
    if(typeof window!=='undefined')window.config=config;if(typeof global!=='undefined')global.config=config;
  }
  cloudBadge();
  nav('home');
  toast(t('Tài khoản đã tạo thành công! Chào mừng '+name+'!','Account created! Welcome, '+name+'!'));
}

async function localSignOut(){
  const u=currentAuthUser();
  if(u&&u.type==='local'){
    try{localStorage.setItem('numi-user-state-'+u.username,JSON.stringify(state))}catch{}
  }
  if(cloudSession){
    try{await cloudRequest('/auth/v1/logout','POST',{})}catch{}
    cloudSession=null;
    localStorage.removeItem(CLOUD_SESSION_KEY);
  }
  localStorage.removeItem('numi-current-user-v1');
  state=fresh();
  stop();session=null;
  save();
  cloudBadge();
  openAccount('login');
  toast(t('Đã đăng xuất. Hẹn gặp lại em!','Signed out. See you next time!'));
}

function cloudConfigured(){const c=window.NUMI_CLOUD_CONFIG||{};if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(c.url||''))return false;const key=c.publishableKey||'';if(key.startsWith('sb_publishable_'))return true;try{const jwt=JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));return jwt.role==='anon'}catch{return false}}
function cloudBase(){return window.NUMI_CLOUD_CONFIG.url.replace(/\/$/,'')}
function cloudStoreSession(s){cloudSession=s?{access_token:s.access_token,refresh_token:s.refresh_token,expires_at:s.expires_at||Math.floor(Date.now()/1000)+(s.expires_in||3600),user:s.user}:null;try{if(cloudSession)localStorage.setItem(CLOUD_SESSION_KEY,JSON.stringify(cloudSession));else localStorage.removeItem(CLOUD_SESSION_KEY)}catch{}cloudBadge()}
function cloudBadge(){
  const button=$('#accountButton');
  const u=currentAuthUser();
  document.body?.classList?.toggle('not-logged-in',!u);
  $$('nav button').forEach(b=>{b.disabled=!u&&b.dataset.view!=='guide'&&b.id!=='navMoreBtn'});
  const adminNav=$('#navAdminBtn');
  const sheetAdmin=$('#sheetAdminItem');
  const isAdmin=Boolean(u&&(u.role==='admin'||u.username==='admin'));
  const isTeacher=Boolean(u&&u.role==='teacher');
  const isManager=isAdmin||isTeacher;
  document.body?.classList?.toggle('is-admin-mode',isAdmin);
  document.body?.classList?.toggle('is-teacher-mode',isTeacher);
  if(adminNav){
    adminNav.style.display=isAdmin?'':'none';
  }
  if(sheetAdmin){
    sheetAdmin.style.display=isAdmin?'flex':'none';
  }
  ['home','setup','atlas','stats'].forEach(v=>{
    const navBtn=$(`nav button[data-view="${v}"]`);
    if(navBtn)navBtn.style.display=isManager?'none':'';
  });
  const sheetAtlas=$('[data-sheet-view="atlas"]');
  if(sheetAtlas)sheetAtlas.style.display=isManager?'none':'';
  const footerLocal=$('footer .local');
  if(footerLocal){
    const viTxt=u?`Đã đăng nhập: ${u.name} · Tiến độ lưu tự động trên thiết bị`:'Lưu trên thiết bị · Đăng nhập để bảo vệ tiến độ học';
    const enTxt=u?`Signed in: ${u.name} · Progress auto-saved on device`:'Saved on this device · Sign in to save progress';
    footerLocal.dataset.vi=viTxt;
    footerLocal.dataset.en=enTxt;
    footerLocal.textContent=lang==='en'?enTxt:viTxt;
  }
  if(!button)return;
  if(u){
    const shortLabel=isAdmin?t('Quản trị','Admin'):isTeacher?u.name:u.name;
    button.innerHTML=`<b class="account-btn-label">${esc(shortLabel)}</b>`;
    button.title=u.name;
    button.classList.add('is-logged-in');
    button.dataset.status=cloudSession?cloudStatus:'local';
  }else{
    button.innerHTML=`<b>${t('Đăng nhập','Sign in')}</b>`;
    button.title=t('Vui lòng đăng nhập để bắt đầu học','Please sign in to start learning');
    button.classList.remove('is-logged-in');
    button.dataset.status='unauthenticated';
  }
}
async function cloudRequest(path,method='GET',body=null,authorized=true,extraHeaders={}){const headers={apikey:window.NUMI_CLOUD_CONFIG.publishableKey,'Content-Type':'application/json',...extraHeaders};if(authorized&&cloudSession)headers.Authorization='Bearer '+cloudSession.access_token;const res=await fetch(cloudBase()+path,{method,headers,body:body===null?undefined:JSON.stringify(body)});const text=await res.text();let data;try{data=text?JSON.parse(text):null}catch{data=null}if(!res.ok){const error=Error(res.status===401?t('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.','Your session expired. Please sign in again.'):res.status===429?t('Đang có nhiều yêu cầu. Hãy thử lại sau ít phút.','Too many requests. Please try again shortly.'):res.status===400?t('Chưa đăng nhập được. Kiểm tra email, mật khẩu hoặc xác nhận email.','Could not sign in. Check your email, password or email confirmation.'):t('Chưa kết nối được nơi lưu trực tuyến.','Could not connect to online storage.'));error.status=res.status;throw error}return data}
async function cloudRefresh(){if(!cloudSession)throw Error('session');if(cloudSession.expires_at>Date.now()/1000+60)return;const s=await cloudRequest('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:cloudSession.refresh_token},false);cloudStoreSession(s)}
async function cloudGetRow(){await cloudRefresh();const uid=cloudSession.user.id;const rows=await cloudRequest('/rest/v1/numi_progress?user_id=eq.'+encodeURIComponent(uid)+'&select=payload,revision,updated_at');return rows?.[0]||null}
function cloudQueue(){if(!cloudSession||!cloudReady)return;cloudDirty=true;clearTimeout(cloudTimer);cloudTimer=setTimeout(()=>cloudPush().catch(()=>{}),1200)}
async function cloudPush(){if(!cloudReady||!cloudSession||cloudBusy||!cloudDirty)return;cloudBusy=true;cloudDirty=false;cloudStatus='saving';cloudBadge();const snapshot=JSON.parse(JSON.stringify(state));try{await cloudRefresh();const uid=cloudSession.user.id;let rows;if(cloudRevision===null){rows=await cloudRequest('/rest/v1/numi_progress','POST',{user_id:uid,payload:snapshot,revision:1},true,{Prefer:'return=representation'})}else{rows=await cloudRequest('/rest/v1/numi_progress?user_id=eq.'+encodeURIComponent(uid)+'&revision=eq.'+cloudRevision,'PATCH',{payload:snapshot,revision:cloudRevision+1,updated_at:new Date().toISOString()},true,{Prefer:'return=representation'})}if(!rows?.[0]){cloudReady=false;cloudDirty=true;cloudStatus='conflict';cloudBadge();return}cloudRevision=rows[0].revision;localStorage.setItem(CLOUD_OWNER_KEY,JSON.stringify({uid,revision:cloudRevision}));cloudStatus='saved'}catch(e){cloudDirty=true;if(e.status===409){cloudReady=false;cloudStatus='conflict'}else cloudStatus='offline'}finally{cloudBusy=false;cloudBadge();if(cloudDirty&&cloudReady&&cloudStatus==='saved')cloudQueue()}}
const saveBeforeCloud=save;
save=function(){
  saveBeforeCloud();
  const u=currentAuthUser();
  if(u&&u.type==='local'){
    try{localStorage.setItem('numi-user-state-'+u.username,JSON.stringify(state))}catch{}
  }
  cloudQueue();
  try{window.dispatchEvent(new Event('numi-saved'))}catch{}
};
function cloudStatusText(){return cloudSession?(cloudStatus==='saved'?t('Đã lưu trực tuyến.','Saved online.'):cloudStatus==='saving'?t('Đang lưu trực tuyến…','Saving online…'):cloudStatus==='conflict'?t('Có bản lưu mới từ thiết bị khác. Chọn bản muốn tiếp tục bên dưới.','A newer save exists on another device. Choose which one to continue.'):cloudStatus==='offline'?t('Chưa lưu lên mạng. Kết quả vẫn có trên thiết bị; kết nối lại để đồng bộ.','Not saved online yet. Progress is on this device; reconnect to sync.'):t('Kết quả hiện được lưu trên thiết bị.','Progress is currently saved on this device.')):t('Tài khoản học sinh được lưu an toàn trên máy này.','Student account is saved securely on this device.')}

function updateUserProfile(updates={}){
  const u=currentAuthUser();
  if(!u)return;
  const users=getLocalUsers(),username=u.username;
  if(!users[username])users[username]={...u};
  if(updates.name){
    const cleanName=String(updates.name).trim().slice(0,30);
    if(cleanName){
      u.name=cleanName;users[username].name=cleanName;
      if(typeof state!=='undefined'){state.name=cleanName;}
      if(typeof global!=='undefined'&&global.state){global.state.name=cleanName;}
      if(typeof window!=='undefined'&&window.state){window.state.name=cleanName;}
    }
  }
  if(updates.avatar){
    const valid=['bunny','panda','fox','lion'];
    if(valid.includes(updates.avatar)){
      u.avatar=updates.avatar;users[username].avatar=updates.avatar;
      if(typeof state!=='undefined'){state.buddy=updates.avatar;}
      if(typeof global!=='undefined'&&global.state){global.state.buddy=updates.avatar;}
      if(typeof window!=='undefined'&&window.state){window.state.buddy=updates.avatar;}
    }
  }
  if(updates.grade){
    const g=Number(updates.grade);
    if(g>=1&&g<=9){
      u.grade=g;users[username].grade=g;
      if(typeof NUMI_GRADES!=='undefined'&&NUMI_GRADES[g]){
        const gDef=NUMI_GRADES[g];
        config={...defaults,...gDef,grade:gDef.id,ops:[...gDef.ops],types:[...gDef.types],type:gDef.types[0],digits:[...gDef.digits]};
        if(typeof window!=='undefined')window.config=config;if(typeof global!=='undefined')global.config=config;
      }
    }
  }
  saveLocalUsers(users);
  localStorage.setItem('numi-current-user-v1',JSON.stringify(u));
  try{localStorage.setItem('numi-buddy-profile-v1',JSON.stringify({name:u.name,avatar:u.avatar}))}catch{}
  save();
  cloudBadge();
  return u;
}

async function updateUserPassword(newPassword){
  const u=currentAuthUser();
  if(!u)throw Error(t('Chưa đăng nhập.','Not signed in.'));
  const pwd=String(newPassword||'').trim();
  if(!pwd||pwd.length<NUMI_MIN_PIN)throw Error(t('Mật khẩu / Mã PIN cần ít nhất 6 ký tự.','Password / PIN must be at least 6 characters.'));
  const users=getLocalUsers(),username=u.username;
  if(!users[username])throw Error(t('Không tìm thấy tài khoản.','Account not found.'));
  // Change the online password first: if that fails, keep the old PIN everywhere so devices stay in step.
  if(cloudSession&&String(cloudSession.user?.email||'').toLowerCase()===cloudEmail(username)){
    await cloudRefresh();
    await cloudRequest('/auth/v1/user','PUT',{password:cloudPassword(pwd)});
  }
  users[username].hash=await hashPassword(pwd);
  delete users[username].password; // never keep the PIN as plain text on the device
  users[username].passwordChanged=true;
  delete users[username].weakPin;
  saveLocalUsers(users);
  return true;
}

function renderProfile(){
  const u=currentAuthUser();
  if(!u){
    stop();view='profile';document.body.dataset.view='profile';
    $$('nav button').forEach(b=>b.classList.toggle('active',b.dataset.view==='profile'));
    $('#app').innerHTML=`<section class="narrow card profile-gate-card">
      <div class="intro-animal">${animal('bunny')}</div>
      <span class="eyebrow">NUMIQUICK · ${t('HỒ SƠ CÁ NHÂN','STUDENT PROFILE')}</span>
      <h1>${t('Đăng nhập để xem hồ sơ của em','Sign in to view your profile')}</h1>
      <p class="muted">${t('Xem cấp độ, chuỗi ngày học, điểm kinh nghiệm và bộ sưu tập huy hiệu của riêng em.','Track your level, streak, experience points and badge collection.')}</p>
      <div class="actions" style="margin-top:20px">
        <button class="primary wide" onclick="openAccount('login')">${t('Đăng nhập vào học','Sign in to learn')} →</button>
        <button class="wide" onclick="openAccount('signup')" style="margin-top:8px">${t('Tạo tài khoản mới','Create new account')}</button>
        <button class="wide" onclick="nav('home')" style="margin-top:8px">${t('Về trang chủ','Back to home')}</button>
      </div>
    </section>`;
    translate();
    window.scrollTo(0,0);
    return;
  }

  if(u.role==='admin'||u.username==='admin'){
    if(typeof renderAdmin==='function'){renderAdmin();return;}
  }

  stop();view='profile';document.body.dataset.view='profile';
  $$('nav button').forEach(b=>b.classList.toggle('active',b.dataset.view==='profile'));

  const tea=typeof teaState==='function'?teaState():{pearls:0,size:'S'};
  const goal=(typeof teaSizes!=='undefined'&&teaSizes[tea.size])||20;
  const streak=getStreak();
  const h=state.history||[];
  const totalSessions=h.length;
  const totalAnswered=h.reduce((a,b)=>a+(b.total||0),0);
  const totalCorrect=h.reduce((a,b)=>a+(b.correct||0),0);
  const accuracy=totalAnswered>0?Math.round((totalCorrect/totalAnswered)*100):100;
  const avgSpeed=h.length>0?(h.reduce((a,b)=>a+(b.time||0),0)/h.length).toFixed(1):'0.0';
  const curGrade=u.grade?Number(u.grade):(config.grade||1);
  const allLocalUsers=getLocalUsers();
  const isAdmin=u.role==='admin'||u.username==='admin';
  const isTeacher=u.role==='teacher';

  const badgesList=[
    {id:'first_step',icon:'🌱',titleVi:'Khởi đầu tự tin',titleEn:'Confident Start',descVi:'Hoàn thành bài luyện tập đầu tiên',descEn:'Complete your first practice session',unlocked:totalSessions>=1},
    {id:'streak_3',icon:'🔥',titleVi:'Chiến thần kiên trì',titleEn:'Streak Master',descVi:'Học liên tục 3 ngày giữ lửa',descEn:'Keep a 3-day daily streak',unlocked:streak.count>=3},
    {id:'fast_speed',icon:'⚡',titleVi:'Phản xạ thần tốc',titleEn:'Fast Reflexes',descVi:'Tốc độ trung bình dưới 5s/câu',descEn:'Average speed under 5s/question',unlocked:totalSessions>=1&&parseFloat(avgSpeed)>0&&parseFloat(avgSpeed)<=5.0},
    {id:'garden_bloom',icon:'🌼',titleVi:'Bác sĩ vườn hoa',titleEn:'Flower Healer',descVi:'Sửa sạch hết câu sai trong Vườn hoa',descEn:'Clear all pending mistakes in Garden',unlocked:totalSessions>=1&&state.mistakes.length===0}
  ];

  $('#app').innerHTML=`<section class="profile-view">
    ${isAdmin ? `<div class="card admin-shortcut-card">
      <div class="admin-shortcut-content">
        <div>
          <h3>${t('BẢNG QUẢN TRỊ VIÊN HỆ THỐNG','ADMINISTRATOR CONTROL PANEL')}</h3>
          <p class="muted">${t('Kiểm soát danh sách học sinh, ai đã đăng nhập và tiến độ làm bài.','Monitor all students, login times, and learning progression.')}</p>
        </div>
      </div>
      <button type="button" class="primary wide" onclick="nav('admin')">${t('Mở Trung tâm Quản trị →','Open Admin Dashboard →')}</button>
    </div>` : ''}

    <div class="profile-bento-grid" ${(isAdmin||isTeacher)?'style="grid-template-columns:1fr"':''}>
      <div class="profile-bento-col-left">
        <div class="card profile-header-card">
          <div class="profile-avatar-wrap">
            <div class="profile-avatar">${animal(u.avatar||buddy())}</div>
          </div>
          <span class="eyebrow">NUMIQUICK · ${isAdmin?t('HỒ SƠ QUẢN TRỊ VIÊN','ADMINISTRATOR PROFILE'):isTeacher?t('HỒ SƠ GIÁO VIÊN','TEACHER PROFILE'):t('HỒ SƠ HỌC SINH','STUDENT PROFILE')}</span>
          <h1 class="profile-name">
            <span id="profileNameText">${esc(u.name)}</span>
            <button type="button" class="profile-edit-name-btn" id="editNameBtn" title="${t('Đổi tên hiển thị','Change display name')}">Sửa</button>
          </h1>
          <p class="profile-username">@${esc(u.username)} · <span class="profile-joined">${isAdmin?t('Quản trị viên hệ thống','System Administrator'):isTeacher?t('Giáo viên phụ trách lớp','Classroom Teacher'):t('Thành viên NumiQuick','NumiQuick Learner')}</span></p>

          ${(isAdmin||isTeacher)?'':`<div class="profile-field-group">
            <label class="profile-field-label">${t('Lớp học của em:','Current Grade Level:')}</label>
            <div class="profile-grade-chips">
              ${[1,2,3,4,5,6,7,8,9].map(g=>`<button type="button" class="profile-grade-chip ${curGrade===g?'active':''}" data-set-grade="${g}">${lang==='vi'?NUMI_GRADES[g].name:NUMI_GRADES[g].enName}</button>`).join('')}
            </div>
          </div>

          <div class="profile-field-group">
            <label class="profile-field-label">${t('Bạn thú đồng hành:','Choose Study Buddy:')}</label>
            <div class="profile-buddy-chips">
              ${[['bunny','Thỏ Mimi'],['panda','Gấu Baobao'],['fox','Cáo Kiki'],['lion','Sư tử Leo']].map(([av,lbl])=>`<button type="button" class="profile-buddy-chip ${(u.avatar||'bunny')===av?'active':''}" data-set-avatar="${av}"><div class="buddy-chip-icon">${(typeof numiAnimalOriginal==='function'?numiAnimalOriginal:animal)(av)}</div><span>${lbl}</span></button>`).join('')}
            </div>
          </div>`}
        </div>

        <div class="card profile-password-card">
          <div class="profile-pwd-header">
            <h3>${t('Mật khẩu & Mã PIN của em','My Password & PIN')}</h3>
            <p class="muted">${t('Dùng để đăng nhập và bảo vệ tiến độ học tập của em.','Use this PIN/Password to sign in and protect your learning progress.')}</p>
          </div>

          <p class="muted" style="margin:8px 0 14px;font-size:12px">${t('Mật khẩu được mã hóa nên không xem lại được. Quên mật khẩu thì nhờ Thầy/Cô hoặc bố mẹ đặt lại giúp em nhé.','Your password is encrypted and cannot be shown. If you forget it, ask your teacher or parent to reset it.')}</p>

          <div class="change-pwd-box">
            <h4 style="margin:0 0 10px;font-size:14px;color:#284632;font-weight:800">
              ${t('Đổi mã PIN / Mật khẩu mới','Change PIN / New password')}
            </h4>
            <form id="changePinForm" class="profile-pin-form">
              <div class="profile-pwd-fields-grid">
                <label>${t('Mật khẩu mới (tối thiểu 6 ký tự)','New password (min 6 characters)')}
                  <div class="pwd-input-wrap">
                    <input type="password" id="newPinInput" minlength="6" required placeholder="${t('Ví dụ: 123456 hoặc bonghoa','e.g. 123456 or flower')}">
                    <button type="button" class="pwd-eye-btn" data-toggle-eye="newPinInput" title="${t('Hiện/ẩn mật khẩu','Toggle visibility')}">${t('Hiện','Show')}</button>
                  </div>
                </label>
                <label>${t('Nhập lại mật khẩu mới','Confirm new password')}
                  <div class="pwd-input-wrap">
                    <input type="password" id="confirmPinInput" minlength="6" required placeholder="${t('Nhập lại mật khẩu mới','Confirm new password')}">
                    <button type="button" class="pwd-eye-btn" data-toggle-eye="confirmPinInput" title="${t('Hiện/ẩn mật khẩu','Toggle visibility')}">${t('Hiện','Show')}</button>
                  </div>
                </label>
              </div>
              <p id="pinMessage" class="danger" role="status" style="margin:8px 0;font-weight:700"></p>
              <button type="submit" class="primary" id="saveNewPwdBtn" style="margin-top:8px">${t('Lưu mật khẩu mới','Save new password')}</button>
            </form>
          </div>
        </div>

        <div class="card profile-settings-card">
          <h3>${t('Tùy chỉnh giao diện & Âm thanh','Display & Sound Settings')}</h3>
          <div class="profile-quick-prefs">
            <div class="pref-row">
              <span>${t('Giao diện màu sắc:','Color Theme:')}</span>
              <div class="pref-theme-chips">
                ${Object.keys(typeof NUMI_THEMES!=='undefined'?NUMI_THEMES:{}).map(k=>`<button type="button" class="theme-chip ${document.body.dataset.theme===k?'active':''}" data-theme-pick="${k}">${NUMI_THEMES[k].name}</button>`).join('')}
              </div>
            </div>
            <div class="pref-row">
              <span>${t('Âm thanh vui nhộn:','Sound effects:')}</span>
              <button type="button" id="profileSoundToggle" class="profile-btn-pill">
                ${soundEnabled?t('Đang bật','On'):t('Đang tắt','Off')}
              </button>
            </div>
          </div>
        </div>

        <div class="profile-bottom-actions card profile-actions-card">
          ${isAdmin ? `
            <button class="primary wide" onclick="nav('admin')">${t('Trung tâm Quản trị Học sinh','Student Admin Center')} →</button>
          ` : isTeacher ? `
            <button class="primary wide" onclick="nav('teacher')">🏫 ${t('Quay lại Lớp học của tôi','Back to My Classroom')} →</button>
          ` : `
            <button class="primary wide" onclick="nav('setup')">${t('Vào luyện tập ngay','Start practicing now')} →</button>
          `}
          <button id="profileSignOutBtn" class="danger wide" style="margin-top:12px">${t('Đăng xuất tài khoản','Sign out')}</button>
        </div>
      </div>

      ${(isAdmin || isTeacher) ? '' : `<div class="profile-bento-col-right">
        <div class="profile-stats-grid">
          <div class="profile-stat-box card">
            <div class="stat-info"><small>${t('Cấp độ','Level')}</small><strong>${level()}</strong></div>
          </div>
          <div class="profile-stat-box card">
            <div class="stat-info"><small>${t('Điểm XP','XP Score')}</small><strong>${state.xp}</strong></div>
          </div>
          <div class="profile-stat-box card">
            <div class="stat-info"><small>${t('Chuỗi ngày','Daily Streak')}</small><strong>${streak.count} ${t('ngày','days')}</strong></div>
          </div>
          <div class="profile-stat-box card">
            <div class="stat-info"><small>${t('Chính xác','Accuracy')}</small><strong>${accuracy}%</strong></div>
          </div>
        </div>

        <div class="card profile-perf-card">
          <h3>${t('Hiệu suất tính nhẩm','Mental Math Performance')}</h3>
          <div class="perf-stats-row">
            <div class="perf-col"><span class="perf-val">${totalSessions}</span><small>${t('Lượt luyện','Sessions')}</small></div>
            <div class="perf-col"><span class="perf-val">${totalCorrect}/${totalAnswered}</span><small>${t('Câu đúng','Correct')}</small></div>
            <div class="perf-col"><span class="perf-val">${accuracy}%</span><small>${t('Chính xác','Accuracy')}</small></div>
            <div class="perf-col"><span class="perf-val">${avgSpeed}s</span><small>${t('Tốc độ/câu','Speed/Q')}</small></div>
          </div>
          <button class="wide" onclick="nav('stats')" style="margin-top:14px">${t('Xem nhật ký tiến bộ chi tiết 7 ngày','View 7-day progress journal')} →</button>
        </div>

        <div class="card profile-badges-card">
          <div class="badges-header">
            <h3>${t('Huy hiệu học tập','Learning Badges')}</h3>
            <span class="badges-count">${badgesList.filter(b=>b.unlocked).length}/${badgesList.length} ${t('đã đạt','unlocked')}</span>
          </div>
          <div class="badges-grid">
            ${badgesList.map(b=>`<div class="badge-item ${b.unlocked?'unlocked':'locked'}"><div class="badge-details"><b>${lang==='vi'?b.titleVi:b.titleEn}</b><p>${lang==='vi'?b.descVi:b.descEn}</p><span class="badge-tag ${b.unlocked?'tag-unlocked':'tag-locked'}">${b.unlocked?t('Đã mở khóa','Unlocked'):t('Chưa mở','Locked')}</span></div></div>`).join('')}
          </div>
        </div>
      </div>`}
    </div>
  </section>`;

  $$('[data-set-grade]').forEach(btn=>{
    btn.onclick=()=>{
      const g=+btn.dataset.setGrade;
      updateUserProfile({grade:g});
      renderProfile();
      toast(t('Đã chuyển sang '+(lang==='vi'?'Lớp '+g:'Grade '+g)+'!','Switched to Grade '+g+'!'));
    };
  });

  $$('[data-set-avatar]').forEach(btn=>{
    btn.onclick=()=>{
      const av=btn.dataset.setAvatar;
      updateUserProfile({avatar:av});
      renderProfile();
      toast(t('Đã đổi bạn đồng hành thành công!','Companion updated!'));
    };
  });

  const editNameBtn=$('#editNameBtn');
  if(editNameBtn){
    editNameBtn.onclick=()=>{
      modal(`<h2>${t('Đổi tên hiển thị','Change display name')}</h2><p class="muted">${t('Nhập tên của em (Ví dụ: Minh Khôi, Bảo An)','Enter your name (e.g. Alex, Emily)')}</p><input id="profileModalNameInput" maxlength="30" value="${esc(u.name)}" style="width:100%;font-size:16px;padding:10px;margin:12px 0;border-radius:10px;border:1.5px solid #d5e4c7"><div class="actions"><button class="primary" id="saveProfileNameBtn">${t('Lưu tên mới','Save name')}</button><button id="cancelProfileNameBtn">${t('Hủy','Cancel')}</button></div>`);
      $('#cancelProfileNameBtn').onclick=()=>$('#modal').close();
      $('#saveProfileNameBtn').onclick=()=>{
        const val=$('#profileModalNameInput')?.value.trim();
        if(!val){toast(t('Vui lòng nhập tên của em.','Please enter a name.'));return}
        updateUserProfile({name:val});
        $('#modal').close();
        renderProfile();
        toast(t('Đã cập nhật tên thành '+val+'!','Name updated to '+val+'!'));
      };
    };
  }

  $$('[data-toggle-eye]').forEach(btn=>{
    btn.onclick=()=>{
      const targetId=btn.dataset.toggleEye;
      const inp=$('#'+targetId);
      if(!inp)return;
      const isPassword=inp.type==='password';
      inp.type=isPassword?'text':'password';
      btn.textContent=isPassword?t('Ẩn','Hide'):t('Hiện','Show');
    };
  });

  const changePinForm=$('#changePinForm');
  if(changePinForm){
    changePinForm.onsubmit=async e=>{
      e.preventDefault();
      const p1=$('#newPinInput')?.value.trim();
      const p2=$('#confirmPinInput')?.value.trim();
      const msg=$('#pinMessage');
      if(msg)msg.textContent='';
      if(!p1||p1.length<NUMI_MIN_PIN){if(msg)msg.textContent=t('Mật khẩu cần ít nhất 6 ký tự.','Password must be at least 6 characters.');return}
      if(p1!==p2){if(msg)msg.textContent=t('Mật khẩu xác nhận chưa khớp. Vui lòng kiểm tra lại.','Confirmation password does not match.');return}
      try{
        await updateUserPassword(p1);
        toast(t('Đã đổi mật khẩu thành công!','Password updated successfully!'));
        $('#newPinInput').value='';$('#confirmPinInput').value='';
        renderProfile();
      }catch(err){
        if(msg)msg.textContent=err.message||t('Lỗi đổi mật khẩu.','Failed to update password.');
      }
    };
  }

  $$('[data-theme-pick]').forEach(btn=>{
    btn.onclick=()=>{
      const th=btn.dataset.themePick;
      if(typeof numiThemeApply==='function')numiThemeApply(th);
      renderProfile();
    };
  });

  const soundToggle=$('#profileSoundToggle');
  if(soundToggle){
    soundToggle.onclick=()=>{
      soundEnabled=!soundEnabled;state.sound=soundEnabled;save();renderProfile();
      toast(soundEnabled?t('Đã bật âm thanh','Sound turned on'):t('Đã tắt âm thanh','Sound turned off'));
    };
  }

  $$('[data-switch-user]').forEach(btn=>{
    btn.onclick=()=>{
      const targetUser=btn.dataset.switchUser;
      const targetObj=allLocalUsers[targetUser];
      if(!targetObj)return;
      modal(`<h2>${t('Đăng nhập tài khoản '+esc(targetObj.name),'Sign in as '+esc(targetObj.name))}</h2><p class="muted">${t('Nhập mã PIN của bé để vào học:','Enter PIN to switch profile:')}</p><input type="password" id="switchPinInput" minlength="4" placeholder="••••" style="width:100%;font-size:18px;padding:10px;margin:12px 0;border-radius:10px;border:1.5px solid #d5e4c7;text-align:center"><p id="switchPinError" class="danger" style="margin:6px 0;font-weight:700"></p><div class="actions"><button class="primary" id="confirmSwitchBtn">${t('Vào học →','Sign in →')}</button><button id="cancelSwitchBtn">${t('Hủy','Cancel')}</button></div>`);
      $('#cancelSwitchBtn').onclick=()=>$('#modal').close();
      $('#confirmSwitchBtn').onclick=async()=>{
        const pin=$('#switchPinInput')?.value.trim();
        const errEl=$('#switchPinError');
        if(!pin){if(errEl)errEl.textContent=t('Vui lòng nhập mã PIN.','Please enter PIN.');return}
        try{
          await localSignIn(targetUser,pin);
          $('#modal').close();
          renderProfile();
        }catch(err){
          if(errEl)errEl.textContent=err.message||t('Mật khẩu chưa đúng.','Incorrect password.');
        }
      };
    };
  });

  const signOutBtn=$('#profileSignOutBtn');
  if(signOutBtn){
    signOutBtn.onclick=()=>{
      if(confirm(t('Em có chắc muốn đăng xuất không?','Are you sure you want to sign out?'))){
        if(cloudSession)cloudSignOut();else localSignOut();
      }
    };
  }

  translate();
  window.scrollTo(0,0);
}
if(typeof window!=='undefined')window.renderProfile=renderProfile;
if(typeof global!=='undefined')global.renderProfile=renderProfile;

function openAccount(mode='login'){
  if(session&&!session.done&&['quiz','garden','battle'].includes(view)){
    toast(t('Hoàn thành lượt đang chơi trước khi đổi tài khoản nhé.','Finish the current session before changing accounts.'));
    return;
  }
  stop();view='account';session=null;document.body.dataset.view='account';
  const u=currentAuthUser();
  if(u){
    renderProfile();
    return;
  }

  // Not logged in -> Render clean private login/register gate wall (never expose other users' accounts publicly)
  const signup=mode==='signup';
  const userChips='';
  let chosenAvatar='bunny';
  const companionPicks=signup?`<div class="settings-hint" style="margin-top:14px">${t('Chọn bạn thú đồng hành:','Choose your study buddy:')}</div><div class="buddy-choices">${[['bunny','Thỏ'],['panda','Gấu'],['fox','Cáo'],['lion','Sư tử']].map(([k,label])=>`<button type="button" data-signup-avatar="${k}" class="${k===chosenAvatar?'chosen':''}">${(typeof numiAnimalOriginal==='function'?numiAnimalOriginal:animal)(k)}<span>${label}</span></button>`).join('')}</div>`:'';

  $('#app').innerHTML=`<div class="narrow card account-card auth-gate-card">
    <div class="intro-animal">${animal('bunny')}</div>
    <span class="eyebrow">NUMIQUICK · ${t('BẢO VỆ TIẾN ĐỘ HỌC','SAVE YOUR PROGRESS')}</span>
    <h1>${signup?t('Tạo tài khoản học sinh','Create student account'):t('Đăng nhập để vào học','Sign in to learn')}</h1>
    <p class="muted">${signup?t('Tạo tài khoản riêng để lưu điểm số, chuỗi ngày học và tiến độ học của em.','Create an account to save your scores, daily streak and progress.'):t('Nhập tài khoản để mở khóa toàn bộ bài học và tiếp tục tiến độ.','Enter your account to unlock all lessons and resume your progress.')}</p>
    <div class="auth-tabs">
      <button type="button" class="auth-tab ${!signup?'active':''}" id="tabLogin">${t('Đăng nhập','Sign in')}</button>
      <button type="button" class="auth-tab ${signup?'active':''}" id="tabSignup">${t('Tạo tài khoản mới','Create new account')}</button>
    </div>
    ${userChips}
    <form id="authForm" class="auth-form">
      ${signup?`<label>${t('Tên của em (Ví dụ: Minh Khôi, Bảo An)','Your name (e.g. Alex, Emily)')}<input name="name" maxlength="30" placeholder="${t('Nhập tên của em','Enter your name')}" required value="${state.name&&state.name!=='Explorer'?esc(state.name):''}"></label>`:''}
      <label>${t('Tên đăng nhập','Username')}<input name="username" maxlength="50" autocomplete="username" placeholder="${t('Ví dụ: khoi123','e.g. alex123')}" required></label>
      <label>${t('Mật khẩu / Mã PIN (tối thiểu 6 ký tự)','Password / PIN (min 6 characters)')}<input name="password" type="password" autocomplete="${signup?'new-password':'current-password'}" ${signup?'minlength="6"':''} required placeholder="••••••"></label>
      ${signup?`<label>${t('Em đang học lớp mấy?','Which grade are you in?')}</label><div class="grade-signup-picks">${[1,2,3,4,5,6,7,8,9].map(g=>`<label><input type="radio" name="signupGrade" value="${g}" ${g===1?'checked':''}><span>${(typeof NUMI_GRADES!=='undefined'&&NUMI_GRADES[g])?(lang==='vi'?NUMI_GRADES[g].name:NUMI_GRADES[g].enName):('Lớp '+g)}</span></label>`).join('')}</div>`:''}
      ${companionPicks}
      <p id="authMessage" class="danger" role="status" style="margin:12px 0;font-weight:700"></p>
      <button type="submit" class="primary wide" id="authSubmitBtn">${signup?t('Tạo tài khoản & Bắt đầu học →','Create account & Start learning →'):t('Đăng nhập vào học →','Sign in to learn →')}</button>
    </form>
    ${cloudConfigured()&&!signup?`<div class="section"><p class="muted" style="text-align:center">${t('Hoặc tài khoản Supabase:','Or Supabase Account:')}</p>${window.NUMI_CLOUD_CONFIG.googleEnabled?`<button type="button" class="wide" id="googleSignIn">${t('Tiếp tục với Google','Continue with Google')}</button>`:''}</div>`:''}
  </div>`;

  $('#tabLogin').onclick=()=>openAccount('login');
  $('#tabSignup').onclick=()=>openAccount('signup');
  $$('[data-quick-user]').forEach(chip=>{
    chip.onclick=()=>{
      const f=$('#authForm');
      if(f&&f.username){
        f.username.value=chip.dataset.quickUser;
        f.password.focus();
      }
    };
  });
  $$('[data-signup-avatar]').forEach(btn=>{
    btn.onclick=()=>{
      chosenAvatar=btn.dataset.signupAvatar;
      $$('[data-signup-avatar]').forEach(b=>b.classList.toggle('chosen',b.dataset.signupAvatar===chosenAvatar));
    };
  });
  if($('#googleSignIn')){
    $('#googleSignIn').onclick=()=>{location.assign(cloudBase()+'/auth/v1/authorize?provider=google&redirect_to='+encodeURIComponent(location.href.split('#')[0]))};
  }

  $('#authForm').onsubmit=async e=>{
    e.preventDefault();
    const f=new FormData(e.target),btn=$('#authSubmitBtn'),msg=$('#authMessage');
    btn.disabled=true;if(msg)msg.textContent='';
    try{
      if(signup){
        await localSignUp(f.get('name'),f.get('username'),f.get('password'),chosenAvatar,f.get('signupGrade'));
        if(cloudConfigured()){
          const nu=currentAuthUser();
          try{await cloudSignUpUser(nu,String(f.get('password')||''))}
          catch(cloudErr){
            console.log('Cloud sign up failed:',cloudErr);
            toast(cloudErr.status===409||cloudErr.status===422?t('Tên này đã có trên mạng nên tài khoản chỉ lưu trên máy này. Em hãy chọn tên khác để lưu trực tuyến.','This name is already used online, so the account is saved on this device only. Pick another name to sync online.'):t('Chưa lưu được trực tuyến. Tài khoản vẫn dùng được trên máy này.','Could not save online. Your account still works on this device.'));
          }
        }
      }else{
        const uVal=String(f.get('username')||'').trim(),pVal=String(f.get('password')||'');
        if(cloudConfigured()&&!uVal.includes('@')&&uVal.toLowerCase()!=='admin'){
          const key=uVal.toLowerCase().replace(/\s+/g,'');
          const hadLocal=!!localStorage.getItem('numi-user-state-'+key);
          let cloudOk=false;
          try{await cloudSignInUser(key,pVal);cloudOk=true}catch(cloudErr){console.log('Cloud username sign in failed, trying local:',cloudErr)}
          try{await localSignIn(uVal,pVal)}catch(localErr){if(cloudOk)cloudStoreSession(null);throw localErr}
          const lu=currentAuthUser();
          if(cloudOk)await cloudAfterSignIn(key,hadLocal); // not linked yet? cloud-classes.js links it after localSignIn
          return;
        }
        if(cloudConfigured()&&uVal.includes('@')){
          try{
            const data=await cloudRequest('/auth/v1/token?grant_type=password','POST',{email:uVal,password:pVal},false);
            if(data?.access_token){
              cloudStoreSession(data);
              await cloudChooseSave();
              return;
            }
          }catch(cloudErr){
            console.log('Cloud sign in failed, trying local:',cloudErr);
          }
        }
        await localSignIn(uVal,pVal);
      }
    }catch(err){
      if(msg)msg.textContent=err.message||t('Đăng nhập không thành công. Vui lòng thử lại.','Sign in failed. Please try again.');
    }finally{
      if(btn.isConnected)btn.disabled=false;
    }
  };
  translate();
}

async function cloudChooseSave(){if(cloudBusy){toast(t('Đang lưu, chờ một chút nhé.','Saving. Please wait a moment.'));return}clearTimeout(cloudTimer);cloudReady=false;try{const row=await cloudGetRow();if(row&&!validBackup(row.payload))throw Error(t('Bản lưu chưa đúng định dạng. Tiến độ trên máy vẫn được giữ.','The online save has an unsupported format. Local progress is unchanged.'));cloudRevision=row?.revision??null;view='account';document.body.dataset.view='account';$('#app').innerHTML=`<div class="narrow card account-card"><div class="intro-animal">${animal('panda')}</div><h1>${t('Em muốn tiếp tục bản nào?','Which journey shall we continue?')}</h1><p>${row?t('Đã tìm thấy bản lưu của tài khoản này. Chọn rõ một bản để không ghi đè ngoài ý muốn.','An account save was found. Choose a version to avoid accidental overwrites.'):t('Tài khoản chưa có bản lưu. Em có thể mang kết quả trên máy này vào hoặc bắt đầu mới.','This account has no save yet. Bring this device’s progress or start fresh.')}</p><div class="save-choices">${row?`<button id="useRemote"><b>${t('Bản đã lưu trực tuyến','Online save')}</b><small>${row.payload.history.length} ${t('lượt học','sessions')} · ${Object.values(row.payload.pieces).reduce((a,b)=>a+b,0)} ${t('mảnh','pieces')}</small></button>`:''}<button id="useLocal"><b>${t('Bản trên máy này','This device’s progress')}</b><small>${state.history.length} ${t('lượt học','sessions')} · ${totalPieces()} ${t('mảnh','pieces')}</small></button>${!row?`<button id="useFresh">${t('Bắt đầu mới cho tài khoản này','Start fresh for this account')}</button>`:''}</div><p id="cloudChoiceStatus" role="status"></p></div>`;const choose=async payload=>{const guest=localStorage.getItem(CLOUD_OWNER_KEY);if(!guest)localStorage.setItem('numi-guest-snapshot',JSON.stringify(state));if(payload){state={...fresh(),...payload};lang=state.lang==='en'?'en':'vi'}cloudReady=true;localStorage.setItem(CLOUD_OWNER_KEY,JSON.stringify({uid:cloudSession.user.id,revision:cloudRevision}));saveBeforeCloud();cloudDirty=true;await cloudPush();if(typeof syncUserGradeToConfig==='function')syncUserGradeToConfig();openAccount()};if($('#useRemote'))$('#useRemote').onclick=()=>choose(row.payload);$('#useLocal').onclick=()=>choose(null);if($('#useFresh'))$('#useFresh').onclick=()=>choose(fresh());translate()}catch(error){cloudStatus='offline';cloudBadge();toast(error.message||t('Chưa tải được bản lưu.','Could not load your save.'));openAccount()}}

function cloudEmail(username){return String(username||'').trim().toLowerCase()+'@numiquick.app'}
function cloudPassword(p){return 'nq-'+String(p||'')} // Supabase needs >= 6 chars; app PIN may be 4
async function cloudSignUpUser(user,password){
  // Supabase rejects made-up email domains on public signup, so a tiny Edge Function creates the user with admin rights.
  await cloudRequest('/functions/v1/numi-signup','POST',{username:user.username,password:cloudPassword(password),name:user.name,avatar:user.avatar||'bunny',grade:user.grade||1,role:user.role==='teacher'?'teacher':'student'},false);
  const data=await cloudRequest('/auth/v1/token?grant_type=password','POST',{email:cloudEmail(user.username),password:cloudPassword(password)},false);
  cloudStoreSession(data);cloudRevision=null;cloudReady=true;cloudDirty=true;
  await cloudPush();
}
async function cloudSignInUser(username,password){
  const data=await cloudRequest('/auth/v1/token?grant_type=password','POST',{email:cloudEmail(username),password:cloudPassword(password)},false);
  cloudStoreSession(data);
  const users=getLocalUsers(),meta=data.user?.user_metadata||{};
  if(users[username]&&users[username].cloudStub){ // roster stub created on a teacher device: this is the real owner signing in
    users[username].hash=await hashPassword(password);delete users[username].cloudStub;saveLocalUsers(users);
  }
  if(!users[username]){
    users[username]={username,name:meta.name||username,hash:await hashPassword(password),avatar:meta.avatar||'bunny',grade:Number(meta.grade)||1,role:meta.role==='teacher'?'teacher':'student',createdAt:new Date().toISOString()};
    saveLocalUsers(users);
  }
}
async function cloudAfterSignIn(username,hadLocal){
  cloudReady=false;
  try{
    const row=await cloudGetRow();
    if(!row){cloudRevision=null;cloudReady=true;cloudDirty=true;await cloudPush();return}
    if(!hadLocal&&validBackup(row.payload)){
      cloudRevision=row.revision;
      state={...fresh(),...row.payload};lang=state.lang==='en'?'en':'vi';
      if(typeof window!=='undefined')window.state=state;
      cloudReady=true;
      localStorage.setItem(CLOUD_OWNER_KEY,JSON.stringify({uid:cloudSession.user.id,revision:cloudRevision}));
      save();cloudStatus='saved';cloudBadge();translate();
      return;
    }
    await cloudChooseSave();
  }catch(e){cloudStatus='offline';cloudBadge()}
}
async function cloudSignOut(){clearTimeout(cloudTimer);if(cloudBusy){toast(t('Đang lưu, chờ một chút nhé.','Saving. Please wait a moment.'));return}if(cloudDirty){if(cloudReady)await cloudPush();if(cloudStatus!=='saved'&&!confirm(t('Chưa lưu lên mạng. Vẫn đăng xuất? Bản trên máy sẽ được giữ riêng.','Not saved online. Sign out anyway? A local account copy will be kept.')))return}const old=cloudSession;localStorage.setItem('numi-account-cache-'+old.user.id,JSON.stringify(state));try{await cloudRequest('/auth/v1/logout','POST',{})}catch{}cloudReady=false;cloudRevision=null;cloudDirty=false;cloudStatus='local';cloudStoreSession(null);localStorage.removeItem(CLOUD_OWNER_KEY);let guest;try{guest=JSON.parse(localStorage.getItem('numi-guest-snapshot')||'null')}catch{}state=guest&&validBackup(guest)?guest:fresh();lang=state.lang==='en'?'en':'vi';saveBeforeCloud();nav('home')}

async function cloudRestore(){if(!cloudConfigured())return;let fromCallback=false;try{let saved=JSON.parse(localStorage.getItem(CLOUD_SESSION_KEY)||'null');const hash=new URLSearchParams(location.hash.slice(1));if(hash.has('access_token')){fromCallback=true;saved={access_token:hash.get('access_token'),refresh_token:hash.get('refresh_token'),expires_in:+hash.get('expires_in')||3600};cloudRecovering=hash.get('type')==='recovery';history.replaceState(null,'',location.pathname+location.search)}if(!saved?.access_token||!saved.refresh_token)return;cloudStoreSession(saved);await cloudRefresh();const user=await cloudRequest('/auth/v1/user');cloudSession.user=user;cloudStoreSession(cloudSession);const owner=JSON.parse(localStorage.getItem(CLOUD_OWNER_KEY)||'null'),row=await cloudGetRow();if(owner?.uid===user.id&&owner.revision===row?.revision){cloudRevision=row.revision;cloudReady=true;cloudStatus='saved'}else{cloudReady=false;cloudStatus='conflict'}cloudBadge();if(fromCallback)await cloudChooseSave()}catch{cloudStatus='offline';cloudBadge()}}

const accountButton=document.createElement('button');
accountButton.id='accountButton';
accountButton.className='account-button';
accountButton.onclick=()=>{const u=currentAuthUser();if(u&&(u.role==='admin'||u.username==='admin')){if(typeof renderAdmin==='function')renderAdmin();return;}if(u&&u.role==='teacher'){if(typeof renderTeacherWorkspace==='function')renderTeacherWorkspace();else renderProfile();return;}openAccount();};
$('#lang')?.before(accountButton);
cloudBadge();
window.addEventListener('online',()=>{if(cloudReady)cloudQueue();else cloudRestore()});
cloudRestore().finally(()=>setTimeout(checkWeakPinOnLoad,300)); // after restore so a PIN change also reaches the cloud

const translateBeforeCloud=translate;
translate=function(){translateBeforeCloud();cloudBadge()};

if(typeof window!=='undefined'){
  window.getLocalUsers=getLocalUsers;
  window.saveLocalUsers=saveLocalUsers;
  window.currentAuthUser=currentAuthUser;
  window.hashPassword=hashPassword;
  window.localSignIn=localSignIn;
  window.localSignUp=localSignUp;
  window.openAccount=openAccount;
}
if(typeof global!=='undefined'){
  global.getLocalUsers=getLocalUsers;
  global.saveLocalUsers=saveLocalUsers;
  global.currentAuthUser=currentAuthUser;
  global.hashPassword=hashPassword;
  global.localSignIn=localSignIn;
  global.localSignUp=localSignUp;
  global.openAccount=openAccount;
}
if(typeof syncUserGradeToConfig==='function')syncUserGradeToConfig();
