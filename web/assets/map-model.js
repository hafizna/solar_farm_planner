const STORE='plts-potensi-lahan-mock-v2';
const SAVED=(()=>{try{const s=JSON.parse(localStorage.getItem(STORE)||'null');return s&&s.v===1?s:null}catch(e){return null}})();
if(SAVED)['gis','lands','provinces','rows'].forEach(k=>{if(Array.isArray(SAVED[k])&&SAVED[k].length)D[k]=SAVED[k]});
// Rule: PLTS candidate GI is EXCLUSIVELY 70 kV or 150 kV, never GITET or 20 kV.
// Demo sites tied to other voltages are excluded, NOT silently reassigned.
const ELIGIBLE_GI_KV=new Set([70,150]);
const GI_BEFORE_FILTER=D.gis.length,LAND_BEFORE_FILTER=D.lands.length;
D.gis=D.gis.filter(g=>ELIGIBLE_GI_KV.has(Number(g.kv)));
const ELIGIBLE_IDS=new Set(D.gis.map(g=>g.id));
D.lands=D.lands.filter(l=>ELIGIBLE_IDS.has(l.gi));
for(const g of D.gis)g.lands=D.lands.filter(l=>l.gi===g.id).map(l=>l.id);
for(const p of D.provinces)p.gis=p.gis.filter(id=>ELIGIBLE_IDS.has(id));
const REMOVED_INVALID_GI=GI_BEFORE_FILTER-D.gis.length;
const REMOVED_INVALID_LAND=LAND_BEFORE_FILTER-D.lands.length;
const STG=['Identifikasi','Verifikasi lapangan','Kajian teknis','Direkomendasikan'];
const CEK=[['legal','Status hukum lahan terverifikasi','Sertifikat/alas hak dan pemilik sudah dicek'],['rtrw','Kesesuaian tata ruang dicek','Peta RTRW kabupaten mengizinkan PLTS'],['survei','Survei lapangan selesai','Kondisi fisik, akses, dan foto lokasi sudah ada'],['topo','Kajian topografi dan geoteknik','Kemiringan dan daya dukung tanah memadai'],['grid','Kajian interkoneksi ke GI','Rute jaringan dan ruang di GI sudah dikonfirmasi']];
const COMP=[['radiasi','Radiasi matahari','Seberapa kuat sinar matahari harian'],['jaringan','Kedekatan ke GI','Makin dekat GI makin murah penyambungan'],['topografi','Kemiringan lahan','Lahan datar lebih mudah dibangun'],['legal','Status lahan','Kejelasan dan kemudahan penguasaan lahan'],['tataruang','Kesesuaian tata ruang','Kesesuaian dengan RTRW daerah'],['lingkungan','Risiko banjir','Makin rendah risiko makin baik'],['akses','Akses jalan','Jarak lahan ke jalan terdekat']];
const REF={status:{'Tanah Negara':95,'Aset PLN / BUMN':100,'Tanah Perusahaan':70,'Tanah Perorangan':55,'Tanah Adat / Ulayat':45},rtrw:{'Sesuai':100,'Sesuai bersyarat':75,'Perlu kajian':50,'Tidak sesuai':15},banjir:{'Rendah':100,'Sedang':65,'Tinggi':25}};
const W=Object.assign({radiasi:20,jaringan:20,topografi:15,legal:15,tataruang:12,lingkungan:10,akses:8},SAVED&&SAVED.W||{});
const T=Object.assign({SP:80,P:70,CP:60,KP:50},SAVED&&SAVED.T||{});
let HA=SAVED&&SAVED.HA||1.3;
const RAD=Object.assign({r1:10,r2:20},SAVED&&SAVED.RAD||{});
const NET=Object.assign({span:350,rf:1.2},SAVED&&SAVED.NET||{});
const LELANG=['Pengumuman registrasi peserta','Pendaftaran peserta DPT','Pengambilan dokumen kualifikasi','Pemasukan dokumen ke aplikasi','Site visit','Evaluasi dan klarifikasi','Penetapan peserta DPT','Pengumuman peserta DPT tanah'];
const hav2=(a,b,c,d)=>{const R=6371,r=Math.PI/180,x=(c-a)*r,y=(d-b)*r,h=Math.sin(x/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin(y/2)**2;return 2*R*Math.asin(Math.sqrt(h))};
D.gis.forEach(g=>g.radius=RAD.r2);
function zoneOf(l){return l.dist<=RAD.r1?1:l.dist<=RAD.r2?2:3}
function zoneLbl(z){return z===1?`Zona 1 (≤ ${RAD.r1} km)`:z===2?`Zona 2 (${RAD.r1}–${RAD.r2} km)`:`Di luar ${RAD.r2} km`}
function zoneShort(z){return z===1?`≤ ${RAD.r1} km`:z===2?`${RAD.r1}–${RAD.r2} km`:`> ${RAD.r2} km`}
function computeRanks(){const gp={};D.gis.forEach(g=>gp[g.id]=g.prov);const byG={},byP={};
 D.lands.forEach(l=>{l.rk=null;l.rkP=null;if(l.dist<=RAD.r2){(byG[l.gi]=byG[l.gi]||[]).push(l);(byP[gp[l.gi]]=byP[gp[l.gi]]||[]).push(l)}});
 const srt=a=>a.sort((x,y)=>y.skor-x.skor||x.dist-y.dist);
 Object.values(byG).forEach(a=>srt(a).forEach((l,i)=>{l.rk=i+1;l.rkN=a.length}));
 Object.values(byP).forEach(a=>srt(a).forEach((l,i)=>{l.rkP=i+1;l.rkPN=a.length}));}
/* ================================================================
   GRID CONNECTION CORRIDOR — PHYSICAL CONSTRAINT PRE-SCREEN
   NO electrically validated route / ROW / permit / topo / borehole
   ================================================================ */
const LANDMASK_COARSE={"type":"MultiPolygon","coordinates":[[[[141.00021040259185,-2.60015105551566],[141.03385176001382,-9.117892754760483],[140.14341515519254,-8.29716765710095],[139.1277665549281,-8.096042982620979],[138.881476678625,-8.380935153846075],[137.61447391169287,-8.41168263105974],[138.03909915583517,-7.597882175327321],[138.66862145401478,-7.320224704623087],[138.4079138531023,-6.232849216337485],[137.92783979711078,-5.393365573756],[135.98925011611345,-4.54654387778907],[135.16459760959975,-4.462931410340822],[133.66288048719787,-3.538853448097541],[133.36770470594672,-4.024818617370315],[132.98395551974727,-4.112978610860253],[132.75694095268904,-3.7462826473171233],[132.75378869031925,-3.3117872046070502],[131.98980431531618,-2.820551039240499],[133.0668445171434,-2.460417982598436],[133.78003095920354,-2.4798483211401816],[133.69621178602614,-2.214541517753702],[132.23237348849426,-2.2125261368943185],[131.83622195854474,-1.6171619604596472],[130.94283979708285,-1.4325220678807826],[130.5195581401801,-0.9377202286860893],[131.8675378765136,-0.6954611141017892],[132.3801164084167,-0.36953785563694913],[133.98554813042836,-0.7802104630604559],[134.14336795464772,-1.151867364103623],[134.42262739475302,-2.769184665542376],[135.45760298069467,-3.367752780779149],[136.29331424371884,-2.307042331556154],[137.44073774632756,-1.7035132788193648],[138.3297274110447,-1.7026864559026933],[139.18492068904288,-2.0512956681436734],[139.92668419816044,-2.409051608900313],[141.00021040259185,-2.60015105551566]]],[[[124.96868248911623,-8.892790215697083],[125.07001997284061,-9.089987481322872],[125.08852013560109,-9.393173109579294],[124.43595014861933,-10.140000909061449],[123.57998172413669,-10.359987481327956],[123.459989048355,-10.239994805546223],[123.55000939340744,-9.900015557497987],[123.9800089865081,-9.290026950724716],[124.96868248911623,-8.892790215697083]]],[[[134.21013390516885,-6.89523772545472],[134.11277550673094,-6.142467136259],[134.29033572808584,-5.783057549669017],[134.49962527886788,-5.445042006047871],[134.72700158095216,-5.737582289252167],[134.7246244650667,-6.214400730009288],[134.21013390516885,-6.89523772545472]]],[[[117.88203494677018,4.137551377779516],[117.3132324565335,3.234428208830593],[118.0483297058854,2.2876901310273325],[117.87562706916597,1.8276406925489255],[118.99674726773816,0.9022191430660627],[117.8118583517178,0.7842418481437078],[117.47833865770603,0.10247467691702639],[117.52164350796664,-0.8037232397532676],[116.56004845587947,-1.4876608211362097],[116.5337968282752,-2.483517347832901],[116.14808393764866,-4.012726332214022],[116.00085778204911,-3.6570374487490582],[114.86480309454456,-4.106984144714396],[114.46865156459506,-3.495703627133828],[113.75567182826407,-3.4391696102065197],[113.25699425664752,-3.118775729996905],[112.06812625534067,-3.4783920223160507],[111.70329064336005,-2.9944422339026535],[111.04824018762824,-3.0494259578612106],[110.223846063276,-2.9340324845534553],[110.07093550012434,-1.5928740372824635],[109.571947869914,-1.3149065079844746],[109.0918738139225,-0.45950652425709393],[108.9526575053282,0.41537547444431766],[109.06913618371408,1.3419339054376138],[109.66326012577375,2.0064669864949565],[109.83022667850881,1.3381356876641632],[110.51406090702716,0.7731314152009645],[111.15913781132662,0.976478176269481],[111.79754845586041,0.9044412296546085],[112.38025190638359,1.4101209578467433],[112.85980919805218,1.4977900252299037],[113.8058496440195,1.2175487329110695],[114.62135542201753,1.4306881778989011],[115.13403730678522,2.8214818383862337],[115.51907840379198,3.169238389494396],[115.8655172058767,4.3065591495901],[117.01521447150628,4.3060940616994685],[117.88203494677018,4.137551377779516]]],[[[129.37099775606094,-2.8021542293445947],[130.47134402885177,-3.093764336767634],[130.83483605359282,-3.8584721818227763],[129.99054650280817,-3.446300957862796],[129.15524865124235,-3.3626368139822485],[128.59068362845363,-3.428679294451264],[127.89889122936235,-3.393435967628207],[128.13587934785284,-2.843650404474971],[129.37099775606094,-2.8021542293445947]]],[[[126.87492272349886,-3.7909827612495874],[126.18380211802736,-3.607376397316564],[125.98903364471926,-3.177273451351305],[127.00065148326497,-3.129317722184446],[127.24921512258891,-3.45906503663889],[126.87492272349886,-3.7909827612495874]]],[[[127.93237755748748,2.1745962589565693],[128.00415612194087,1.6285313989283452],[128.5945593608755,1.5408106551128782],[128.6882487326207,1.1323859724940633],[128.63595218314134,0.2584858260061935],[128.1201697124361,0.3564126651992865],[127.96803429576886,-0.25207732503751856],[128.3799988139997,-0.7800037573313005],[128.1000159038423,-0.8999964331130315],[127.69647464407507,-0.26659840251153355],[127.39949018769369,1.011721503092545],[127.60051150930906,1.810690822757195],[127.93237755748748,2.1745962589565693]]],[[[122.9275667664518,0.8751923689774088],[124.07752241424288,0.9171019555661245],[125.0659892111218,1.6432591821315297],[125.2405005229715,1.4198361271176054],[124.4370353536974,0.4278811710589565],[123.6855049988767,0.235593166500891],[122.72308312387287,0.4311367862933366],[121.05672488818911,0.3812173526993945],[120.18308312386272,0.2372468123342344],[120.04086958219548,-0.5196578914448367],[120.93590538949073,-1.408905938323393],[121.4758207540762,-0.9559620092851304],[123.34056481332846,-0.6156727026431383],[123.25839928598441,-1.0762130672283092],[122.82271528533161,-0.9309506160558526],[122.38852990121529,-1.516858005381117],[121.50827355355551,-1.904482924002458],[122.4545723816843,-3.1860584448409237],[122.2718961935325,-3.5295000138527115],[123.17096276254655,-4.683693129091701],[123.1623327983538,-5.340603936385996],[122.62851525277875,-5.634591159694466],[122.23639448454801,-5.2829330379482675],[122.71956912647701,-4.464171644715826],[121.73823367725436,-4.851331475446543],[121.48946333220127,-4.574552504091265],[121.61917117725386,-4.1884778784386825],[120.89818159391766,-3.602105401222794],[120.97238895068878,-2.627642917494939],[120.30545291552986,-2.9316036922357327],[120.39004723519167,-4.097579034037274],[120.43071658740537,-5.528241062037793],[119.79654341031949,-5.673400160345665],[119.36690555224489,-5.3798780249278195],[119.65360639860017,-4.459417412944973],[119.49883548388601,-3.4944117163265322],[119.07834435432704,-3.487021986508793],[118.76776899625287,-2.801999200047718],[119.18097374885869,-2.1471037736128054],[119.3233939962551,-1.3531470678804638],[119.82599897672587,0.1542544620734816],[120.0357019389663,0.5664773624657613],[120.88577925016762,1.3092227237968501],[121.66681684782696,1.0139435896810909],[122.9275667664518,0.8751923689774088]]],[[[120.29501427620689,-10.258649997603591],[118.96780846565471,-9.557969252158074],[119.90030968636157,-9.361340427287502],[120.42575564990534,-9.665921319215798],[120.77550174365675,-9.96967538822743],[120.71560875863045,-10.239581394087885],[120.29501427620689,-10.258649997603591]]],[[[121.34166873584651,-8.536739597206072],[122.00736453663043,-8.460620212440148],[122.90353722543607,-8.094234307490765],[122.75698286345632,-8.649807631060696],[121.2544905945701,-8.933666273639957],[119.92439090380958,-8.81041798262384],[119.92092858284605,-8.444858900591122],[120.71509199430757,-8.236964613480914],[121.34166873584651,-8.536739597206072]]],[[[118.26061648974044,-8.362383314653293],[118.87845991422208,-8.280682875199844],[119.12650678922307,-8.705824883665088],[117.27773074754901,-9.040894870645594],[116.74014082241665,-9.032936700072646],[117.0837374207253,-8.45715789147659],[117.6320243673421,-8.449303073768228],[117.90001834520776,-8.09568124759494],[118.26061648974044,-8.362383314653293]]],[[[108.48684614464926,-6.42198495852574],[108.62347863162896,-6.777673841990705],[110.53922732955328,-6.877357679881726],[110.75957563684585,-6.465186455921747],[112.6148112325564,-6.946035658397626],[112.97876834518806,-7.594213148634594],[114.47893517462114,-7.7765276017603275],[115.70552697150106,-8.370806573116873],[114.56451134649649,-8.751816908404855],[113.46473351446085,-8.348947442257405],[112.55967247930097,-8.376180922075221],[111.52206139531245,-8.302128594600973],[110.58614953007432,-8.122604668819001],[109.42766727095511,-7.740664157749762],[108.69365522668133,-7.641600437046243],[108.27776329959633,-7.766657403192576],[106.45410200401612,-7.354899590690934],[106.28062422081231,-6.924899997590252],[105.36548628135552,-6.851416110871206],[106.05164594932702,-5.895918877794472],[107.2650085795402,-5.954985039904081],[108.07209109907467,-6.3457622208952245],[108.48684614464926,-6.42198495852574]]],[[[104.36999148968489,-1.0848430314210589],[104.53949018760221,-1.7823715144967662],[104.88789269411402,-2.340425306816705],[105.62211144411697,-2.4288436824680986],[106.10859337771265,-3.0617766251789647],[105.85744591677414,-4.305524997579774],[105.8176550639094,-5.85235564537242],[104.71038414919144,-5.873284600450632],[103.86821333213078,-5.037314955264996],[102.5842606954069,-4.2202588842981825],[102.156173130301,-3.6141460099468006],[101.39911339722507,-2.7997771134591645],[100.90250288290015,-2.050262139497832],[100.14198082886065,-0.6503475887109857],[99.26373986206028,0.1831415877246343],[98.97001102091326,1.042882391764536],[98.60135135294306,1.8235065779655741],[97.69959760944985,2.45318390544206],[97.17694217324984,3.3087905948985963],[96.42401655475726,3.868859768077925],[95.3808760925135,4.970782172053688],[95.29302615761729,5.479820868344788],[95.93686282754174,5.439513251157123],[97.4848820332771,5.246320909033955],[98.36916914265566,4.2683702661263965],[99.1425586283358,3.590349636240873],[99.69399783732241,3.174328518075143],[100.64143354696162,2.099381211755741],[101.65801232300734,2.0836974145551608],[102.49827111207323,1.3987004663102311],[103.07684044801303,0.5613613956688681],[103.83839603069836,0.10454173420869493],[103.4376452982749,-0.7119458960029021],[104.01078860882404,-1.0592115210042863],[104.36999148968489,-1.0848430314210589]]]]};
const ROUTE_CTX={mode:'auto',demo:false,constraints:[],revision:0,cache:new Map(),showCoast:true};
const ROUTE_MODES=['sutt','sktt'];
const fmtKm=v=>Number.isFinite(v)?nf(v):'–';
const fmtRoute=(l,g)=>fmtKm(routeOf(l,g).km);
function ringContains(pt,ring){let c=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){
 const a=ring[i],b=ring[j],x=pt[1],y=pt[0];
 if(((a[1]>y)!==(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))c=!c;
}return c}
function shapeContains(pt,geo){
 if(!geo)return false;
 if(geo.type==='Polygon')return geo.coordinates.length>0 && ringContains(pt,geo.coordinates[0]) && !geo.coordinates.slice(1).some(r=>ringContains(pt,r));
 if(geo.type==='MultiPolygon')return geo.coordinates.some(p=>shapeContains(pt,{type:'Polygon',coordinates:p}));
 return false;
}
function coastContains(lat,lon){return shapeContains([lat,lon],LANDMASK_COARSE)}
function demoConstraints(l,g){
 if(!ROUTE_CTX.demo)return [];
 const dy=l.lat-g.lat,dx=(l.lng-g.lng)*Math.cos(g.lat*Math.PI/180),mag=Math.hypot(dx,dy)||1e-9;
 const nx=-dy/mag,ny=dx/mag,cc=Math.cos(g.lat*Math.PI/180);
 function diamond(t,rPar,rPer,type){
  const lat=g.lat+(l.lat-g.lat)*t,lon=g.lng+(l.lng-g.lng)*t;
  const shift=(p,q)=>[lon+((l.lng-g.lng)*p+nx*q/cc),lat+(l.lat-g.lat)*p+ny*q];
  const coords=[shift(-rPar,-rPer),shift(rPar,-rPer),shift(rPar,rPer),shift(-rPar,rPer)];coords.push(coords[0]);
  return {type:'Feature',properties:{class:type,source:'SYNTHETIC_DEMO'},geometry:{type:'Polygon',coordinates:[coords]}};
 }
 return [diamond(.43,.075,.007,'water'),diamond(.67,.055,.005,'urban')];
}
function canonicalConstraintClass(properties){
 const token=String(properties.class||properties.category||properties.type||properties.landuse||properties.natural||properties.highway||'').toLowerCase().trim();
 if(['water','river','lake','reservoir','sea','ocean','wetland','sungai','danau','waduk','air'].includes(token))return 'water';
 if(['protected','conservation','no_go','restricted','protected_area','kawasan_lindung'].includes(token))return 'protected';
 if(['urban','residential','settlement','builtup','industrial','permukiman','bangunan'].includes(token))return 'urban';
 if(['steep','slope','landslide','curam'].includes(token))return 'steep';
 if(['road','residential_road','service','track','jalan','tertiary','secondary','primary'].includes(token))return 'road';
 return '';
}
function getConstraints(l,g){
 return ROUTE_CTX.constraints.concat(demoConstraints(l,g)).map(f=>({...f,_cls:canonicalConstraintClass(f.properties||{})})).filter(f=>f._cls);
}
function pointLineKm(p,coordinates){
 let dist=1e9;const c=Math.cos(p[0]*Math.PI/180);
 for(let i=1;i<coordinates.length;i++){
  const a=coordinates[i-1],b=coordinates[i],px=p[1]*c,py=p[0];
  const ax=a[0]*c,ay=a[1],bx=b[0]*c,by=b[1],dx=bx-ax,dy=by-ay;
  const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy||1)));
  dist=Math.min(dist,Math.hypot(px-ax-t*dx,py-ay-t*dy)*111.2);
 }return dist;
}
function constraintClassAt(pt,features){
 const found=new Set();
 for(const f of features){const geom=f.geometry||{},cls=f._cls;
  if((geom.type==='Polygon'||geom.type==='MultiPolygon')&&shapeContains(pt,geom))found.add(cls);
  if(cls==='road'&&geom.type==='LineString'&&pointLineKm(pt,geom.coordinates)<.25)found.add('road');
  if(cls==='road'&&geom.type==='MultiLineString'&&geom.coordinates.some(x=>pointLineKm(pt,x)<.25))found.add('road');
 }return found;
}
function routeSearch(l,g,method){
 const start=[g.lat,g.lng],end=[l.lat,l.lng],distance=hav2(...start,...end);
 const features=getConstraints(l,g),landmask=coastContains(...start)&&coastContains(...end)&&ROUTE_CTX.showCoast;
 const latSpan=Math.abs(start[0]-end[0]),lonSpan=Math.abs(start[1]-end[1]);
 const pad=Math.min(.085,Math.max(.014,Math.max(latSpan,lonSpan)*.45));
 const minLat=Math.min(start[0],end[0])-pad,maxLat=Math.max(start[0],end[0])+pad;
 const minLon=Math.min(start[1],end[1])-pad,maxLon=Math.max(start[1],end[1])+pad;
 const rows=Math.min(84,Math.max(24,Math.ceil((maxLat-minLat)/.006)));
 const cols=Math.min(84,Math.max(24,Math.ceil((maxLon-minLon)/.006)));
 const xy=(r,c)=>[minLat+r*(maxLat-minLat)/(rows-1),minLon+c*(maxLon-minLon)/(cols-1)];
 const grid=(p)=>[Math.min(rows-1,Math.max(0,Math.round((p[0]-minLat)/(maxLat-minLat)*(rows-1)))),Math.min(cols-1,Math.max(0,Math.round((p[1]-minLon)/(maxLon-minLon)*(cols-1))))];
 const id=(r,c)=>r*cols+c, startGrid=grid(start),endGrid=grid(end),src=id(...startGrid),dst=id(...endGrid),len=rows*cols;
 const nodes=new Array(len),blocks=new Uint8Array(len),factors=new Float64Array(len);
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
  const i=id(r,c),p=xy(r,c);nodes[i]=p;
  const cls=constraintClassAt(p,features);
  blocks[i]=(landmask&&!coastContains(...p))||cls.has('water')||cls.has('protected')?1:0;
  let factor=1;
  if(cls.has('urban'))factor*=method==='sutt'?12:1.65;
  if(cls.has('steep'))factor*=method==='sutt'?4:8;
  if(cls.has('road')&&method==='sktt')factor*=.78;
  factors[i]=Math.max(.75,factor);
 }
 // Start/end local coordinates are known connection anchors, not verified connection bays.
 if(blocks[src]||blocks[dst])return {status:'BLOCKED',method,km:null,pts:[],reason:'Titik GI atau lahan berada pada zona eksklusi / area laut dari data yang dimuat.',landmask};
 const best=new Float64Array(len);best.fill(Infinity);best[src]=0;
 const parent=new Int32Array(len);parent.fill(-1);
 const closed=new Uint8Array(len),heap=[];
 const push=(cost,node)=>{heap.push([cost,node]);let i=heap.length-1;while(i>0){const p=Math.floor((i-1)/2);if(heap[p][0]<=heap[i][0])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p}};
 const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){let b=i,l=i*2+1,r=l+1;if(l<heap.length&&heap[l][0]<heap[b][0])b=l;if(r<heap.length&&heap[r][0]<heap[b][0])b=r;if(i===b)break;[heap[i],heap[b]]=[heap[b],heap[i]];i=b}}return top};
 const h=i=>hav2(...nodes[i],...nodes[dst])*.75;
 push(h(src),src);
 const neighbors=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
 let explored=0;
 while(heap.length&&explored<len*4){const [_,i]=pop();if(closed[i])continue;closed[i]=1;explored++;
  if(i===dst)break;const r=Math.floor(i/cols),c=i%cols;
  for(const [dr,dc] of neighbors){const rr=r+dr,cc=c+dc;if(rr<0||cc<0||rr>=rows||cc>=cols)continue;
   const ni=id(rr,cc);if(blocks[ni]||closed[ni])continue;
   if(dr&&dc&&(blocks[id(r+dr,c)]||blocks[id(r,c+dc)]))continue;
   const m=[(nodes[i][0]+nodes[ni][0])/2,(nodes[i][1]+nodes[ni][1])/2];
   const mcls=constraintClassAt(m,features);
   if(mcls.has('water')||mcls.has('protected')||(landmask&&!coastContains(...m)))continue;
   const cost=hav2(...nodes[i],...nodes[ni])*(factors[i]+factors[ni])/2;
   if(best[i]+cost<best[ni]){best[ni]=best[i]+cost;parent[ni]=i;push(best[ni]+h(ni),ni)}
  }
 }
 if(!Number.isFinite(best[dst]))return {status:'BLOCKED',method,km:null,pts:[],reason:'Tidak ada koridor tanpa melintasi area eksklusi di batas area pencarian.',landmask};
 const indices=[],used=new Set();for(let i=dst;i!==-1&&!used.has(i);i=parent[i]){indices.push(i);used.add(i);if(i===src)break}indices.reverse();
 let pts=[start,...indices.slice(1,-1).map(i=>nodes[i]),end];
 // Remove almost-collinear waypoints ONLY; do not draw a shortcut through excluded polygons.
 let clean=[pts[0]];
 for(let i=1;i<pts.length-1;i++){
  const p=clean[clean.length-1],b=pts[i],q=pts[i+1];
  const a1=Math.atan2(b[0]-p[0],(b[1]-p[1])*Math.cos(p[0]*Math.PI/180)),a2=Math.atan2(q[0]-b[0],(q[1]-b[1])*Math.cos(p[0]*Math.PI/180));
  if(Math.abs(Math.atan2(Math.sin(a1-a2),Math.cos(a1-a2)))>.07)clean.push(b);
 }clean.push(end);pts=clean;
 // Safety validation samples the final segments, rejecting paths that pass water polygons between samples.
 for(let k=1;k<pts.length;k++){
  let a=pts[k-1],b=pts[k],n=Math.max(3,Math.ceil(hav2(...a,...b)/.15));
  for(let j=1;j<n;j++){
   const p=[a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n],cls=constraintClassAt(p,features);
   if(cls.has('water')||cls.has('protected')||(landmask&&!coastContains(...p)))
      return {status:'BLOCKED',method,km:null,pts:[],reason:'Validasi lintasan menemukan perpotongan penghalang. Perlu resolusi GIS lebih baik.',landmask};
  }
 }
 const km=pts.slice(1).reduce((sum,p,i)=>sum+hav2(...pts[i],...p),0);
 return {status:'INDICATIVE',method,km:Math.round(km*10)/10,pts,reason:'Jalur indikatif dari raster pathfinding; bukan desain ROW',landmask,
  constraints:features.length,gridResolutionKm:Math.max((maxLat-minLat)*111/rows,(maxLon-minLon)*111/cols)};
}
function corridor(l,g){
 if(!ELIGIBLE_GI_KV.has(Number(g.kv)))return {status:'INELIGIBLE',km:null,pts:[],reason:'GI wajib 70 kV atau 150 kV'};
 if(!l||!g)return {status:'MISSING',km:null,pts:[]};
 // Avoid costly raster simulation for 1,000+ rows in national reports / tables.
 if(typeof S!=='undefined'&&(S.level!==3||S.gi!==g.id))return {status:'NOT_EVALUATED',km:null,pts:[],reason:'Aktifkan peta GI untuk hitung koridor'};
 const key=[l.id,g.id,ROUTE_CTX.mode,ROUTE_CTX.demo,ROUTE_CTX.revision].join('|');
 if(ROUTE_CTX.cache.has(key))return ROUTE_CTX.cache.get(key);
 const candidates=(ROUTE_CTX.mode==='auto'?ROUTE_MODES:[ROUTE_CTX.mode]).map(mode=>routeSearch(l,g,mode));
 const valid=candidates.filter(r=>r.status==='INDICATIVE');
 const score=r=>r.km*(r.method==='sktt'?3.2:1);
 const selected=valid.sort((a,b)=>score(a)-score(b))[0]||candidates[0];
 ROUTE_CTX.cache.set(key,selected);return selected;
}
function routeOf(l,g){
 const r=corridor(l,g),kv=g.kv;
 const sktt=r.method==='sktt',km=r.status==='INDICATIVE'?r.km:null;
 return {kv,km,lurus:l.dist,tower:km!=null&&!sktt?Math.ceil(km*1000/NET.span)+1:null,
 jenis:(sktt?'SKTT ':'SUTT ')+kv+' kV',sirkit:'Belum ditentukan',status:r.status,reason:r.reason,
 sumber:'Natural Earth coastline kasar / GeoJSON constraint jika disediakan',method:r.method||ROUTE_CTX.mode};
}
function routePts(l,g){return corridor(l,g).pts||[]}
let NETL=[];
function buildNet(){NETL=[]; /* No invented transmission traces. Load verified routes when available. */}
function katOf(s){return s>=T.SP?'SP':s>=T.P?'P':s>=T.CP?'CP':s>=T.KP?'KP':'TL'}
function kdesc(k){return k==='SP'?`skor ≥ ${T.SP}`:k==='P'?`skor ${T.P}–${T.SP-1}`:k==='CP'?`skor ${T.CP}–${T.P-1}`:k==='KP'?`skor ${T.KP}–${T.CP-1}`:`skor < ${T.KP}`}
function rescore(){D.lands.forEach(l=>{let s=0;for(const k in W)s+=W[k]*l.comp[k]/100;l.skor=Math.round(s*10)/10;let k=katOf(l.skor);if(l.dist>RAD.r2&&(k==='SP'||k==='P'||k==='CP'))k='KP';l.kat=k;l.mwp=Math.round(l.luas/HA*10)/10});computeRanks()}
const hh=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))|0;return Math.abs(h)};
const PICS=['Div. Perencanaan Sistem','UIP setempat','Div. Pertanahan','UIW setempat','Tim SolAr Icon Plus'];
function fuOf(l){if(!l.fu){const h=hh(l.id);l.fu={opsi:['Sewa','Beli','Kerja sama pemanfaatan'][h%3],st:h%8,pic:PICS[h%5],tgt:`2027-${String(1+h%12).padStart(2,'0')}`}}return l.fu}
D.lands.forEach(l=>{if(l.tahap==='Shortlist')l.tahap='Direkomendasikan';
  if(!l.cek){const si=STG.indexOf(l.tahap),n=l.tahap==='Direkomendasikan'?5:Math.min(4,si*2+(hh(l.id)%2));l.cek={};CEK.forEach((c,i)=>l.cek[c[0]]=i<n)}
  if(l.note==null)l.note='';});
