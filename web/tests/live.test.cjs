const {test}=require('node:test');const assert=require('node:assert/strict');
const {makeRequest}=require('../lib/data.cjs');const {rasterUrl}=require('../lib/raster.cjs');
test('online adapters bound coordinates, query, source and area',()=>{
 assert.throws(()=>makeRequest(new URLSearchParams({source:'osm',lat:'-6.9',lon:'107.75',radius:'200'})),/radius/);
 assert.throws(()=>makeRequest(new URLSearchParams({source:'https://evil.test',lat:'-6.9',lon:'107.75'})),/Sumber/);
 const osm=makeRequest(new URLSearchParams({source:'osm',lat:'-6.9',lon:'107.75',radius:'10'}));assert.match(osm.url,/overpass.private.coffee/);const q=new URL(osm.url).searchParams.get('data');assert.match(q,/around:10000/);assert.match(q,/around:5000/);
 const risk=makeRequest(new URLSearchParams({source:'risk',lat:'-6.9',lon:'107.75'}));const g=JSON.parse(new URL(risk.url).searchParams.get('geometry'));assert.equal(g.spatialReference.wkid,4326);assert.equal(g.x,107.75);
});
test('raster proxy accepts only known Indonesian raster tile identifiers',()=>{
 assert.match(rasterUrl(new URLSearchParams({kind:'cover',tile:'S09E105'})),/ESA_WorldCover_10m_2021/);
 assert.match(rasterUrl(new URLSearchParams({kind:'dem',tile:'Copernicus_DSM_COG_10_S07_00_E107_00_DEM'})),/copernicus-dem-30m/);
 for(const tile of ['../../secret','https://evil.test','N60E105','S09E106'])assert.throws(()=>rasterUrl(new URLSearchParams({kind:'cover',tile})),/Tile/);
});
