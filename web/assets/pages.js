/* =====================================================================
   HALAMAN MENU (selain peta)
   ===================================================================== */
Object.assign(IC,{
 grid:'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 check:'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
 rank:'<path d="M18 20V10M12 20V4M6 20v-6"/>',
 flag:'<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
 trash:'<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
 dl:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
 print:'<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
 refresh:'<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>'
});

const MENU=[
 ['peta','Peta Potensi Lahan','map'],
 ['ringkasan','Ringkasan Eksekutif','grid'],
 ['ruptl','Target RUPTL','target'],
 ['lahan','Kandidat Lahan','layers'],
 ['validasi','Validasi Lahan','check'],
 ['ranking','Ranking & Rekomendasi','rank'],
 ['tindak','Proses Lelang DPT','flag'],
 ['master','Data Master','db'],
 ['unggah','Unggah Data','up'],
 ['laporan','Laporan','doc']
];
const MENU_B=[['bantuan','Bantuan','help']];
const LOGO='<svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><rect x="1" y="1" width="38" height="38" rx="8" fill="#FFD200"/><path d="M6 27c4-2 8 2 12 0s8-2 12 0 4 0 4 0" stroke="#1a4fa0" stroke-width="2.2" fill="none"/><path d="M6 31.5c4-2 8 2 12 0s8-2 12 0 4 0 4 0" stroke="#1a4fa0" stroke-width="2.2" fill="none"/><path d="M22 5 13 20h7l-3 9 10-15h-7l2-9z" fill="#e1251b"/></svg>';
$('rail').innerHTML=`<div class="logo" title="PLN">${LOGO}<b>PLN</b></div>`+
 MENU.map(([id,l,i])=>`<button data-page="${id}" data-label="${l}" aria-label="${l}">${ic(i)}</button>`).join('')+
 `<div class="sp"></div>`+MENU_B.map(([id,l,i])=>`<button data-page="${id}" data-label="${l}" aria-label="${l}">${ic(i)}</button>`).join('')+
 `<button id="bellBtn" data-act="notif" data-label="Notifikasi" aria-label="Notifikasi">${ic('bell')}</button><div class="avatar" title="Pengguna demo">SR</div><button data-act="logout" data-label="Keluar" aria-label="Keluar">${ic('out')}</button>`;

/* ---------- state halaman ---------- */
const F={
 ruptl:{wil:'',prov:'',status:'',dev:'',kat:'',q:''},
 lahan:{prov:'',gi:'',kat:'',status:'',tahap:'',zona:'',min:'0',q:'',sort:'skor',dir:-1,page:0},
 val:{prov:'',q:''},
 rank:{prov:'',min:'CP'},
 tl:{prov:''},
 master:{tab:'gi',prov:'',q:''},
 lap:{prov:''}
};
let N=(SAVED&&SAVED.notif)||null, LOGS=(SAVED&&SAVED.logs)||[], UPL=null, PD=null, PN=null, MCTX=null;
const OPSI=['Sewa','Beli','Kerja sama pemanfaatan'];
const FU_ST=LELANG;

