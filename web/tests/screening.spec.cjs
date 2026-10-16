const { test, expect } = require('@playwright/test');
async function enter(page) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:\d+)/, route => route.abort());
  await page.goto('/');
  await page.locator('#demoUserName').fill('Pilot reviewer');
  await page.locator('#demoLoginForm button').click();
}
test('pilot parcel, six alternatives, route selection, exports and study import', async ({page}) => {
  test.setTimeout(90000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await enter(page);
  await page.locator('#rail [data-page="screening"]').click();
  await page.locator('[data-sc="demo"]').click();
  await page.locator('#scAnalyze').click();
  await expect(page.locator('#scResults tbody tr')).toHaveCount(6,{timeout:45000});
  const result=await page.evaluate(()=>({summary:SCREEN.summary,results:SCREEN.results.map(r=>({status:r.status,cost:r.costBillion,road:r.roadShare,pts:r.pts})),forbidden:SCREEN.features.find(f=>f.properties.class==='protected')}));
  expect(result.summary.netHa).toBeLessThan(result.summary.grossHa);
  expect(result.summary.capacityMwp).toBeGreaterThan(0);
  expect(result.results.every(r=>r.cost===null)).toBe(true);
  expect(result.results.some(r=>r.pts.length>0)).toBe(true);
  expect(result.results.filter(r=>r.pts.length).every(r=>r.road!==null)).toBe(true);
  const safe=await page.evaluate(()=>SCREEN.results.every(r=>!r.pts.length||!turf.booleanIntersects(turf.lineString(r.pts.map(p=>[p[1],p[0]])),SCREEN.features.find(f=>f.properties.class==='protected'))));expect(safe).toBe(true);
  await page.locator('[data-sc-route="1"]').click();
  expect(await page.evaluate(()=>SCREEN.selected)).toBe(1);
  const downloadPromise=page.waitForEvent('download');await page.locator('[data-sc="json"]').click();const download=await downloadPromise;
  const report=JSON.parse(require('fs').readFileSync(await download.path(),'utf8'));
  expect(report.alternatives).toHaveLength(6);expect(report.missing).toContain('Resistivitas termal tanah');expect(report.inputs.features).toHaveLength(10);
  await page.locator('#scStudy').setInputFiles({name:'study.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({gi_id:'pilot-a',status:'in_review',reference:'PILOT-001',date:'2026-10-15',notes:'Menunggu kajian grid'}))});
  await expect(page.locator('#scStudies')).toContainText('PILOT-001');
  await page.locator('.screen-input summary').click();
  await page.locator('#scSuttMin').fill('1');await page.locator('#scSuttMax').fill('2');
  await page.locator('#scAnalyze').click();await expect(page.locator('#scStatus')).toContainText('sumber benchmark');
  await page.locator('#scCostSource').fill('Asumsi pengujian, bukan benchmark proyek');
  await page.locator('#scAnalyze').click();await expect(page.locator('#scResults tbody tr')).toHaveCount(6,{timeout:45000});
  expect(await page.evaluate(()=>SCREEN.results.filter(r=>r.method==='sutt'&&r.km!=null).every(r=>r.costBillion[0]===r.km&&r.costBillion[1]===r.km*2))).toBe(true);
  await page.screenshot({path:'test-results/screening-workspace.png',fullPage:true});
  expect(errors).toEqual([]);
});
test('all navigation pages render without runtime errors',async({page})=>{
  await enter(page);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const id of ['beranda','screening','gi','ringkasan','ruptl','lahan','validasi','ranking','tindak','master','unggah','laporan','bantuan','peta']){
    await page.locator(`#rail [data-page="${id}"]`).click();
    if(id!=='peta')await expect(page.locator('#pageView h1').first()).toBeVisible();
  }expect(errors).toEqual([]);
});
test('invalid input is rejected atomically and polygon overlap is deducted once',async({page})=>{
  await enter(page);await page.locator('#rail [data-page="screening"]').click();
  await page.locator('[data-sc="demo"]').click();
  await page.locator('#scFile').setInputFiles({name:'bad.geojson',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({type:'FeatureCollection',features:[{type:'Feature',properties:{class:'gi',kv:500},geometry:{type:'Point',coordinates:[107,-6]}}]}))});
  await expect(page.locator('#scStatus')).toContainText('kv 70 atau 150');expect(await page.evaluate(()=>SCREEN.features.length)).toBe(10);
  await page.evaluate(()=>{const f=SCREEN.features.find(f=>f.properties.class==='protected');SCREEN.features.push(JSON.parse(JSON.stringify(f)));});
  await page.locator('#scAnalyze').click();await expect(page.locator('#scResults tbody tr')).toHaveCount(6,{timeout:45000});
  const area=await page.evaluate(()=>{const site=SCREEN.site,p=SCREEN.features.find(f=>f.properties.class==='protected');return {actual:SCREEN.summary.netHa,expected:turf.area(turf.difference(turf.featureCollection([site,p])))/10000};});expect(area.actual).toBeCloseTo(area.expected,5);
});

test('drawing a parcel and rejecting a self intersecting parcel',async({page})=>{
  await enter(page);await page.locator('#rail [data-page="screening"]').click();
  await page.locator('[data-sc="draw"]').click();
  const box=await page.locator('#screenMap').boundingBox();
  for(const [x,y] of [[.4,.4],[.6,.4],[.6,.6],[.4,.6]])await page.mouse.click(box.x+box.width*x,box.y+box.height*y);
  await page.locator('[data-sc="finish"]').click();
  expect(await page.evaluate(()=>SCREEN.site.geometry.coordinates[0].length)).toBe(5);
  const rejection=await page.evaluate(()=>{try{validateScreenGeojson({type:'FeatureCollection',features:[{type:'Feature',properties:{class:'site'},geometry:{type:'Polygon',coordinates:[[[107,-6],[108,-7],[108,-6],[107,-7],[107,-6]]]}}]});return false;}catch{return true;}});expect(rejection).toBe(true);
});
