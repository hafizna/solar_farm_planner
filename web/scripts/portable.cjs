'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const dataUrl=file=>{const mime=file.endsWith('.png')?'image/png':file.endsWith('.svg')?'image/svg+xml':'application/octet-stream';return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;};
function portableHTML(){let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 // Portable release focuses on login + existing map explorer.
 const omitted=['vendor/turf.min.js','vendor/geotiff.js','screening.js','live-data.js','html-report.js'];
 for(const file of omitted)html=html.replace('<script src="./assets/'+file+'"></script>','');
 html=html.replace(/<link rel="stylesheet" href="(\.\/[^"<>]+)">/g,(_,href)=>{const file=path.resolve(root,href),dir=path.dirname(file);let css=fs.readFileSync(file,'utf8');css=css.replace(/url\((?:["']?)(images\/[^)'"\s]+)(?:["']?)\)/g,(_,asset)=>`url("${dataUrl(path.join(dir,asset))}")`);return '<style>'+css.replace(/<\/style/gi,'<\\/style')+'</style>';});
 html=html.replace(/<script>window\.L\|\|document\.write\([\s\S]*?<\/script>/g,'');
 html=html.replace(/<script src="(\.\/[^"<>]+)"><\/script>/g,(_,src)=>{const file=path.resolve(root,src);let code=fs.readFileSync(file,'utf8').replace(/\/\/# sourceMappingURL=[^\r\n]+/g,'');if(src==='./leaflet/leaflet.js'){code+=`\nL.Icon.Default.mergeOptions(${JSON.stringify({iconUrl:dataUrl(path.join(root,'leaflet/images/marker-icon.png')),iconRetinaUrl:dataUrl(path.join(root,'leaflet/images/marker-icon-2x.png')),shadowUrl:dataUrl(path.join(root,'leaflet/images/marker-shadow.png'))})});\n`;}
 return '<script>\n'+code.replace(/<\/script/gi,'<\\/script')+'\n</script>';});
 html=html.replace('<head>','<head>\n<script>window.GEORENSIS_PORTABLE=true;</script>');
 html=html.replace('</title>',' — Portabel</title>');
 html=html.replace('</body>','<!-- Bundled libraries: Leaflet (BSD-2-Clause), Turf (MIT), GeoTIFF.js (MIT). Library license notices are retained in their bundled code and web/assets/vendor. -->\n</body>');
 if(/<(?:script|link)[^>]+(?:src|href)="\.\//.test(html))throw Error('Portable artifact still references local assets.');
 return html;
}
if(require.main===module){const target=path.join(root,'portable');fs.mkdirSync(target,{recursive:true});const file=path.join(target,'georensis-solar.html');fs.writeFileSync(file,portableHTML());console.log(`Portable app ready: ${file} (${(fs.statSync(file).size/1024/1024).toFixed(2)} MB)`);}
module.exports={portableHTML};
