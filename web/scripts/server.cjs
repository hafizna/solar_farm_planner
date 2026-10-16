const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const {dataHandler}=require('../lib/data.cjs');
const {rasterHandler}=require('../lib/raster.cjs');
const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 3000);
const mimes = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
http.createServer((req,res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end('Invalid URL'); return; }
  if(pathname==='/api/data') {dataHandler(req,res);return;}
  if(pathname==='/api/raster') {rasterHandler(req,res);return;}
  const candidate = path.resolve(root, '.' + pathname);
  if (candidate !== root && !candidate.startsWith(root+path.sep)) {res.writeHead(403).end('Forbidden');return;}
  const filename = candidate === root ? path.join(root,'index.html') : candidate;
  fs.stat(filename,(err,st)=>{
    if(err || !st.isFile()) {res.writeHead(404).end('Not found');return;}
    res.writeHead(200,{'Content-Type':mimes[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-cache'});
    fs.createReadStream(filename).pipe(res);
  });
}).listen(port,'127.0.0.1',()=> console.log('Solar Farm Planner: http://127.0.0.1:'+port));
