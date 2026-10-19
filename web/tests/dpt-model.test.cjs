const test=require('node:test');
const assert=require('node:assert/strict');
const D=require('../assets/dpt-model.js');
const base={target:50,capacityBasis:'MWp',usableFraction:.65,haPerMwp:1.5,dcAcRatio:1.25,ghiMin:4.5,maxSlope:15,maxRoadMeters:1500,years:20,discountPct:10};
const site={id:'A',areaHa:150,meanSlope:4,maxSlope:13,roadMeters:100};
const routes=[{candidateId:'A',id:'R70',giId:'g70',method:'sutt',km:7,status:'indicative'},{candidateId:'A',id:'R500',giId:'g500',method:'sutt',km:2}];
const gis=[{id:'g70',kv:70},{id:'g500',kv:500}];
test('MWp vs MWac and gross land are handled separately',()=>{
 const p=D.programme(base);assert.equal(p.mwp,50);assert.equal(p.mwac,40);
 assert.ok(Math.abs(p.requiredGrossHa-115.3846153846)<1e-6);
 assert.equal(D.programme({...base,target:40,capacityBasis:'MWac'}).mwp,50);
});
test('Unpriced land cannot be called zero-cost or cheapest',()=>{
 const r=D.compare(site,routes,gis,5.5,base,{mode:'beli'});
 assert.equal(r.landPV,null);assert.equal(r.landPVperMWac,null);
 assert.equal(r.routeKm,7);assert.equal(r.giId,'g70');
 assert.equal(r.full,true);assert.equal(r.siteEligible,true);
});
test('Discounted lease differs from outright purchase and has transparent units',()=>{
 const a=D.compare(site,routes,gis,5.5,base,{mode:'beli',price:50});
 const b=D.compare(site,routes,gis,5.5,base,{mode:'sewa',price:2});
 assert.equal(a.landPV,7.5);assert.ok(b.landPV>0&&b.landPV<a.landPV);
 assert.equal(D.pvFactor(10,0),10);
});
test('GHI, slope and only 70/150 kV GI control screening',()=>{
 assert.equal(D.compare(site,routes,gis,3,base,{}).siteEligible,false);
 assert.ok(D.compare({...site,maxSlope:18},routes,gis,5.5,base,{}).reasons.some(s=>s.includes('Kemiringan')));
 const wrong=D.compare(site,routes,[{id:'g500',kv:500}],5.5,base,{});
 assert.equal(wrong.routeKm,null);assert.equal(wrong.siteEligible,false);
});
