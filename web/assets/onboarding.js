(function(){
  'use strict';
  const KEY=window.GEORENSIS_PORTABLE?'georensis-portable-session-v2':'solar-demo-session-v1';
  const gate=document.getElementById('demoGate');
  const form=document.getElementById('demoLoginForm');
  const avatar=document.querySelector('#rail .avatar');
  function read(){try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(e){return null}}
  function applySession(session){
    const valid=session&&typeof session.name==='string'&&session.name.trim();
    gate.hidden=!!valid;
    document.body.classList.toggle('demo-locked',!valid);
    if(valid){
      if(avatar){avatar.textContent=session.name.trim().slice(0,2).toUpperCase();avatar.title=session.name+' — '+session.role+' (demo)'}
      goPage(window.GEORENSIS_PORTABLE?'peta':'beranda');
    }else{
      if(avatar){avatar.textContent='DEMO';avatar.title='Belum masuk'}
      document.getElementById('demoUserName')?.focus();
    }
  }
  window.solarDemoLogout=function(){
    try{sessionStorage.removeItem(KEY)}catch(e){}
    applySession(null);
  };
  form.addEventListener('submit',function(event){
    event.preventDefault();
    const name=document.getElementById('demoUserName').value.trim();
    if(!name)return;
    const role=document.getElementById('demoRole').value;
    const session={name,role};
    try{sessionStorage.setItem(KEY,JSON.stringify(session))}catch(e){}
    applySession(session);
  });
  applySession(read());
})();
