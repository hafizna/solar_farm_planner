/* Pure scenario engine shared by browser and Node tests. MWac and MWp are distinct. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PortfolioModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const finite=v=>typeof v==='number'&&Number.isFinite(v);
 const positive=v=>finite(v)&&v>0;
 const clamp=v=>Math.max(0,Math.min(100,v));
 function validateAssumptions(a){const errors=[];for(const [key,min,max] of [['usableFraction',.01,1],['haPerMwp',.1,100],['dcAcRatio',1,2],['performanceRatio',.1,1],['suttDetour',1,5],['skttDetour',1,5]])if(!finite(a[key])||a[key]<min||a[key]>max)errors.push(key+' di luar rentang.');for(const mode of ['sutt','sktt']){const c=a.costs?.[mode];if(c!=null&&(!Array.isArray(c)||c.length!==2||!c.every(positive)||c[1]<c[0]))errors.push('Rentang biaya '+mode+' tidak valid.');}if(a.giWorks!=null&&(!Array.isArray(a.giWorks)||a.giWorks.length!==2||!a.giWorks.every(v=>finite(v)&&v>=0)||a.giWorks[1]<a.giWorks[0]))errors.push('Biaya pekerjaan GI tidak valid.');if((a.costs?.sutt||a.costs?.sktt||a.giWorks)&&!(typeof a.costSource==='string'&&a.costSource.trim()))errors.push('Sumber asumsi biaya wajib diisi.');return errors;}
 function evaluateCandidate(candidate,route,a,requestMwac,ghi,mode='exploration'){
  const errors=validateAssumptions(a);if(errors.length)throw Error(errors.join(' '));
  const area=positive(candidate.areaHa)?candidate.areaHa:null;
  const maxMwp=area==null?null:area*a.usableFraction/a.haPerMwp;
  const request=positive(requestMwac)?requestMwac:null;
  const installedMwp=request==null?null:request*a.dcAcRatio;
  const energy=installedMwp!=null&&positive(ghi)?installedMwp*ghi*365*a.performanceRatio:null;
  const reasons=[];if(request==null)reasons.push('MW ekspor belum diisi');if(maxMwp==null)reasons.push('Luas belum diketahui');else if(installedMwp!=null&&installedMwp>maxMwp+1e-8)reasons.push('MWp melebihi kapasitas indikatif area');
  if(candidate.blocked)reasons.push(candidate.blockReason||'Hambatan wajib belum terpenuhi');
  if(mode==='registration'){for(const [key,label] of [['legal','Legalitas'],['documents','Dokumen'],['technical','Kajian interkoneksi']])if(candidate.readiness?.[key]!=='pass')reasons.push(label+' belum lolos');if(candidate.kind!=='registration')reasons.push('Belum merupakan pendaftaran aktual');}
  if(!route||route.status==='blocked')reasons.push('Koridor belum ditemukan');
  if(candidate.allowedMethods&&route&&!candidate.allowedMethods.includes(route.method))reasons.push('Metode tidak diizinkan pada skenario');
  const km=route&&positive(route.km)?route.km:null;
  if(km==null)reasons.push('Panjang koridor belum tersedia');
  const rates=route?a.costs?.[route.method]:null,works=a.giWorks;
  const connectionCost=km!=null&&rates&&works?[km*rates[0]+works[0],km*rates[1]+works[1]]:null;
  return {id:candidate.id,group:candidate.landGroup||candidate.id,giId:route?.giId||null,method:route?.method||null,routeId:route?.id||null,kind:candidate.kind||'indicative',requestMwac:request,installedMwp,maxMwp,energyMwh:energy,routeKm:km,straightKm:route?.straightKm??null,connectionCostBillion:connectionCost,costPerMw:connectionCost&&request?connectionCost.map(v=>v/request):null,score:null,scoreParts:null,eligible:reasons.length===0,reasons,confidence:route?.confidence||'unknown',route};
 }
 function scoreAlternatives(rows,weights){const keys=['investment','generation','distance'];if(keys.some(k=>!finite(weights[k])||weights[k]<0)||keys.reduce((n,k)=>n+weights[k],0)<=0)throw Error('Bobot harus nonnegatif dan total lebih dari nol.');const eligible=rows.filter(r=>r.eligible),metrics={investment:r=>r.costPerMw?.[1]??null,generation:r=>r.energyMwh!=null&&r.requestMwac?r.energyMwh/r.requestMwac:null,distance:r=>r.routeKm};const ranges={};for(const key of keys){const values=eligible.map(metrics[key]).filter(finite);ranges[key]=values.length?[Math.min(...values),Math.max(...values)]:null;}
  return rows.map(r=>{if(!r.eligible)return {...r,score:null};let score=0,total=0,complete=true;const parts={};for(const k of keys){if(!weights[k])continue;const value=metrics[k](r),range=ranges[k];if(!finite(value)||!range){complete=false;parts[k]=null;continue;}const [min,max]=range;const tied=Math.abs(max-min)<=1e-9*Math.max(1,Math.abs(max),Math.abs(min));const normalized=tied?50:100*(value-min)/(max-min);parts[k]=clamp(k==='generation'?normalized:100-normalized);score+=parts[k]*weights[k];total+=weights[k];}return {...r,score:complete&&total?score/total:null,scoreParts:parts};});
 }
 function optimize(rows,limits,{objective='energy',nodeLimit=1000000}={}){
  if(!finite(limits.regionMwac)||limits.regionMwac<0)return {status:'missing_limits',message:'Isi sisa kuota wilayah dalam MWac.',selection:[]};
  if(!['energy','score'].includes(objective))throw Error('Tujuan optimasi tidak valid.');
  const candidates=rows.filter(r=>r.eligible&&positive(r.requestMwac)&&positive(r.energyMwh)&&r.connectionCostBillion&&r.connectionCostBillion.every(v=>finite(v)&&v>=0)&&(objective!=='score'||finite(r.score)));
  const incompleteCount=rows.filter(r=>r.eligible&&(!positive(r.energyMwh)||!r.connectionCostBillion||(objective==='score'&&!finite(r.score)))).length;
  const missing=[...new Set(candidates.map(r=>r.giId))].filter(id=>!finite(limits.giMwac?.[id])||limits.giMwac[id]<0);
  if(missing.length)return {status:'missing_limits',message:'Kemampuan menerima tambahan di GI belum diisi: '+missing.join(', '),selection:[]};
  if(limits.budgetBillion!=null&&(!finite(limits.budgetBillion)||limits.budgetBillion<0))throw Error('Anggaran tidak valid.');
  const byGroup=new Map();for(const r of candidates){if(!byGroup.has(r.group))byGroup.set(r.group,[]);byGroup.get(r.group).push(r);}const groups=[...byGroup.values()];if(groups.length>12)return {status:'too_large',message:'Batasi perbandingan ke 12 kelompok lahan per simulasi.',selection:[]};
  const value=r=>objective==='energy'?r.energyMwh:r.score*r.requestMwac;
  groups.sort((a,b)=>Math.max(...b.map(value))-Math.max(...a.map(value)));const upper=new Array(groups.length+1).fill(0);for(let i=groups.length-1;i>=0;i--)upper[i]=upper[i+1]+Math.max(...groups[i].map(value));
  let best={value:-1,selection:[],mw:0,energy:0,cost:0,used:{}},nodes=0,limited=false;const used={},chosen=[];
  function dfs(i,mw,energy,cost,total){if(++nodes>nodeLimit){limited=true;return;}if(total+upper[i]<best.value-1e-8)return;if(i===groups.length){if(total>best.value+1e-8||(Math.abs(total-best.value)<1e-8&&cost<best.cost)){best={value:total,selection:[...chosen],mw,energy,cost,used:{...used}};}return;}for(const r of groups[i]){const nextMw=mw+r.requestMwac,nextCost=cost+r.connectionCostBillion[1],giUsed=(used[r.giId]||0)+r.requestMwac;if(nextMw>limits.regionMwac+1e-8||giUsed>limits.giMwac[r.giId]+1e-8||(limits.budgetBillion!=null&&nextCost>limits.budgetBillion+1e-8))continue;const previous=used[r.giId]||0;used[r.giId]=giUsed;chosen.push(r);dfs(i+1,nextMw,energy+r.energyMwh,nextCost,total+value(r));chosen.pop();used[r.giId]=previous;if(limited)return;}dfs(i+1,mw,energy,cost,total);}
  dfs(0,0,0,0,0);if(!candidates.length)return {status:'no_candidates',message:'Belum ada alternatif lengkap yang lolos syarat skenario.',selection:[]};if(best.value<0)return {status:'limit_reached',message:'Pencarian belum menemukan kombinasi; perkecil kelompok.',selection:[]};return {status:limited?'approximate':'optimal',selection:best.selection,mwac:best.mw,mwp:best.selection.reduce((s,r)=>s+r.installedMwp,0),energyMwh:best.energy,costMaxBillion:best.cost,costMinBillion:best.selection.reduce((s,r)=>s+r.connectionCostBillion[0],0),giUsed:best.used,incompleteCount,remainingMwac:limits.regionMwac-best.mw,nodes,objective,message:limited?'Batas pencarian tercapai; kombinasi terbaik yang ditemukan, belum terbukti optimal.':'Kombinasi terbaik pada input dan batas skenario ini; bukan alokasi resmi.'+(incompleteCount?' '+incompleteCount+' alternatif belum lengkap tidak diikutkan.':'')};
 }
 return {validateAssumptions,evaluateCandidate,scoreAlternatives,optimize};
});
