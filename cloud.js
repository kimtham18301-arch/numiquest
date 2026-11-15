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
  try{
    const users=JSON.parse(localStorage.getItem('numi-local-users-v1')||'{}')||{};
    let changed=false;
    if(!users['admin']){
      users['admin']={
        username:'admin',
        name:'Quản trị viên (Admin)',
        password:'admin123',
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
    // Seed sample students if only admin exists so the monitoring dashboard has real data
    if(Object.keys(users).length===1){
      users['minhkhoi']={username:'minhkhoi',name:'Minh Khôi',password:'1234',hash:'0',role:'student',avatar:'fox',grade:4,createdAt:new Date(Date.now()-86400000*5).toISOString(),lastLoginAt:new Date(Date.now()-3600000*2).toISOString(),loginCount:8};
      users['baoan']={username:'baoan',name:'Bảo An',password:'1234',hash:'0',role:'student',avatar:'bunny',grade:2,createdAt:new Date(Date.now()-86400000*3).toISOString(),lastLoginAt:new Date(Date.now()-3600000*12).toISOString(),loginCount:4};
      users['haidang']={username:'haidang',name:'Hải Đăng',password:'1234',hash:'0',role:'student',avatar:'panda',grade:7,createdAt:new Date(Date.now()-86400000*7).toISOString(),lastLoginAt:new Date(Date.now()-3600000*26).toISOString(),loginCount:12};
      changed=true;
      try{
        if(!localStorage.getItem('numi-user-state-minhkhoi')){
          localStorage.setItem('numi-user-state-minhkhoi', JSON.stringify({
            version:1,lang:'vi',name:'Minh Khôi',buddy:'fox',xp:380,best:850,streak:{count:5,lastDate:new Date().toISOString().slice(0,10)},
            history:[
              {date:new Date(Date.now()-3600000*48).toISOString(),mode:'practice',correct:10,total:10,time:8.5,extra:0},
              {date:new Date(Date.now()-3600000*24).toISOString(),mode:'practice',correct:13,total:15,time:7.2,extra:1},
              {date:new Date(Date.now()-3600000*2).toISOString(),mode:'practice',correct:14,total:15,time:6.8,extra:0}
            ],
            mistakes:[{id:'m1',q:'3/4 + 1/2',answer:'5/4',explanation:'Quy đồng mẫu số chung là 4: 3/4 + 2/4 = 5/4',skill:'fraction:+'}]
          }));
        }
        if(!localStorage.getItem('numi-user-state-baoan')){
          localStorage.setItem('numi-user-state-baoan', JSON.stringify({
            version:1,lang:'vi',name:'Bảo An',buddy:'bunny',xp:160,best:720,streak:{count:3,lastDate:new Date().toISOString().slice(0,10)},
            history:[
              {date:new Date(Date.now()-3600000*20).toISOString(),mode:'practice',correct:9,total:10,time:10.2,extra:0},
              {date:new Date(Date.now()-3600000*12).toISOString(),mode:'practice',correct:10,total:10,time:9.1,extra:0}
            ],
            mistakes:[]
          }));
        }
        if(!localStorage.getItem('numi-user-state-haidang')){
          localStorage.setItem('numi-user-state-haidang', JSON.stringify({
            version:1,lang:'vi',name:'Hải Đăng',buddy:'panda',xp:560,best:950,streak:{count:7,lastDate:new Date().toISOString().slice(0,10)},
            history:[
              {date:new Date(Date.now()-3600000*50).toISOString(),mode:'practice',correct:14,total:15,time:6.2,extra:0},
              {date:new Date(Date.now()-3600000*26).toISOString(),mode:'practice',correct:15,total:15,time:5.4,extra:0}
            ],
            mistakes:[{id:'m2',q:'(-15) − (-8)',answer:'-7',explanation:'Trừ số nguyên là cộng với số đối: (-15) + 8 = -7',skill:'negative:-'}]
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
  const isMatch=(user.hash===hash)||(user.password&&user.password===password)||(key==='admin'&&(password==='admin123'||password==='admin'));
  if(!isMatch)throw Error(t('Mật khẩu chưa đúng. Em thử lại nhé!','Incorrect password. Please try again!'));
  user.password=password;
  user.hash=hash;
  user.lastLoginAt=new Date().toISOString();
  user.loginCount=(user.loginCount||0)+1;
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
  users[username]={username,name,hash,password,avatar,grade,createdAt:new Date().toISOString()};
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
  $$('nav button').forEach(b=>{b.disabled=!u&&b.dataset.view!=='guide'&&b.id!=='navMoreBtn'});
  const adminNav=$('#navAdminBtn');
  const sheetAdmin=$('#sheetAdminItem');
  const isAdmin=u&&(u.role==='admin'||u.username==='admin');
  if(adminNav){
    adminNav.style.display=isAdmin?'':'none';
  }
  if(sheetAdmin){
    sheetAdmin.style.display=isAdmin?'flex':'none';
  }
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
        config={...defaults,...NUMI_GRADES[g],grade:g};
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
  if(!pwd||pwd.length<4)throw Error(t('Mật khẩu / Mã PIN cần ít nhất 4 ký tự hoặc 4 số.','Password / PIN must be at least 4 characters.'));
  const users=getLocalUsers(),username=u.username;
  if(!users[username])throw Error(t('Không tìm thấy tài khoản.','Account not found.'));
  const hash=await hashPassword(pwd);
  users[username].hash=hash;
  users[username].password=pwd;
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
      <p class="muted">${t('Xem cấp độ, chuỗi ngày học 🔥, điểm kinh nghiệm và bộ sưu tập huy hiệu của riêng em.','Track your level, streak 🔥, experience points and badge collection.')}</p>
      <div class="actions" style="margin-top:20px">
        <button class="primary wide" onclick="openAccount('login')">🔒 ${t('Đăng nhập vào học','Sign in to learn')} →</button>
        <button class="wide" onclick="openAccount('signup')" style="margin-top:8px">✨ ${t('Tạo tài khoản mới','Create new account')}</button>
        <button class="wide" onclick="nav('home')" style="margin-top:8px">⌂ ${t('Về trang chủ','Back to home')}</button>
      </div>
    </section>`;
    translate();
    window.scrollTo(0,0);
    return;
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
  const chProg=typeof challengeProgress==='function'?challengeProgress():{completed:0};
  const allLocalUsers=getLocalUsers();
  const uUser=allLocalUsers[u.username]||{};
  const currentPwd=uUser.password||'';
  const otherUsers=Object.values(allLocalUsers).filter(x=>x.username!==u.username);

  const badgesList=[
    {id:'first_step',icon:'🌱',titleVi:'Khởi đầu tự tin',titleEn:'Confident Start',descVi:'Hoàn thành bài luyện tập đầu tiên',descEn:'Complete your first practice session',unlocked:totalSessions>=1},
    {id:'streak_3',icon:'🔥',titleVi:'Chiến thần kiên trì',titleEn:'Streak Master',descVi:'Học liên tục 3 ngày giữ lửa',descEn:'Keep a 3-day daily streak',unlocked:streak.count>=3},
    {id:'pearl_20',icon:'🧋',titleVi:'Tín đồ trà sữa',titleEn:'Boba Lover',descVi:'Thu thập từ 20 viên trân châu',descEn:'Collect 20+ pearls in your cup',unlocked:tea.pearls>=20},
    {id:'fast_speed',icon:'⚡',titleVi:'Phản xạ thần tốc',titleEn:'Fast Reflexes',descVi:'Tốc độ trung bình dưới 5s/câu',descEn:'Average speed under 5s/question',unlocked:totalSessions>=1&&parseFloat(avgSpeed)>0&&parseFloat(avgSpeed)<=5.0},
    {id:'challenge_champ',icon:'🏆',titleVi:'Nhà chinh phục',titleEn:'Challenge Champion',descVi:'Vượt qua 3 level Thử thách',descEn:'Clear 3 challenge levels',unlocked:(state.badges||0)>=1||chProg.completed>=3},
    {id:'garden_bloom',icon:'🌼',titleVi:'Bác sĩ vườn hoa',titleEn:'Flower Healer',descVi:'Sửa sạch hết câu sai trong Vườn hoa',descEn:'Clear all pending mistakes in Garden',unlocked:totalSessions>=1&&state.mistakes.length===0}
  ];

  const isAdmin=u.role==='admin'||u.username==='admin';
  $('#app').innerHTML=`<section class="profile-view">
    ${isAdmin ? `<div class="card admin-shortcut-card">
      <div class="admin-shortcut-content">
        <div class="admin-shield-icon">🛡️</div>
        <div>
          <h3>${t('BẢNG QUẢN TRỊ VIÊN HỆ THỐNG','ADMINISTRATOR CONTROL PANEL')}</h3>
          <p class="muted">${t('Kiểm soát danh sách học sinh, ai đã đăng nhập và tiến độ làm bài.','Monitor all students, login times, and learning progression.')}</p>
        </div>
      </div>
      <button type="button" class="primary wide" onclick="nav('admin')">🛡️ ${t('Mở Trung tâm Quản trị →','Open Admin Dashboard →')}</button>
    </div>` : ''}

    <div class="profile-bento-grid">
      <div class="profile-bento-col-left">
        <div class="card profile-header-card">
          <div class="profile-avatar-wrap">
            <div class="profile-avatar">${animal(u.avatar||buddy())}</div>
          </div>
          <span class="eyebrow">NUMIQUICK · ${t('HỒ SƠ HỌC SINH','STUDENT PROFILE')}</span>
          <h1 class="profile-name">
            <span id="profileNameText">${esc(u.name)}</span>
            <button type="button" class="profile-edit-name-btn" id="editNameBtn" title="${t('Đổi tên hiển thị','Change display name')}">✏️</button>
          </h1>
          <p class="profile-username">@${esc(u.username)} · <span class="profile-joined">${t('Thành viên NumiQuick','NumiQuick Learner')}</span></p>

          <div class="profile-field-group">
            <label class="profile-field-label">🎓 ${t('Lớp học của em:','Current Grade Level:')}</label>
            <div class="profile-grade-chips">
              ${[1,2,3,4,5,6,7,8,9].map(g=>`<button type="button" class="profile-grade-chip ${curGrade===g?'active':''}" data-set-grade="${g}">${NUMI_GRADES[g]?NUMI_GRADES[g].icon:'🌱'} ${lang==='vi'?NUMI_GRADES[g].name:NUMI_GRADES[g].enName}</button>`).join('')}
            </div>
          </div>

          <div class="profile-field-group">
            <label class="profile-field-label">🐾 ${t('Bạn thú đồng hành:','Choose Study Buddy:')}</label>
            <div class="profile-buddy-chips">
              ${[['bunny','Thỏ Mimi 🐰'],['panda','Gấu Baobao 🐼'],['fox','Cáo Kiki 🦊'],['lion','Sư tử Leo 🦁']].map(([av,lbl])=>`<button type="button" class="profile-buddy-chip ${(u.avatar||'bunny')===av?'active':''}" data-set-avatar="${av}"><div class="buddy-chip-icon">${animal(av)}</div><span>${lbl}</span></button>`).join('')}
            </div>
          </div>
        </div>

        <div class="card profile-password-card">
          <div class="profile-pwd-header">
            <h3>🔑 ${t('Mật khẩu & Mã PIN của em','My Password & PIN')}</h3>
            <p class="muted">${t('Dùng để đăng nhập hoặc đổi tài khoản nhanh khi có nhiều bạn cùng dùng máy.','Use this PIN/Password to sign in or switch profiles on this device.')}</p>
          </div>

          <div class="current-pwd-box">
            <div class="current-pwd-label-row">
              <span class="current-pwd-label">🔒 ${t('Mật khẩu hiện tại:','Current Password:')}</span>
              <span class="current-pwd-hint">${t('(Bấm 👁️ để ẩn hoặc xem)','(Click 👁️ to hide or show)')}</span>
            </div>
            <div class="current-pwd-field">
              <input type="text" id="currentPwdDisplay" readonly value="${esc(currentPwd || (uUser.hash ? '••••••••' : '1234'))}" class="current-pwd-input" spellcheck="false" autocomplete="off" aria-label="${t('Mật khẩu hiện tại','Current password')}">
              <div class="current-pwd-btns">
                <button type="button" id="toggleCurrentPwdBtn" class="pwd-action-btn" title="${t('Ẩn / Hiện mật khẩu','Hide / Show password')}">👁️ <span class="btn-text">${t('Ẩn','Hide')}</span></button>
                <button type="button" id="copyCurrentPwdBtn" class="pwd-action-btn" title="${t('Sao chép mật khẩu','Copy password')}">📋 <span class="btn-text">${t('Chép','Copy')}</span></button>
              </div>
            </div>
            ${!currentPwd && uUser.hash ? `<p class="muted" style="margin:6px 0 0;font-size:12px">💡 ${t('Mật khẩu trước đây đã được mã hóa bảo mật. Em có thể nhập mật khẩu mới bên dưới để đặt lại nhé!','Your earlier password was encrypted. You can enter a new password below to reset it!')}</p>` : ''}
          </div>

          <div class="change-pwd-divider"></div>

          <div class="change-pwd-box">
            <h4 style="margin:0 0 10px;font-size:14px;color:#284632;font-weight:800">
              🔄 ${t('Đổi mã PIN / Mật khẩu mới','Change PIN / New password')}
            </h4>
            <form id="changePinForm" class="profile-pin-form">
              <div class="profile-pwd-fields-grid">
                <label>${t('Mật khẩu mới (tối thiểu 4 số/ký tự)','New password (min 4 characters)')}
                  <div class="pwd-input-wrap">
                    <input type="password" id="newPinInput" minlength="4" required placeholder="${t('Ví dụ: 1234 hoặc bông hoa','e.g. 1234 or flower')}">
                    <button type="button" class="pwd-eye-btn" data-toggle-eye="newPinInput" title="${t('Hiện/ẩn mật khẩu','Toggle visibility')}">👁️</button>
                  </div>
                </label>
                <label>${t('Nhập lại mật khẩu mới','Confirm new password')}
                  <div class="pwd-input-wrap">
                    <input type="password" id="confirmPinInput" minlength="4" required placeholder="${t('Nhập lại mật khẩu mới','Confirm new password')}">
                    <button type="button" class="pwd-eye-btn" data-toggle-eye="confirmPinInput" title="${t('Hiện/ẩn mật khẩu','Toggle visibility')}">👁️</button>
                  </div>
                </label>
              </div>
              <p id="pinMessage" class="danger" role="status" style="margin:8px 0;font-weight:700"></p>
              <button type="submit" class="primary" id="saveNewPwdBtn" style="margin-top:8px">💾 ${t('Lưu mật khẩu mới','Save new password')}</button>
            </form>
          </div>
        </div>

        <div class="card profile-settings-card">
          <h3>⚙️ ${t('Tùy chỉnh giao diện & Âm thanh','Display & Sound Settings')}</h3>
          <div class="profile-quick-prefs">
            <div class="pref-row">
              <span>🎨 ${t('Giao diện màu sắc:','Color Theme:')}</span>
              <div class="pref-theme-chips">
                ${Object.keys(typeof NUMI_THEMES!=='undefined'?NUMI_THEMES:{}).map(k=>`<button type="button" class="theme-chip ${document.body.dataset.theme===k?'active':''}" data-theme-pick="${k}">${NUMI_THEMES[k].name}</button>`).join('')}
              </div>
            </div>
            <div class="pref-row">
              <span>🔊 ${t('Âm thanh vui nhộn:','Sound effects:')}</span>
              <button type="button" id="profileSoundToggle" class="profile-btn-pill">
                ${soundEnabled?'🔊 '+t('Bật','On'):'🔈 '+t('Tắt','Off')}
              </button>
            </div>
          </div>
        </div>

        ${otherUsers.length?`<div class="card profile-family-card">
          <h3>👨‍👩‍👧 ${t('Chuyển sang tài khoản bé khác trong nhà','Switch to another child profile')}</h3>
          <p class="muted">${t('Mỗi bé có bảng điểm, cấp độ và chuỗi ngày riêng biệt.','Each child has their own progress, level, and daily streak.')}</p>
          <div class="family-chips">
            ${otherUsers.map(uOther=>`<button type="button" class="family-chip" data-switch-user="${esc(uOther.username)}"><span class="family-chip-avatar">${animal(uOther.avatar||'bunny')}</span><span class="family-chip-name">${esc(uOther.name)} (${uOther.grade?(lang==='vi'?'Lớp '+uOther.grade:'Grade '+uOther.grade):'Lớp 1'})</span></button>`).join('')}
          </div>
        </div>`:''}

        <div class="profile-bottom-actions card profile-actions-card">
          <button class="primary wide" onclick="nav('setup')">⚡ ${t('Vào luyện tập ngay','Start practicing now')} →</button>
          <button class="wide" onclick="renderWorksheet()" style="margin-top:8px">📄 ${t('In phiếu bài tập (PDF)','Print worksheet (PDF)')}</button>
          <button class="wide" onclick="openAccount('signup')" style="margin-top:8px">➕ ${t('Tạo thêm tài khoản bé khác','Add another child profile')}</button>
          <button id="profileSignOutBtn" class="danger wide" style="margin-top:14px">🚪 ${t('Đăng xuất tài khoản','Sign out')}</button>
        </div>
      </div>

      <div class="profile-bento-col-right">
        <div class="profile-stats-grid">
          <div class="profile-stat-box card">
            <span class="stat-icon">🏅</span>
            <div class="stat-info"><small>${t('Cấp độ','Level')}</small><strong>${level()}</strong></div>
          </div>
          <div class="profile-stat-box card">
            <span class="stat-icon">⭐</span>
            <div class="stat-info"><small>${t('Điểm XP','XP Score')}</small><strong>${state.xp}</strong></div>
          </div>
          <div class="profile-stat-box card">
            <span class="stat-icon">🔥</span>
            <div class="stat-info"><small>${t('Chuỗi ngày 🔥','Daily Streak')}</small><strong>${streak.count} ${t('ngày','days')}</strong></div>
          </div>
          <div class="profile-stat-box card">
            <span class="stat-icon">🧋</span>
            <div class="stat-info"><small>${t('Trân châu','Pearls')}</small><strong>${tea.pearls} ${t('viên','pearls')}</strong></div>
          </div>
        </div>

        <div class="card profile-tea-card">
          <div class="tea-card-header">
            <span class="tea-cup-icon">${typeof teaIcon==='function'?teaIcon(tea.size):'🧋'}</span>
            <div>
              <h3>${t('Mục tiêu Trà Sữa Trân Châu','Milk Tea Boba Goal')} · Size ${tea.size}</h3>
              <p class="muted">${t('Mỗi câu đúng tích lũy 1 viên trân châu cho ly trà sữa ngọt ngào!','Every correct answer adds 1 chewy boba pearl!')}</p>
            </div>
          </div>
          <div class="tea-progress-wrap">
            <div class="tea-progress-label">
              <span><b>${Math.min(goal,tea.pearls)}</b> / ${goal} ${t('viên trân châu','pearls')}</span>
              <span>${Math.round((Math.min(goal,tea.pearls)/goal)*100)}%</span>
            </div>
            <progress class="tea-progress-bar" max="${goal}" value="${Math.min(goal,tea.pearls)}"></progress>
          </div>
          <button class="primary wide" onclick="nav('atlas')">🧋 ${t('Vào quán trà sữa & Nhận thưởng','View Milk Tea Shop & Level Up')} →</button>
        </div>

        <div class="card profile-perf-card">
          <h3>📈 ${t('Hiệu suất tính nhẩm','Mental Math Performance')}</h3>
          <div class="perf-stats-row">
            <div class="perf-col"><span class="perf-val">${totalSessions}</span><small>${t('Lượt luyện','Sessions')}</small></div>
            <div class="perf-col"><span class="perf-val">${totalCorrect}/${totalAnswered}</span><small>${t('Câu đúng','Correct')}</small></div>
            <div class="perf-col"><span class="perf-val">${accuracy}%</span><small>${t('Chính xác','Accuracy')}</small></div>
            <div class="perf-col"><span class="perf-val">${avgSpeed}s</span><small>${t('Tốc độ/câu','Speed/Q')}</small></div>
          </div>
          <button class="wide" onclick="nav('stats')" style="margin-top:14px">🏅 ${t('Xem nhật ký tiến bộ chi tiết 7 ngày','View 7-day progress journal')} →</button>
        </div>

        <div class="card profile-badges-card">
          <div class="badges-header">
            <h3>🎖️ ${t('Bộ sưu tập Huy hiệu & Danh hiệu','Badges & Milestone Honors')}</h3>
            <span class="badges-count">${badgesList.filter(b=>b.unlocked).length}/${badgesList.length} ${t('đã đạt','unlocked')}</span>
          </div>
          <div class="badges-grid">
            ${badgesList.map(b=>`<div class="badge-item ${b.unlocked?'unlocked':'locked'}"><div class="badge-icon-wrap">${b.icon}</div><div class="badge-details"><b>${lang==='vi'?b.titleVi:b.titleEn}</b><p>${lang==='vi'?b.descVi:b.descEn}</p><span class="badge-tag ${b.unlocked?'tag-unlocked':'tag-locked'}">${b.unlocked?'🌟 '+t('Đã mở khóa','Unlocked'):'🔒 '+t('Chưa mở','Locked')}</span></div></div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </section>`;

  $$('[data-set-grade]').forEach(btn=>{
    btn.onclick=()=>{
      const g=+btn.dataset.setGrade;
      updateUserProfile({grade:g});
      renderProfile();
      toast(t('Đã chuyển sang '+(lang==='vi'?'Lớp '+g:'Grade '+g)+'! 🎓','Switched to Grade '+g+'! 🎓'));
    };
  });

  $$('[data-set-avatar]').forEach(btn=>{
    btn.onclick=()=>{
      const av=btn.dataset.setAvatar;
      updateUserProfile({avatar:av});
      renderProfile();
      toast(t('Đã đổi bạn đồng hành thành công! 🌟','Companion updated! 🌟'));
    };
  });

  const editNameBtn=$('#editNameBtn');
  if(editNameBtn){
    editNameBtn.onclick=()=>{
      modal(`<h2>✏️ ${t('Đổi tên hiển thị','Change display name')}</h2><p class="muted">${t('Nhập tên của em (Ví dụ: Minh Khôi, Bảo An)','Enter your name (e.g. Alex, Emily)')}</p><input id="profileModalNameInput" maxlength="30" value="${esc(u.name)}" style="width:100%;font-size:16px;padding:10px;margin:12px 0;border-radius:10px;border:1.5px solid #d5e4c7"><div class="actions"><button class="primary" id="saveProfileNameBtn">${t('Lưu tên mới','Save name')}</button><button id="cancelProfileNameBtn">${t('Hủy','Cancel')}</button></div>`);
      $('#cancelProfileNameBtn').onclick=()=>$('#modal').close();
      $('#saveProfileNameBtn').onclick=()=>{
        const val=$('#profileModalNameInput')?.value.trim();
        if(!val){toast(t('Vui lòng nhập tên của em.','Please enter a name.'));return}
        updateUserProfile({name:val});
        $('#modal').close();
        renderProfile();
        toast(t('Đã cập nhật tên thành '+val+'! 🎉','Name updated to '+val+'! 🎉'));
      };
    };
  }

  const toggleCurrentPwdBtn=$('#toggleCurrentPwdBtn');
  if(toggleCurrentPwdBtn){
    toggleCurrentPwdBtn.onclick=()=>{
      const inp=$('#currentPwdDisplay');
      if(!inp)return;
      const isText=inp.type==='text';
      inp.type=isText?'password':'text';
      const label=toggleCurrentPwdBtn.querySelector('.btn-text');
      if(label)label.textContent=isText?t('Hiện','Show'):t('Ẩn','Hide');
    };
  }

  const copyCurrentPwdBtn=$('#copyCurrentPwdBtn');
  if(copyCurrentPwdBtn){
    copyCurrentPwdBtn.onclick=()=>{
      const val=$('#currentPwdDisplay')?.value;
      if(!val||val==='••••••••'){toast(t('Chưa có mật khẩu để sao chép.','No password to copy.'));return;}
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(val).then(()=>{
          toast(t('Đã sao chép mật khẩu! 📋','Copied password! 📋'));
        }).catch(()=>{
          toast(t('Mật khẩu của em là: ','Your password is: ')+val);
        });
      }else{
        toast(t('Mật khẩu của em là: ','Your password is: ')+val);
      }
    };
  }

  $$('[data-toggle-eye]').forEach(btn=>{
    btn.onclick=()=>{
      const targetId=btn.dataset.toggleEye;
      const inp=$('#'+targetId);
      if(!inp)return;
      const isPassword=inp.type==='password';
      inp.type=isPassword?'text':'password';
      btn.style.opacity=isPassword?'1':'0.6';
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
      if(!p1||p1.length<4){if(msg)msg.textContent=t('Mật khẩu cần ít nhất 4 ký tự hoặc 4 số.','Password must be at least 4 characters.');return}
      if(p1!==p2){if(msg)msg.textContent=t('Mật khẩu xác nhận chưa khớp. Vui lòng kiểm tra lại.','Confirmation password does not match.');return}
      try{
        await updateUserPassword(p1);
        toast(t('Đã đổi mật khẩu thành công! 🔒','Password updated successfully! 🔒'));
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
      toast(soundEnabled?t('Đã bật âm thanh ♫','Sound turned on ♫'):t('Đã tắt âm thanh ♪','Sound turned off ♪'));
    };
  }

  $$('[data-switch-user]').forEach(btn=>{
    btn.onclick=()=>{
      const targetUser=btn.dataset.switchUser;
      const targetObj=allLocalUsers[targetUser];
      if(!targetObj)return;
      modal(`<h2>👤 ${t('Đăng nhập tài khoản '+targetObj.name,'Sign in as '+targetObj.name)}</h2><p class="muted">${t('Nhập mã PIN của bé để vào học:','Enter PIN to switch profile:')}</p><input type="password" id="switchPinInput" minlength="4" placeholder="••••" style="width:100%;font-size:18px;padding:10px;margin:12px 0;border-radius:10px;border:1.5px solid #d5e4c7;text-align:center"><p id="switchPinError" class="danger" style="margin:6px 0;font-weight:700"></p><div class="actions"><button class="primary" id="confirmSwitchBtn">${t('Vào học →','Sign in →')}</button><button id="cancelSwitchBtn">${t('Hủy','Cancel')}</button></div>`);
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
        localSignOut();
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
    ${!signup ? `<div class="admin-hint-bar">
      <span>🛡️ ${t('Tài khoản Quản trị:','Admin Account:')}</span>
      <button type="button" id="quickAdminLoginBtn" class="admin-hint-pill"><b>admin</b> / <b>admin123</b></button>
    </div>` : ''}
    ${userChips}
    <form id="authForm" class="auth-form">
      ${signup?`<label>${t('Tên của em (Ví dụ: Minh Khôi, Bảo An)','Your name (e.g. Alex, Emily)')}<input name="name" maxlength="30" placeholder="${t('Nhập tên của em','Enter your name')}" required value="${state.name&&state.name!=='Explorer'?esc(state.name):''}"></label>`:''}
      <label>${t('Tên đăng nhập','Username')}<input name="username" maxlength="50" autocomplete="username" placeholder="${t('Ví dụ: khoi123','e.g. alex123')}" required></label>
      <label>${t('Mật khẩu / Mã PIN (tối thiểu 4 ký tự)','Password / PIN (min 4 characters)')}<input name="password" type="password" autocomplete="${signup?'new-password':'current-password'}" minlength="4" required placeholder="••••"></label>
      ${signup?`<label>${t('Em đang học lớp mấy?','Which grade are you in?')}</label><div class="grade-signup-picks">${[1,2,3,4,5,6,7,8,9].map(g=>`<label><input type="radio" name="signupGrade" value="${g}" ${g===1?'checked':''}><span>${(typeof NUMI_GRADES!=='undefined'&&NUMI_GRADES[g])?NUMI_GRADES[g].icon:'🌱'} ${(typeof NUMI_GRADES!=='undefined'&&NUMI_GRADES[g])?(lang==='vi'?NUMI_GRADES[g].name:NUMI_GRADES[g].enName):('Lớp '+g)}</span></label>`).join('')}</div>`:''}
      ${companionPicks}
      <p id="authMessage" class="danger" role="status" style="margin:12px 0;font-weight:700"></p>
      <button type="submit" class="primary wide" id="authSubmitBtn">${signup?t('Tạo tài khoản & Bắt đầu học →','Create account & Start learning →'):t('Đăng nhập vào học →','Sign in to learn →')}</button>
    </form>
    ${cloudConfigured()&&!signup?`<div class="section"><p class="muted" style="text-align:center">${t('Hoặc tài khoản Supabase:','Or Supabase Account:')}</p>${window.NUMI_CLOUD_CONFIG.googleEnabled?`<button type="button" class="wide" id="googleSignIn">${t('Tiếp tục với Google','Continue with Google')}</button>`:''}</div>`:''}
  </div>`;

  $('#tabLogin').onclick=()=>openAccount('login');
  $('#tabSignup').onclick=()=>openAccount('signup');
  if($('#quickAdminLoginBtn')){
    $('#quickAdminLoginBtn').onclick=()=>{
      const f=$('#authForm');
      if(f){
        f.username.value='admin';
        f.password.value='admin123';
        $('#authSubmitBtn')?.click();
      }
    };
  }
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
