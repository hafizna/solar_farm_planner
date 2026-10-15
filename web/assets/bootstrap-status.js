if(!window.L){
  document.addEventListener('DOMContentLoaded',()=>{
    const map=document.getElementById('map');
    if(map){map.innerHTML='<div style="position:absolute;inset:0;display:grid;place-items:center;padding:24px;text-align:center;background:#eaf1f7;color:#153454;font:14px system-ui"><div><b>Library peta Leaflet tidak dapat dimuat.</b><p>Aplikasi membutuhkan akses ke CDN Leaflet atau salinan lokal leaflet.js dan leaflet.css. Cek koneksi/firewall, lalu buka file melalui server lokal.</p><p>Perbaikan tile OSM/CARTO/Esri tidak dapat membantu sebelum Leaflet berhasil dimuat.</p></div></div>'}
  });
}
