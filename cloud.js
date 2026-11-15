'use strict';
let cloudSession=null,cloudReady=false,cloudRevision=null,cloudDirty=false,cloudTimer=null,cloudBusy=false,cloudRecovering=false,cloudStatus='local';
const CLOUD_SESSION_KEY='numi-cloud-session-v1',CLOUD_OWNER_KEY='numi-cloud-owner-v1';

function currentAuthUser(){
  if(cloudSession&&cloudSession.user)return {type:'cloud',id:cloudSession.user.id,name:cloudSession.user.email,username:cloudSession.user.email,email:cloudSession.user.email,avatar:state.buddy||'bunny'};
  try{
    const saved=JSON.parse(localStorage.getItem('numi-current-user-v1')||'null');
    if(saved&&saved.username)return saved;
  }catch{}
  return null;
}

function getLocalUsers(){
  try{return JSON.parse(localStorage.getItem('numi-local-users-v1')||'{}')||{}}catch{return{}}
}
function saveLocalUsers(users){
  try{localStorage.setItem('numi-local-users-v1',JSON.stringify(users))}catch{}
}

async function hashPassword(pwd){
  const s=String(pwd||'');
  if(typeof window!=='undefined'&&window.crypto&&crypto.subtle){
    try{
      const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('numi_salt_v1:'+s));
      return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
    }catch{}
  }
  let h=0x811c9dc5;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193);}
  return 'fb_'+(h>>>0).toString(16);
}

async function localSignIn(username,password){
  const users=getLocalUsers(),key=String(username||'').trim().toLowerCase();
  const user=users[key];
  if(!user)throw Error(t('Không tìm thấy tài khoản này. Vui lòng kiểm tra lại hoặc tạo tài khoản mới.','Account not found. Please check or create a new account.'));
  const hash=await hashPassword(password);
  if(user.hash!==hash)throw Error(t('Mật khẩu chưa đúng. Em thử lại nhé!','Incorrect password. Please try again!'));
  const activeUser={id:user.username,username:user.username,name:user.name,avatar:user.avatar||'bunny',grade:user.grade||1,type:'local'};
  localStorage.setItem('numi-current-user-v1',JSON.stringify(activeUser));
  try{
    localStorage.setItem('numi-buddy-profile-v1',JSON.stringify({name:user.name,avatar:user.avatar||'bunny'}));
    const savedState=JSON.parse(localStorage.getItem('numi-user-state-'+user.username)||'null');
    if(savedState&&validBackup(savedState)){
      state={...fresh(),...savedState};
      lang=state.lang==='en'?'en':'vi';
    }else{
      state.name=user.name;
      state.buddy=user.avatar||'bunny';
      save();
    }
  }catch{
    state.name=user.name;
    state.buddy=user.avatar||'bunny';
  }
  if(user.grade&&typeof NUMI_GRADES!=='undefined'&&NUMI_GRADES[user.grade]){
    config={...defaults,...NUMI_GRADES[user.grade],grade:user.grade};
    if(typeof window!=='undefined')window.config=config;if(typeof global!=='undefined')global.config=config;
  }
  cloudBadge();
  nav('home');
  toast(t('Chào mừng '+user.name+' đã trở lại! 🌟','Welcome back, '+user.name+'! 🌟'));
}

