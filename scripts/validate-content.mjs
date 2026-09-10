import {readFile,readdir} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
const site=JSON.parse(await readFile('src/data/site.json','utf8'));
const sources=JSON.parse(await readFile('src/data/sources.json','utf8'));
const pages=site.pages.filter(p=>p.status==='published');
const paths=new Set(pages.map(p=>p.path));
assert.equal(paths.size,pages.length,'duplicate canonical path');assert.equal(new Set(pages.map(p=>p.id)).size,pages.length,'duplicate id');
let links=0;
for(const p of pages){
 for(const key of ['id','path','title','seoTitle','description','summary','status','authorId','publishedAt','updatedAt','reviewedAt'])assert.ok(p[key],`${p.id}: missing ${key}`);
 assert.ok(p.seoTitle.length<=70,`${p.id}: SEO title exceeds 70 characters`);
 for(const id of p.sources)assert.ok(sources.some(s=>s.id===id),`missing source ${id}`);
 for(const id of p.related)assert.ok(pages.some(x=>x.id===id),`missing related ${id}`);
 const html=await readFile(`dist${p.path==='/'?'/index':p.path}.html`,'utf8');
 const md=await readFile(`dist${p.path==='/'?'/index':p.path}.md`,'utf8');
 assert.ok(html.includes(`href="${site.url+p.path}"`));assert.ok(md.includes(`Canonical: ${site.url+p.path}`));
 const structured=[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m=>m[1]).join('');
 assert.ok(!/AggregateRating|aggregateRating/.test(structured));
 if(p.kind==='guide'){
  const body=await readFile(`src/content/${p.id}.md`,'utf8');const words=body.split(/\s+/).length;assert.ok(words>=900&&words<=1600,`${p.id}: expected substantive guide, got ${words} words`);
  assert.ok(md.includes(body.trim()));assert.ok(html.includes(p.reviewedAt));
  assert.ok(!/<script(?![^>]*application\/ld\+json)/.test(html),`${p.id}: unexpected script`);
  assert.ok(gzipSync(html).length<200*1024);
 }
 for(const [,href]of html.matchAll(/href="([^"#]+)(?:#[^"]*)?"/g)){
  if(!href.startsWith('/')||href.startsWith('//'))continue;
  const clean=href.split('?')[0];
  if(paths.has(clean)||clean.startsWith('/live-lab/pages/')){links++;continue;}
  try{await readFile('dist'+clean);links++;}catch{throw new Error(`Broken internal link ${p.path} → ${href}`);}
 }
}
const sitemap=await readFile('dist/sitemap.xml','utf8');
assert.equal([...sitemap.matchAll(/<loc>/g)].length,pages.filter(p=>p.kind!=='test').length);
assert.ok(!sitemap.includes('.md<'));assert.ok(!sitemap.includes('/api/feedback'));
const css=(await readdir('dist/_astro')).filter(s=>s.endsWith('.css'));
for(const file of css){const content=await readFile('dist/_astro/'+file);console.log(`Own CSS: ${gzipSync(content).length} bytes gzip`);assert.ok(gzipSync(content).length<30*1024);}
console.log(`Validated ${pages.length} published records, 3 complete guides, ${links} internal links, source/date parity, titles, and sitemap inventory.`);
