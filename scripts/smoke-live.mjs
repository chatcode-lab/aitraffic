import assert from 'node:assert/strict';
import {solveChallenge,challengeFromHtml} from '../tests/challenge-solver.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const site=JSON.parse(await readFile('src/data/site.json','utf8'));
const base=process.env.LAB_ORIGIN||site.url;
const report={origin:base,checkedAt:new Date().toISOString(),checks:[]};
async function get(path,options={}){return fetch(new URL(path,base),{...options,headers:{'X-AITraffic-Test':'1','User-Agent':'AITrafficSmoke/1.0',...options.headers},signal:AbortSignal.timeout(15000)});}
const pass=name=>{report.checks.push({name,result:'pass'});console.log('PASS '+name);};
try{
 const article='/guides/measure-ai-traffic';
 for(const accept of ['text/html','text/markdown','text/html','text/markdown','text/markdown;q=0,text/html','text/markdown;q=0.3,text/html;q=0.9']){
  const r=await get(article,{headers:{Accept:accept}});assert.equal(r.status,200);assert.ok(r.headers.get('content-type').includes(accept==='text/markdown'?'text/markdown':'text/html'));assert.ok(r.headers.get('vary').includes('Accept'));assert.ok(r.headers.get('cache-control').includes('no-store'));assert.ok((await r.text()).includes('Four signals, four different questions'));
 }pass('Alternating live HTML/Markdown, quality preferences, and no-store');
 const head=await fetch(new URL(article,base),{method:'HEAD',headers:{Accept:'text/html'},signal:AbortSignal.timeout(15000)});assert.equal(head.status,200);assert.ok(!head.headers.get('x-robots-tag')?.includes('noindex'));assert.equal((await head.text()).length,0);pass('Production canonical is indexable; HEAD is bodyless');
 for(const p of site.pages.filter(p=>p.kind!=='test')){const r=await get(p.path);assert.equal(r.status,200);const body=await r.text();assert.ok(body.includes(`rel="canonical" href="${site.url+p.path}"`));}
 const map=await(await get('/sitemap.xml')).text();assert.equal([...map.matchAll(/<loc>/g)].length,10);assert.equal((await(await get('/api/v1/catalog.json')).json()).items.length,10);pass('Ten canonical pages, live sitemap and catalog');
 for(const path of ['/missing-preview-check','/.env','/live-lab/pages/not-a-page'])assert.equal((await get(path)).status,404);assert.equal((await get(article,{headers:{Accept:'application/json'}})).status,406);pass('Genuine missing routes and unsupported representations');
 const md=await get(article+'.md');assert.ok(md.headers.get('content-type').includes('text/markdown'));assert.ok(md.headers.get('x-robots-tag').includes('noindex'));const robots=await(await get('/robots.txt')).text();assert.ok(robots.includes('Sitemap: '+site.url+'/sitemap.xml'));assert.equal((await get('/social.png')).headers.get('content-type'),'image/png');pass('Explicit Markdown, robots, and PNG social image MIME');
 const html=await(await get('/')).text();assert.ok(html.includes('Last 24 hours')&&html.includes('Last 30 days'));assert.ok(!html.includes('Data temporarily unavailable'));const snapshot=await(await get('/api/v1/stats')).json();assert.equal(snapshot.schemaVersion,1);assert.ok(snapshot.asOf);pass('Persistent lab snapshot and activity in original homepage HTML');
 const tokens=[],answers=[];
 for(let i=0;i<2;i++){const r=await get(article,{headers:{'User-Agent':'OAI-SearchBot/1.0',Accept:'text/html'}});const body=await r.text();const token=body.match(/data-feedback-token[^>]*>([a-f0-9]{64})</)?.[1];assert.ok(Boolean(token),'Test invitation missing');tokens.push(token);answers.push(solveChallenge(challengeFromHtml(body)));assert.ok(r.headers.get('cache-control').includes('no-store'));}
 assert.ok(tokens[0]!==tokens[1]);const human=await(await get(article,{headers:{Accept:'text/html'}})).text();assert.ok(!human.includes('data-feedback-token'));pass('Unique issued test capabilities and no agent token in subsequent ordinary HTML');
 const params=new URLSearchParams({token:tokens[0],answer:answers[0],rating:'2',comment:'Synthetic deployment smoke check. Exclude from production.'});
 const wrong=new URLSearchParams(params);wrong.set('answer','0');assert.equal((await get('/api/feedback?'+wrong)).status,403);
 const missing=new URLSearchParams(params);missing.delete('answer');assert.equal((await get('/api/feedback?'+missing)).status,400);pass('Live challenge rejects incorrect and missing answers');
 const first=await(await get('/api/feedback?'+params)).json();assert.ok(first.ok&&first.test&&first.action==='created'&&first.verification==='text-sort-v1');const duplicate=await(await get('/api/feedback?'+params)).json();assert.ok(duplicate.action==='unchanged'&&duplicate.id===first.id);params.set('comment','Synthetic deployment smoke check updated. Exclude from production.');const update=await(await get('/api/feedback?'+params)).json();assert.ok(update.action==='updated'&&update.id===first.id&&update.test);pass('Live SQLite test feedback create, duplicate, update; test state retained');
 const action=await get('/api/feedback?'+params,{method:'HEAD'});assert.equal(action.status,204);assert.ok(action.headers.get('cache-control').includes('no-store'));assert.ok(action.headers.get('x-robots-tag').includes('noindex'));assert.equal(action.headers.get('referrer-policy'),'no-referrer');const prefetch=await get('/api/feedback?'+params,{headers:{Purpose:'prefetch'}});assert.equal(prefetch.status,204);pass('Live HEAD/prefetch mutation safeguards and response privacy headers');
 const www=await fetch('https://www.aitrafficanalytic.com'+article,{redirect:'manual',headers:{'X-AITraffic-Test':'1'},signal:AbortSignal.timeout(15000)});assert.ok([301,308].includes(www.status));assert.equal(www.headers.get('location'),site.url+article);pass('HTTPS www redirects to the canonical apex');
 const http=await fetch('http://aitrafficanalytic.com'+article,{redirect:'manual',headers:{'X-AITraffic-Test':'1'},signal:AbortSignal.timeout(15000)});assert.ok([301,308].includes(http.status));assert.equal(http.headers.get('location'),site.url+article);pass('HTTP redirects to HTTPS');
 report.passed=true;
}catch(error){report.passed=false;report.error=error instanceof assert.AssertionError?'A live smoke assertion failed.':error.name;console.error(report.error);process.exitCode=1;}
await mkdir('artifacts',{recursive:true});await writeFile('artifacts/live-smoke.json',JSON.stringify(report,null,2)+'\n');