rescore();


/* ---------- ikon ---------- */
const IC={
 map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
 zap:'<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
 net:'<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/>',
 layers:'<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 12 10 5 10-5M2 17l10 5 10-5"/>',
 act:'<path d="M22 12h-4l-3 8-6-16-3 8H2"/>',
 db:'<rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/>',
 up:'<path d="M16 16l-4-4-4 4M12 12v9"/><path d="M20.4 18.4A5 5 0 0 0 18 9h-1.3A8 8 0 1 0 4 16.3"/>',
 doc:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
 help:'<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
 bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
 out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
 pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
 home:'<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
 back:'<path d="M19 12H5M12 19l-7-7 7-7"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 ext:'<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>',
 star:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
 list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
 file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>'
};
const ic=(n,s='')=>`<svg class="i" viewBox="0 0 24 24" ${s}>${IC[n]}</svg>`;
document.querySelectorAll('[data-ic]').forEach(b=>b.innerHTML=ic(b.dataset.ic));

/* ---------- data & util ---------- */
const KAT={SP:'Sangat potensial',P:'Potensial',CP:'Cukup potensial',KP:'Kurang potensial',TL:'Tidak layak'};
const KO=['SP','P','CP','KP','TL'];
const kc=k=>`var(--k-${k})`;
const PROV=Object.fromEntries(D.provinces.map(p=>[p.key,p]));
const GI=Object.fromEntries(D.gis.map(g=>[g.id,g]));
const LAND=Object.fromEntries(D.lands.map(l=>[l.id,l]));
const nf=(n,d=1)=>Number(n).toLocaleString('id-ID',{maximumFractionDigits:d});
const nf0=n=>Number(n).toLocaleString('id-ID',{maximumFractionDigits:0});
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=id=>document.getElementById(id);

