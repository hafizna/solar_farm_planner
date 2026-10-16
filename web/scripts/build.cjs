const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
execFileSync(process.execPath, [path.join(__dirname, 'prepare-leaflet.cjs')], {stdio:'inherit'});
const output = path.join(root, 'dist');
fs.rmSync(output, {force:true, recursive:true});
fs.mkdirSync(output, {recursive:true});
fs.copyFileSync(path.join(root, 'index.html'), path.join(output, 'index.html'));
fs.cpSync(path.join(root, 'assets'), path.join(output, 'assets'), {recursive:true});
fs.cpSync(path.join(root, 'leaflet'), path.join(output, 'leaflet'), {recursive:true});
console.log('Static output ready:', output);

execFileSync(process.execPath, [path.join(__dirname, 'portable.cjs')], {stdio:'inherit'});
