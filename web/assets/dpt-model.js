/* Preliminary land-offer economics. Pure functions for browser and Node. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DPTModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const n=v=>typeof v==='number'&&Number.isFinite(v)?v:null;
  const positive=v=>n(v)!=null&&v>0;
  const pvFactor=(years,ratePercent)=>{
    if(!positive(years)||n(ratePercent)==null||ratePercent<0)return null;
    const r=ratePercent/100;
    return r===0?years:(1-Math.pow(1+r,-years))/r;
  };
  function validate(s){
    const errors=[];
    if(!positive(s.target)||s.target>100000)errors.push('Target kapasitas harus positif dan wajar.');
    if(!['MWp','MWac'].includes(s.capacityBasis))errors.push('Satuan target tidak dikenal.');
    for(const [key,min,max] of [['usableFraction',.01,1],['haPerMwp',.1,100],['dcAcRatio',1,2],['ghiMin',0,10],['maxSlope',0,45],['maxRoadMeters',0,50000],['years',1,50],['discountPct',0,50]]){
      if(n(s[key])==null||s[key]<min||s[key]>max)errors.push(key+' di luar rentang.');
    }
    return errors;
  }
  function programme(s){
    const errors=validate(s);if(errors.length)throw Error(errors.join(' '));
    const mwp=s.capacityBasis==='MWp'?s.target:s.target*s.dcAcRatio;
    return {mwp,mwac:mwp/s.dcAcRatio,requiredGrossHa:mwp*s.haPerMwp/s.usableFraction};
  }
  function compare(candidate,routes,substations,ghi,s,offer){
    const plan=programme(s);
    const maxMWp=positive(candidate.areaHa)?candidate.areaHa*s.usableFraction/s.haPerMwp:null;
    const maxMWac=maxMWp==null?null:maxMWp/s.dcAcRatio;
    const eligibleRoutes=routes.filter(r=>r.candidateId===candidate.id&&
      positive(r.km)&&['sutt','sktt'].includes(r.method)&&
      substations.some(g=>g.id===r.giId&&[70,150].includes(Number(g.kv)))&&r.status!=='blocked');
    const best=[...eligibleRoutes].sort((a,b)=>a.km-b.km)[0]||null;
    const reasons=[];
    if(!positive(ghi)||ghi<s.ghiMin)reasons.push('GHI regional di bawah ambang / tidak tersedia');
    if(n(candidate.maxSlope)==null||candidate.maxSlope>s.maxSlope)reasons.push('Kemiringan melampaui batas');
    if(n(candidate.roadMeters)==null||candidate.roadMeters>s.maxRoadMeters)reasons.push('Akses jalan indikatif di luar batas');
    if(!best)reasons.push('Belum ada rute ke GI 70/150 kV');
    if(!positive(candidate.areaHa))reasons.push('Luas kandidat tidak diketahui');
    const full=maxMWp!=null&&maxMWp+1e-9>=plan.mwp;
    const mode=offer?.mode||'beli';
    const price=offer?.price;
    const priced=positive(price);
    const annuity=pvFactor(s.years,s.discountPct);
    const purchasePV=mode==='beli'&&priced?candidate.areaHa*price/1000:null;
    const rentPV=mode==='sewa'&&priced?candidate.areaHa*price*annuity/1000:null;
    const landPV=purchasePV??rentPV;
    return {
      id:candidate.id,areaHa:candidate.areaHa,ghi,meanSlope:candidate.meanSlope,maxSlope:candidate.maxSlope,
      roadMeters:candidate.roadMeters,maxMWp,maxMWac,full,siteEligible:reasons.length===0,
      gate:reasons.length?'DATA / CONSTRAINT':full?'CUKUP UNTUK TARGET':'KAPASITAS PARSIAL',
      reasons,method:best?.method||null,routeKm:best?.km??null,giId:best?.giId??null,
      offerMode:mode,offerPrice:priced?price:null,
      landPV:landPV??null,
      landPVperMWac:landPV!=null&&maxMWac>0?landPV/maxMWac:null,
      validation:'Perlu verifikasi DPT, legalitas, RTRW/LSD, survei, biaya jaringan dan studi P2B'
    };
  }
  function sortRows(rows){
    // No implicit zero-cost: unpriced candidates cannot be declared cheapest.
    return [...rows].sort((a,b)=>
      Number(b.siteEligible)-Number(a.siteEligible)||
      Number(b.full)-Number(a.full)||
      (a.landPVperMWac??Infinity)-(b.landPVperMWac??Infinity)||
      (a.routeKm??Infinity)-(b.routeKm??Infinity));
  }
  return {pvFactor,validate,programme,compare,sortRows};
});
