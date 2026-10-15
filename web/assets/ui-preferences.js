(function(){
 const key='solar-planner-ui-preferences-v1';
 let prefs={};try{prefs=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(_){prefs={}}
 const root=document.documentElement;
 function apply(t,f){
   root.setAttribute('data-theme',t);
   root.setAttribute('data-font',f);
   const tBtn=document.getElementById('themeToggle'), tLabel=document.getElementById('themeLabel');
   if(tBtn)tBtn.setAttribute('aria-pressed',String(t==='dark'));
   if(tLabel)tLabel.textContent=t==='dark'?'Gelap':'Terang';
   const font=document.getElementById('fontSelect');if(font)font.value=f;
   try{localStorage.setItem(key,JSON.stringify({theme:t,font:f}))}catch(_){ }
 }
 let theme=['light','dark'].includes(prefs.theme)?prefs.theme:'light';
 let font=['system','arial','tahoma'].includes(prefs.font)?prefs.font:'system';
 apply(theme,font);
 document.getElementById('themeToggle')?.addEventListener('click',()=>{theme=theme==='dark'?'light':'dark';apply(theme,font)});
 document.getElementById('fontSelect')?.addEventListener('change',e=>{font=e.target.value;apply(theme,font)});
})();