/* ---------- utilitas ---------- */
let _sv;
function save(){clearTimeout(_sv);_sv=setTimeout(()=>{try{localStorage.setItem(STORE,JSON.stringify({v:1,gis:D.gis,lands:D.lands,provinces:D.provinces,rows:D.rows,sl:[...S.sl],W,T,HA,RAD,NET,notif:N,logs:LOGS}))}catch(e){}},400)}
const opt=(v,l,cur)=>`<option value="${esc(v)}" ${String(v)===String(cur)?'selected':''}>${esc(l)}</option>`;
function selBox(key,label,options,cur){return `<label>${label}<select data-in="${key}">${options.map(o=>Array.isArray(o)?opt(o[0],o[1],cur):opt(o,o,cur)).join('')}</select></label>`}
const provOpts=(all='Semua provinsi')=>[['',all],...[...D.provinces].sort((a,b)=>a.short.localeCompare(b.short)).map(p=>[p.key,p.short])];
const uniq=(arr)=>[...new Set(arr)].filter(x=>x!=null&&x!=='').sort((a,b)=>String(a).localeCompare(String(b)));
function rowsAll(){return D.rows.filter(r=>(S.scen==='B'?r.inB:r.inA)&&(S.jenis==='all'||r.jenis===S.jenis))}
const YEARS=[2025,2026,2027,2028,2029,2030,2031,2032,2033,2034];
const cekN=l=>CEK.filter(c=>l.cek&&l.cek[c[0]]).length;
const sumBy=(a,f)=>a.reduce((x,y)=>x+f(y),0);
function num(v){if(typeof v==='number')return v;if(v==null)return NaN;let s=String(v).trim().replace(/\s/g,'');if(s.includes(',')&&!s.includes('.'))s=s.replace(',','.');else if(s.includes(',')&&s.includes('.'))s=s.replace(/\./g,'').replace(',','.');return parseFloat(s)}
function hav(a,b,c,d){const R=6371,r=Math.PI/180,x=(c-a)*r,y=(d-b)*r,h=Math.sin(x/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin(y/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
function nearestGI(lat,lng){let best=null,bd=1e9;D.gis.forEach(g=>{const d=hav(lat,lng,g.lat,g.lng);if(d<bd){bd=d;best=g}});return{g:best,d:bd}}
function dlCSV(name,head,rows){
  const q=v=>{if(v==null)return '';if(typeof v==='number')v=String(v).replace('.',',');v=String(v);return /[";\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  const txt='\ufeff'+[head,...rows].map(r=>r.map(q).join(';')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/csv;charset=utf-8'}));a.download=name;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},800);toast(`${name} diunduh`);
}
function ago(t){const s=(Date.now()-t)/1000;if(s<60)return 'baru saja';if(s<3600)return Math.floor(s/60)+' menit lalu';if(s<86400)return Math.floor(s/3600)+' jam lalu';return new Date(t).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}
function stgBadge(t){const i=STG.indexOf(t);const c=['var(--faint)','var(--k-CP)','var(--blue2)','var(--k-SP)'][i];return `<span class="kb" style="background:${c}">${esc(t)}</span>`}
function kb(k){return `<span class="kb" style="background:${kc(k)}">${KAT[k]}</span>`}
function zb(l){const z=zoneOf(l);return `<span class="zn z${z}">${zoneShort(z)}</span>`}
const rkb=l=>l.rk?`<span class="rk">#${l.rk}</span>`:'<span class="rk off">–</span>';
function yearBars(rows,h=150){
  const yr={};rows.forEach(r=>{const y=cod(r);if(y&&y!=='-'){yr[y]=yr[y]||{P:0,B:0};yr[y][r.jenis==='PLTS'?'P':'B']+=r.mw}});
  const mx=Math.max(1,...YEARS.map(y=>yr[y]?yr[y].P+yr[y].B:0));
  return `<div class="bars" style="height:${h}px;padding-top:18px">${YEARS.map(y=>{const v=yr[y]||{P:0,B:0},t=v.P+v.B;return `<div class="c" title="${y}: ${nf(t)} MW (PLTS ${nf(v.P)} · PLTS + BESS ${nf(v.B)})">${t?`<em>${nf0(t)}</em>`:''}<div class="v" style="height:${t/mx*100}%"><i style="height:${t?v.P/t*100:0}%;background:var(--blue2)"></i><i style="height:${t?v.B/t*100:0}%;background:#e0a400"></i></div></div>`}).join('')}</div>
  <div class="yrs">${YEARS.map(y=>`<span>${y}</span>`).join('')}</div>`;
}
const jLegend=`<span class="lg"><span class="kd" style="background:var(--blue2)"></span>PLTS</span><span class="lg"><span class="kd" style="background:#e0a400"></span>PLTS + BESS</span>`;
function pageHead(id,sub,acts=''){
  const m=[...MENU,...MENU_B].find(x=>x[0]===id);
  return `<div class="phead"><div><div class="bc"><a data-page="peta">${ic('home','style="width:13px;height:13px"')} Beranda</a><span class="sep">›</span><span class="cur">${m[1]}</span></div>
  <h1>${ic(m[2],'style="width:21px;height:21px;color:var(--blue)"')}${m[1]}</h1><p>${sub}</p></div><div class="pacts">${acts}</div></div>`;
}
const btn=(act,label,icn,cls='',attrs='')=>`<button class="btn ${cls}" data-act="${act}" ${attrs}>${icn?ic(icn,'style="width:15px;height:15px"'):''}${label}</button>`;
const emptyBox=(t)=>`<div class="sec"><div class="empty">${t}</div></div>`;

/* ---------- navigasi halaman ---------- */
function chrome(id){
  S.page=id;
  $('main').classList.toggle('pagemode',id!=='peta');
  document.querySelectorAll('#rail [data-page]').forEach(b=>b.classList.toggle('on',b.dataset.page===id));
  if(id==='peta')crumbs();
  else{const m=[...MENU,...MENU_B].find(x=>x[0]===id);$('topCrumbs').innerHTML=`<span>Dashboard</span><span class="sep">›</span><span>Potensi Lahan PLTS</span><span class="sep">›</span><span class="cur">${m[1]}</span>`}
}
function goPage(id){
  closeDrawers();closeModal();
  if(id==='master'&&F.master.tab==='param')PD=null;
  chrome(id);
  if(id==='peta'){map.invalidateSize();render(false);return}
  $('pageView').innerHTML=PAGES[id]();$('pageView').scrollTop=0;
}
function openMap(level,opt){if(S.page!=='peta'){closeModal();chrome('peta');map.invalidateSize()}go(level,opt)}
function refreshBody(){const b=$('pgBody');if(b&&BODY[S.page])b.innerHTML=BODY[S.page]()}
function renderPage(){if(S.page!=='peta')$('pageView').innerHTML=PAGES[S.page]()}
function refreshAll(){if(S.page==='peta'){if(S.level>1)render(false)}else refreshBody()}

/* ---------- modal ---------- */
function openModal(title,body,foot,wide){
  $('mdlBg').innerHTML=`<div class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header><b>${title}</b><button class="x" data-act="mclose" aria-label="Tutup">×</button></header><div class="mb">${body}</div>${foot?`<footer>${foot}</footer>`:''}</div>`;
  $('mdlBg').classList.add('open');
}
function closeModal(){$('mdlBg').classList.remove('open');MCTX=null}
function confirmBox(title,msg,act,label,attrs=''){openModal(title,`<p style="margin:0">${msg}</p>`,btn('mclose','Batal')+btn(act,label,'','pri danger',attrs))}

/* ---------- notifikasi ---------- */
function initNotif(){
  const c=s=>D.lands.filter(l=>l.tahap===s).length;
  const t=Date.now();
  return [
   {m:`${c('Verifikasi lapangan')} lahan menunggu verifikasi lapangan.`,t:t-36e5*2,r:false},
   {m:`${c('Kajian teknis')} lahan sedang dalam kajian teknis.`,t:t-36e5*5,r:false},
   {m:`Data RUPTL 2025–2034 dimuat: ${D.rows.length} baris PLTS dan PLTS + BESS.`,t:t-864e5,r:true},
   {m:`${D.gis.length} gardu induk referensi dan ${D.lands.length} kandidat lahan contoh tersedia.`,t:t-864e5*2,r:true}
  ];
}
if(!N)N=initNotif();
function addNotif(m){N.unshift({m,t:Date.now(),r:false});N=N.slice(0,40);bell();save()}
function bell(){const b=$('bellBtn');if(b)b.classList.toggle('dot',N.some(n=>!n.r))}
function renderNotif(){
  $('ntList').innerHTML=N.length?N.map(n=>`<div class="ntf ${n.r?'':'unread'}">${esc(n.m)}<small>${ago(n.t)}</small></div>`).join(''):'<div class="empty">Belum ada notifikasi.</div>';
}

/* =====================================================================
   1. RINGKASAN EKSEKUTIF
   ===================================================================== */
function pgRingkasan(){return pageHead('ringkasan','Gambaran nasional: berapa target PLTS di RUPTL, di mana saja, dan seberapa siap lahan yang sudah ditemukan.',filtersHTML())+`<div id="pgBody">${bdRingkasan()}</div>`}
function bdRingkasan(){
  const all=D.provinces.map(p=>({p,s:provStats(p)}));
  const rows=rowsAll(),tMW=sumBy(rows,r=>r.mw),tP=sumBy(rows.filter(r=>r.jenis==='PLTS'),r=>r.mw);
  const good=sumBy(all,x=>Math.min(x.s.mwpGood,x.s.mw));
  const rek=D.lands.filter(l=>l.tahap==='Direkomendasikan');
  const wil={};all.forEach(({p,s})=>wil[p.wil]=(wil[p.wil]||0)+s.mw);const wmx=Math.max(1,...Object.values(wil));
  const top=[...all].sort((a,b)=>b.s.mw-a.s.mw).slice(0,10);const mx=Math.max(1,...top.map(x=>Math.max(x.s.mw,x.s.mwpGood)));
  const kca=katCount(D.lands);
  const stc=STG.map(s=>D.lands.filter(l=>l.tahap===s).length);const smx=Math.max(1,...stc);
  const st={};rows.forEach(r=>st[r.status]=(st[r.status]||0)+1);
  const gaps=all.filter(x=>x.s.mw>0&&x.s.mwpGood<x.s.mw).sort((a,b)=>(b.s.mw-b.s.mwpGood)-(a.s.mw-a.s.mwpGood)).slice(0,8);
  return `<div class="kpis">
   <div class="kpi"><span>Target RUPTL (${SCEN[S.scen]})</span><b>${nf0(tMW)} MW</b><small>PLTS ${nf0(tP)} · + BESS ${nf0(tMW-tP)}</small></div>
   <div class="kpi"><span>Proyek / tahap</span><b>${rows.length}</b><small>di ${all.filter(x=>x.s.n).length} kelompok provinsi</small></div>
   <div class="kpi"><span>Gardu induk referensi</span><b>${D.gis.length}</b><small>0 GITET sebagai kandidat</small></div>
   <div class="kpi"><span>Kandidat lahan</span><b>${D.lands.length}</b><small>${nf0(sumBy(D.lands,l=>l.luas))} Ha total</small></div>
   <div class="kpi"><span>Target yang tertutup lahan layak</span><b>${tMW?nf0(good/tMW*100):0}%</b><small>${nf0(good)} dari ${nf0(tMW)} MW</small></div>
   <div class="kpi"><span>Lahan direkomendasikan</span><b>${rek.length}</b><small>${nf0(sumBy(rek,l=>l.mwp))} MWp · shortlist ${S.sl.size}</small></div>
  </div>
  <div class="grid2">
   <div class="sec"><h3>Target per tahun COD</h3><p class="sd">Kapasitas yang direncanakan mulai beroperasi tiap tahun. ${jLegend}</p>${yearBars(rows,170)}</div>
   <div class="sec"><h3>Target per wilayah operasi</h3><p class="sd">Pembagian target RUPTL menurut wilayah operasi PLN.</p>
    ${Object.entries(wil).sort((a,b)=>b[1]-a[1]).map(([w,v])=>`<div class="hb"><span>${esc(w)}</span><div class="tr"><i style="width:${v/wmx*100}%;background:var(--blue2)"></i></div><b>${nf0(v)} MW</b></div>`).join('')}
    <div class="sect" style="margin-top:16px">STATUS PROYEK RUPTL</div>
    <div class="chips">${Object.entries(st).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<span class="chip">${esc(k)}: ${v}</span>`).join('')}</div>
   </div>
  </div>
  <div class="grid2">
   <div class="sec"><h3>Target vs potensi lahan, 10 provinsi terbesar</h3><p class="sd"><span class="lg"><span class="kd" style="background:var(--blue2)"></span>Target RUPTL (MW)</span><span class="lg"><span class="kd" style="background:var(--k-SP)"></span>Lahan sangat potensial + potensial (MWp)</span> Klik baris untuk membuka di peta.</p>
    ${top.map(({p,s})=>`<div class="hb click" data-act="openProv" data-p="${esc(p.key)}"><span>${esc(p.short)}</span><div><div class="tr" style="height:7px;margin-bottom:3px"><i style="width:${s.mw/mx*100}%;background:var(--blue2)"></i></div><div class="tr" style="height:7px"><i style="width:${Math.min(100,s.mwpGood/mx*100)}%;background:var(--k-SP)"></i></div></div><b>${nf0(s.mw)} / ${nf0(s.mwpGood)}</b></div>`).join('')}
   </div>
   <div class="sec"><h3>Kesiapan kandidat lahan</h3><p class="sd">Sebaran kategori kelayakan dan posisi lahan di tahapan validasi.</p>
    <div class="stack" style="max-width:none;height:12px;border-radius:6px">${KO.map(k=>`<i style="width:${kca[k]/Math.max(1,D.lands.length)*100}%;background:${kc(k)}" title="${KAT[k]}: ${kca[k]}"></i>`).join('')}</div>
    <div class="chips" style="margin:8px 0 16px">${KO.map(k=>`<span class="chip" style="color:${kc(k)}"><span class="kd" style="background:${kc(k)}"></span>${KAT[k]}: ${kca[k]}</span>`).join('')}</div>
    <div class="sect" style="margin-top:4px">JARAK KE GI</div>
    ${[1,2,3].map(z=>{const c=D.lands.filter(l=>zoneOf(l)===z);return `<div class="hb"><span>${zoneLbl(z)}</span><div class="tr"><i style="width:${c.length/Math.max(1,D.lands.length)*100}%;background:${z===1?'var(--k-SP)':z===2?'var(--blue2)':'var(--faint)'}"></i></div><b>${c.length} lahan</b></div>`}).join('')}
    <div class="sect" style="margin-top:12px">TAHAPAN VALIDASI</div>
    ${STG.map((s,i)=>`<div class="hb click" data-act="goVal"><span>${s}</span><div class="tr"><i style="width:${stc[i]/smx*100}%;background:${['var(--faint)','var(--k-CP)','var(--blue2)','var(--k-SP)'][i]}"></i></div><b>${stc[i]} lahan</b></div>`).join('')}
   </div>
  </div>
  ${(()=>{const rl=D.lands.filter(l=>l.tahap==='Direkomendasikan');rl.forEach(fuOf);const mx=Math.max(1,...LELANG.map((s,i)=>rl.filter(l=>l.fu.st===i).length));
   return `<div class="sec"><h3>Proses lelang DPT tanah</h3><p class="sd">Posisi ${rl.length} lahan yang direkomendasikan di delapan tahapan lelang. Klik untuk membuka menu Proses Lelang DPT.</p>
   <div class="grid2" style="gap:4px 24px">${LELANG.map((s,i)=>{const c=rl.filter(l=>l.fu.st===i).length;return `<div class="hb click" data-page="tindak" style="grid-template-columns:230px 1fr 70px"><span>${i+1}. ${s}</span><div class="tr"><i style="width:${c/mx*100}%;background:${i===7?'var(--k-SP)':'var(--blue2)'}"></i></div><b>${c} lahan</b></div>`}).join('')}</div></div>`})()}
  <div class="sec"><h3>Provinsi yang potensi lahannya belum cukup</h3><p class="sd">Lahan sangat potensial + potensial masih di bawah target RUPTL. Prioritas untuk pencarian lahan tambahan.</p>
   ${gaps.length?`<div class="tblwrap"><table><thead><tr><th>Provinsi</th><th>Wilayah operasi</th><th class="n">Target (MW)</th><th class="n">Lahan layak (MWp)</th><th class="n">Kekurangan</th><th class="n">GI</th><th></th></tr></thead><tbody>
   ${gaps.map(({p,s})=>`<tr class="click" data-act="openProv" data-p="${esc(p.key)}"><td><b>${esc(p.short)}</b></td><td>${esc(p.wil)}</td><td class="n">${nf(s.mw)}</td><td class="n">${nf(s.mwpGood)}</td><td class="n" style="color:var(--red)"><b>${nf(s.mw-s.mwpGood)} MW</b></td><td class="n">${p.gis.length}</td><td><span class="lnk">Buka peta</span></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Semua provinsi sudah tertutup lahan layak.</div>'}
  </div>`;
}

/* =====================================================================
   2. TARGET RUPTL
   ===================================================================== */
function ruptlFiltered(){
  const f=F.ruptl,q=f.q.toLowerCase();
  return rowsAll().filter(r=>(!f.wil||(PROV[r.prov]&&PROV[r.prov].wil===f.wil))&&(!f.prov||r.prov===f.prov)&&(!f.status||r.status===f.status)&&(!f.dev||r.dev===f.dev)&&(!f.kat||r.kat===f.kat)&&(!q||(r.nama+' '+r.sis+' '+r.prov).toLowerCase().includes(q)));
}
function pgRuptl(){
  const f=F.ruptl;
  return pageHead('ruptl','Daftar rencana PLTS dan PLTS + BESS dari RUPTL 2025–2034, diambil dari file Excel. Pakai filter untuk menyaring.',filtersHTML()+btn('csvRuptl','Unduh CSV','dl'))+
  `<div class="fbar">${selBox('f:ruptl:wil','Wilayah operasi',[['','Semua wilayah'],...uniq(D.provinces.map(p=>p.wil))],f.wil)}
   ${selBox('f:ruptl:prov','Provinsi',provOpts(),f.prov)}
   ${selBox('f:ruptl:status','Status',[['','Semua status'],...uniq(D.rows.map(r=>r.status))],f.status)}
   ${selBox('f:ruptl:dev','Pengembang',[['','Semua pengembang'],...uniq(D.rows.map(r=>r.dev))],f.dev)}
   ${selBox('f:ruptl:kat','Kategori lokasi',[['','Semua kategori'],...uniq(D.rows.map(r=>r.kat))],f.kat)}
   <label>Cari<input data-in="f:ruptl:q" value="${esc(f.q)}" placeholder="Nama lokasi atau sistem…"></label>
   <button class="btn sm" data-act="resetF" data-p="ruptl">Hapus filter</button></div>
   <div id="pgBody">${bdRuptl()}</div>`;
}
function bdRuptl(){
  const rr=ruptlFiltered(),tot=sumBy(rr,r=>r.mw),p=sumBy(rr.filter(r=>r.jenis==='PLTS'),r=>r.mw);
  return `<div class="kpis" style="grid-template-columns:repeat(4,minmax(0,1fr))">
   <div class="kpi"><span>Baris rencana</span><b>${rr.length}</b><small>skenario ${SCEN[S.scen]}</small></div>
   <div class="kpi"><span>Total kapasitas</span><b>${nf(tot)} MW</b><small>dari filter saat ini</small></div>
   <div class="kpi"><span>PLTS</span><b>${nf(p)} MW</b><small>${rr.filter(r=>r.jenis==='PLTS').length} baris</small></div>
   <div class="kpi"><span>PLTS + BESS</span><b>${nf(tot-p)} MW</b><small>${rr.filter(r=>r.jenis!=='PLTS').length} baris</small></div></div>
  <div class="sec"><h3>Jadwal COD per tahun</h3><p class="sd">${jLegend}</p>${yearBars(rr,140)}</div>
  ${rr.length?`<div class="tblwrap" style="max-height:620px"><table><thead><tr><th>No</th><th>Provinsi</th><th>Lokasi / nama pembangkit</th><th>Sistem</th><th>Jenis</th><th class="n">Tahap</th><th class="n">Kapasitas (MW)</th><th class="n">COD</th><th>Status</th><th>Pengembang</th><th>Kategori lokasi</th><th>Sumber</th></tr></thead><tbody>
  ${rr.map(r=>`<tr><td class="mono">${r.no}</td><td><button class="lnk" data-act="openProv" data-p="${esc(r.prov)}">${esc(PROV[r.prov]?PROV[r.prov].short:r.prov)}</button></td><td class="wrap"><b>${esc(r.nama)}</b>${r.cat?`<div class="subt">${esc(r.cat)}</div>`:''}</td><td>${esc(r.sis)}</td><td><span class="jb ${r.jenis==='PLTS'?'p':'b'}">${esc(r.jenis)}</span></td><td class="n">${r.tahap??'–'}</td><td class="n"><b>${nf(r.mw,2)}</b></td><td class="n">${cod(r)}</td><td>${esc(r.status)}</td><td>${esc(r.dev)}</td><td>${esc(r.kat)}</td><td>${esc(r.tabel)}, hal. ${r.hal}</td></tr>`).join('')}
  </tbody><tfoot><tr><td></td><td colspan="5">Total ${rr.length} baris</td><td class="n">${nf(tot,2)}</td><td colspan="5"></td></tr></tfoot></table></div>`:emptyBox('Tidak ada rencana yang cocok dengan filter. Hapus sebagian filter untuk melihat data.')}`;
}

/* =====================================================================
   3. KANDIDAT LAHAN
   ===================================================================== */
function lahanFiltered(){
  const f=F.lahan,q=f.q.toLowerCase(),min=+f.min;
  const ls=D.lands.filter(l=>{const g=GI[l.gi];return g&&(!f.prov||g.prov===f.prov)&&(!f.gi||l.gi===f.gi)&&(!f.zona||String(zoneOf(l))===f.zona)&&(!f.kat||l.kat===f.kat)&&(!f.status||l.status===f.status)&&(!f.tahap||l.tahap===f.tahap)&&l.luas>=min&&(!q||(l.id+' '+g.nama+' '+g.kab).toLowerCase().includes(q))});
  const k=f.sort,d=f.dir,val=l=>k==='prov'?PROV[GI[l.gi].prov].short:k==='gi'?GI[l.gi].nama:k==='rk'?(l.rk||999):l[k];
  return ls.sort((a,b)=>{const x=val(a),y=val(b);return (typeof x==='number'?x-y:String(x).localeCompare(String(y)))*d});
}
function pgLahan(){
  const f=F.lahan;
  const giO=[['','Semua GI'],...D.gis.filter(g=>!f.prov||g.prov===f.prov).map(g=>[g.id,g.nama])];
  return pageHead('lahan','Semua kandidat lahan di sekitar gardu induk. Klik baris untuk melihat lahan di peta, atau beri bintang untuk shortlist.',btn('csvLahan','Unduh CSV','dl')+btn('goUnggah','Unggah lahan baru','up','pri'))+
  `<div class="fbar">${selBox('f:lahan:prov','Provinsi',provOpts(),f.prov)}${selBox('f:lahan:gi','Gardu induk',giO,f.gi)}
   ${selBox('f:lahan:zona','Jarak ke GI',[['','Semua jarak'],['1',zoneLbl(1)],['2',zoneLbl(2)],['3',zoneLbl(3)]],f.zona)}
   ${selBox('f:lahan:kat','Kategori',[['','Semua kategori'],...KO.map(k=>[k,KAT[k]])],f.kat)}
   ${selBox('f:lahan:status','Status lahan',[['','Semua status'],...Object.keys(REF.status)],f.status)}
   ${selBox('f:lahan:tahap','Tahap validasi',[['','Semua tahap'],...STG],f.tahap)}
   ${selBox('f:lahan:min','Luas minimal',[['0','Semua luas'],['10','≥ 10 Ha'],['25','≥ 25 Ha'],['50','≥ 50 Ha'],['100','≥ 100 Ha']],f.min)}
   <label>Cari<input data-in="f:lahan:q" value="${esc(f.q)}" placeholder="Kode, GI, kabupaten…"></label>
   <button class="btn sm" data-act="resetF" data-p="lahan">Hapus filter</button></div><div id="pgBody">${bdLahan()}</div>`;
}
function bdLahan(){
  const f=F.lahan,ls=lahanFiltered(),per=50,pages=Math.max(1,Math.ceil(ls.length/per));f.page=Math.min(f.page,pages-1);
  const pg=ls.slice(f.page*per,f.page*per+per);
  const th=(k,l,n)=>`<th class="${n?'n ':''}s" data-act="sort" data-k="${k}">${l}${f.sort===k?(f.dir<0?' ↓':' ↑'):''}</th>`;
  if(!ls.length)return emptyBox('Tidak ada lahan yang cocok. Ubah atau hapus filter di atas.');
  return `<div class="chips" style="margin-bottom:10px"><span class="chip t">${ls.length} lahan</span><span class="chip">${nf(sumBy(ls,l=>l.luas))} Ha</span><span class="chip">${nf(sumBy(ls,l=>l.mwp))} MWp</span>${KO.map(k=>{const c=ls.filter(l=>l.kat===k).length;return c?`<span class="chip" style="color:${kc(k)}"><span class="kd" style="background:${kc(k)}"></span>${c}</span>`:''}).join('')}</div>
  <div class="tblwrap"><table><thead><tr><th></th>${th('id','Kode')}${th('prov','Provinsi')}${th('gi','Gardu induk')}${th('luas','Luas (Ha)',1)}${th('mwp','Kapasitas (MWp)',1)}${th('dist','Jarak GI (km)',1)}<th>Zona</th>${th('rk','Peringkat di GI',1)}<th>Status lahan</th>${th('ghi','Radiasi',1)}${th('skor','Skor',1)}<th>Kategori</th>${th('tahap','Tahap')}</tr></thead><tbody>
  ${pg.map(l=>{const g=GI[l.gi];return `<tr class="click" data-act="openLand" data-id="${l.id}"><td><button class="star ${S.sl.has(l.id)?'on':''}" data-star="${l.id}" aria-label="Shortlist">★</button></td><td class="mono"><b>${l.id}</b></td><td>${esc(PROV[g.prov].short)}</td><td>${esc(g.nama)}</td><td class="n">${nf(l.luas)}</td><td class="n">${nf(l.mwp)}</td><td class="n">${nf(l.dist)}</td><td>${zb(l)}</td><td class="n">${l.rk?`<b>#${l.rk}</b> <span class="subt" style="display:inline">dari ${l.rkN}</span>`:'<span class="subt" style="display:inline">tidak diperingkat</span>'}</td><td>${esc(l.status)}</td><td class="n">${nf(l.ghi,2)}</td><td class="n"><b>${nf(l.skor)}</b></td><td>${kb(l.kat)}</td><td>${esc(l.tahap)}</td></tr>`}).join('')}
  </tbody></table></div>
  <div class="pager">Menampilkan ${f.page*per+1}–${f.page*per+pg.length} dari ${ls.length}
   <button class="btn sm" data-act="pg" data-d="-1" ${f.page===0?'disabled':''}>Sebelumnya</button><span class="mono">${f.page+1} / ${pages}</span><button class="btn sm" data-act="pg" data-d="1" ${f.page>=pages-1?'disabled':''}>Berikutnya</button></div>`;
}

/* =====================================================================
   4. VALIDASI LAHAN
   ===================================================================== */
function pgValidasi(){
  const f=F.val;
  return pageHead('validasi','Pantau setiap lahan dari identifikasi sampai direkomendasikan. Klik kartu untuk mengisi checklist dan memindahkan tahap.')+
  `<div class="fbar">${selBox('f:val:prov','Provinsi',provOpts('Semua provinsi'),f.prov)}<label>Cari<input data-in="f:val:q" value="${esc(f.q)}" placeholder="Kode atau GI…"></label>
   <span class="fnote">Lahan baru bisa direkomendasikan setelah kelima checklist selesai.</span></div><div id="pgBody">${bdValidasi()}</div>`;
}
function bdValidasi(){
  const f=F.val,q=f.q.toLowerCase();
  const ls=D.lands.filter(l=>{const g=GI[l.gi];return g&&(!f.prov||g.prov===f.prov)&&(!q||(l.id+' '+g.nama).toLowerCase().includes(q))}).sort((a,b)=>b.skor-a.skor);
  const LIM=30;
  return `<div class="board">${STG.map((s,i)=>{const c=ls.filter(l=>l.tahap===s);return `<div class="col"><h4><span>${s}</span><span class="mono">${c.length}</span></h4><div class="cs">${nf(sumBy(c,l=>l.mwp))} MWp</div>
   ${c.slice(0,LIM).map(l=>{const g=GI[l.gi],n=cekN(l);return `<button class="card" data-act="cekOpen" data-id="${l.id}"><div class="r1"><span class="kd" style="background:${kc(l.kat)}"></span>${l.id}<span class="pill blue" style="margin-left:auto">${nf(l.skor)}</span></div>
    <div class="r2">${esc(g.nama)} · ${esc(PROV[g.prov].short)}</div><div class="r2" style="margin-top:-4px">${zb(l)} ${l.rk?`peringkat #${l.rk} di GI`:'tidak diperingkat'}</div><div class="r3"><div class="prog" style="flex:1"><i style="width:${n/5*100}%"></i></div><span class="mono">${n}/5</span></div></button>`}).join('')}
   ${c.length>LIM?`<div class="more">+${c.length-LIM} lahan lain. Pilih provinsi agar daftar lebih pendek.</div>`:''}${!c.length?'<div class="more">Kosong</div>':''}</div>`}).join('')}</div>`;
}
function cekModal(id){
  const l=LAND[id],g=GI[l.gi],si=STG.indexOf(l.tahap),n=cekN(l);MCTX=id;
  openModal(`Validasi ${l.id}`,
   `<div class="chips" style="margin-bottom:10px">${kb(l.kat)}${stgBadge(l.tahap)}<span class="chip">${nf(l.luas)} Ha · ${nf(l.mwp)} MWp</span><span class="chip">${esc(g.nama)}, ${esc(PROV[g.prov].short)}</span></div>
   <div class="steps">${STG.map((t,i)=>`<div data-n="${i+1}" class="${i<si?'done':i===si?'cur':''}">${t}</div>`).join('')}</div>
   <div class="sect" style="margin-top:4px">CHECKLIST VALIDASI <small>${n} dari 5 selesai</small></div>
   ${CEK.map(([k,t,d])=>`<button class="chk ${l.cek[k]?'on':''}" data-act="cekTog" data-id="${l.id}" data-k="${k}"><span class="bx">${l.cek[k]?'✓':''}</span><span><b>${t}</b><small>${d}</small></span></button>`).join('')}
   <label class="flab">Catatan validasi<textarea data-in="note" data-id="${l.id}" rows="3" placeholder="Contoh: pemilik lahan bersedia diskusi sewa jangka panjang">${esc(l.note||'')}</textarea></label>`,
   `${btn('openLand','Lihat di peta','map','',`data-id="${l.id}"`)}<span style="flex:1"></span>${si>0?btn('stage','Mundur ke '+STG[si-1],'','',`data-id="${l.id}" data-d="-1"`):''}${si<3?btn('stage','Pindah ke '+STG[si+1],'','pri',`data-id="${l.id}" data-d="1"`):'<span class="pill blue">Sudah direkomendasikan</span>'}`,true);
}

/* =====================================================================
   5. RANKING & REKOMENDASI
   ===================================================================== */
function pgRanking(){
  const f=F.rank;
  return pageHead('ranking','Urutkan lahan dari skor tertinggi dan lihat berapa lahan yang dibutuhkan untuk memenuhi target RUPTL suatu provinsi.',filtersHTML())+
  `<div class="fbar">${selBox('f:rank:prov','Cakupan',provOpts('Nasional (semua provinsi)'),f.prov)}
  ${selBox('f:rank:min','Kategori minimal',[['SP','Sangat potensial saja'],['P','Potensial ke atas'],['CP','Cukup potensial ke atas'],['KP','Kurang potensial ke atas']],f.min)}
  <span class="fnote">Hanya lahan dalam radius ${RAD.r2} km dari GI yang diperingkat. Radius bisa diubah di Data Master.</span></div><div id="pgBody">${bdRanking()}</div>`;
}
function bdRanking(){
  const f=F.rank,mi=KO.indexOf(f.min);
  const pool=D.lands.filter(l=>GI[l.gi]&&l.dist<=RAD.r2&&(!f.prov||GI[l.gi].prov===f.prov)&&KO.indexOf(l.kat)<=mi).sort((a,b)=>b.skor-a.skor||a.dist-b.dist);
  let html='';
  if(f.prov){
    const s=provStats(PROV[f.prov]),target=s.mw;let cum=0,need=-1;
    pool.forEach((l,i)=>{cum+=l.mwp;l._cum=cum;if(need<0&&target>0&&cum>=target)need=i});
    const tot=cum;
    const msg=target<=0?`Provinsi ini tidak punya target untuk filter skenario/jenis saat ini.`:need>=0?`<b>${need+1} lahan teratas</b> (${nf0(pool[need]._cum)} MWp) sudah cukup memenuhi target <b>${nf0(target)} MW</b>.`:`Seluruh ${pool.length} lahan hanya menutup <b>${nf0(tot)} MWp</b> dari target ${nf0(target)} MW. Masih kurang <b>${nf0(target-tot)} MW</b>, perlu pencarian lahan tambahan.`;
    const marked=need>=0?pool.slice(0,need+1):pool;
    html+=`<div class="sec callout"><div><h3>${esc(PROV[f.prov].short)}: kecukupan target</h3><p class="sd" style="margin:4px 0 0">${msg}</p></div>
     <div class="pacts">${marked.length?btn('slBulk',`Tambahkan ${marked.length} lahan ke shortlist`,'star','pri',`data-ids="${marked.map(l=>l.id).join(',')}"`):''}</div></div>`;
    html+=rankTable(pool,need,true);
  }else{
    const all=D.provinces.map(p=>({p,s:provStats(p)})).filter(x=>x.s.mw>0).sort((a,b)=>(b.s.mwpGood/b.s.mw)-(a.s.mwpGood/a.s.mw));
    html+=`<div class="sec"><h3>Kecukupan potensi per provinsi</h3><p class="sd">Membandingkan target RUPTL dengan lahan sangat potensial + potensial. Klik baris untuk melihat ranking provinsi itu.</p>
    <div class="tblwrap" style="max-height:380px"><table><thead><tr><th>Provinsi</th><th class="n">Target (MW)</th><th class="n">Lahan layak (MWp)</th><th>Keterpenuhan</th><th class="n">Lahan</th><th>Status</th></tr></thead><tbody>
    ${all.map(({p,s})=>{const c=s.mwpGood/s.mw*100;return `<tr class="click" data-act="rankProv" data-p="${esc(p.key)}"><td><b>${esc(p.short)}</b></td><td class="n">${nf(s.mw)}</td><td class="n">${nf(s.mwpGood)}</td><td style="min-width:160px"><div class="prog"><i style="width:${Math.min(100,c)}%;background:${c>=100?'var(--k-SP)':c>=50?'var(--k-CP)':'var(--k-TL)'}"></i></div><small class="mono">${nf0(c)}%</small></td><td class="n">${s.ls.length}</td><td>${c>=100?'<span class="pill green">Cukup</span>':'<span class="pill red">Kurang</span>'}</td></tr>`}).join('')}</tbody></table></div></div>`;
    html+=`<div class="sec" style="padding-bottom:4px"><h3>50 lahan terbaik nasional</h3><p class="sd">Urut skor tertinggi sesuai kategori minimal yang dipilih.</p></div>`+rankTable(pool.slice(0,50),-1,false);
  }
  return html;
}
function rankTable(pool,need,showCum){
  if(!pool.length)return emptyBox('Tidak ada lahan pada kategori ini. Turunkan kategori minimal.');
  return `<div class="tblwrap"><table><thead><tr><th class="n">#</th><th>Kode</th><th>Gardu induk</th><th>Provinsi</th><th class="n">Jarak (km)</th><th>Zona</th><th class="n">Jalur ke GI (km)</th><th class="n">Peringkat di GI</th><th class="n">Luas (Ha)</th><th class="n">Kapasitas (MWp)</th>${showCum?'<th class="n">Kumulatif (MWp)</th>':''}<th class="n">Skor</th><th>Kategori</th><th>Tahap</th><th>Aksi</th></tr></thead><tbody>
  ${pool.map((l,i)=>{const g=GI[l.gi];return `<tr class="${need>=0&&i<=need?'hit':''}"><td class="n">${i+1}</td><td class="mono"><button class="lnk" data-act="openLand" data-id="${l.id}"><b>${l.id}</b></button></td><td>${esc(g.nama)}</td><td>${esc(PROV[g.prov].short)}</td><td class="n">${nf(l.dist)}</td><td>${zb(l)}</td><td class="n">${fmtRoute(l,g)}</td><td class="n">#${l.rk} <span class="subt" style="display:inline">dari ${l.rkN}</span></td><td class="n">${nf(l.luas)}</td><td class="n">${nf(l.mwp)}</td>${showCum?`<td class="n">${nf(l._cum)}</td>`:''}<td class="n"><b>${nf(l.skor)}</b></td><td>${kb(l.kat)}</td><td>${esc(l.tahap)}</td>
   <td>${l.tahap==='Direkomendasikan'?'<span class="pill green">Direkomendasikan</span>':btn('cekOpen','Proses validasi','','sm',`data-id="${l.id}"`)}</td></tr>`}).join('')}</tbody></table></div>`;
}

/* =====================================================================
   6. TINDAK LANJUT
   ===================================================================== */
function pgTindak(){
  return pageHead('tindak','Lahan yang sudah direkomendasikan masuk proses lelang DPT tanah. Klik nomor tahap untuk memperbarui posisi lelang tiap lahan. Perubahan langsung tersimpan.',btn('csvTindak','Unduh CSV','dl'))+
  `<div class="fbar">${selBox('f:tl:prov','Provinsi',provOpts(),F.tl.prov)}</div><div id="pgBody">${bdTindak()}</div>`;
}
function bdTindak(){
  const ls=D.lands.filter(l=>l.tahap==='Direkomendasikan'&&GI[l.gi]&&(!F.tl.prov||GI[l.gi].prov===F.tl.prov)).sort((a,b)=>b.skor-a.skor);
  ls.forEach(fuOf);
  if(!ls.length)return emptyBox('Belum ada lahan yang direkomendasikan. Selesaikan checklist di menu Validasi Lahan lalu pindahkan ke tahap Direkomendasikan.');
  const mx=Math.max(1,...FU_ST.map((s,i)=>ls.filter(l=>l.fu.st===i).length));
  return `<div class="grid2"><div class="sec"><h3>Tahapan proses lelang DPT tanah</h3><p class="sd">Jumlah lahan di setiap tahap saat ini. Total ${ls.length} lahan, ${nf0(sumBy(ls,l=>l.mwp))} MWp.</p>
   ${FU_ST.map((s,i)=>{const c=ls.filter(l=>l.fu.st===i);return `<div class="hb" style="grid-template-columns:230px 1fr 120px"><span>${i+1}. ${s}</span><div class="tr"><i style="width:${c.length/mx*100}%;background:${i===7?'var(--k-SP)':'var(--blue2)'}"></i></div><b>${c.length} · ${nf0(sumBy(c,l=>l.mwp))} MWp</b></div>`}).join('')}</div>
   <div class="sec"><h3>Urutan tahapan</h3><p class="sd">Delapan tahapan lelang yang dilalui setiap lahan.</p><ol class="flow">${FU_ST.map(s=>`<li><b>${s}</b></li>`).join('')}</ol></div></div>
  <div class="tblwrap"><table><thead><tr><th>Kode</th><th>Gardu induk</th><th class="n">Luas (Ha)</th><th class="n">MWp</th><th>Opsi lahan</th><th>Tahap lelang</th><th>Penanggung jawab</th><th>Target selesai</th><th></th></tr></thead><tbody>
  ${ls.map(l=>{const g=GI[l.gi];return `<tr><td class="mono"><b>${l.id}</b></td><td>${esc(g.nama)}<div class="subt">${esc(PROV[g.prov].short)}</div></td><td class="n">${nf(l.luas)}</td><td class="n">${nf(l.mwp)}</td>
   <td><select class="inp" data-in="fu" data-id="${l.id}" data-k="opsi">${OPSI.map(o=>opt(o,o,l.fu.opsi)).join('')}</select></td>
   <td><div class="dots">${FU_ST.map((s,i)=>`<button class="${i<=l.fu.st?'on':''}" data-act="fuSt" data-id="${l.id}" data-i="${i}" title="${s}">${i+1}</button>`).join('')}</div><div class="subt">${l.fu.st+1}. ${FU_ST[l.fu.st]}</div></td>
   <td><input class="inp" data-in="fu" data-id="${l.id}" data-k="pic" value="${esc(l.fu.pic)}"></td>
   <td><input class="inp" type="month" data-in="fu" data-id="${l.id}" data-k="tgt" value="${esc(l.fu.tgt)}" style="min-width:140px"></td>
   <td>${btn('openLand','Peta','map','sm',`data-id="${l.id}"`)}</td></tr>`}).join('')}</tbody></table></div>`;
}

/* =====================================================================
   7. DATA MASTER
   ===================================================================== */
const MTABS=[['gi','Gardu induk'],['net','Radius & jalur ke lahan'],['prov','Provinsi & wilayah'],['sistem','Sistem tenaga listrik'],['param','Kategori & kapasitas'],['ref','Referensi']];
function pgMaster(){
  return pageHead('master','Data acuan yang dipakai di seluruh aplikasi. Perubahan di sini langsung memengaruhi peta, skor, dan laporan.')+
  `<div class="tabs" style="margin-bottom:14px">${MTABS.map(([k,l])=>`<button data-act="mtab" data-t="${k}" class="${F.master.tab===k?'on':''}">${l}</button>`).join('')}</div><div id="pgBody">${bdMaster()}</div>`;
}
function bdMaster(){
  const t=F.master.tab;
  if(t==='gi'){
    const f=F.master,q=f.q.toLowerCase();
    const gs=D.gis.filter(g=>(!f.prov||g.prov===f.prov)&&(!q||(g.nama+' '+g.kab+' '+g.sistem).toLowerCase().includes(q)));
    return `<div class="fbar">${selBox('f:master:prov','Provinsi',provOpts(),f.prov)}<label>Cari<input data-in="f:master:q" value="${esc(f.q)}" placeholder="Nama GI, kabupaten, sistem…"></label><span style="flex:1"></span>${btn('csvGI','Unduh CSV','dl')}${btn('giEdit','Tambah GI','plus','pri','data-id=""')}</div>
    <div class="tblwrap" style="max-height:640px"><table><thead><tr><th>Nama GI</th><th>Provinsi</th><th>Kabupaten/Kota</th><th class="n">Tegangan</th><th>Sistem</th><th class="n">Trafo (MVA)</th><th class="n">Beban</th><th class="n">Ruang (MW)</th><th>Bay</th><th class="n">Radius</th><th class="n">Lahan</th><th>Koordinat</th><th>Aksi</th></tr></thead><tbody>
    ${gs.map(g=>`<tr><td><b>${esc(g.nama)}</b></td><td>${esc(PROV[g.prov].short)}</td><td>${esc(g.kab)}</td><td class="n">${g.kv} kV</td><td>${esc(g.sistem)}</td><td class="n">${nf0(g.mva)}</td><td class="n">${g.beban}%</td><td class="n">${nf(g.ruang)}</td><td>${esc(g.bay)}</td><td class="n">${RAD.r1}/${RAD.r2} km</td><td class="n">${g.lands.length}</td><td class="mono">${g.lat.toFixed(3)}, ${g.lng.toFixed(3)}</td>
     <td style="white-space:nowrap"><button class="icb" data-act="giEdit" data-id="${g.id}" aria-label="Ubah ${esc(g.nama)}">${ic('edit')}</button><button class="icb" data-act="giMap" data-id="${g.id}" aria-label="Lihat di peta">${ic('map')}</button><button class="icb del" data-act="giDel" data-id="${g.id}" aria-label="Hapus ${esc(g.nama)}">${ic('trash')}</button></td></tr>`).join('')}</tbody></table></div>
    <p class="fnote" style="margin-top:8px">${gs.length} dari ${D.gis.length} GI. Data GI adalah contoh; ganti dengan data GI resmi saat integrasi.</p>`;
  }
  if(t==='net'){
    if(!PN)PN={...RAD,...NET};
    const f=(k,l,d,u,st='1')=>`<div class="prow2"><span><b>${l}</b><small>${d}</small></span><input class="inp" type="number" step="${st}" data-in="pn" data-k="${k}" value="${PN[k]}" style="min-width:0;width:90px"><span class="mono">${u}</span></div>`;
    return `<div class="grid2"><div class="sec"><h3>Aturan radius dari GI</h3><p class="sd">Lahan dalam radius terluar berstatus potensial dan diberi peringkat. Lahan di luar radius tidak diperingkat dan kategorinya dibatasi paling tinggi "Kurang potensial".</p>
     ${f('r1','Radius zona 1','Zona prioritas, paling dekat ke GI','km')}${f('r2','Radius zona 2 (batas potensial)','Batas terluar lahan berstatus potensial','km')}</div>
     <div class="sec"><h3>Perhitungan jalur ke lahan</h3><p class="sd">Dipakai untuk memperkirakan panjang jalur 150 kV dan jumlah tower dari GI ke setiap lahan.</p>
     ${f('span','Asumsi span tower','Rata-rata jarak satu tower ke tower berikutnya','m','10')}
     ${f('rf','Faktor belok rute','Jalur nyata lebih panjang dari garis lurus karena mengikuti jalan dan menghindari permukiman','×','0.05')}</div></div>
     <div class="acts">${btn('netApply','Terapkan dan hitung ulang','refresh','pri')}${btn('netReset','Kembalikan bawaan')}</div>`;
  }
  if(t==='prov'){
    return `<div class="tblwrap"><table><thead><tr><th>Provinsi (nama di RUPTL)</th><th>Nama tampilan</th><th>Wilayah operasi</th><th class="n">GI</th><th class="n">Kandidat lahan</th><th class="n">Baris RUPTL</th><th class="n">Target ${SCEN[S.scen]} (MW)</th><th>Sistem</th></tr></thead><tbody>
    ${D.provinces.map(p=>{const s=provStats(p);return `<tr><td class="wrap">${esc(p.key)}</td><td><b>${esc(p.short)}</b></td><td>${esc(p.wil)}</td><td class="n">${p.gis.length}</td><td class="n">${s.ls.length}</td><td class="n">${D.rows.filter(r=>r.prov===p.key).length}</td><td class="n">${nf(s.mw)}</td><td class="wrap">${uniq(D.rows.filter(r=>r.prov===p.key).map(r=>r.sis)).join(', ')}</td></tr>`}).join('')}</tbody></table></div>`;
  }
  if(t==='sistem'){
    const m={};D.rows.forEach(r=>{const x=m[r.sis]=m[r.sis]||{prov:new Set(),n:0,b:0,a:0};x.prov.add(PROV[r.prov]?PROV[r.prov].short:r.prov);x.n++;if(r.inB)x.b+=r.mw;if(r.inA)x.a+=r.mw});
    return `<p class="fnote" style="margin:0 0 10px">Diambil dari kolom "Sistem Tenaga Listrik" pada Excel RUPTL. "Isolated" berarti sistem kecil yang tidak tersambung jaringan utama.</p>
    <div class="tblwrap"><table><thead><tr><th>Sistem</th><th>Provinsi</th><th class="n">Baris</th><th class="n">RE Base (MW)</th><th class="n">ARED (MW)</th><th class="n">GI terkait</th></tr></thead><tbody>
    ${Object.entries(m).sort((a,b)=>b[1].a-a[1].a).map(([k,x])=>`<tr><td><b>${esc(k)}</b></td><td class="wrap">${[...x.prov].join(', ')}</td><td class="n">${x.n}</td><td class="n">${nf(x.b)}</td><td class="n">${nf(x.a)}</td><td class="n">${D.gis.filter(g=>g.sistem===k).length}</td></tr>`).join('')}</tbody></table></div>`;
  }
  if(t==='param'){
    if(!PD)PD={W:{...W},T:{...T},HA};
    return `<div class="grid2">
     <div class="sec"><h3>Batas kategori</h3><p class="sd">Skor minimal untuk masuk tiap kategori. Di bawah batas terendah dianggap tidak layak.</p>
     ${['SP','P','CP','KP'].map(k=>`<div class="prow2"><span><span class="kd" style="background:${kc(k)}"></span> <b>${KAT[k]}</b></span><input class="inp" type="number" min="0" max="100" data-in="pd" data-g="T" data-k="${k}" value="${PD.T[k]}" style="min-width:0;width:80px"><span class="mono">ke atas</span></div>`).join('')}
     <h3 style="margin-top:18px">Kebutuhan lahan</h3><p class="sd">Luas lahan untuk menghasilkan 1 MWp. Dipakai menghitung kapasitas indikatif.</p>
     <div class="prow2"><span><b>Hektare per MWp</b></span><input class="inp" type="number" min="0.5" max="3" step="0.1" data-in="pd" data-g="HA" value="${PD.HA}" style="min-width:0;width:80px"><span class="mono">Ha</span></div>
     <div class="acts" style="margin-top:16px">${btn('paramApply','Terapkan dan hitung ulang skor','refresh','pri')}${btn('paramReset','Kembalikan bawaan')}</div></div></div>`;
  }
  return `<div class="grid2">
   <div class="sec"><h3>Tahapan validasi</h3>${STG.map((s,i)=>`<div class="prow2"><span><b>${i+1}. ${s}</b></span><span></span><span></span></div>`).join('')}
   <h3 style="margin-top:16px">Checklist validasi</h3>${CEK.map(([k,t,d])=>`<div class="prow2"><span><b>${t}</b><small>${d}</small></span><span></span><span></span></div>`).join('')}</div>
   <div class="sec"><h3>Tahapan proses lelang DPT tanah</h3>${LELANG.map((s,i)=>`<div class="prow2"><span><b>${i+1}. ${s}</b></span><span></span><span></span></div>`).join('')}
   <h3 style="margin-top:16px">Opsi penguasaan lahan</h3>${OPSI.map(o=>`<div class="prow2"><span><b>${o}</b></span><span></span><span></span></div>`).join('')}</div></div>`;
}
const refTbl=o=>`<table><tbody>${Object.entries(o).map(([k,v])=>`<tr><td>${esc(k)}</td><td class="n"><b>${v}</b></td></tr>`).join('')}</tbody></table>`;
function giForm(id){
  const g=id?GI[id]:{nama:'',prov:F.master.prov||'Jawa Barat',kab:'',lat:'',lng:'',kv:150,sistem:'',mva:120,beban:60,bay:'Tersedia 1 bay',radius:25};
  const sis=uniq([...D.gis.map(x=>x.sistem),...D.rows.map(r=>r.sis)]);
  openModal(id?`Ubah ${esc(g.nama)}`:'Tambah gardu induk',
  `<div class="frm" id="giF">
   <label class="full">Nama GI<input class="inp" name="nama" value="${esc(g.nama)}" placeholder="Contoh: GI Sumedang"></label>
   <label>Provinsi<select class="inp" name="prov">${provOpts().slice(1).map(o=>opt(o[0],o[1],g.prov)).join('')}</select></label>
   <label>Kabupaten/Kota<input class="inp" name="kab" value="${esc(g.kab)}"></label>
   <label>Lintang (latitude)<input class="inp" name="lat" value="${g.lat}" placeholder="-6,85"></label>
   <label>Bujur (longitude)<input class="inp" name="lng" value="${g.lng}" placeholder="107,92"></label>
   <label>Tegangan<select class="inp" name="kv">${[150,70].map(v=>opt(v,v+' kV',g.kv)).join('')}</select></label>
   <label>Sistem<input class="inp" name="sistem" list="sisList" value="${esc(g.sistem)}"><datalist id="sisList">${sis.map(s=>`<option value="${esc(s)}">`).join('')}</datalist></label>
   <label>Kapasitas trafo (MVA)<input class="inp" name="mva" value="${g.mva}"></label>
   <label>Beban puncak (%)<input class="inp" name="beban" value="${g.beban}"></label>
   <label>Ketersediaan bay<select class="inp" name="bay">${['Tersedia 1 bay','Tersedia 2 bay','Perlu perluasan bay','Tidak tersedia'].map(v=>opt(v,v,g.bay)).join('')}</select></label>
   <div class="full ferr" id="giErr"></div></div>`,
  btn('mclose','Batal')+btn('giSave',id?'Simpan perubahan':'Tambah GI','','pri',`data-id="${id||''}"`));
}

/* =====================================================================
   8. UNGGAH DATA
   ===================================================================== */
const LH_HEAD=['kode','gi','lat','lng','luas_ha','status_lahan','rtrw','risiko_banjir','kemiringan_persen','ghi','jarak_jalan_km','tutupan_lahan'];
const RH={no:'No',wil:'Wilayah Operasi',prov:'Provinsi',tabel:'Sumber Tabel RUPTL',hal:'Halaman PDF',sis:'Sistem Tenaga Listrik',jenis:'Jenis',nama:'Lokasi / Nama Pembangkit',tahap:'Tahap',mw:'Kapasitas (MW)',codB:'COD Skenario RE Base',codA:'COD Skenario ARED',inB:'Termasuk RE Base',inA:'Termasuk ARED',status:'Status',dev:'Pengembang',kat:'Kategori Lokasi (turunan)',cat:'Catatan'};
function pgUnggah(){
  return pageHead('unggah','Tambahkan kandidat lahan hasil survei, atau perbarui data RUPTL dari file Excel. Data diperiksa dulu sebelum dipakai.')+
  `<div class="grid2">
   <div class="sec"><h3>Kandidat lahan</h3><p class="sd">File CSV atau Excel berisi koordinat dan luas lahan. Skor dan GI terdekat dihitung otomatis.</p>
    <label class="drop">${ic('up','style="width:26px;height:26px;color:var(--blue)"')}<b>Pilih file lahan</b><small>.csv, .xlsx · kolom wajib: lat, lng, luas_ha</small><input type="file" accept=".csv,.xlsx,.xls" data-in="file" data-kind="lahan" hidden></label>
    <div class="acts" style="margin-top:10px">${btn('tplLahan','Unduh template CSV','dl')}</div></div>
   <div class="sec"><h3>Rencana RUPTL</h3><p class="sd">Excel dengan format sheet "Daftar PLTS" yang sama seperti file sumber. Data RUPTL lama akan diganti.</p>
    <label class="drop">${ic('file','style="width:26px;height:26px;color:var(--blue)"')}<b>Pilih file RUPTL</b><small>.xlsx atau .csv · hanya baris PLTS dan PLTS + BESS yang dipakai</small><input type="file" accept=".csv,.xlsx,.xls" data-in="file" data-kind="ruptl" hidden></label>
    <div class="acts" style="margin-top:10px">${btn('csvRuptlAll','Unduh data RUPTL saat ini (CSV)','dl')}</div></div></div>
  <div id="pgBody">${bdUnggah()}</div>`;
}
function bdUnggah(){
  let h='';
  if(UPL&&UPL.loading)h+=`<div class="sec"><div class="empty">Membaca ${esc(UPL.name)}…</div></div>`;
  else if(UPL&&UPL.err)h+=`<div class="sec callout bad"><div><h3>File tidak bisa dibaca</h3><p class="sd" style="margin:4px 0 0">${esc(UPL.err)}</p></div>${btn('upCancel','Tutup')}</div>`;
  else if(UPL){
    const ok=UPL.out.length;
    h+=`<div class="sec"><div class="callout" style="border:0;padding:0;margin-bottom:12px"><div><h3>Pratinjau: ${esc(UPL.name)}</h3><p class="sd" style="margin:4px 0 0">${UPL.kind==='lahan'?`${ok} lahan siap ditambahkan`:`${ok} baris RUPTL siap dipakai (${nf(sumBy(UPL.out.filter(r=>r.inB),r=>r.mw))} MW RE Base, ${nf(sumBy(UPL.out.filter(r=>r.inA),r=>r.mw))} MW ARED)`}${UPL.iss.length?`, ${UPL.iss.length} catatan`:''}.</p></div>
     <div class="pacts">${btn('upCancel','Batal')}${ok?btn('upApply',UPL.kind==='lahan'?`Tambahkan ${ok} lahan`:'Ganti data RUPTL','','pri'):''}</div></div>
     ${UPL.iss.length?`<div class="issues"><b>Catatan pemeriksaan</b><ul>${UPL.iss.slice(0,12).map(i=>`<li>${esc(i)}</li>`).join('')}${UPL.iss.length>12?`<li>dan ${UPL.iss.length-12} catatan lain</li>`:''}</ul></div>`:''}
     ${ok?(UPL.kind==='lahan'?`<div class="tblwrap"><table><thead><tr><th>Kode</th><th>GI</th><th class="n">Jarak (km)</th><th>Zona</th><th class="n">Luas (Ha)</th><th class="n">MWp</th><th>Status lahan</th><th class="n">Skor</th><th>Kategori</th></tr></thead><tbody>
      ${UPL.out.slice(0,12).map(o=>`<tr><td class="mono">${esc(o.id)}</td><td>${esc(GI[o.gi].nama)}</td><td class="n">${nf(o.dist)}</td><td>${zb(o)}</td><td class="n">${nf(o.luas)}</td><td class="n">${nf(o.mwp)}</td><td>${esc(o.status)}</td><td class="n"><b>${nf(o.skor)}</b></td><td>${kb(o.kat)}</td></tr>`).join('')}</tbody></table></div>`
      :`<div class="tblwrap"><table><thead><tr><th>Provinsi</th><th>Lokasi</th><th>Jenis</th><th class="n">MW</th><th class="n">COD Base</th><th>Status</th></tr></thead><tbody>
      ${UPL.out.slice(0,12).map(r=>`<tr><td>${esc(r.prov)}</td><td>${esc(r.nama)}</td><td>${esc(r.jenis)}</td><td class="n">${nf(r.mw,2)}</td><td class="n">${r.codB}</td><td>${esc(r.status)}</td></tr>`).join('')}</tbody></table></div>`)+(ok>12?`<p class="fnote">Menampilkan 12 dari ${ok} baris.</p>`:''):''}</div>`;
  }
  h+=`<div class="sec"><h3>Riwayat unggahan</h3>${LOGS.length?`<table><thead><tr><th>Waktu</th><th>File</th><th>Jenis data</th><th class="n">Baris dipakai</th></tr></thead><tbody>${LOGS.map(g=>`<tr><td>${new Date(g.t).toLocaleString('id-ID')}</td><td>${esc(g.name)}</td><td>${g.kind==='lahan'?'Kandidat lahan':'Rencana RUPTL'}</td><td class="n">${g.n}</td></tr>`).join('')}</tbody></table>`:'<div class="empty">Belum ada file yang diunggah.</div>'}</div>`;
  return h;
}
function ensureXLSX(){
  if(window.XLSX)return Promise.resolve();
  const urls=['https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js','https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'];
  return new Promise((res,rej)=>{let i=0;const nx=()=>{if(i>=urls.length)return rej(new Error('Pembaca file Excel tidak termuat. Periksa koneksi internet, atau simpan file sebagai CSV lalu unggah lagi.'));const s=document.createElement('script');s.src=urls[i++];s.onload=()=>window.XLSX?res():nx();s.onerror=nx;document.head.appendChild(s)};nx()});
}
function parseCSV(text){
  text=text.replace(/^\ufeff/,'');const first=text.split(/\r?\n/)[0]||'';const dl=(first.split(';').length>first.split(',').length)?';':',';
  const rows=[];let row=[],cur='',q=false;
  for(let i=0;i<text.length;i++){const c=text[i];
    if(q){if(c==='"'){if(text[i+1]==='"'){cur+='"';i++}else q=false}else cur+=c}
    else if(c==='"')q=true;else if(c===dl){row.push(cur);cur=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cur);rows.push(row);row=[];cur=''}else cur+=c}
  if(cur!==''||row.length){row.push(cur);rows.push(row)}
  const head=(rows.shift()||[]).map(h=>h.trim());
  return rows.filter(r=>r.some(v=>String(v).trim()!=='')).map(r=>Object.fromEntries(head.map((h,i)=>[h,r[i]===''?null:r[i]])));
}
async function readFile(file,kind){
  if(/\.xlsx?$/i.test(file.name)){
    await ensureXLSX();
    const wb=XLSX.read(await file.arrayBuffer(),{type:'array'});
    const nm=kind==='ruptl'&&wb.SheetNames.includes('Daftar PLTS')?'Daftar PLTS':wb.SheetNames[0];
    return XLSX.utils.sheet_to_json(wb.Sheets[nm],{defval:null,raw:true});
  }
  return parseCSV(await file.text());
}
function nextLandId(){let m=0;D.lands.forEach(l=>{const n=parseInt(String(l.id).replace(/\D/g,''),10);if(n>m)m=n});return n=>'PL-'+String(m+n).padStart(4,'0')}
function buildLand(o){
  const sg=Math.max(0,Math.min(100,(o.ghi-3.7)/1.7*100)),sj=Math.max(0,100-o.dist*2.2),ss=o.slope<=3?100:o.slope<=6?85:o.slope<=10?60:30;
  const comp={radiasi:Math.round(sg),jaringan:Math.round(sj),topografi:ss,legal:REF.status[o.status],tataruang:REF.rtrw[o.rtrw],akses:Math.round(Math.max(0,100-o.akses*12)),lingkungan:REF.banjir[o.banjir]};
  const r=Math.sqrt(o.luas/100)/2*1.2,poly=[];
  for(let v=0;v<7;v++){const a=v/7*2*Math.PI,rr=r*(0.85+((v*37)%10)/30);poly.push([+(o.lat+rr*Math.sin(a)/110.6).toFixed(5),+(o.lng+rr*Math.cos(a)/(111.3*Math.cos(o.lat*Math.PI/180))).toFixed(5)])}
  const g=GI[o.gi],ang=Math.atan2(o.lat-g.lat,(o.lng-g.lng)*Math.cos(g.lat*Math.PI/180))*180/Math.PI;
  const ARAH=['timur','timur laut','utara','barat laut','barat','barat daya','selatan','tenggara'];
  const l={id:o.id,gi:o.gi,lat:+o.lat.toFixed(5),lng:+o.lng.toFixed(5),arah:ARAH[Math.round(((ang+360)%360)/45)%8],dist:+o.dist.toFixed(1),luas:+o.luas.toFixed(1),mwp:0,status:o.status,rtrw:o.rtrw,banjir:o.banjir,slope:o.slope,ghi:o.ghi,akses:o.akses,cover:o.cover,comp,skor:0,kat:'TL',lengkap:60,tahap:'Identifikasi',poly,cek:{},note:o.note||''};
  CEK.forEach(c=>l.cek[c[0]]=false);
  let s=0;for(const k in W)s+=W[k]*l.comp[k]/100;l.skor=Math.round(s*10)/10;l.kat=katOf(l.skor);if(l.dist>RAD.r2&&['SP','P','CP'].includes(l.kat))l.kat='KP';l.mwp=Math.round(l.luas/HA*10)/10;
  return l;
}
function mapLahan(objs,fname){
  const out=[],iss=[],nid=nextLandId(),used=new Set(D.lands.map(l=>l.id));let c=0;
  const pick=(o,ks,d)=>{for(const k of ks)if(o[k]!=null&&o[k]!=='')return o[k];return d};
  objs.forEach((raw,i)=>{
    const o={};for(const k in raw)o[String(k).toLowerCase().trim().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'')]=raw[k];
    const ln=`Baris ${i+2}`;
    const lat=num(pick(o,['lat','latitude','lintang'])),lng=num(pick(o,['lng','lon','long','longitude','bujur'])),luas=num(pick(o,['luas_ha','luas']));
    if(!isFinite(lat)||!isFinite(lng)||lat<-11.5||lat>6.5||lng<94||lng>142){iss.push(`${ln}: koordinat kosong atau di luar Indonesia, dilewati`);return}
    if(!(luas>0)){iss.push(`${ln}: luas_ha kosong atau nol, dilewati`);return}
    const gn=String(pick(o,['gi','gardu_induk','nama_gi'],'')).trim().toLowerCase();
    let g=gn?D.gis.find(x=>x.nama.toLowerCase()===gn):null;const near=nearestGI(lat,lng);
    if(!g){g=near.g;if(gn)iss.push(`${ln}: GI "${pick(o,['gi','gardu_induk','nama_gi'])}" tidak ditemukan, dipakai GI terdekat ${g.nama}`)}
    const dist=hav(lat,lng,g.lat,g.lng);if(dist>60)iss.push(`${ln}: jarak ke ${g.nama} ${nf(dist)} km, cukup jauh`);
    const fix=(v,ref,def,lbl)=>{if(v==null||v==='')return def;const k=Object.keys(ref).find(x=>x.toLowerCase()===String(v).trim().toLowerCase());if(!k){iss.push(`${ln}: ${lbl} "${v}" tidak dikenal, dipakai "${def}"`);return def}return k};
    let id=String(pick(o,['kode','id'],'')).trim();if(!id||used.has(id)){if(id)iss.push(`${ln}: kode ${id} sudah dipakai, diberi kode baru`);c++;id=nid(c);while(used.has(id)){c++;id=nid(c)}}used.add(id);
    const sl=num(pick(o,['kemiringan_persen','kemiringan','slope'])),gh=num(pick(o,['ghi','radiasi'])),ak=num(pick(o,['jarak_jalan_km','akses','jarak_jalan']));
    out.push(buildLand({id,gi:g.id,lat,lng,luas,dist,status:fix(pick(o,['status_lahan','status']),REF.status,'Tanah Perorangan','status lahan'),rtrw:fix(pick(o,['rtrw','tata_ruang']),REF.rtrw,'Perlu kajian','tata ruang'),banjir:fix(pick(o,['risiko_banjir','banjir']),REF.banjir,'Sedang','risiko banjir'),
      slope:isFinite(sl)?sl:5,ghi:isFinite(gh)?gh:4.8,akses:isFinite(ak)?ak:1,cover:String(pick(o,['tutupan_lahan','tutupan'],'Belum diisi')),note:`Diunggah dari ${fname}`}));
  });
  return{out,iss};
}
function mapRuptl(objs){
  const out=[],iss=[];
  if(!objs.length)return{out,iss:['File kosong.']};
  const miss=['prov','jenis','nama','mw'].filter(k=>!(RH[k] in objs[0]));
  if(miss.length)return{out,iss:[`Kolom wajib tidak ditemukan: ${miss.map(k=>'"'+RH[k]+'"').join(', ')}. Pastikan memakai format sheet "Daftar PLTS".`]};
  let skipJ=0;
  objs.forEach((o,i)=>{
    const g=k=>o[RH[k]];const jen=String(g('jenis')||'').trim();
    if(jen!=='PLTS'&&jen!=='PLTS + BESS'){skipJ++;return}
    const prov=String(g('prov')||'').trim();if(!PROV[prov]){iss.push(`Baris ${i+2}: provinsi "${prov}" tidak ada di data master, dilewati`);return}
    const mw=num(g('mw'));if(!(mw>0)){iss.push(`Baris ${i+2}: kapasitas kosong, dilewati`);return}
    const cd=v=>{const n=num(v);return isFinite(n)?Math.round(n):'-'};const codB=cd(g('codB')),codA=cd(g('codA'));
    const yn=(v,c)=>v==null?c!=='-':String(v).trim().toLowerCase()==='ya';
    out.push({no:num(g('no'))||out.length+1,prov,tabel:g('tabel')||'',hal:g('hal')||'',sis:g('sis')||'',jenis:jen,nama:String(g('nama')),tahap:g('tahap')??null,mw,codB,codA,inB:yn(g('inB'),codB),inA:yn(g('inA'),codA),status:g('status')||'Rencana',dev:g('dev')||'',kat:g('kat')||'',cat:g('cat')||null});
  });
  if(skipJ)iss.unshift(`${skipJ} baris bukan PLTS / PLTS + BESS, tidak dipakai`);
  return{out,iss};
}

/* =====================================================================
   9. LAPORAN
   ===================================================================== */
function pgLaporan(){
  return pageHead('laporan','Laporan ringkas siap cetak atau simpan sebagai PDF. Pilih cakupan nasional atau satu provinsi.',filtersHTML()+btn('csvLap','Unduh CSV','dl')+btn('print','Cetak / simpan PDF','print','pri'))+
  `<div class="fbar">${selBox('f:lap:prov','Cakupan laporan',provOpts('Nasional'),F.lap.prov)}<span class="fnote">Untuk PDF, pilih "Simpan sebagai PDF" pada jendela cetak.</span></div><div id="pgBody">${bdLaporan()}</div>`;
}
function bdLaporan(){
  const pk=F.lap.prov,p=pk?PROV[pk]:null,d=new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
  const provs=p?[p]:D.provinces,st=provs.map(x=>({p:x,s:provStats(x)}));
  const ls=provs.flatMap(x=>landsOfProv(x)),mw=sumBy(st,x=>x.s.mw),n=sumBy(st,x=>x.s.n),good=sumBy(st,x=>x.s.mwpGood);
  const top=ls.filter(l=>l.dist<=RAD.r2).sort((a,b)=>b.skor-a.skor||a.dist-b.dist).slice(0,10),rek=ls.filter(l=>l.tahap==='Direkomendasikan');
  const t1=p?`<table class="rt"><thead><tr><th>Gardu induk</th><th>Tegangan</th><th>Sistem</th><th class="n">Lahan</th><th class="n">Luas (Ha)</th><th class="n">Potensi (MWp)</th></tr></thead><tbody>${p.gis.map(id=>GI[id]).map(g=>{const x=landsOfGI(g);return `<tr><td>${esc(g.nama)}</td><td>${g.kv} kV</td><td>${esc(g.sistem)}</td><td class="n">${x.length}</td><td class="n">${nf(sumBy(x,l=>l.luas))}</td><td class="n">${nf(sumBy(x,l=>l.mwp))}</td></tr>`}).join('')}</tbody></table>`
   :`<table class="rt"><thead><tr><th>Provinsi</th><th class="n">Target (MW)</th><th class="n">Proyek</th><th class="n">GI</th><th class="n">Lahan</th><th class="n">Lahan layak (MWp)</th><th class="n">Keterpenuhan</th></tr></thead><tbody>${st.filter(x=>x.s.mw>0).sort((a,b)=>b.s.mw-a.s.mw).map(({p,s})=>`<tr><td>${esc(p.short)}</td><td class="n">${nf(s.mw)}</td><td class="n">${s.n}</td><td class="n">${p.gis.length}</td><td class="n">${s.ls.length}</td><td class="n">${nf(s.mwpGood)}</td><td class="n">${nf0(s.mwpGood/s.mw*100)}%</td></tr>`).join('')}</tbody></table>`;
  return `<div class="paper" id="report">
   <div class="rh"><div>${LOGO}</div><div><b>PT PLN (Persero)</b><span>Laporan Potensi Lahan PLTS</span></div><div class="rd">${d}</div></div>
   <h2>Potensi lahan PLTS ${p?'Provinsi '+esc(p.short):'nasional'}</h2>
   <p class="rs">Acuan target: RUPTL 2025–2034 skenario ${SCEN[S.scen]}${S.jenis!=='all'?', jenis '+S.jenis:', PLTS dan PLTS + BESS'}.</p>
   <h3>1. Ringkasan</h3>
   <table class="rt kvt"><tbody>
    <tr><td>Target kapasitas RUPTL</td><td class="n">${nf(mw)} MW (${n} proyek/tahap)</td></tr>
    <tr><td>Gardu induk referensi</td><td class="n">${provs.reduce((a,x)=>a+x.gis.length,0)} GI</td></tr>
    <tr><td>Kandidat lahan teridentifikasi</td><td class="n">${ls.length} lokasi, ${nf(sumBy(ls,l=>l.luas))} Ha, ${nf(sumBy(ls,l=>l.mwp))} MWp</td></tr>
    <tr><td>Lahan sangat potensial + potensial</td><td class="n">${nf(good)} MWp (${mw?nf0(good/mw*100):0}% dari target)</td></tr>
    <tr><td>Lahan direkomendasikan</td><td class="n">${rek.length} lokasi, ${nf(sumBy(rek,l=>l.mwp))} MWp</td></tr>
   </tbody></table>
   <h3>2. ${p?'Potensi per gardu induk':'Target dan potensi per provinsi'}</h3>${t1}
   <h3>3. Sepuluh kandidat terbaik dalam radius ${RAD.r2} km dari GI</h3>
   <table class="rt"><thead><tr><th>Kode</th><th>Gardu induk</th>${p?'':'<th>Provinsi</th>'}<th class="n">Jarak (km)</th><th class="n">Jalur (km)</th><th class="n">Luas (Ha)</th><th class="n">MWp</th><th>Status lahan</th><th class="n">Skor</th><th>Kategori</th></tr></thead><tbody>
   ${top.map(l=>`<tr><td>${l.id}</td><td>${esc(GI[l.gi].nama)}</td>${p?'':`<td>${esc(PROV[GI[l.gi].prov].short)}</td>`}<td class="n">${nf(l.dist)}</td><td class="n">${fmtRoute(l,GI[l.gi])}</td><td class="n">${nf(l.luas)}</td><td class="n">${nf(l.mwp)}</td><td>${esc(l.status)}</td><td class="n">${nf(l.skor)}</td><td>${KAT[l.kat]}</td></tr>`).join('')}</tbody></table>
   <h3>4. Lahan direkomendasikan dan proses lelang DPT tanah</h3>
   ${rek.length?`<table class="rt"><thead><tr><th>Kode</th><th>Gardu induk</th><th class="n">MWp</th><th>Opsi</th><th>Tahap lelang</th><th>Penanggung jawab</th><th>Target</th></tr></thead><tbody>${rek.map(l=>{const f=fuOf(l);return `<tr><td>${l.id}</td><td>${esc(GI[l.gi].nama)}</td><td class="n">${nf(l.mwp)}</td><td>${f.opsi}</td><td>${f.st+1}. ${FU_ST[f.st]}</td><td>${esc(f.pic)}</td><td>${esc(f.tgt)}</td></tr>`}).join('')}</tbody></table>`:'<p>Belum ada lahan yang direkomendasikan.</p>'}
   <p class="rn">Catatan: target RUPTL bersumber dari file Rencana PLTS RUPTL 2025–2034. Data gardu induk, kandidat lahan, dan skor pada mock-up ini adalah data simulasi.</p>
  </div>`;
}

/* =====================================================================
   10. BANTUAN
   ===================================================================== */
function pgBantuan(){
  return pageHead('bantuan','Cara memakai aplikasi, arti istilah, dan penjelasan sumber data.')+
  `<div class="grid2"><div class="sec"><h3>Alur kerja yang disarankan</h3>
   <ol class="flow">${[['Lihat target','Buka Target RUPTL atau Ringkasan Eksekutif untuk tahu provinsi mana yang targetnya besar.','ruptl'],['Cari lahan','Buka Peta Potensi Lahan, klik provinsi lalu GI, dan periksa lahan di sekitarnya.','peta'],['Tambah lahan baru','Unggah hasil survei lahan lewat Unggah Data.','unggah'],['Validasi','Isi checklist di Validasi Lahan sampai lahan siap direkomendasikan.','validasi'],['Bandingkan','Gunakan Ranking & Rekomendasi untuk melihat lahan mana yang cukup memenuhi target.','ranking'],['Proses lelang','Pantau delapan tahapan lelang DPT tanah di menu Proses Lelang DPT.','tindak'],['Laporkan','Cetak ringkasan di menu Laporan.','laporan']].map(([t,d,pg])=>`<li><b>${t}</b><span>${d}</span><button class="lnk" data-page="${pg}">Buka menu</button></li>`).join('')}</ol></div>
   <div class="sec"><h3>Arti kategori lahan</h3>${KO.map(k=>`<div class="prow2"><span><span class="kd" style="background:${kc(k)}"></span> <b>${KAT[k]}</b></span><span class="mono">${kdesc(k)}</span><span></span></div>`).join('')}
   <h3 style="margin-top:16px">Istilah</h3><dl class="gl">${[['RUPTL','Rencana Usaha Penyediaan Tenaga Listrik, dokumen rencana pembangunan pembangkit dan jaringan PLN 10 tahun.'],['RE Base dan ARED','Dua skenario di RUPTL. RE Base adalah skenario dasar; ARED adalah skenario percepatan energi terbarukan dengan target lebih besar.'],['PLTS + BESS','PLTS yang dilengkapi baterai penyimpan energi, sehingga listrik bisa dipakai saat tidak ada matahari.'],['GI / GITET','Untuk PoC koneksi PLTS hanya ke GI 70 atau 150 kV; GITET tidak masuk pilihan interkoneksi.'],['MW dan MWp','MW adalah kapasitas yang disalurkan ke sistem; MWp adalah kapasitas puncak panel surya.'],['Ruang interkoneksi','Perkiraan kapasitas yang masih bisa diterima GI. Angka pastinya perlu studi aliran daya.'],['COD','Commercial Operation Date, tahun pembangkit mulai beroperasi.'],['Zona radius','Lahan sampai 10 km dari GI masuk zona 1, 10–20 km zona 2. Keduanya berstatus potensial dan diberi peringkat. Di atas 20 km tidak diperingkat.'],['SUTT','Saluran Udara Tegangan Tinggi, menggunakan tower; koneksi kandidat hanya GI 70/150 kV. Jalur pra-screening bukan ROW final.'],['SKTT','Saluran Kabel Tegangan Tinggi bawah tanah; memerlukan studi koridor, utilitas bawah tanah, izin dan geoteknik tersendiri.'],['DPT','Daftar Penyedia Terseleksi. Pemilik atau penyedia lahan yang lolos kualifikasi dan berhak ikut tahap pengadaan tanah berikutnya.']].map(([a,b])=>`<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl></div></div>
   <div class="sec callout"><div><h3>Tentang data</h3><p class="sd" style="margin:4px 0 0">Target RUPTL diambil dari file Excel (${D.rows.length} baris). Data GI (10 sampel per provinsi), kandidat lahan, skor, dan proses lelang adalah simulasi. Perubahan yang Anda buat tersimpan di browser ini.</p></div>${btn('resetAll','Kembalikan semua data contoh','refresh','danger')}</div>`;
}

const PAGES={ringkasan:pgRingkasan,ruptl:pgRuptl,lahan:pgLahan,validasi:pgValidasi,ranking:pgRanking,tindak:pgTindak,master:pgMaster,unggah:pgUnggah,laporan:pgLaporan,bantuan:pgBantuan};
const BODY={ringkasan:bdRingkasan,ruptl:bdRuptl,lahan:bdLahan,validasi:bdValidasi,ranking:bdRanking,tindak:bdTindak,master:bdMaster,unggah:bdUnggah,laporan:bdLaporan};

/* =====================================================================
   AKSI
   ===================================================================== */
function removeGI(id){
  const g=GI[id];if(!g)return;
  g.lands.forEach(lid=>{delete LAND[lid];S.sl.delete(lid)});
  D.lands=D.lands.filter(l=>l.gi!==id);
  const p=PROV[g.prov];p.gis=p.gis.filter(x=>x!==id);
  D.gis=D.gis.filter(x=>x.id!==id);delete GI[id];
}
const ACT={
 mclose:()=>closeModal(),
 openProv:t=>openMap(2,{prov:t.dataset.p}),
 openLand:t=>{const l=LAND[t.dataset.id];if(l)openMap(3,{gi:l.gi,land:l.id})},
 goVal:()=>goPage('validasi'),
 goUnggah:()=>goPage('unggah'),
 resetF:t=>{const p=t.dataset.p;Object.keys(F[p]).forEach(k=>{if(!['sort','dir'].includes(k))F[p][k]=k==='min'?'0':k==='page'?0:''});renderPage()},
 sort:t=>{const k=t.dataset.k;if(F.lahan.sort===k)F.lahan.dir*=-1;else{F.lahan.sort=k;F.lahan.dir=['id','prov','gi','tahap'].includes(k)?1:-1}F.lahan.page=0;refreshBody()},
 pg:t=>{F.lahan.page+= +t.dataset.d;refreshBody();$('pageView').scrollTop=0},
 cekOpen:t=>cekModal(t.dataset.id),
 cekTog:t=>{const l=LAND[t.dataset.id],k=t.dataset.k;l.cek[k]=!l.cek[k];if(!l.cek[k]&&l.tahap==='Direkomendasikan'){l.tahap='Kajian teknis';toast(`${l.id} dikembalikan ke Kajian teknis karena checklist belum lengkap`)}save();cekModal(l.id);refreshAll()},
 stage:t=>{const l=LAND[t.dataset.id],i=STG.indexOf(l.tahap)+ +t.dataset.d;if(i<0||i>3)return;
   if(i===3&&cekN(l)<5){toast('Lengkapi kelima checklist sebelum lahan direkomendasikan');return}
   l.tahap=STG[i];if(i===3)fuOf(l);addNotif(`${l.id} (${GI[l.gi].nama}) dipindah ke tahap ${STG[i]}.`);toast(`${l.id} dipindah ke ${STG[i]}`);cekModal(l.id);refreshAll()},
 slBulk:t=>{const ids=t.dataset.ids.split(',');ids.forEach(id=>S.sl.add(id));renderSL();save();toast(`${ids.length} lahan ditambahkan ke shortlist`);addNotif(`${ids.length} lahan ditambahkan ke shortlist dari Ranking & Rekomendasi.`)},
 rankProv:t=>{F.rank.prov=t.dataset.p;renderPage();$('pageView').scrollTop=0},
 fuSt:t=>{const l=LAND[t.dataset.id];fuOf(l).st=+t.dataset.i;save();if(S.page==='peta')renderPanel();else refreshBody();toast(`${l.id}: tahap ${+t.dataset.i+1}. ${LELANG[+t.dataset.i]}`)},
 mtab:t=>{F.master.tab=t.dataset.t;PD=null;PN=null;renderPage()},
 netApply:()=>{const v={};for(const k in PN)v[k]=num(PN[k]);
   if(!(v.r1>0&&v.r2>v.r1)){toast('Radius zona 2 harus lebih besar dari zona 1');return}
   if(!(v.span>0&&v.rf>=1)){toast('Isi jarak antar tower dengan angka positif; faktor belok minimal 1');return}
   RAD.r1=v.r1;RAD.r2=v.r2;['span','rf'].forEach(k=>NET[k]=v[k]);D.gis.forEach(g=>g.radius=RAD.r2);
   rescore();save();PN=null;refreshBody();toast('Radius dan acuan jalur diterapkan');addNotif(`Radius potensial diubah menjadi ${RAD.r1} dan ${RAD.r2} km; peringkat lahan dihitung ulang.`)},
 netReset:()=>{PN={r1:10,r2:20,span:350,rf:1.2};refreshBody();toast('Nilai bawaan dimuat. Klik "Terapkan" untuk memakainya.')},
 giEdit:t=>giForm(t.dataset.id),
 giMap:t=>openMap(3,{gi:t.dataset.id}),
 giDel:t=>{const g=GI[t.dataset.id];confirmBox('Hapus gardu induk',`Hapus <b>${esc(g.nama)}</b>? ${g.lands.length} kandidat lahan di sekitarnya juga akan ikut terhapus.`,'giDelOk','Hapus',`data-id="${g.id}"`)},
 giDelOk:t=>{const g=GI[t.dataset.id];const nm=g.nama;removeGI(g.id);buildNet();computeRanks();save();closeModal();refreshBody();renderSL();toast(`${nm} dihapus`);addNotif(`Gardu induk ${nm} dihapus dari data master.`)},
 giSave:t=>{
   const v={};document.querySelectorAll('#giF [name]').forEach(e=>v[e.name]=e.value.trim());
   const lat=num(v.lat),lng=num(v.lng),err=[];
   if(!v.nama)err.push('Nama GI wajib diisi.');
   if(!isFinite(lat)||lat<-11.5||lat>6.5)err.push('Lintang harus di antara -11,5 dan 6,5.');
   if(!isFinite(lng)||lng<94||lng>142)err.push('Bujur harus di antara 94 dan 142.');
   const id=t.dataset.id;if(D.gis.some(g=>g.nama.toLowerCase()===v.nama.toLowerCase()&&g.id!==id))err.push('Nama GI sudah dipakai.');
   if(err.length){$('giErr').innerHTML=err.join('<br>');return}
   const mva=num(v.mva)||0,beban=Math.max(0,Math.min(100,num(v.beban)||0));
   const val={nama:v.nama,prov:v.prov,kab:v.kab||'-',lat,lng,kv:+v.kv,sistem:v.sistem||'Isolated',mva,beban,ruang:Math.round(mva*0.85*(1-beban/100)*0.6*10)/10,bay:v.bay,radius:RAD.r2};
   if(id){const g=GI[id];if(g.prov!==val.prov){PROV[g.prov].gis=PROV[g.prov].gis.filter(x=>x!==id);PROV[val.prov].gis.push(id)}Object.assign(g,val);
     landsOfGI(g).forEach(l=>{l.dist=Math.round(hav(l.lat,l.lng,g.lat,g.lng)*10)/10;l.comp.jaringan=Math.round(Math.max(0,100-l.dist*2.2))});rescore();toast(`${g.nama} diperbarui`)}
   else{let m=0;D.gis.forEach(g=>{const n=+g.id.slice(1);if(n>m)m=n});const g={id:'g'+(m+1),...val,lands:[]};D.gis.push(g);GI[g.id]=g;PROV[g.prov].gis.push(g.id);toast(`${g.nama} ditambahkan`);addNotif(`Gardu induk ${g.nama} ditambahkan ke ${PROV[g.prov].short}.`)}
   buildNet();save();closeModal();refreshBody()},
 paramApply:()=>{
   const t=PD.T;if(!(+t.SP>+t.P&&+t.P>+t.CP&&+t.CP>+t.KP)){toast('Batas kategori harus menurun: sangat potensial > potensial > cukup > kurang');return}
   if(!(+PD.HA>0)){toast('Hektare per MWp harus lebih dari 0');return}
   Object.keys(T).forEach(k=>T[k]=+PD.T[k]);HA=+PD.HA;
   rescore();save();PD=null;refreshBody();toast('Parameter diterapkan, semua skor dihitung ulang');addNotif('Parameter penilaian diperbarui dan skor seluruh lahan dihitung ulang.')},
 paramReset:()=>{PD={W:{...W},T:{SP:80,P:70,CP:60,KP:50},HA:1.3};refreshBody();toast('Nilai bawaan dimuat. Klik "Terapkan" untuk memakainya.')},
 upCancel:()=>{UPL=null;refreshBody()},
 upApply:()=>{
   if(!UPL)return;
   if(UPL.kind==='lahan'){UPL.out.forEach(l=>{D.lands.push(l);LAND[l.id]=l;GI[l.gi].lands.push(l.id)});computeRanks();addNotif(`${UPL.out.length} kandidat lahan baru ditambahkan dari ${UPL.name}.`);toast(`${UPL.out.length} lahan ditambahkan`)}
   else{D.rows=UPL.out;addNotif(`Data RUPTL diganti dari ${UPL.name}: ${UPL.out.length} baris.`);toast('Data RUPTL diperbarui')}
   LOGS.unshift({t:Date.now(),name:UPL.name,kind:UPL.kind,n:UPL.out.length});UPL=null;save();refreshBody()},
 tplLahan:()=>dlCSV('template_kandidat_lahan.csv',LH_HEAD,[['','GI Garut',-7.25,107.95,45,'Tanah Negara','Sesuai','Rendah',3.5,4.9,0.8,'Lahan kosong / semak'],['','',-6.6,107.8,30,'Tanah Perorangan','Perlu kajian','Sedang',6,4.8,1.5,'Tegalan / ladang']]),
 csvRuptl:()=>dlCSV('rencana_ruptl_terfilter.csv',Object.values(RH),ruptlFiltered().map(r=>Object.keys(RH).map(k=>k==='wil'?(PROV[r.prov]?PROV[r.prov].wil:''):k==='inB'||k==='inA'?(r[k]?'Ya':'Tidak'):r[k]))),
 csvRuptlAll:()=>dlCSV('rencana_ruptl_semua.csv',Object.values(RH),D.rows.map(r=>Object.keys(RH).map(k=>k==='wil'?(PROV[r.prov]?PROV[r.prov].wil:''):k==='inB'||k==='inA'?(r[k]?'Ya':'Tidak'):r[k]))),
 csvLahan:()=>dlCSV('kandidat_lahan.csv',['kode','provinsi','gi','lat','lng','luas_ha','kapasitas_mwp','jarak_gi_km','zona','peringkat_di_gi','jalur_ke_gi_km','status_lahan','rtrw','risiko_banjir','kemiringan_persen','ghi','jarak_jalan_km','skor','kategori','tahap'],lahanFiltered().map(l=>[l.id,PROV[GI[l.gi].prov].short,GI[l.gi].nama,l.lat,l.lng,l.luas,l.mwp,l.dist,zoneLbl(zoneOf(l)),l.rk||'',routeOf(l,GI[l.gi]).km,l.status,l.rtrw,l.banjir,l.slope,l.ghi,l.akses,l.skor,KAT[l.kat],l.tahap])),
 csvGI:()=>dlCSV('gardu_induk.csv',['nama','provinsi','kabupaten','lat','lng','kv','sistem','mva','beban_persen','ruang_mw','bay','radius_km','jumlah_lahan'],D.gis.map(g=>[g.nama,PROV[g.prov].short,g.kab,g.lat,g.lng,g.kv,g.sistem,g.mva,g.beban,g.ruang,g.bay,g.radius,g.lands.length])),
 csvTindak:()=>dlCSV('proses_lelang_dpt.csv',['kode','gi','provinsi','luas_ha','mwp','opsi','tahap_lelang','penanggung_jawab','target'],D.lands.filter(l=>l.tahap==='Direkomendasikan').map(l=>{const f=fuOf(l);return [l.id,GI[l.gi].nama,PROV[GI[l.gi].prov].short,l.luas,l.mwp,f.opsi,FU_ST[f.st],f.pic,f.tgt]})),
 csvLap:()=>{const provs=F.lap.prov?[PROV[F.lap.prov]]:D.provinces;dlCSV('laporan_potensi_lahan.csv',['provinsi','wilayah','target_mw','proyek','gi','lahan','luas_ha','potensi_mwp','lahan_layak_mwp','direkomendasikan'],provs.map(p=>{const s=provStats(p);return [p.short,p.wil,Math.round(s.mw*100)/100,s.n,p.gis.length,s.ls.length,Math.round(sumBy(s.ls,l=>l.luas)*10)/10,Math.round(s.mwp*10)/10,Math.round(s.mwpGood*10)/10,s.ls.filter(l=>l.tahap==='Direkomendasikan').length]}))},
 print:()=>window.print(),
 notif:()=>{const d=$('ntDrawer'),open=!d.classList.contains('open');closeDrawers();if(open){renderNotif();d.classList.add('open');N.forEach(n=>n.r=true);bell();save()}},
 logout:()=>confirmBox('Keluar dari aplikasi','Ini mock-up, jadi tidak ada sesi yang benar-benar ditutup. Data yang Anda ubah tetap tersimpan di browser.','logoutOk','Keluar'),
 logoutOk:()=>{openModal('Anda sudah keluar','<p style="margin:0">Sesi demo telah diakhiri.</p>',btn('mclose','Masuk kembali','','pri'))},
 resetAll:()=>confirmBox('Kembalikan data contoh','Semua perubahan (shortlist, validasi, tindak lanjut, GI, unggahan, parameter) akan dihapus dan data kembali seperti awal.','resetOk','Kembalikan'),
 resetOk:()=>{try{localStorage.removeItem(STORE)}catch(e){}clearTimeout(_sv);location.reload()}
};
const IN={
 pn:t=>{PN[t.dataset.k]=t.value},
 note:t=>{LAND[t.dataset.id].note=t.value;save()},
 fu:t=>{const l=LAND[t.dataset.id];fuOf(l)[t.dataset.k]=t.value;save();if(t.dataset.k==='opsi')toast(`${l.id}: opsi ${t.value}`)},
 pd:t=>{const g=t.dataset.g;if(g==='HA')PD.HA=t.value;else PD[g][t.dataset.k]=t.value;
},
 file:async t=>{
   const f=t.files&&t.files[0];if(!f)return;const kind=t.dataset.kind;
   UPL={loading:true,name:f.name};refreshBody();
   try{const objs=await readFile(f,kind);const r=kind==='lahan'?mapLahan(objs,f.name):mapRuptl(objs);UPL={kind,name:f.name,out:r.out,iss:r.iss};if(!r.out.length&&!r.iss.length)UPL.iss=['Tidak ada baris data yang terbaca.']}
   catch(e){UPL={err:e.message||String(e),name:f.name}}
   t.value='';refreshBody();
 }
};

/* ---------- pendengar event ---------- */
document.addEventListener('click',e=>{
  if(e.target.id==='mdlBg'){closeModal();return}
  const p=e.target.closest('[data-page]');if(p){e.preventDefault();goPage(p.dataset.page);return}
  const t=e.target.closest('[data-act]');if(!t||t.disabled)return;
  const f=ACT[t.dataset.act];if(f)f(t,e);
});
document.addEventListener('input',e=>{
  const t=e.target.closest('[data-in]');if(!t||t.type==='file')return;
  const k=t.dataset.in;
  if(k.startsWith('f:')){const[,pg,fld]=k.split(':');F[pg][fld]=t.value;
    if(pg==='lahan'){F.lahan.page=0;if(fld==='prov'){F.lahan.gi='';renderPage();return}}
    refreshBody();
    if(t.tagName==='INPUT'){const n=document.querySelector(`[data-in="${k}"]`);if(n&&n!==t){n.focus();const L=n.value.length;try{n.setSelectionRange(L,L)}catch(_){}}}
    return}
  if(IN[k])IN[k](t);
});
document.addEventListener('change',e=>{const t=e.target.closest('[data-in]');if(t&&t.type==='file')IN.file(t)});
bell();
chrome('peta');
