/* Commitment-led solar programme and preliminary DPT buy/lease comparison.
   Pilot patches are not cadastral parcels or actual DPT participants. */
(function(){
'use strict';
const KEY='georensis-commitment-dpt-v1';
const init=()=>({title:'Skenario komitmen kapasitas (DEMO)',source:'Input simulasi; belum merupakan penugasan lokasi',pilotId:'kupang',target:50,capacityBasis:'MWp',usableFraction:.65,haPerMwp:1.5,dcAcRatio:1.25,ghiMin:4.5,maxSlope:15,maxRoadMeters:1500,years:20,discountPct:10,offers:{},hasExample:false});
function retrieve(){try{const s=JSON.parse(localStorage.getItem(KEY)||'null');return s&&typeof s==='object'&&!Array.isArray(s)?Object.assign(init(),s):init();}catch(e){return init();}}
let state=retrieve();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}};
const n=v=>v==null?'—':Number(v).toLocaleString('id-ID',{maximumFractionDigits:2});
const pilot=()=>PILOT_CATALOG.find(p=>(p.id||'kupang')===state.pilotId)||PILOT_CATALOG[0];
const choice=(v,l,current)=>'<option value="'+esc(v)+'"'+(v===current?' selected':'')+'>'+esc(l)+'</option>';
const num=(key,label,min,max,step)=>'<label>'+esc(label)+'<input data-dpt-field="'+key+'" type="number" min="'+min+'" max="'+max+'" step="'+step+'" value="'+state[key]+'"></label>';
function result(){
 const p=pilot(),plan=DPTModel.programme(state);
 const rows=DPTModel.sortRows(p.candidates.map(c=>DPTModel.compare(c,p.routes,p.gis,p.ghi,state,state.offers[c.id])));
 return {p,plan,rows,geo:rows.filter(r=>r.siteEligible),full:rows.filter(r=>r.siteEligible&&r.full)};
}
const oldHome=PAGES.beranda;
MENU.splice(1,0,['dpt','Program & Penjajakan DPT','target']);
const nav=document.createElement('button');
nav.dataset.page='dpt';nav.dataset.label='Program & Penjajakan DPT';nav.setAttribute('aria-label',nav.dataset.label);
nav.innerHTML=ic('target');
$('rail').insertBefore(nav,$('rail').querySelector('[data-page="peta"]'));
PAGES.beranda=()=>'<section class="dpt-entry"><div class="dpt-kicker">ALUR UTAMA · KOMITMEN → DPT → SCREENING → INTERKONEKSI</div><h2>Target kapasitas belum berarti lokasi tanah sudah tersedia.</h2><p>Mulai dari komitmen MWp/MWac, pilih wilayah penjajakan, lalu bandingkan harga beli/sewa beserta GHI, luas, akses, dan koridor ke GI 70/150 kV.</p><button class="btn pri" data-page="dpt">Mulai dari kebutuhan proyek →</button></section>'+oldHome();
function render(){
 try{
 const x=result(),p=x.p,plan=x.plan,rows=x.rows;
 const priced=rows.filter(r=>r.landPV!=null);
 let html=pageHead('dpt','Komitmen kapasitas → pencarian lahan DPT (beli atau sewa) → uji fisik → kajian GI dan koridor.');
 html+='<div class="dpt-wrap"><section class="dpt-intro"><div class="dpt-kicker">PROGRAMME-LED / PRE-SCREENING</div><h2>Mulai dari target, bukan bidang tanah yang diasumsikan sudah final.</h2><p>Lokasi dibuka pada tingkat wilayah pilot; kandidat indikatif dicari dengan GIS lalu dihadapkan pada penawaran harga dan kesiapan lahan. Kuota 100 GWp nasional bukan otomatis alokasi MW per GI.</p></section>';
 html+='<section class="sec"><h3>01 / Definisikan komitmen pengembangan</h3><div class="dpt-grid">';
 html+='<label class="dpt-span2">Nama program atau skenario<input data-dpt-field="title" maxlength="120" value="'+esc(state.title)+'"></label>';
 html+='<label class="dpt-span2">Sumber target / rujukan<input data-dpt-field="source" maxlength="160" value="'+esc(state.source)+'"></label>';
 html+='<label>Wilayah indikatif<select data-dpt-field="pilotId">'+PILOT_CATALOG.map(z=>choice(z.id||'kupang',z.name,state.pilotId)).join('')+'</select></label>';
 html+=num('target','Komitmen kapasitas',.01,100000,1);
 html+='<label>Satuan target<select data-dpt-field="capacityBasis">'+choice('MWp','MWp — DC',state.capacityBasis)+choice('MWac','MWac — AC',state.capacityBasis)+'</select></label>';
 html+=num('usableFraction','Fraksi lahan efektif (0–1)',.01,1,.05);
 html+=num('haPerMwp','Kepadatan (ha/MWp)',.1,100,.1);
 html+=num('dcAcRatio','Rasio DC/AC',1,2,.05);
 html+='</div><div class="dpt-metrics"><div><small>Target DC</small><strong>'+n(plan.mwp)+' MWp</strong></div><div><small>Ekivalen AC</small><strong>'+n(plan.mwac)+' MWac</strong></div><div><small>Estimasi luas bruto</small><strong>'+n(plan.requiredGrossHa)+' ha</strong></div><div><small>GHI regional</small><strong>'+n(p.ghi)+'</strong><small>kWh/m²/hari</small></div></div>';
 html+='<p class="dpt-note">Luas bruto = MWp × ha/MWp ÷ fraksi efektif. Parameter hanya asumsi screening, bukan desain layout PLTS. RUPTL, program 100 GWp, dan kuota GI tidak otomatis sama.</p></section>';
 html+='<section class="sec"><h3>02 / Saring kesiapan fisik</h3><div class="dpt-grid">';
 html+=num('ghiMin','Ambang GHI regional (kWh/m²/hari)',0,10,.1);
 html+=num('maxSlope','Kemiringan maksimum (°)',0,45,1);
 html+=num('maxRoadMeters','Jarak ke jalan terpetakan (m)',0,50000,50);
 html+=num('years','Horizon sewa (tahun)',1,50,1);
 html+=num('discountPct','Diskonto perbandingan PV (%)',0,50,.5);
 html+='</div><div class="dpt-metrics"><div><small>Area indikatif</small><strong>'+p.candidates.length+'</strong></div><div><small>Lolos batas GIS*</small><strong>'+x.geo.length+'</strong></div><div><small>Cukup untuk target sendiri*</small><strong>'+x.full.length+'</strong></div><div><small>Akumulasi kapasitas teoretis*</small><strong>'+n(x.geo.reduce((v,r)=>v+(r.maxMWp||0),0))+' MWp</strong></div></div>';
 html+='<p class="dpt-note">*Polygon berasal dari raster, bukan sertifikat atau bukti lahan tersedia. Penjumlahan area tidak membuktikan dapat dikonsolidasikan. GHI regional tidak memiliki resolusi untuk membedakan iradiasi antarkandidat yang berdekatan.</p></section>';
 html+='<section class="sec"><h3>03 / Bandingkan indikasi harga beli atau sewa</h3><p class="sd">Masukkan harga per area berdasarkan penawaran yang diperoleh secara sah. Beli: juta Rp/ha. Sewa: juta Rp/ha/tahun. Nilai sewa dikonversi menjadi PV selama horizon yang dipilih.</p>';
 html+='<div class="screen-actions dpt-actions"><button class="btn" data-dpt-act="examples">Isi harga contoh sintetis</button><button class="btn" data-dpt-act="clear">Kosongkan harga</button><button class="btn" data-dpt-act="export">Ekspor JSON</button><button class="btn" data-page="alokasi">Peta & alternatif koridor →</button></div>';
 html+='<p class="dpt-note" role="status">'+(priced.length?priced.length+' kandidat dengan input harga. Urutan harga hanya bermakna bagi kandidat yang diberi harga.':'Belum ada data harga: tidak ada kandidat yang dapat disebut termurah.')+(state.hasExample?' <b>ANGKA CONTOH SINTETIS AKTIF; BUKAN PENAWARAN DPT.</b>':'')+'</p>';
 html+='<div class="tblwrap"><table class="dpt-table"><thead><tr><th>Area*</th><th>Bruto (ha)</th><th>Maks MWac</th><th>Screening</th><th>Koridor / GI**</th><th>Skema</th><th>Harga***</th><th>PV biaya lahan</th><th>PV / maks MWac</th></tr></thead><tbody>';
 for(const r of rows){
  const o=state.offers[r.id]||{mode:'beli',price:''};const gi=p.gis.find(g=>g.id===r.giId);
  html+='<tr data-dpt-row="'+esc(r.id)+'"><td><b>'+esc(r.id)+'</b><small>'+(r.full?'Target muat dalam 1 patch':'Kapasitas parsial')+'</small></td>';
  html+='<td>'+n(r.areaHa)+'</td><td>'+n(r.maxMWac)+'</td><td><span class="dpt-gate '+(r.siteEligible?'ok':'warn')+'">'+esc(r.gate)+'</span><small>'+esc(r.reasons.join('; ')||'Butuh legal, RTRW/LSD & DPT')+'</small></td>';
  html+='<td>'+(r.routeKm!=null?n(r.routeKm)+' km '+String(r.method).toUpperCase():'Tidak ada rute')+'<small>'+esc(gi?gi.name+' '+gi.kv+' kV (OSM)':'GI belum diketahui')+'</small></td>';
  html+='<td><select data-dpt-offer="'+esc(r.id)+'" data-dpt-kind="mode">'+choice('beli','Beli',o.mode)+choice('sewa','Sewa',o.mode)+'</select></td>';
  html+='<td><input data-dpt-offer="'+esc(r.id)+'" data-dpt-kind="price" type="number" min="0" step=".1" placeholder="'+(o.mode==='sewa'?'juta/ha/tahun':'juta/ha')+'" value="'+(o.price??'')+'"></td>';
  html+='<td>'+(r.landPV==null?'Belum ada harga':n(r.landPV)+' miliar Rp')+'</td>';
  html+='<td>'+(r.landPVperMWac==null?'—':n(r.landPVperMWac)+' miliar Rp/MWac')+'</td></tr>';
 }
 html+='</tbody></table></div><p class="dpt-note">*Patch raster bukan bidang DPT. **GI berasal dari OSM dan jalur grid indikatif, tidak mengonfirmasi bay atau kemampuan interkoneksi. ***Angka harga hanya penguasaan area bruto; belum termasuk pajak, biaya sosial, ROW, akses, GI, jaringan, EPC, dan nilai residu tanah. Biaya PV beli dan sewa belum merupakan perbandingan lifecycle final.</p></section>';
 html+='<section class="sec"><h3>04 / Keputusan lanjut dan data minimum</h3><div class="dpt-decision"><div><b>A · Penjajakan DPT</b><p>Verifikasi penawaran beli/sewa, luas bidang, persetujuan pemilik, legalitas, RTRW/LSD/LP2B dan izin.</p></div><div><b>B · Screening engineering</b><p>Validasi GHI/PVOUT, area efektif, kemiringan, akses jalan, alternatif SUTT/SKTT dan biaya koneksi indikatif.</p></div><div><b>C · Handoff Perencanaan Sistem</b><p>Telaah GI 70/150 kV, bay, hasil studi sistem P2B, N-1, hosting capacity, dan konsekuensi investasi.</p></div></div>';
 html+='<p class="dpt-note"><b>Provenance:</b> empat pilot memakai data publik OSM, ESA WorldCover, Copernicus DEM dan NASA POWER; tidak ada data penawaran DPT aktual atau komitmen kuota GI resmi di halaman ini. Keputusan harga dan kelayakan belum bisa final.</p>';
 html+='<div class="screen-actions"><button class="btn pri" data-page="alokasi">Buka studi GIS empat wilayah →</button><button class="btn" data-page="tindak">Lihat tahapan DPT demo</button><button class="btn" data-page="screening">Evaluasi polygon & GI →</button></div></section></div>';
 return html;
 }catch(e){return pageHead('dpt','Input belum valid')+'<section class="sec"><h3>Periksa input skenario</h3><p role="alert">'+esc(e.message)+'</p><button class="btn" data-dpt-act="reset">Reset parameter</button></section>';}
}
PAGES.dpt=render;
function redraw(){if(S.page!=='dpt')return;const view=$('pageView'),y=view.scrollTop;view.innerHTML=PAGES.dpt();view.scrollTop=y;}
document.addEventListener('change',e=>{
 if(S.page!=='dpt')return;
 const f=e.target.dataset.dptField;
 if(f){
  state[f]=['title','source','pilotId','capacityBasis'].includes(f)?e.target.value:(e.target.value===''?NaN:Number(e.target.value));
  save();redraw();return;
 }
 const id=e.target.dataset.dptOffer;if(!id||!pilot().candidates.some(c=>c.id===id))return;
 const o=state.offers[id]||{mode:'beli',price:''};
 if(e.target.dataset.dptKind==='mode')o.mode=e.target.value;
 else o.price=e.target.value===''?'':Number(e.target.value);
 state.offers[id]=o;save();redraw();
});
document.addEventListener('click',e=>{
 const btn=e.target.closest('[data-dpt-act]');if(!btn)return;
 const action=btn.dataset.dptAct;
 if(action==='reset'){state=init();save();redraw();}
 if(action==='clear'){state.offers={};state.hasExample=false;save();redraw();}
 if(action==='examples'){
  state.offers={};
  pilot().candidates.forEach((c,i)=>{state.offers[c.id]={mode:i%3===0?'sewa':'beli',price:i%3===0?2.5+i*.4:50+i*8};});
  state.hasExample=true;save();redraw();
 }
 if(action==='export'){try{
  const x=result();
  const payload={schema:'georensis-dpt-scenario-v1',generatedAt:new Date().toISOString(),scenario:state,pilot:{id:x.p.id,name:x.p.name,generated_at:x.p.generated_at},plan:x.plan,rows:x.rows,provenance:state.hasExample?'synthetic_price_example_or_user_modified':'user_input_unverified',disclaimer:'Raster patches and OSM GI are not cadastral/authorized DPT offers or approved grid capacity.'};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='georensis-dpt-scenario.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
 }catch(err){alert(err.message);}}
});
})();