const S={level:1,prov:null,gi:null,land:null,scen:'B',jenis:'all',tab:'map',page:'peta',sl:new Set((SAVED&&SAVED.sl||[]).filter(id=>D.lands.some(l=>l.id===id)))};
const SCEN={B:'RE Base',A:'ARED'};

function rowsOf(pk,sis){
  return D.rows.filter(r=>r.prov===pk&&(S.scen==='B'?r.inB:r.inA)&&(S.jenis==='all'||r.jenis===S.jenis)&&(!sis||r.sis===sis));
}
const cod=r=>S.scen==='B'?r.codB:r.codA;
const landsOfGI=g=>g.lands.map(id=>LAND[id]);
const landsOfProv=p=>p.gis.flatMap(id=>landsOfGI(GI[id]));
function katCount(ls){const c={SP:0,P:0,CP:0,KP:0,TL:0};ls.forEach(l=>c[l.kat]++);return c}
function provStats(p){
  const rows=rowsOf(p.key),ls=landsOfProv(p);
  const s={rows,n:rows.length,mw:0,mwP:0,mwB:0,nP:0,nB:0,st:{},yr:{},ls,kc:katCount(ls),mwp:0,mwpGood:0};
  rows.forEach(r=>{s.mw+=r.mw;if(r.jenis==='PLTS'){s.mwP+=r.mw;s.nP++}else{s.mwB+=r.mw;s.nB++}
    s.st[r.status]=(s.st[r.status]||0)+1;const y=cod(r);if(y&&y!=='-'){s.yr[y]=s.yr[y]||{P:0,B:0};s.yr[y][r.jenis==='PLTS'?'P':'B']+=r.mw}});
  ls.forEach(l=>{s.mwp+=l.mwp;if(l.kat==='SP'||l.kat==='P')s.mwpGood+=l.mwp});
  const gs=p.gis.map(id=>GI[id]);
  s.center=[gs.reduce((a,g)=>a+g.lat,0)/gs.length,gs.reduce((a,g)=>a+g.lng,0)/gs.length];
  return s;
}
function bestKat(ls){for(const k of KO)if(ls.some(l=>l.kat===k))return k;return 'TL'}
function stackBar(c,total){return `<div class="stack">${KO.map(k=>c[k]?`<i style="width:${c[k]/total*100}%;background:${kc(k)}"></i>`:'').join('')}</div>`}
function toast(t){const e=$('toast');e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),2200)}

/* ---------- jam ---------- */
function tick(){const d=new Date();const b=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
 $('clock').textContent=`${d.getDate()} ${b[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,'0')}.${String(d.getMinutes()).padStart(2,'0')}.${String(d.getSeconds()).padStart(2,'0')} WIB`}
tick();setInterval(tick,1000);

/* ---------- peta ---------- */
const INDO=[[-11.2,94.6],[6.4,141.2]];
const map=L.map('map',{zoomControl:true,minZoom:4,maxZoom:17,zoomSnap:.25,attributionControl:true}).fitBounds(INDO);
/* Basemap service is OPTIONAL. All site/GI geometry must remain independent of tiles.
   Rotate across three providers when a provider returns no usable tile. */
