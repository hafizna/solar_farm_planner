const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
async function login(page){await page.goto('/');await page.locator('#demoUserName').fill('Online reviewer');await page.locator('#demoLoginForm button').click();await page.locator('.home-start').click();await page.locator('[data-sc="demo"]').click();}
test('online sources retain provenance and partial failures; standalone HTML report works offline',async({page,context})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route(/^https?:\/\/(?!127\.0\.0\.1:\d+)/,route=>route.abort());
 await page.route('**/api/data?**',async route=>{const url=new URL(route.request().url()),source=url.searchParams.get('source');let data;
 if(source==='osm')data={osm3s:{timestamp_osm_base:'2026-10-15T00:00:00Z'},elements:[{type:'node',id:1,lat:-6.89,lon:107.72,tags:{power:'substation',voltage:'150000;20000',name:'GI Publik'}},{type:'node',id:2,lat:-6.9,lon:107.73,tags:{power:'substation'}},{type:'node',id:3,lat:-6.9,lon:107.74,tags:{power:'substation',voltage:'500000;150000',name:'GITET excluded'}},{type:'way',id:4,tags:{highway:'primary'},geometry:[{lat:-6.89,lon:107.72},{lat:-6.895,lon:107.755}]}]};
 else if(source==='nasa')data={properties:{parameter:{ALLSKY_SFC_SW_DWN:{ANN:5.1,JAN:4.8}}},parameters:{ALLSKY_SFC_SW_DWN:{units:'kW-hr/m^2/day'}},header:{range:'2001–2025',fill_value:-999}};
 else if(source==='risk')data={value:'NoData'};
 else return route.fulfill({status:503,json:{error:'Fixture: source unavailable'}});
 return route.fulfill({json:{source,upstream:'https://example.test/'+source,fetched_at:'2026-10-15T00:00:00Z',data}});
 });
 await login(page);await page.locator('[data-live-source="cover"]').uncheck();
 await page.locator('#liveLoad').click();await expect(page.locator('#scStatus')).toContainText('Pengambilan selesai',{timeout:20000});
 await expect(page.locator('#liveStatus')).toContainText('5,1');
 const state=await page.evaluate(()=>({live:SCREEN.live,gis:screenGis(),features:SCREEN.features}));
 expect(state.live.osm.result.counts.unknownVoltage).toBe(1);expect(state.live.osm.result.counts.ineligibleGI).toBe(1);expect(state.live.risk.status).toBe('no_data');expect(state.live.dem.status).toBe('error');expect(state.gis).toHaveLength(1);expect(state.features.filter(f=>f.properties.source==='SYNTHETIC_PILOT')).toHaveLength(1);
 await page.locator('#scAnalyze').click();await expect(page.locator('#scResults tbody tr')).toHaveCount(2);
 // Escape a hostile project name in both visible HTML and embedded JSON.
 await page.evaluate(()=>SCREEN.name='<script>window.bad=true</script> & report');
 const waitDownload=page.waitForEvent('download');await page.locator('[data-sc="html"]').click();const download=await waitDownload;
 const filename=path.join(__dirname,'../test-results/exported-report.html');fs.copyFileSync(await download.path(),filename);
 const reportPage=await context.newPage();const remote=[];reportPage.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url());});await reportPage.goto(pathToFileURL(filename).href);await expect(reportPage.locator('h1')).toHaveText('<script>window.bad=true</script> & report');expect(await reportPage.evaluate(()=>window.bad)).toBeUndefined();expect(await reportPage.evaluate(()=>JSON.parse(document.querySelector('#evidence').textContent).project)).toBe('<script>window.bad=true</script> & report');await reportPage.locator('[data-select-route="1"]').click();await expect(reportPage.locator('[data-map-route="1"]')).toHaveClass(/active/);expect(remote).toEqual([]);expect(errors).toEqual([]);
});
test('portable application opens as one file with network disabled',async({page})=>{
 const errors=[],localFiles=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().startsWith('file:'))localFiles.push(r.url());});
 await page.route(/^https?:/,r=>r.abort());const file=path.resolve(__dirname,'../portable/georensis-solar.html');await page.goto(pathToFileURL(file).href);
 await expect(page.locator('#demoTitle')).toHaveText('Masuk ke Georensis');
 await expect(page.locator('#demoRole')).toBeHidden();
 await page.locator('#demoUserName').fill('Portable user');await page.locator('#demoLoginForm button').click();
 await expect(page.locator('#demoGate')).toBeHidden();
 await expect(page.locator('.dpt-entry')).toBeVisible();
 await expect(page.locator('#rail [data-page="screening"]')).toHaveCount(0);
 await expect(page.locator('#rail [data-page="beranda"]')).toHaveCount(1);
 await expect(page.locator('#rail [data-page="dpt"]')).toHaveCount(1);
 await page.locator('#rail [data-page="dpt"]').click();
 await expect(page.locator('#pageView')).toContainText('Definisikan komitmen');
 await page.locator('#rail [data-page="ruptl"]').click();await expect(page.locator('#pageView tbody tr').first()).toBeVisible();
 // Breadcrumb now returns to programme-first home; map is available explicitly.
 await page.locator('#pageView [data-page="beranda"]').click();await expect(page.locator('.dpt-entry')).toBeVisible();
 await page.locator('#rail [data-page="peta"]').click();await expect(page.locator('#map')).toBeVisible();
 await page.locator('#rail [data-act="logout"]').click();await expect(page.locator('#demoGate')).toBeVisible();
 expect(await page.evaluate(()=>window.GEORENSIS_PORTABLE)).toBe(true);expect(localFiles).toHaveLength(1);expect(errors).toEqual([]);
});
