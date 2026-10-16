const {test,expect}=require('@playwright/test');
const {pathToFileURL}=require('node:url');const path=require('node:path');
for(const portable of [false,true])test(`RUPTL dependent province filter ${portable?'portable HTML':'web'}`,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route(/^https?:\/\/(?!127\.0\.0\.1:\d+)/,r=>r.abort());
 await page.goto(portable?pathToFileURL(path.resolve(__dirname,'../portable/georensis-solar.html')).href:'/');
 await page.locator('#demoUserName').fill('Filter reviewer');await page.locator('#demoLoginForm button').click();await page.locator('#rail [data-page="ruptl"]').click();
 const data=await page.evaluate(()=>{const aceh=D.provinces.find(p=>p.short==='Aceh'),jabar=D.provinces.find(p=>p.short==='Jawa Barat');return {aceh:aceh.key,jabar:jabar.key,jamali:jabar.wil,sumatera:aceh.wil,jamaliKeys:D.provinces.filter(p=>p.wil===jabar.wil).map(p=>p.key).sort(),allCount:D.provinces.length};});
 const prov=page.locator('[data-in="f:ruptl:prov"]'),wil=page.locator('[data-in="f:ruptl:wil"]');
 await prov.selectOption(data.aceh);await wil.selectOption(data.jamali);
 await expect(prov).toHaveValue('');await expect(prov.locator(`option[value="${data.aceh}"]`)).toHaveCount(0);
 expect(await prov.locator('option').evaluateAll(options=>options.map(o=>o.value).filter(Boolean).sort())).toEqual(data.jamaliKeys);
 const matching=await page.evaluate(()=>({count:ruptlFiltered().length,valid:ruptlFiltered().every(r=>PROV[r.prov].wil===F.ruptl.wil)}));expect(matching.count).toBeGreaterThan(0);expect(matching.valid).toBe(true);
 await prov.selectOption(data.jabar);await wil.selectOption(data.sumatera);await expect(prov).toHaveValue('');await expect(prov.locator(`option[value="${data.jabar}"]`)).toHaveCount(0);
 await prov.selectOption(data.aceh);await wil.selectOption('');await expect(prov).toHaveValue(data.aceh);await expect(prov.locator('option')).toHaveCount(data.allCount+1);
 await wil.selectOption(data.sumatera);await expect(prov).toHaveValue(data.aceh);
 await page.locator('[data-act="resetF"][data-p="ruptl"]').click();await expect(wil).toHaveValue('');await expect(prov).toHaveValue('');await expect(prov.locator('option')).toHaveCount(data.allCount+1);
 // Old/injected invalid filter state is normalized on re-entry too.
 await page.evaluate(({jamali,aceh})=>{F.ruptl.wil=jamali;F.ruptl.prov=aceh;goPage('ruptl');},data);await expect(prov).toHaveValue('');
 const csvPromise=page.waitForEvent('download');await page.locator('[data-act="csvRuptl"]').click();const csv=await csvPromise;const text=require('node:fs').readFileSync(await csv.path(),'utf8');expect(text).not.toContain(';Aceh;');expect(errors).toEqual([]);
});