const BASEMAPS={
  // All four priority styles are served by the same Esri host already reachable in this user's environment.
  // These are basemaps, NOT water/protected-area geodata for route feasibility decisions.
  clean:{url:'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    reference:'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    attribution:'Tiles &copy; Esri, HERE, Garmin &amp; OpenStreetMap contributors'},
  streets:{url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution:'Tiles &copy; Esri and data contributors'},
  topo:{url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution:'Tiles &copy; Esri and data contributors'},
  imagery:{url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:'Imagery &copy; Esri and imagery providers'},
  carto:{url:'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution:'&copy; OpenStreetMap contributors &copy; CARTO'},
  osm:{url:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:'&copy; OpenStreetMap contributors'}
};
// An unreachable OSM host must not block use of the known-working Esri family.
const BASEMAP_ORDER=['clean','streets','topo','imagery'];
const BASEMAP_LABELS={clean:'Esri Light Gray',streets:'Esri Streets',topo:'Esri Topographic',imagery:'Esri Imagery',carto:'CARTO',osm:'OSM'};
let tiles=null,referenceTiles=null,fb=null,baseMode='clean',baseTimer=null,baseAttempts=new Set();
let baseRequest='clean', fallbackMessage='';
function setMapStatus(message){const el=$('offline');el.textContent=message;el.style.display='block'}
function resetFallback(){
  if(fb){map.removeLayer(fb);fb=null}
  if(fallbackMessage)setMapStatus(fallbackMessage);
  else $('offline').style.display='none';
}
function activateBase(mode,auto=false){
  if(!auto){baseAttempts.clear();baseRequest=mode;fallbackMessage='';}
  if(baseTimer){clearTimeout(baseTimer);baseTimer=null}
  if(tiles){map.removeLayer(tiles);tiles=null}
  if(referenceTiles){map.removeLayer(referenceTiles);referenceTiles=null}
  baseMode=mode;
  const select=$('baseMapSelect');if(select)select.value=mode;
  if(mode==='outline'){
    fallback(fallbackMessage||'Mode outline ilustratif. Layer GI/lahan tetap dapat digunakan.');
    return;
  }
  const cfg=BASEMAPS[mode];if(!cfg){activateBase('outline',true);return}
  baseAttempts.add(mode);
  let ok=0,errors=0,ended=false;
  const layer=L.tileLayer(cfg.url,{maxZoom:18,attribution:cfg.attribution,crossOrigin:false});
  tiles=layer;
  function failed(){
    if(ended||baseMode!==mode||ok>0)return;
    ended=true;
    const next=BASEMAP_ORDER.find(x=>!baseAttempts.has(x));
    if(next){
      fallbackMessage=`${BASEMAP_LABELS[baseRequest]||baseRequest} tidak dapat dimuat di jaringan/browser ini. Menggunakan ${BASEMAP_LABELS[next]} sebagai pengganti.`;
      setMapStatus(fallbackMessage);
      activateBase(next,true);
    }else{
      fallbackMessage=`Peta online tidak tersedia dari penyedia yang dicoba. Menampilkan outline ilustratif.`;
      activateBase('outline',true);
    }
  }
  layer.on('tileload',()=>{
    if(baseMode!==mode)return;
    ok++;
    if(ok===1){
      ended=true;
      if(baseTimer)clearTimeout(baseTimer);
      resetFallback();
      // Optional place-label overlay; failure is harmless and must never hide the base.
      if(cfg.reference){
        referenceTiles=L.tileLayer(cfg.reference,{maxZoom:18,attribution:'',opacity:0.95});
        referenceTiles.addTo(map);
      }
    }
  });
  layer.on('tileerror',()=>{if(baseMode===mode&&++errors>=4)failed()});
  layer.addTo(map);
  baseTimer=setTimeout(failed,6500);
  if(!auto)resetFallback();
}
$('baseMapSelect').addEventListener('change',e=>activateBase(e.target.value));
const ISL=[
 [[95.3,5.6],[97.5,5.2],[98.7,3.8],[100.3,2.2],[101.4,1.7],[103,.5],[103.8,-.8],[104.6,-1.8],[106,-3.2],[105.9,-4.3],[105.8,-5.8],[104.6,-5.9],[103.4,-4.9],[102.3,-4],[101,-2.6],[100.3,-1],[99.2,.2],[98.6,1.7],[97.6,2.9],[96.3,3.8],[95.2,5]],
 [[105.2,-6.8],[106,-5.9],[106.9,-6],[108.3,-6.2],[109,-6.8],[110.4,-6.9],[111,-6.4],[112.6,-6.9],[114.4,-7.7],[114.4,-8.6],[113,-8.3],[111,-8.2],[109,-7.7],[107.5,-7.6],[106.4,-7.4],[105.5,-6.9]],
 [[112.7,-7],[114,-6.9],[114,-7.2],[112.8,-7.2]],
 [[114.4,-8.1],[115.2,-8.05],[115.7,-8.4],[115.2,-8.8],[114.6,-8.4]],
 [[116,-8.3],[116.7,-8.3],[116.6,-8.9],[116,-8.9]],
 [[116.8,-8.4],[117.9,-8.1],[119.2,-8.4],[119,-8.8],[117.2,-9],[116.8,-8.8]],
 [[119.8,-8.4],[121,-8.3],[122.9,-8.2],[122.9,-8.6],[121,-8.9],[119.8,-8.8]],
 [[118.9,-9.4],[120,-9.3],[120.8,-10.1],[119.6,-9.9]],
 [[123.5,-10.3],[124.5,-9.3],[125.4,-8.8],[127.3,-8.4],[126,-9.2],[124.4,-10.2],[123.6,-10.5]],
 [[109,1.8],[109.6,2.1],[111,1.6],[111.6,2.5],[113,3.2],[114.2,4.6],[115.4,5],[116.1,6.1],[117.5,6.8],[118.3,5.8],[119.2,5.2],[117.8,4.2],[117.8,2],[118.9,1],[117.5,0],[117,-1],[116.5,-1.7],[116.2,-3],[116,-4],[114.6,-4.1],[113,-3.3],[111.7,-3],[110.2,-2.9],[110,-1.7],[109,-.4],[108.9,.4]],
 [[119.5,-5.6],[119.4,-4],[118.8,-2.9],[119.2,-1.5],[119.8,-.1],[120.1,.7],[120.9,1.3],[122.4,1],[124,.9],[125,1.6],[125.2,1.4],[124.3,.4],[123,.5],[121.2,.5],[120.2,.3],[120.6,-1],[121.6,-.8],[123.4,-.9],[122.9,-1.5],[121.4,-1.9],[122.2,-3],[123.2,-4.4],[122.6,-4.9],[121.6,-4.4],[121,-2.7],[120.4,-2.9],[120.5,-5.6]],
 [[131,-1.2],[132,-.4],[134,-.9],[134.2,-2.5],[135.3,-3.3],[137,-1.6],[138,-1.6],[140.8,-2.5],[143.5,-3.4],[145.7,-4.8],[147.5,-6.1],[148.2,-8.6],[146,-8.1],[143.5,-9],[141,-9.1],[140,-8.1],[138.8,-8.4],[137.6,-7.5],[138.4,-6.6],[136,-4.7],[134.6,-4.1],[133.7,-3.6],[132.8,-4],[132,-2.8],[133.3,-2.3],[131.9,-2]],
 [[127.7,1.9],[128.1,2.1],[127.9,1],[128.7,1.5],[128.2,.6],[128.9,.3],[128,0],[127.9,-.9],[127.4,0],[127.5,1]],
 [[127.9,-3],[129.4,-2.8],[130.9,-3.4],[129.5,-3.5],[128.3,-3.5]],
 [[125.9,-3.2],[127.2,-3.1],[127.1,-3.8],[126.1,-3.8]],
 [[105.1,-1.6],[106,-1.6],[106.8,-2.9],[106,-3.1],[105.5,-2.2]],
 [[107.6,-2.6],[108.3,-2.7],[108.2,-3.2],[107.6,-3.1]],
 [[100.3,6.4],[101.2,6.8],[102.4,6],[103.4,4.5],[103.5,2.6],[104.3,1.4],[103.5,1.3],[101.3,2.8],[100.6,4.2]]
];
function fallback(message){
  if(!fb){
    const cs=getComputedStyle(document.documentElement);
    fb=L.layerGroup(ISL.map(poly=>L.polygon(poly.map(([x,y])=>[y,x]),{color:cs.getPropertyValue('--landLine').trim(),weight:1,fillColor:cs.getPropertyValue('--land').trim(),fillOpacity:1,interactive:false}))).addTo(map);
    fb.eachLayer(l=>l.bringToBack());
  }
  setMapStatus(message||'Peta dasar tidak termuat. Garis pulau hanya ilustrasi, bukan batas administrasi resmi.');
}
activateBase('clean');
const LG=L.layerGroup().addTo(map);
const BARRIER_VIS=L.layerGroup().addTo(map);
function refreshCorridorUI(){
 ROUTE_CTX.revision++;ROUTE_CTX.cache.clear();
 BARRIER_VIS.clearLayers();
 if(S.level===3&&S.land){
  const l=LAND[S.land],g=GI[S.gi],features=getConstraints(l,g);
  features.forEach(f=>{if(!f.geometry)return;
   const cl=f._cls,col=cl==='water'?'#258ac5':cl==='protected'?'#ce3d4b':cl==='urban'?'#e89a37':cl==='steep'?'#8a6bad':'#5b8e52';
   try{L.geoJSON(f,{style:{color:col,weight:2,fillOpacity:cl==='water'?.26:.15,dashArray:'4 3'}}).bindTooltip(`${cl.toUpperCase()} — ${f.properties?.source||'GeoJSON pengguna'}; belum tervalidasi`).addTo(BARRIER_VIS)}catch(e){}
  });
 }
 if(S.page==='peta'&&S.level===3){render(false);if(S.land){const r=corridor(LAND[S.land],GI[S.gi]);
  $('rtStatus').textContent=(r.status==='INDICATIVE'?`${r.method?.toUpperCase()} · ${fmtKm(r.km)} km · HANYA PRA-SCREENING`:`${r.status}: ${r.reason}`)+
    ' | Sungai, DEM, ROW, izin dan peta peruntukan aktual BELUM tersedia.';
 }}
}
$('routeMode').addEventListener('change',e=>{ROUTE_CTX.mode=e.target.value;refreshCorridorUI()});
$('demoConstraints').addEventListener('change',e=>{ROUTE_CTX.demo=e.target.checked;refreshCorridorUI()});
$('rtClear').addEventListener('click',()=>{ROUTE_CTX.constraints=[];$('barriersFile').value='';refreshCorridorUI()});
$('barriersFile').addEventListener('change',async e=>{
 const f=e.target.files?.[0];if(!f)return;
 if(f.size>5*1024*1024){$('rtStatus').textContent='File terlalu besar (maks 5 MB).';return}
 try{const val=JSON.parse(await f.text()),arr=val.type==='FeatureCollection'?val.features:val.type==='Feature'?[val]:[];
  if(!Array.isArray(arr)||arr.length>1000)throw Error('Harus GeoJSON FeatureCollection dengan ≤ 1000 fitur.');
  const filtered=arr.filter(x=>x&&x.type==='Feature'&&x.geometry&&canonicalConstraintClass(x.properties||{}));
  ROUTE_CTX.constraints=filtered;$('rtStatus').textContent=`${filtered.length} fitur hambatan dikenali; data tetap belum diverifikasi.`;
  refreshCorridorUI();
 }catch(err){$('rtStatus').textContent='GeoJSON gagal dibaca: '+err.message}
});

const zl=()=>$('map').classList.toggle('zlow',map.getZoom()<5.75);map.on('zoomend',zl);zl();

/* ---------- header ---------- */
function crumbs(){
  const a=[`<a data-go="1">${ic('home','style="width:13px;height:13px"')} Indonesia</a>`];
  if(S.level>=2)a.push(`<a data-go="2" class="${S.level===2?'cur':''}">${esc(PROV[S.prov].short)}</a>`);
  if(S.level===3)a.push(`<a class="cur">${esc(GI[S.gi].nama)}</a>`);
  if(S.level===1)a[0]=`<a data-go="1">${ic('home','style="width:13px;height:13px"')} Indonesia</a><span class="sep">›</span><a class="cur">Peta Nasional</a>`;
  $('bc').innerHTML=a.join('<span class="sep">›</span>');
  const t=['Dashboard','Potensi Lahan PLTS'];
  if(S.level===1)t.push('Peta Nasional');
  if(S.level>=2)t.push(PROV[S.prov].short);
  if(S.level===3)t.push(GI[S.gi].nama);
  $('topCrumbs').innerHTML=t.map((x,i)=>`<span class="${i===t.length-1?'cur':''}">${esc(x)}</span>`).join('<span class="sep">›</span>');
}
function filtersHTML(){
  return `<div class="filt"><div class="r"><label>Skenario RUPTL</label><div class="seg" data-f="scen">${Object.entries(SCEN).map(([k,v])=>`<button data-v="${k}" class="${S.scen===k?'on':''}">${v}</button>`).join('')}</div></div>
  <div class="r"><label>Jenis</label><div class="seg" data-f="jenis">${[['all','Semua'],['PLTS','PLTS'],['PLTS + BESS','PLTS + BESS']].map(([k,v])=>`<button data-v="${k}" class="${S.jenis===k?'on':''}">${v}</button>`).join('')}</div></div></div>`;
}
function legendHTML(){
  return `<div class="legend"><h4>LEGENDA KATEGORI LAHAN</h4>${KO.map(k=>`<div class="li"><span class="kd" style="background:${kc(k)}"></span>${KAT[k]} <small>— ${kdesc(k)}</small></div>`).join('')}
  <div class="li" style="margin-top:4px"><span class="kd" style="background:transparent;border:2px solid var(--blue2)"></span>Lingkaran <small>— besar = target MW RUPTL</small></div></div>`;
}
function header(){
  crumbs();
  $('stepNo').textContent=S.level;
  if(S.level===1){
    $('h1').textContent='Peta nasional sebaran potensi lahan PLTS';
    $('h1sub').textContent=`Target PLTS dan PLTS + BESS dari RUPTL 2025–2034 (skenario ${SCEN[S.scen]}) per provinsi, beserta kandidat lahan di sekitar gardu induk.`;
    $('rhs').innerHTML=filtersHTML()+legendHTML();
  }else if(S.level===2){
    const p=PROV[S.prov];
    $('h1').textContent='Provinsi '+p.short;
    $('h1sub').textContent=`${p.key!==p.short?p.key+' · ':''}Wilayah operasi ${p.wil} · ${p.gis.length} gardu induk referensi`;
    $('rhs').innerHTML=`<button class="backbtn" data-go="1">${ic('back','style="width:15px;height:15px"')} Kembali ke Peta Nasional</button>`;
  }else{
    const g=GI[S.gi];
    $('h1').textContent=g.nama;
    $('h1sub').textContent=`${g.kab}, ${PROV[g.prov].short} · Sistem ${g.sistem} · ${g.kv} kV · zona radius ${RAD.r1} km dan ${RAD.r2} km`;
    $('rhs').innerHTML=`<button class="backbtn" data-go="2">${ic('back','style="width:15px;height:15px"')} Kembali ke ${esc(PROV[g.prov].short)}</button>`;
  }
}

/* ---------- tabs ---------- */
function tabs(){
  const tb=$('tabbar');
  tb.hidden=false;
  let t;
  if(S.level===1){t=[['map','Peta',null,'map'],['gi','Daftar GI',D.gis.filter(g=>g.kv===70||g.kv===150).length,'zap'],['ruptl','Rencana RUPTL',D.rows.filter(r=>(S.scen==='B'?r.inB:r.inA)&&(S.jenis==='all'||r.jenis===S.jenis)).length,'file']]}
  else if(S.level===2){const p=PROV[S.prov];t=[['map','Peta',null,'map'],['gi','Daftar GI',p.gis.length,'zap'],['ruptl','Rencana RUPTL',rowsOf(p.key).length,'file']]}
  else{const g=GI[S.gi];t=[['map','Peta',null,'map'],['land','Daftar lahan',g.lands.length,'list'],['ruptl','Rencana RUPTL sistem',rowsOf(g.prov,g.sistem).length,'file']]}
  $('tabs').innerHTML=t.map(([k,l,c,i])=>`<button role="tab" data-tab="${k}" class="${S.tab===k?'on':''}">${ic(i,'style="width:15px;height:15px"')}${l}${c!=null?`<span class="c">${c}</span>`:''}</button>`).join('');
  $('tabFilters').innerHTML=filtersHTML().replace('class="filt"','class="filt" style="flex-direction:row;gap:14px"');
  $('tabMeta').textContent=S.level===1?'Akses cepat nasional · GI simulasi':S.level===2?`Sumber target: RUPTL 2025–2034 · ${SCEN[S.scen]}`:`Tegangan: ${GI[S.gi].kv} kV · Sistem: ${GI[S.gi].sistem}`;
}

/* ---------- render utama ---------- */
function render(fit=true){
  document.body.classList.toggle('lvl2',S.level===2);document.body.classList.toggle('lvl3',S.level===3);
  $('body').classList.toggle('lvl2',S.level===2);$('body').classList.toggle('lvl3',S.level===3);$('routeTools').style.display=S.level===3?'flex':'none';
  header();tabs();
  const showMap=S.level===1||S.tab==='map';
  $('tabview').style.display=showMap?'none':'block';
  ['stats','listBtn','hint'].forEach(id=>$(id).style.display=S.level===1?'':'none');
  $('mlegend').hidden=S.level===1||!showMap;
  if(!showMap)renderTab();
  LG.clearLayers();
  if(S.level===1)lvl1(fit);else if(S.level===2)lvl2(fit);else lvl3(fit);
  renderPanel();
  setTimeout(()=>map.invalidateSize(),30);
}
function go(level,opt={}){
  if(level===1){S.level=1;S.prov=null;S.gi=null;S.land=null}
  if(level===2){S.level=2;S.prov=opt.prov||S.prov;S.gi=null;S.land=null}
  if(level===3){S.level=3;S.gi=opt.gi;S.prov=GI[opt.gi].prov;S.land=opt.land||null}
  S.tab='map';closeDrawers();render(true);$('panel').scrollTop=0;
  if(level===3&&opt.land)selectLand(opt.land,true);
}

/* level 1 */
const UP=new Set(['Jawa Barat','Jawa Timur','Gorontalo','Sulawesi Barat','Kepulauan Bangka Belitung','Jambi','Sulawesi Tenggara','Kalimantan Utara','Maluku Utara','Lampung','Sumatera Selatan']);
function lvl1(fit){
  if(fit)map.flyToBounds(INDO,{duration:.6});
  let tMW=0,tN=0,tL=0,tMWp=0;
  D.provinces.forEach(p=>{
    const s=provStats(p);tMW+=s.mw;tN+=s.n;tL+=s.ls.length;tMWp+=s.mwpGood;
    const d=Math.max(16,Math.min(50,12+Math.sqrt(s.mw)*1.3));
    const big=s.mw>=300;
    const m=L.marker(s.center,{icon:L.divIcon({className:'',iconSize:[d,d],iconAnchor:[d/2,d/2],
      html:`<div class="pb ${big?'big':''}" style="width:${d}px;height:${d}px"><div class="b">${s.mw>=1?`<span>${nf0(s.mw)}</span>`:''}</div><div class="n ${UP.has(p.key)?'up':'dn'}">${esc(p.short)}</div></div>`}),
      keyboard:true,title:p.short,riseOnHover:true}).addTo(LG);
    m.bindTooltip(provCard(p,s),{direction:'top',offset:[0,-d/2-4],className:'tt',opacity:1});
    m.on('click',()=>go(2,{prov:p.key}));
  });
  $('stats').innerHTML=`<div><b>${nf0(tMW)} MW</b><small>Target RUPTL (${SCEN[S.scen]})</small></div><div><b>${tN}</b><small>Proyek / tahap</small></div><div><b>${D.gis.length}</b><small>GI referensi</small></div><div><b>${tL}</b><small>Kandidat lahan</small></div><div><b>${nf0(tMWp)} MWp</b><small>Lahan sangat potensial + potensial</small></div>`;
  $('hintTxt').innerHTML=`Arahkan kursor ke lingkaran untuk ringkasan, klik untuk membuka provinsi, misalnya <b>"Jawa Barat"</b>`;
  renderProvList();
}
function provCard(p,s){
  return `<div class="mcard"><div class="h"><span class="pinc">${ic('pin')}</span><div><b>${esc(p.short)}</b><small>${p.gis.length} GI · ${s.ls.length} kandidat lahan · ${s.n} proyek</small></div></div>
  <div class="chips" style="margin-bottom:6px"><span class="chip t">Target ${nf(s.mw)} MW</span><span class="chip">PLTS ${nf(s.mwP)}</span><span class="chip">+BESS ${nf(s.mwB)}</span></div>
  <div class="chips">${['SP','P','CP'].map(k=>`<span class="chip" style="color:${kc(k)}"><span class="kd" style="background:${kc(k)}"></span>${KAT[k].split(' ')[0]}: ${s.kc[k]}</span>`).join('')}</div></div>`;
}

/* level 2 */
function lvl2(fit){
  const p=PROV[S.prov],gs=p.gis.map(id=>GI[id]);
  if(fit){const b=L.latLngBounds(gs.flatMap(g=>landsOfGI(g).map(l=>[l.lat,l.lng]).concat([[g.lat,g.lng]])));map.flyToBounds(b.pad(.12),{duration:.6,paddingTopLeft:[20,20]})}
  gs.forEach(g=>{
    const ls=landsOfGI(g);
    ls.forEach(l=>{const out=l.dist>RAD.r2;L.circleMarker([l.lat,l.lng],{radius:out?4:5.5,color:out?getK(l.kat):'#fff',weight:1.4,fillColor:getK(l.kat),fillOpacity:out?.25:.95}).addTo(LG)
      .bindTooltip(`${l.rk?'#'+l.rk+' ':''}${l.id} · ${nf(l.dist)} km dari GI · ${KAT[l.kat]} · ${nf(l.mwp)} MWp`,{className:'code',direction:'top'}).on('click',()=>go(3,{gi:g.id,land:l.id}))});
    const ring=L.circle([g.lat,g.lng],{radius:RAD.r2*1000,color:getCss('--blue2'),weight:1,dashArray:'4 5',fill:false,opacity:0}).addTo(LG);
    const mwp=ls.reduce((a,l)=>a+l.mwp,0);
    const m=L.marker([g.lat,g.lng],{icon:L.divIcon({className:'',iconSize:[0,0],
      html:`<div class="gm"><span class="p ${g.kv===500?'t500':''}">${ic('zap')}</span><span class="l">${esc(g.nama)} <em>${ls.length} lahan</em></span></div>`}),riseOnHover:true,title:g.nama}).addTo(LG);
    m.bindTooltip(giCard(g,ls,mwp),{direction:'top',offset:[0,-16],className:'tt',opacity:1});
    m.on('mouseover',()=>ring.setStyle({opacity:.8}));m.on('mouseout',()=>ring.setStyle({opacity:0}));
    m.on('click',()=>go(3,{gi:g.id}));
  });
  legendMap();
}
function giCard(g,ls,mwp){const c=katCount(ls);
  return `<div class="mcard"><div class="h"><span class="pinc">${ic('zap')}</span><div><b>${esc(g.nama)}</b><small>${g.kv} kV · ${esc(g.kab)} · Sistem ${esc(g.sistem)}</small></div></div>
  <div class="chips" style="margin-bottom:6px"><span class="chip t">${ls.filter(l=>l.dist<=RAD.r2).length} potensial dari ${ls.length} lahan</span><span class="chip">${nf(mwp)} MWp</span><span class="chip">Ruang ${nf(g.ruang)} MW</span></div>
  <div class="chips">${KO.filter(k=>c[k]).map(k=>`<span class="chip" style="color:${kc(k)}"><span class="kd" style="background:${kc(k)}"></span>${c[k]}</span>`).join('')}</div></div>`}
function getCss(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()}
function getK(k){return getCss('--k-'+k)}
function legendMap(){
  $('mlegend').innerHTML=KO.map(k=>`<div class="li"><span class="kd" style="background:${kc(k)}"></span>${KAT[k]}</div>`).join('')+
   `<div class="li"><span class="kd" style="background:var(--blue)"></span>Gardu induk</div><div class="li"><span class="kd" style="background:#b7791f"></span>Hanya GI 70/150 kV untuk koneksi PLTS</div>
`+
   (S.level===3?`<div class="li"><span class="ln dash" style="color:var(--blue2)"></span>Koridor SUTT/SKTT indikatif (bukan ROW)</div><div class="li"><span class="kd" style="background:transparent;border:2px dashed var(--k-SP)"></span>Zona 1 · ${RAD.r1} km</div><div class="li"><span class="kd" style="background:transparent;border:2px dashed var(--blue2)"></span>Zona 2 · ${RAD.r2} km</div>`:'');
}

/* level 3 */
let polyRef={},routeRef={},selLine=null;
const NCOL={500:'#7c3aed',150:'#e2621b',70:'#0e9f9a'};
function drawNet(f,w){NETL.forEach(e=>{const a=GI[e.a],b=GI[e.b];if(!a||!b||(f&&!f(a,b)))return;
  L.polyline([[a.lat,a.lng],[b.lat,b.lng]],{color:NCOL[e.kv],weight:e.kv===500?w+1:w,opacity:.8}).addTo(LG)
   .bindTooltip(`${e.kv===500?'SUTET':'SUTT'} ${e.kv} kV · ${a.nama} – ${b.nama} · ± ${nf(e.km)} km`,{className:'code',sticky:true})})}
function lvl3(fit){
  const g=GI[S.gi],ls=landsOfGI(g);polyRef={};routeRef={};selLine=null;
  const c2=L.circle([g.lat,g.lng],{radius:RAD.r2*1000,color:getCss('--blue2'),weight:1.6,dashArray:'7 6',fillColor:getCss('--blue2'),fillOpacity:.04,interactive:false}).addTo(LG);
  L.circle([g.lat,g.lng],{radius:RAD.r1*1000,color:getCss('--k-SP'),weight:1.8,dashArray:'4 5',fillColor:getCss('--k-SP'),fillOpacity:.06,interactive:false}).addTo(LG);
  [[RAD.r1,'--k-SP',1],[RAD.r2,'--blue2',2]].forEach(([r,c,z])=>L.marker([g.lat+r/110.6,g.lng],{icon:L.divIcon({className:'',iconSize:[0,0],html:`<span class="ringlbl" style="--c:var(${c})">Zona ${z} · ${r} km</span>`}),interactive:false,keyboard:false}).addTo(LG));
  ls.forEach(l=>{if(l.dist<=RAD.r2){const pts=routePts(l,g);if(pts.length>=2){const ro=routeOf(l,g);const r=L.polyline(pts,{color:ro.method==='sktt'?'#b56a20':getCss('--blue2'),weight:2,opacity:.68,dashArray:ro.method==='sktt'?'2 5':'8 6'}).addTo(LG);r.bindTooltip(`${ro.jenis} · ${fmtKm(ro.km)} km · pra-screening (belum diverifikasi)`,{className:'code'});r.on('click',()=>selectLand(l.id));routeRef[l.id]=r}}});
  ls.forEach(l=>{const out=l.dist>RAD.r2;
    const pg=L.polygon(l.poly,{color:getK(l.kat),weight:2,dashArray:out?'4 4':null,fillColor:getK(l.kat),fillOpacity:out?.18:.45}).addTo(LG);
    pg.bindTooltip(out?`${l.id} · di luar ${RAD.r2} km`:`#${l.rk} · ${l.id}`,{permanent:true,direction:'top',className:out?'code out':'code',offset:[0,-6]});
    pg.on('click',()=>selectLand(l.id));polyRef[l.id]=pg;
  });
  L.marker([g.lat,g.lng],{icon:L.divIcon({className:'',iconSize:[0,0],html:`<div class="gm big"><span class="p ${g.kv===500?'t500':''}">${ic('zap')}</span><span class="l">${esc(g.nama)} <em>${g.kv} kV</em></span></div>`}),zIndexOffset:1000}).addTo(LG)
   .on('click',()=>{S.land=null;highlight();renderPanel()});
  if(fit){const b=c2.getBounds();ls.forEach(l=>b.extend([l.lat,l.lng]));map.flyToBounds(b,{duration:.6,padding:[24,24]})}
  legendMap();
  if(S.land)highlight();
}
function highlight(){
  if(selLine){LG.removeLayer(selLine);selLine=null}
  Object.entries(polyRef).forEach(([id,pg])=>{const out=LAND[id]&&LAND[id].dist>RAD.r2;pg.setStyle({weight:id===S.land?4:2,fillOpacity:id===S.land?.7:(S.land?.22:(out?.18:.45))})});
  Object.entries(routeRef).forEach(([id,r])=>{if(id===S.land){r.setStyle({color:getCss('--blue2'),weight:4.5,opacity:1,dashArray:null});r.bringToFront()}else r.setStyle({color:getCss('--ink'),weight:1.6,opacity:S.land?.15:.4,dashArray:'6 5'})});
  if(S.land){const l=LAND[S.land],g=GI[S.gi];
    if(routeRef[S.land]){const ro=routeOf(l,g),pts=routePts(l,g),p=pts[Math.floor(pts.length/2)];
      selLine=L.marker(p,{icon:L.divIcon({className:'',iconSize:[0,0],html:`<span class="routelbl">${ro.jenis} · ± ${fmtKm(ro.km)} km · SKENARIO</span>`}),interactive:false,keyboard:false}).addTo(LG)}
    else if(l.dist>RAD.r2){selLine=L.polyline([[g.lat,g.lng],[l.lat,l.lng]],{color:getCss('--red'),weight:2,dashArray:'3 6'}).addTo(LG);
      selLine.bindTooltip(`${nf(l.dist)} km · di luar radius ${RAD.r2} km`,{permanent:true,className:'dist',direction:'center'})}}
}
function selectLand(id,fly){
  S.land=id;
  if(S.tab!=='map'){S.tab='map';render(false)}
  highlight();renderPanel();BARRIER_VIS.clearLayers();getConstraints(LAND[id],GI[S.gi]).forEach(f=>{const col=f._cls==='water'?'#258ac5':f._cls==='protected'?'#ce3d4b':'#e89a37';try{L.geoJSON(f,{style:{color:col,weight:2,fillOpacity:.25}}).bindTooltip(f._cls.toUpperCase()+' — belum diverifikasi').addTo(BARRIER_VIS)}catch(e){}});const rr=corridor(LAND[id],GI[S.gi]);$('rtStatus').textContent=rr.status==='INDICATIVE'?`${rr.method.toUpperCase()} · ${fmtKm(rr.km)} km · jalur indikatif; GIS detail / ROW / DEM wajib diverifikasi`:`${rr.status}: ${rr.reason||'Lahan/GI tidak dapat dihubungkan pada simulasi'}`;
  const pg=polyRef[id];if(pg&&fly!==false)map.flyToBounds(pg.getBounds().extend([GI[S.gi].lat,GI[S.gi].lng]),{padding:[60,60],maxZoom:13,duration:.6});
  $('panel').scrollTop=0;
}

/* ---------- panel ---------- */
function renderPanel(){
  const el=$('panel');
  if(S.level===2)el.innerHTML=panelProv(PROV[S.prov]);
  else if(S.level===3)el.innerHTML=S.land?panelLand(LAND[S.land]):panelGI(GI[S.gi]);
  else el.innerHTML='';
}
function panelProv(p){
  const s=provStats(p);
  const years=[2025,2026,2027,2028,2029,2030,2031,2032,2033,2034];
  const mx=Math.max(1,...years.map(y=>s.yr[y]?s.yr[y].P+s.yr[y].B:0));
  const cover=s.mw?Math.min(999,s.mwpGood/s.mw*100):0;
  const gs=p.gis.map(id=>GI[id]).map(g=>({g,ls:landsOfGI(g)})).sort((a,b)=>b.ls.reduce((x,l)=>x+l.mwp,0)-a.ls.reduce((x,l)=>x+l.mwp,0));
  const stc=k=>s.st[k]||0;
  return `<div class="pin">
  <div class="eyb">INFORMASI PROVINSI</div>
  <h2>${esc(p.short)}</h2>
  <p class="desc">Target PLTS dari RUPTL 2025–2034 (skenario ${SCEN[S.scen]}${S.jenis!=='all'?', hanya '+S.jenis:''}) dibandingkan dengan kandidat lahan di sekitar ${p.gis.length} gardu induk.</p>
  <div class="box">
    <div class="kv"><span>Target kapasitas RUPTL</span><b>${nf(s.mw)} MW</b></div>
    <div class="kv"><span>Jumlah proyek / tahap</span><b>${s.n}</b></div>
    <div class="kv"><span>Gardu induk referensi</span><b>${p.gis.length} GI</b></div>
    <div class="kv"><span>Kandidat lahan</span><b>${s.ls.length} lokasi · ${nf(s.mwp)} MWp</b></div>
  </div>
  <div class="sect">KOMPOSISI TARGET RUPTL <small>MW</small></div>
  <div class="duo">
    <div class="dbox a"><div class="t"><b>PLTS</b><strong>${nf(s.mwP)}</strong></div><small>${s.nP} proyek / tahap</small>
      <div class="minis"><div><span>Rencana</span><b>${s.rows.filter(r=>r.jenis==='PLTS'&&r.status==='Rencana').length}</b></div><div><span>Pengadaan</span><b>${s.rows.filter(r=>r.jenis==='PLTS'&&r.status==='Pengadaan').length}</b></div><div><span>Konstruksi</span><b>${s.rows.filter(r=>r.jenis==='PLTS'&&r.status==='Konstruksi').length}</b></div></div></div>
    <div class="dbox b"><div class="t"><b>PLTS + BESS</b><strong>${nf(s.mwB)}</strong></div><small>${s.nB} proyek / tahap</small>
      <div class="minis"><div><span>Rencana</span><b>${s.rows.filter(r=>r.jenis!=='PLTS'&&r.status==='Rencana').length}</b></div><div><span>Pengadaan</span><b>${s.rows.filter(r=>r.jenis!=='PLTS'&&r.status==='Pengadaan').length}</b></div><div><span>Konstruksi</span><b>${s.rows.filter(r=>r.jenis!=='PLTS'&&r.status==='Konstruksi').length}</b></div></div></div>
  </div>
  <div class="sect">JADWAL COD PER TAHUN <small><span class="kd" style="background:var(--blue2);width:8px;height:8px"></span> PLTS &nbsp;<span class="kd" style="background:#e0a400;width:8px;height:8px"></span> PLTS + BESS</small></div>
  <div class="bars">${years.map(y=>{const v=s.yr[y]||{P:0,B:0},t=v.P+v.B;return `<div class="c" title="${y}: ${nf(t)} MW">${t?`<em>${nf0(t)}</em>`:''}<div class="v" style="height:${t/mx*100}%"><i style="height:${t?v.P/t*100:0}%;background:var(--blue2)"></i><i style="height:${t?v.B/t*100:0}%;background:#e0a400"></i></div></div>`}).join('')}</div>
  <div class="yrs">${years.map(y=>`<span>${String(y).slice(2)}</span>`).join('')}</div>
  <div class="sect">TARGET VS POTENSI LAHAN</div>
  <div class="cov"><div class="track"><i style="width:${Math.min(100,cover)}%;background:var(--k-SP)"></i></div>
  <div class="lbl"><span>Lahan sangat potensial + potensial: <b>${nf0(s.mwpGood)} MWp</b></span><span><b>${s.mw?nf0(cover)+'%':'–'}</b> dari target</span></div></div>
  <div class="sect" style="margin-top:20px">RINCIAN GARDU INDUK <small>${p.gis.length} GI · urut potensi terbesar</small></div>
  ${gs.map(({g,ls})=>{const c=katCount(ls),mwp=ls.reduce((a,l)=>a+l.mwp,0);return `<button class="card" data-gi="${g.id}"><div class="r1">${ic('pin')}${esc(g.nama)}</div>
   <div class="r2">${g.kv} kV · ${esc(g.kab)} · Sistem ${esc(g.sistem)}</div>
   <div class="r3">${stackBar(c,ls.length)}<span class="pill red">${ls.filter(l=>l.dist<=RAD.r2).length} potensial · ${nf0(mwp)} MWp</span></div></button>`}).join('')}
  <div class="note">Target RUPTL berasal dari file Excel Rencana PLTS RUPTL 2025–2034. Lokasi GI, kandidat lahan, dan skor adalah data simulasi untuk keperluan mock-up.</div>
  </div>`;
}
function panelGI(g){
  const ls=landsOfGI(g),inr=ls.filter(l=>l.dist<=RAD.r2).sort((a,b)=>a.rk-b.rk),out=ls.filter(l=>l.dist>RAD.r2).sort((a,b)=>a.dist-b.dist);
  const z1=inr.filter(l=>l.dist<=RAD.r1),z2=inr.filter(l=>l.dist>RAD.r1),sm=a=>a.reduce((x,l)=>x+l.mwp,0);
  const rr=rowsOf(g.prov,g.sistem),rmw=rr.reduce((a,r)=>a+r.mw,0);
  const card=l=>{const ro=routeOf(l,g),o=l.dist>RAD.r2;return `<button class="card ${o?'muted':''}" data-land="${l.id}"><div class="r1">${o?'<span class="rk off">–</span>':`<span class="rk">#${l.rk}</span>`}${l.id}<span class="zn z${zoneOf(l)}" style="margin-left:auto">${zoneShort(zoneOf(l))}</span></div>
   <div class="r2">${nf(l.dist)} km arah ${l.arah} · jalur ± ${fmtKm(ro.km)} km · ${esc(l.status)}</div>
   <div class="r3"><span>${nf(l.luas)} Ha · ${nf(l.mwp)} MWp · skor <b style="color:var(--ink)">${nf(l.skor)}</b></span><span class="kb" style="background:${kc(l.kat)}">${KAT[l.kat]}</span></div></button>`};
  return `<div class="pin">
  <div class="eyb">INFORMASI GARDU INDUK</div>
  <h2>${esc(g.nama)}</h2>
  <p class="desc">${esc(g.kab)}, ${esc(PROV[g.prov].short)}. Lahan sampai ${RAD.r2} km dari GI ini berstatus potensial dan diberi peringkat.</p>
  <div class="box">
    <div class="kv"><span>Tegangan</span><b>${g.kv} kV</b></div>
    <div class="kv"><span>Sistem tenaga listrik</span><b>${esc(g.sistem)}</b></div>
    <div class="kv"><span>Kapasitas trafo</span><b>${nf0(g.mva)} MVA</b></div>
    <div class="kv"><span>Beban puncak</span><b>${g.beban}%</b></div>
    <div class="kv"><span>Ruang interkoneksi (simulasi, bukan hosting capacity)</span><b>± ${nf(g.ruang)} MW</b></div>
    <div class="kv"><span>Ketersediaan bay</span><b>${esc(g.bay)}</b></div>
    <div class="kv"><span>Koordinat</span><b>${g.lat.toFixed(3)}, ${g.lng.toFixed(3)}</b></div>
  </div>
  <div class="sect">ZONA RADIUS DARI GI</div>
  <div class="zones">
   <div class="zbx z1"><span>Zona 1 · ≤ ${RAD.r1} km</span><b>${z1.length}</b><small>${nf(sm(z1))} MWp · potensial</small></div>
   <div class="zbx z2"><span>Zona 2 · ${RAD.r1}–${RAD.r2} km</span><b>${z2.length}</b><small>${nf(sm(z2))} MWp · potensial</small></div>
   <div class="zbx z3"><span>Di luar ${RAD.r2} km</span><b>${out.length}</b><small>tidak diperingkat</small></div>
  </div>
  <div class="tiles"><div><span>Potensi kandidat potensial</span><b>${nf(sm(inr))} <small>MWp</small></b></div><div><span>Rencana RUPTL sistem ${esc(g.sistem)}</span><b>${nf(rmw)} <small>MW · ${rr.length}</small></b></div></div>
  <div class="sect">PERINGKAT KANDIDAT POTENSIAL <small>skor tertinggi, lalu jarak terdekat</small></div>
  ${inr.length?inr.map(card).join(''):'<div class="empty" style="padding:14px">Belum ada lahan dalam radius '+RAD.r2+' km.</div>'}
  ${out.length?`<div class="sect">DI LUAR RADIUS ${RAD.r2} KM <small>tidak diperingkat</small></div>${out.map(card).join('')}`:''}
  <div class="note">Data GI (sampel) dan lahan adalah simulasi. Ruang interkoneksi perlu dikonfirmasi dengan studi aliran daya dari unit berwenang.</div>
  </div>`;
}
function panelLand(l){
  const g=GI[l.gi],inSL=S.sl.has(l.id);
  const comp=COMP.map(([k,n])=>[k,n,W[k]]);
  const stg=STG,si=stg.indexOf(l.tahap),nc=CEK.filter(c=>l.cek&&l.cek[c[0]]).length;
  return `<div class="pin">
  <button class="back" data-backgi>${ic('back','style="width:14px;height:14px"')} Kembali ke info ${esc(g.nama)}</button>
  <div class="eyb">DETAIL LAHAN POTENSI</div>
  <h2>${l.id} <span class="kb" style="background:${kc(l.kat)}">${KAT[l.kat]}</span></h2>
  <p class="desc">± ${nf(l.dist)} km arah ${l.arah} dari ${esc(g.nama)}, ${esc(g.kab)}, ${esc(PROV[g.prov].short)}.</p>
  <div class="stbox ${zoneOf(l)===3?'bad':''}"><div class="rkbig">${l.rk?'#'+l.rk:'–'}</div><div><b>${zoneOf(l)<3?'Potensial':'Tidak potensial'} · ${zoneLbl(zoneOf(l))}</b>
   <span>${l.rk?`Peringkat ${l.rk} dari ${l.rkN} kandidat di ${esc(g.nama)}, dan ${l.rkP} dari ${l.rkPN} di ${esc(PROV[g.prov].short)}.`:`Jaraknya ${nf(l.dist)} km, melebihi batas ${RAD.r2} km. Lahan tidak diperingkat dan kategorinya dibatasi paling tinggi Kurang potensial.`}</span></div></div>
  <div class="score"><div class="ring" style="--p:${l.skor};--c:${kc(l.kat)}"><b>${nf0(l.skor)}</b></div>
   <p><strong>Skor kelayakan ${nf(l.skor)} / 100</strong>Kategori ditentukan dari skor ini, bukan keputusan akhir.</p></div>
  <div class="tiles"><div><span>Luas lahan</span><b>${nf(l.luas)} <small>Ha</small></b></div><div><span>Kapasitas indikatif</span><b>${nf(l.mwp)} <small>MWp</small></b></div>
   <div><span>Jarak ke GI</span><b>${nf(l.dist)} <small>km</small></b></div><div><span>Radiasi harian</span><b>${nf(l.ghi,2)} <small>kWh/m²</small></b></div></div>
  ${(()=>{const ro=routeOf(l,g),v20=ro.jenis.startsWith('SKTT');return `<div class="sect">ALTERNATIF KORIDOR KE GI <small>pra-screening, belum feasibility</small></div>
  <div class="box">
   <div class="kv"><span>Jenis saluran</span><b>${ro.jenis} · ${ro.sirkit}</b></div>
   <div class="kv"><span>Alternatif koneksi</span><b>Bus ${ro.kv} kV ${esc(g.nama)}<br><small style="font-weight:500;color:var(--muted)">Ketersediaan bay belum diverifikasi · data contoh: ${esc(g.bay)}</small></b></div>
   <div class="kv"><span>Jarak garis lurus</span><b>${nf(l.dist)} km</b></div>
   <div class="kv"><span>Panjang koridor geospasial (indikatif)</span><b>± ${fmtKm(ro.km)} km</b></div>
   <div class="kv"><span>Estimasi tower SUTT (perlu survei)</span><b>${v20?'–':(ro.tower!=null?ro.tower+' unit (indikatif)':'Belum dihitung')}</b></div>
   <div class="kv"><span>Asumsi span tower</span><b>${v20?'–':nf0(NET.span)+' m'}</b></div>
   <div class="kv"><span>Status kelayakan koridor</span><b style="color:var(--amber)">${ro.status==='INDICATIVE'?'PRA-SCREENING · BELUM DIVERIFIKASI':ro.status==='BLOCKED'?'RUTE TIDAK DITEMUKAN':'BELUM DIEVALUASI'}</b></div>
   <div class="note">Hasil berdasarkan geometri GI/lahan sintetis, garis pantai kasar, dan layer hambatan yang tersedia. Sungai kecil, jalan/ROW aktual, permukiman, DEM, izin lintasan, geoteknik dan feasibility lapangan BELUM diperiksa. Keputusan interkoneksi perlu studi engineering terpisah.</div>
  </div>`})()}
  <div class="sect">KARAKTERISTIK LAHAN</div>
  <div class="box">
   <div class="kv"><span>Status kepemilikan</span><b>${esc(l.status)}</b></div>
   <div class="kv"><span>Tutupan lahan saat ini</span><b>${esc(l.cover)}</b></div>
   <div class="kv"><span>Kemiringan rata-rata</span><b>${nf(l.slope)}%</b></div>
   <div class="kv"><span>Kesesuaian tata ruang (RTRW)</span><b>${esc(l.rtrw)}</b></div>
   <div class="kv"><span>Risiko banjir</span><b>${esc(l.banjir)}</b></div>
   <div class="kv"><span>Jarak ke jalan terdekat</span><b>${nf(l.akses)} km</b></div>
   <div class="kv"><span>Koordinat titik tengah</span><b>${l.lat.toFixed(4)}, ${l.lng.toFixed(4)}</b></div>
   <div class="kv"><span>Kelengkapan data</span><b>${l.lengkap}%</b></div>
  </div>
  <div class="sect">TAHAPAN VALIDASI</div>
  <div class="steps">${stg.map((t,i)=>`<div data-n="${i+1}" class="${i<si?'done':i===si?'cur':''}">${t}</div>`).join('')}</div>
  <div class="kv" style="border:0;padding:0 0 12px"><span>Checklist validasi</span><b>${nc} dari 5 selesai</b></div>
  ${l.tahap==='Direkomendasikan'?(()=>{const f=fuOf(l);return `<div class="sect">TAHAPAN PROSES LELANG DPT TANAH <small>tahap ${f.st+1} dari 8</small></div>
  <ol class="lel">${LELANG.map((s,i)=>`<li class="${i<f.st?'done':i===f.st?'cur':''}"><button data-act="fuSt" data-id="${l.id}" data-i="${i}">${i+1}</button><span>${s}</span></li>`).join('')}</ol>`})():''}
  <div class="acts">
   <button class="btn pri ${inSL?'rem':''}" data-sl="${l.id}">${ic('star','style="width:15px;height:15px"')}${inSL?'Hapus dari shortlist':'Tambah ke shortlist'}</button>
   <button class="btn" data-act="cekOpen" data-id="${l.id}">${ic('check','style="width:15px;height:15px"')}Kelola validasi</button>
   <a class="btn" href="https://www.google.com/maps?q=${l.lat},${l.lng}&t=k" target="_blank" rel="noopener">${ic('ext','style="width:15px;height:15px"')}Buka citra satelit</a>
  </div>
  <div class="note">Kapasitas indikatif dihitung ± 1 MWp per ${nf(HA)} Ha. Batas bidang, status hukum, dan skor adalah data simulasi.</div>
  </div>`;
}

/* ---------- tab view ---------- */
function renderTab(){
  const v=$('tabview');
  if(S.tab==='gi'){
    const p=PROV[S.prov];
    const rows=p.gis.map(id=>GI[id]).map(g=>{const ls=landsOfGI(g);return{g,ls,mwp:ls.reduce((a,l)=>a+l.mwp,0),luas:ls.reduce((a,l)=>a+l.luas,0),best:bestKat(ls)}});
    v.innerHTML=`<div class="tvh"><div><h3>Gardu induk di ${esc(p.short)}</h3><p>Klik baris untuk membuka GI beserta lahan potensinya.</p></div></div>
    <div class="tblwrap"><table><thead><tr><th>Gardu induk</th><th>Kabupaten/Kota</th><th class="n">Tegangan</th><th>Sistem</th><th class="n">Trafo (MVA)</th><th class="n">Ruang interkoneksi</th><th class="n">Lahan</th><th class="n">Luas (Ha)</th><th class="n">Potensi (MWp)</th><th>Kategori terbaik</th></tr></thead>
    <tbody>${rows.map(r=>`<tr class="click" data-gi="${r.g.id}"><td><b>${esc(r.g.nama)}</b></td><td>${esc(r.g.kab)}</td><td class="n">${r.g.kv} kV</td><td>${esc(r.g.sistem)}</td><td class="n">${nf0(r.g.mva)}</td><td class="n">± ${nf(r.g.ruang)} MW</td><td class="n">${r.ls.length}</td><td class="n">${nf(r.luas)}</td><td class="n">${nf(r.mwp)}</td><td><span class="kb" style="background:${kc(r.best)}">${KAT[r.best]}</span></td></tr>`).join('')}</tbody></table></div>`;
  }else if(S.tab==='land'){
    const g=GI[S.gi],ls=landsOfGI(g).sort((a,b)=>(a.rk||999)-(b.rk||999)||a.dist-b.dist);
    v.innerHTML=`<div class="tvh"><div><h3>Kandidat lahan di sekitar ${esc(g.nama)}</h3><p>Klik baris untuk melihat lahan di peta. Bintang menambah lahan ke shortlist.</p></div></div>
    <div class="tblwrap"><table><thead><tr><th></th><th>Kode</th><th>Lokasi</th><th class="n">Luas (Ha)</th><th class="n">Kapasitas (MWp)</th><th class="n">Jarak GI (km)</th><th>Zona</th><th class="n">Peringkat</th><th class="n">Jalur (km)</th><th>Status lahan</th><th class="n">Skor</th><th>Kategori</th><th>Tahap</th></tr></thead>
    <tbody>${ls.map(l=>`<tr class="click" data-land="${l.id}"><td><button class="star ${S.sl.has(l.id)?'on':''}" data-star="${l.id}" aria-label="Shortlist">★</button></td><td class="mono"><b>${l.id}</b></td><td>± ${nf(l.dist)} km arah ${l.arah}</td><td class="n">${nf(l.luas)}</td><td class="n">${nf(l.mwp)}</td><td class="n">${nf(l.dist)}</td><td><span class="zn z${zoneOf(l)}">${zoneShort(zoneOf(l))}</span></td><td class="n">${l.rk?'<b>#'+l.rk+'</b>':'–'}</td><td class="n">${l.dist<=RAD.r2?fmtRoute(l,g):'–'}</td><td>${esc(l.status)}</td><td class="n"><b>${nf(l.skor)}</b></td><td><span class="kb" style="background:${kc(l.kat)}">${KAT[l.kat]}</span></td><td>${l.tahap}</td></tr>`).join('')}</tbody></table></div>`;
  }else if(S.tab==='ruptl'){
    const pk=S.level===2?S.prov:GI[S.gi].prov,sis=S.level===3?GI[S.gi].sistem:null;
    const rr=rowsOf(pk,sis),tot=rr.reduce((a,r)=>a+r.mw,0);
    v.innerHTML=`<div class="tvh"><div><h3>Rencana PLTS RUPTL 2025–2034 · ${esc(PROV[pk].short)}${sis?' · sistem '+esc(sis):''}</h3><p>Skenario ${SCEN[S.scen]}, ${S.jenis==='all'?'PLTS dan PLTS + BESS':S.jenis}. Sumber: Lampiran RUPTL (tabel rincian per provinsi).</p></div></div>
    ${rr.length?`<div class="tblwrap"><table><thead><tr><th>No</th><th>Lokasi / nama pembangkit</th><th>Sistem</th><th>Jenis</th><th class="n">Tahap</th><th class="n">Kapasitas (MW)</th><th class="n">COD</th><th>Status</th><th>Pengembang</th><th>Kategori lokasi</th><th>Sumber</th></tr></thead>
    <tbody>${rr.map(r=>`<tr><td class="mono">${r.no}</td><td class="wrap"><b>${esc(r.nama)}</b>${r.cat?`<div style="color:var(--muted);font-size:11px;margin-top:2px;max-width:360px">${esc(r.cat)}</div>`:''}</td><td>${esc(r.sis)}</td><td><span class="jb ${r.jenis==='PLTS'?'p':'b'}">${esc(r.jenis)}</span></td><td class="n">${r.tahap??'–'}</td><td class="n"><b>${nf(r.mw,2)}</b></td><td class="n">${cod(r)}</td><td>${esc(r.status)}</td><td>${esc(r.dev)}</td><td>${esc(r.kat)}</td><td style="white-space:nowrap">${esc(r.tabel)}, hal. ${r.hal}</td></tr>`).join('')}</tbody>
    <tfoot><tr><td></td><td>Total ${rr.length} baris</td><td colspan="3"></td><td class="n">${nf(tot,2)}</td><td colspan="5"></td></tr></tfoot></table></div>`:`<div class="empty">Tidak ada rencana untuk filter ini. Coba ubah skenario atau jenis di atas.</div>`}`;
  }
}

/* ---------- daftar provinsi & shortlist ---------- */
function renderProvList(){
  const q=($('provSearch').value||'').toLowerCase();
  const by={};D.provinces.forEach(p=>{if(q&&!p.short.toLowerCase().includes(q)&&!p.key.toLowerCase().includes(q))return;(by[p.wil]=by[p.wil]||[]).push(p)});
  $('provList').innerHTML=Object.keys(by).length?Object.entries(by).map(([w,ps])=>`<div class="grp">${esc(w.toUpperCase())}</div>`+ps.map(p=>{const s=provStats(p);return{p,s}}).sort((a,b)=>b.s.mw-a.s.mw)
   .map(({p,s})=>`<button class="prow" data-prov="${esc(p.key)}"><span>${esc(p.short)}</span><small>${nf(s.mw)} MW · ${p.gis.length} GI · ${s.ls.length} lahan</small></button>`).join('')).join(''):'<div class="empty">Provinsi tidak ditemukan.</div>';
}
function renderSL(){
  $('slCount').textContent=S.sl.size;
  const ls=[...S.sl].map(id=>LAND[id]);
  $('slList').innerHTML=ls.length?ls.map(l=>{const g=GI[l.gi];return `<button class="card" data-goland="${l.id}"><div class="r1"><span class="kd" style="background:${kc(l.kat)}"></span>${l.id}<span class="pill blue" style="margin-left:auto">${nf(l.skor)}</span></div><div class="r2">${esc(g.nama)} · ${esc(PROV[g.prov].short)}</div><div class="r3"><span>${nf(l.luas)} Ha · ${nf(l.mwp)} MWp · ${nf(l.dist)} km</span><span class="kb" style="background:${kc(l.kat)}">${KAT[l.kat]}</span></div></button>`}).join('')+
   `<div class="note">Total ${ls.length} lahan · ${nf(ls.reduce((a,l)=>a+l.luas,0))} Ha · ${nf(ls.reduce((a,l)=>a+l.mwp,0))} MWp</div>`
   :'<div class="empty">Belum ada lahan di shortlist. Buka detail lahan lalu pilih "Tambah ke shortlist".</div>';
}
function toggleSL(id){if(S.sl.has(id)){S.sl.delete(id);toast(`${id} dihapus dari shortlist`)}else{S.sl.add(id);toast(`${id} ditambahkan ke shortlist`)}renderSL();if(window.save)save()}
function closeDrawers(){document.querySelectorAll('.drawer').forEach(d=>d.classList.remove('open'))}

/* ---------- event ---------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-go],[data-tab],[data-gi],[data-land],[data-sl],[data-star],[data-backgi],[data-close],[data-prov],[data-goland],.seg button');
  if(!t)return;
  if(t.matches('.seg button')){const f=t.parentElement.dataset.f;S[f]=t.dataset.v;if(S.page==='peta'){render(false);renderProvList()}else renderPage();return}
  if(t.dataset.star){e.stopImmediatePropagation();toggleSL(t.dataset.star);t.classList.toggle('on',S.sl.has(t.dataset.star));return}
  if(t.dataset.go){const lv=+t.dataset.go;if(lv===2&&!S.prov)return;go(lv);return}
  if(t.dataset.tab){S.tab=t.dataset.tab;render(false);return}
  if(t.dataset.gi){go(3,{gi:t.dataset.gi});return}
  if(t.dataset.land){selectLand(t.dataset.land);return}
  if(t.dataset.sl){toggleSL(t.dataset.sl);renderPanel();return}
  if(t.hasAttribute('data-backgi')){S.land=null;highlight();renderPanel();map.flyToBounds(L.latLng(GI[S.gi].lat,GI[S.gi].lng).toBounds(GI[S.gi].radius*2000),{padding:[20,20],duration:.5});return}
  if(t.dataset.close){$(t.dataset.close).classList.remove('open');return}
  if(t.dataset.prov){openMap(2,{prov:t.dataset.prov});return}
  if(t.dataset.goland){const l=LAND[t.dataset.goland];if(l)openMap(3,{gi:l.gi,land:l.id});return}
});
// The province/GI tabs must work independently of map tiles and map rendering.
$('tabs').addEventListener('click',function(ev){
  const t=ev.target.closest('[data-tab]');if(!t)return;
  ev.preventDefault();ev.stopPropagation();
  const tab=t.dataset.tab;
  if(!['map','gi','land','ruptl'].includes(tab))return;
  if(S.level===1&&tab!=='map'){goPage(tab==='gi'?'gi':'ruptl');return;}
  S.tab=tab;
  this.querySelectorAll('[data-tab]').forEach(b=>{
    const selected=b.dataset.tab===tab;
    b.classList.toggle('on',selected);
    b.setAttribute('aria-selected',selected?'true':'false');
  });
  const showMap=tab==='map';
  $('tabview').style.display=showMap?'none':'block';
  $('mlegend').hidden=!showMap;
  if(showMap){map.invalidateSize();return;}
  try{renderTab()}
  catch(err){
    console.error('Gagal membuka tab',tab,err);
    $('tabview').innerHTML='<div class="sec"><b>Tab gagal dimuat</b><p>'+String(err.message||err).replace(/[<>]/g,'')+'</p><p>Silakan reset data contoh atau periksa hasil impor data.</p></div>';
  }
});
// When selected provider is OSM, show a diagnostic link for a standard tile.
$('baseMapSelect').addEventListener('change',e=>{
  const d=$('mapDiagnostics');
  d.hidden=e.target.value!=='osm';
  if(e.target.value==='osm')$('mapDiagText').textContent='Jika tidak tampil, klik tes tile. Jika tile gagal pada tab baru, ini isu akses host, bukan warna peta atau layer GI.';
});
$('listBtn').onclick=()=>{$('provDrawer').classList.add('open');$('provSearch').focus()};
$('provSearch').oninput=renderProvList;
$('slOpen').onclick=()=>{const o=!$('slDrawer').classList.contains('open');closeDrawers();if(o){renderSL();$('slDrawer').classList.add('open')}};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('mdlBg').classList.contains('open')){closeModal();return}if(document.querySelector('.drawer.open'))closeDrawers();else if(S.page!=='peta')return;else if(S.level===3&&S.land){S.land=null;highlight();renderPanel()}else if(S.level>1)go(S.level-1)}});

render(true);renderSL();
