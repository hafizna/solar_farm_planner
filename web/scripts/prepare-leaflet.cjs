const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '..');
const source = path.join(base, 'node_modules', 'leaflet', 'dist');
const target = path.join(base, 'leaflet');
if (!fs.existsSync(path.join(source, 'leaflet.js'))) {
  console.error('Leaflet 1.9.4 belum terinstal. Jalankan npm install di folder web terlebih dahulu.');
  process.exit(1);
}
fs.mkdirSync(target, {recursive:true});
for (const file of ['leaflet.js', 'leaflet.css']) {
  fs.copyFileSync(path.join(source, file), path.join(target, file));
}
fs.cpSync(path.join(source, 'images'), path.join(target, 'images'), {recursive:true, force:true});
console.log('Local Leaflet assets ready:', target);