async function localSignUp(name,username,password,avatar='bunny',grade=1){
  name=String(name||'').trim().slice(0,30);
  if(!name)throw Error(t('Vui lòng nhập tên của em.','Please enter your name.'));
  username=String(username||'').trim().toLowerCase().replace(/\s+/g,'');
  if(!username||username.length<2)throw Error(t('Tên đăng nhập cần ít nhất 2 ký tự.','Username must be at least 2 characters.'));
  if(!/^[a-z0-9_.-]+$/.test(username))throw Error(t('Tên đăng nhập chỉ gồm chữ cái không dấu, số hoặc dấu gạch.','Username can only contain letters, numbers, or dashes.'));
  if(!password||password.length<4)throw Error(t('Mật khẩu cần ít nhất 4 ký tự hoặc 4 số.','Password must be at least 4 characters.'));
  grade=Number(grade)||1;
  const users=getLocalUsers();
  if(users[username])throw Error(t('Tên đăng nhập này đã có bạn dùng rồi. Hãy chọn tên khác nhé!','This username is already taken. Please choose another!'));
  const hash=await hashPassword(password);
  users[username]={username,name,hash,avatar,grade,createdAt:new Date().toISOString()};
  saveLocalUsers(users);
  const activeUser={id:username,username,name,avatar,grade,type:'local'};
  localStorage.setItem('numi-current-user-v1',JSON.stringify(activeUser));
  try{localStorage.setItem('numi-buddy-profile-v1',JSON.stringify({name,avatar}))}catch{}
  state={...fresh(),name,buddy:avatar};
  save();
  localStorage.setItem('numi-user-state-'+username,JSON.stringify(state));
  if(typeof NUMI_GRADES!=='undefined'&&NUMI_GRADES[grade]){
    config={...defaults,...NUMI_GRADES[grade],grade};
    if(typeof window!=='undefined')window.config=config;if(typeof global!=='undefined')global.config=config;
  }
  cloudBadge();
  nav('home');
  toast(t('Tài khoản đã tạo thành công! Chào mừng '+name+'! 🎉','Account created! Welcome, '+name+'! 🎉'));
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
  $$('nav button').forEach(b=>{b.disabled=!u&&b.dataset.view!=='guide'});
  if(!button)return;
  if(u){
    button.innerHTML=`${animal(u.avatar||buddy())} <b>${esc(u.name)}</b>`;
    button.title=t('Tài khoản của em','Your account');
    button.classList.add('is-logged-in');
    button.dataset.status=cloudSession?cloudStatus:'local';
  }else{
    button.innerHTML=`🔒 <b>${t('Đăng nhập','Sign in')}</b>`;
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
};
function cloudStatusText(){return cloudSession?(cloudStatus==='saved'?t('Đã lưu trực tuyến.','Saved online.'):cloudStatus==='saving'?t('Đang lưu trực tuyến…','Saving online…'):cloudStatus==='conflict'?t('Có bản lưu mới từ thiết bị khác. Chọn bản muốn tiếp tục bên dưới.','A newer save exists on another device. Choose which one to continue.'):cloudStatus==='offline'?t('Chưa lưu lên mạng. Kết quả vẫn có trên thiết bị; kết nối lại để đồng bộ.','Not saved online yet. Progress is on this device; reconnect to sync.'):t('Kết quả hiện được lưu trên thiết bị.','Progress is currently saved on this device.')):t('Tài khoản học sinh được lưu an toàn trên máy này.','Student account is saved securely on this device.')}

function openAccount(mode='login'){
  if(session&&!session.done&&['quiz','garden','battle'].includes(view)){
    toast(t('Hoàn thành lượt đang chơi trước khi đổi tài khoản nhé.','Finish the current session before changing accounts.'));
    return;
  }
  stop();view='account';session=null;document.body.dataset.view='account';
  const u=currentAuthUser();
  if(u){
    $('#app').innerHTML=`<div class="narrow card account-card">
      <div class="intro-animal">${animal(u.avatar||buddy())}</div>
      <span class="eyebrow">NUMIQUICK · ${t('TÀI KHOẢN HỌC SINH','STUDENT ACCOUNT')}</span>
      <h1>${esc(u.name)}</h1>
      <p class="account-email">@${esc(u.username||u.email||'')}</p>
      <div class="metrics" style="margin:18px 0">
        <div class="metric"><small>${t('Cấp độ','Level')}</small><strong>${level()}</strong></div>
        <div class="metric"><small>${t('Điểm XP','XP')}</small><strong>${state.xp}</strong></div>
        <div class="metric"><small>${t('Trân châu','Pearls')}</small><strong>${typeof teaState==='function'?teaState().pearls:0}</strong></div>
        <div class="metric"><small>${t('Chuỗi ngày 🔥','Streak')}</small><strong>${getStreak().count}</strong></div>
        <div class="metric"><small>${t('Lớp học','Grade')}</small><strong>${u.grade ? (lang==='vi'?'Lớp '+u.grade:'Grade '+u.grade) : (lang==='vi'?'Lớp 1':'Grade 1')}</strong></div>
      </div>
      <p id="cloudAccountStatus" role="status">${cloudStatusText()}</p>
      <div class="actions">
        <button class="primary" onclick="nav('home')">${t('Tiếp tục học →','Continue learning →')}</button>
        <button onclick="nav('stats')">${t('Nhật ký tiến bộ','View progress')}</button>
        <button id="accountSignOut" class="danger">${t('Đăng xuất','Sign out')}</button>
      </div>
    </div>`;
    $('#accountSignOut').onclick=()=>localSignOut();
    translate();
    return;
  }

  // Not logged in -> Render login/register gate wall
  const signup=mode==='signup',localUsers=getLocalUsers(),usersList=Object.values(localUsers);
  const userChips=usersList.length&&!signup?`<div class="quick-users"><div class="quick-users-label">👤 ${t('Tài khoản đã có trên máy này (chạm để chọn):','Accounts on this device (tap to select):')}</div><div class="quick-user-chips">${usersList.map(u=>`<button type="button" class="quick-user-chip" data-quick-user="${esc(u.username)}">${animal(u.avatar||'bunny')} <span>${esc(u.name)}</span></button>`).join('')}</div></div>`:'';
  let chosenAvatar='bunny';
  const companionPicks=signup?`<div class="settings-hint" style="margin-top:14px">${t('Chọn bạn thú đồng hành:','Choose your study buddy:')}</div><div class="buddy-choices">${[['bunny','Thỏ 🐰'],['panda','Gấu 🐼'],['fox','Cáo 🦊'],['lion','Sư tử 🦁']].map(([k,label])=>`<button type="button" data-signup-avatar="${k}" class="${k===chosenAvatar?'chosen':''}">${animal(k)}<span>${label}</span></button>`).join('')}</div>`:'';

  $('#app').innerHTML=`<div class="narrow card account-card auth-gate-card">
    <div class="intro-animal">${animal('bunny')}</div>
    <span class="eyebrow">NUMIQUICK · ${t('BẢO VỆ TIẾN ĐỘ HỌC','SAVE YOUR PROGRESS')}</span>
    <h1>${signup?t('Tạo tài khoản học sinh','Create student account'):t('Đăng nhập để vào học','Sign in to learn')}</h1>
    <p class="muted">${signup?t('Tạo tài khoản riêng để lưu điểm số, chuỗi ngày học 🔥 và trân châu của em.','Create an account to save your scores, daily streak and pearls.'):t('Nhập tài khoản để mở khóa toàn bộ bài học và tiếp tục tiến độ.','Enter your account to unlock all lessons and resume your progress.')}</p>
    <div class="auth-tabs">
      <button type="button" class="auth-tab ${!signup?'active':''}" id="tabLogin">${t('Đăng nhập','Sign in')}</button>
      <button type="button" class="auth-tab ${signup?'active':''}" id="tabSignup">${t('Tạo tài khoản mới','Create new account')}</button>
    </div>
    ${userChips}
    <form id="authForm" class="auth-form">
      ${signup?`<label>${t('Tên của em (Ví dụ: Minh Khôi, Bảo An)','Your name (e.g. Alex, Emily)')}<input name="name" maxlength="30" placeholder="${t('Nhập tên của em','Enter your name')}" required value="${state.name&&state.name!=='Explorer'?esc(state.name):''}"></label>`:''}
      <label>${t('Tên đăng nhập','Username')}<input name="username" maxlength="50" autocomplete="username" placeholder="${t('Ví dụ: khoi123','e.g. alex123')}" required></label>
      <label>${t('Mật khẩu / Mã PIN (tối thiểu 4 ký tự)','Password / PIN (min 4 characters)')}<input name="password" type="password" autocomplete="${signup?'new-password':'current-password'}" minlength="4" required placeholder="••••"></label>
      ${signup?`<label>${t('Em đang học lớp mấy?','Which grade are you in?')}</label><div class="grade-signup-picks"><label><input type="radio" name="signupGrade" value="1" checked><span>🌱 ${t('Lớp 1','Grade 1')}</span></label><label><input type="radio" name="signupGrade" value="2"><span>🌿 ${t('Lớp 2','Grade 2')}</span></label><label><input type="radio" name="signupGrade" value="3"><span>🌸 ${t('Lớp 3','Grade 3')}</span></label><label><input type="radio" name="signupGrade" value="4"><span>🌻 ${t('Lớp 4','Grade 4')}</span></label><label><input type="radio" name="signupGrade" value="5"><span>🌳 ${t('Lớp 5','Grade 5')}</span></label></div>`:''}
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
      }else{
        const uVal=String(f.get('username')||'').trim(),pVal=String(f.get('password')||'');
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

async function cloudChooseSave(){if(cloudBusy){toast(t('Đang lưu, chờ một chút nhé.','Saving. Please wait a moment.'));return}clearTimeout(cloudTimer);cloudReady=false;try{const row=await cloudGetRow();if(row&&!validBackup(row.payload))throw Error(t('Bản lưu chưa đúng định dạng. Tiến độ trên máy vẫn được giữ.','The online save has an unsupported format. Local progress is unchanged.'));cloudRevision=row?.revision??null;view='account';document.body.dataset.view='account';$('#app').innerHTML=`<div class="narrow card account-card"><div class="intro-animal">${animal('panda')}</div><h1>${t('Em muốn tiếp tục bản nào?','Which journey shall we continue?')}</h1><p>${row?t('Đã tìm thấy bản lưu của tài khoản này. Chọn rõ một bản để không ghi đè ngoài ý muốn.','An account save was found. Choose a version to avoid accidental overwrites.'):t('Tài khoản chưa có bản lưu. Em có thể mang kết quả trên máy này vào hoặc bắt đầu mới.','This account has no save yet. Bring this device’s progress or start fresh.')}</p><div class="save-choices">${row?`<button id="useRemote"><b>${t('Bản đã lưu trực tuyến','Online save')}</b><small>${row.payload.history.length} ${t('lượt học','sessions')} · ${Object.values(row.payload.pieces).reduce((a,b)=>a+b,0)} ${t('mảnh','pieces')}</small></button>`:''}<button id="useLocal"><b>${t('Bản trên máy này','This device’s progress')}</b><small>${state.history.length} ${t('lượt học','sessions')} · ${totalPieces()} ${t('mảnh','pieces')}</small></button>${!row?`<button id="useFresh">${t('Bắt đầu mới cho tài khoản này','Start fresh for this account')}</button>`:''}</div><p id="cloudChoiceStatus" role="status"></p></div>`;const choose=async payload=>{const guest=localStorage.getItem(CLOUD_OWNER_KEY);if(!guest)localStorage.setItem('numi-guest-snapshot',JSON.stringify(state));if(payload){state={...fresh(),...payload};lang=state.lang==='en'?'en':'vi'}cloudReady=true;localStorage.setItem(CLOUD_OWNER_KEY,JSON.stringify({uid:cloudSession.user.id,revision:cloudRevision}));saveBeforeCloud();cloudDirty=true;await cloudPush();openAccount()};if($('#useRemote'))$('#useRemote').onclick=()=>choose(row.payload);$('#useLocal').onclick=()=>choose(null);if($('#useFresh'))$('#useFresh').onclick=()=>choose(fresh());translate()}catch(error){cloudStatus='offline';cloudBadge();toast(error.message||t('Chưa tải được bản lưu.','Could not load your save.'));openAccount()}}

async function cloudSignOut(){clearTimeout(cloudTimer);if(cloudBusy){toast(t('Đang lưu, chờ một chút nhé.','Saving. Please wait a moment.'));return}if(cloudDirty){if(cloudReady)await cloudPush();if(cloudStatus!=='saved'&&!confirm(t('Chưa lưu lên mạng. Vẫn đăng xuất? Bản trên máy sẽ được giữ riêng.','Not saved online. Sign out anyway? A local account copy will be kept.')))return}const old=cloudSession;localStorage.setItem('numi-account-cache-'+old.user.id,JSON.stringify(state));try{await cloudRequest('/auth/v1/logout','POST',{})}catch{}cloudReady=false;cloudRevision=null;cloudDirty=false;cloudStatus='local';cloudStoreSession(null);localStorage.removeItem(CLOUD_OWNER_KEY);let guest;try{guest=JSON.parse(localStorage.getItem('numi-guest-snapshot')||'null')}catch{}state=guest&&validBackup(guest)?guest:fresh();lang=state.lang==='en'?'en':'vi';saveBeforeCloud();nav('home')}

async function cloudRestore(){if(!cloudConfigured())return;let fromCallback=false;try{let saved=JSON.parse(localStorage.getItem(CLOUD_SESSION_KEY)||'null');const hash=new URLSearchParams(location.hash.slice(1));if(hash.has('access_token')){fromCallback=true;saved={access_token:hash.get('access_token'),refresh_token:hash.get('refresh_token'),expires_in:+hash.get('expires_in')||3600};cloudRecovering=hash.get('type')==='recovery';history.replaceState(null,'',location.pathname+location.search)}if(!saved?.access_token||!saved.refresh_token)return;cloudStoreSession(saved);await cloudRefresh();const user=await cloudRequest('/auth/v1/user');cloudSession.user=user;cloudStoreSession(cloudSession);const owner=JSON.parse(localStorage.getItem(CLOUD_OWNER_KEY)||'null'),row=await cloudGetRow();if(owner?.uid===user.id&&owner.revision===row?.revision){cloudRevision=row.revision;cloudReady=true;cloudStatus='saved'}else{cloudReady=false;cloudStatus='conflict'}cloudBadge();if(fromCallback)await cloudChooseSave()}catch{cloudStatus='offline';cloudBadge()}}

const accountButton=document.createElement('button');
accountButton.id='accountButton';
accountButton.className='account-button';
accountButton.onclick=()=>openAccount();
$('#lang')?.before(accountButton);
cloudBadge();
window.addEventListener('online',()=>{if(cloudReady)cloudQueue();else cloudRestore()});
cloudRestore();

const translateBeforeCloud=translate;
translate=function(){translateBeforeCloud();cloudBadge()};
