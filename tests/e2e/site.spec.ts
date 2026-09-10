import {test,expect,type APIRequestContext} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import site from '../../src/data/site.json';
import {solveChallenge,challengeFromHtml} from '../challenge-solver.mjs';
const article='/guides/measure-ai-traffic';
const fixture=async(request:APIRequestContext,query:string,params:unknown[]=[])=>{
 const r=await request.post('/__fixture',{data:{action:'sql',query,params}});expect(r.ok()).toBeTruthy();return r.json();
};
const issue=async(request:APIRequestContext,isTest=true)=>{
 const r=await request.post('/__fixture-context',{data:{page:'measure-ai-traffic',issue:true,agent:'OAI-SearchBot',test:isTest,ip:'192.0.2.25'}});expect(r.ok()).toBeTruthy();const invitation=(await r.json()).invitation;return {...invitation,answer:solveChallenge(invitation.challenge)};
};
test.beforeEach(async({request})=>{await request.post('/__fixture',{data:{action:'reset'}});});
test('HTML, Markdown negotiation, aliases, genuine 404, and bodyless HEAD',async({request})=>{
 for(const [accept,type]of [['text/html','text/html'],['text/markdown','text/markdown'],['text/markdown;q=0,text/html','text/html'],['text/markdown;q=0.3,text/html;q=0.9','text/html'],['*/*','text/html'],['text/markdown;q=0.8,text/html;q=0.8','text/markdown'],['text/html','text/html'],['text/markdown','text/markdown']]){
  const r=await request.get(article,{headers:{Accept:accept}});expect(r.status()).toBe(200);expect(r.headers()['content-type']).toContain(type);expect(r.headers()['vary']).toContain('Accept');expect(r.headers()['cache-control']).toContain('no-store');expect(await r.text()).toContain('Four signals, four different questions');
 }
 const md=await request.get(article+'.md');expect(md.headers()['x-robots-tag']).toContain('noindex');expect(md.headers()['link']).toContain('rel="canonical"');
 const head=await request.head(article,{headers:{Accept:'text/markdown'}});expect(head.headers()['content-type']).toContain('text/markdown');expect(await head.body()).toHaveLength(0);
 for(const path of ['/missing','/.env','/guide/nope.md','/live-lab/pages/invalid','/index.html'])expect((await request.get(path)).status()).toBe(404);
 expect((await request.get(article,{headers:{Accept:'application/json'}})).status()).toBe(406);
 const alias=await request.get('/about.md',{maxRedirects:0});expect(alias.status()).toBe(308);expect(alias.headers().location).toBe('/how-it-works.md');
 expect((await request.get(article+'/',{maxRedirects:0})).headers().location).toBe(article);
});
test('every sitemap URL is published, canonical HTML with a working Markdown alternate',async({request})=>{
 const sitemap=await(await request.get('/sitemap.xml')).text();const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);expect(urls).toHaveLength(10);expect(new Set(urls).size).toBe(urls.length);
 for(const url of urls){const path=new URL(url).pathname;const r=await request.get(path,{headers:{Accept:'text/html'}});expect(r.status()).toBe(200);const body=await r.text();expect(body).toContain(`rel="canonical" href="${url}"`);expect(body).not.toContain('name="robots" content="noindex');expect((await request.get(path==='/'?'/index.md':path+'.md')).status()).toBe(200);}
 const catalog=await(await request.get('/api/v1/catalog.json')).json();expect(catalog.items).toHaveLength(urls.length);
});
test('both page activity periods and agent-specific explanation exist in raw HTML; tokens never repeat',async({request})=>{
 const human=await(await request.get(article,{headers:{Accept:'text/html'}})).text();expect(human).toContain('Last 24 hours');expect(human).toContain('Last 30 days');expect(human).toContain('Estimated human traffic');expect(human).toContain('No observations yet');expect(human).not.toContain('data-feedback-token');
 const tokens:string[]=[];
 for(let i=0;i<2;i++){const r=await request.get(article,{headers:{'User-Agent':'OAI-SearchBot/1.0',Accept:'text/html'}});const body=await r.text();expect(body.includes('Simulation does not authenticate an agent.')).toBeTruthy();expect(body.includes('Selected-agent subset')).toBeTruthy();expect(body.includes('Four signals, four different questions')).toBeTruthy();const token=body.match(/data-feedback-token[^>]*>([a-f0-9]{64})</)?.[1];expect(Boolean(token)).toBeTruthy();tokens.push(token!);}
 expect(tokens[0]===tokens[1]).toBe(false);
 const after=await(await request.get(article,{headers:{Accept:'text/html'}})).text();expect(after).not.toContain('data-feedback-token');
});
test('GET creates, updates and deduplicates one token record; concurrent requests stay unique',async({request})=>{
 const inv=await issue(request);
 const query={token:inv.token,answer:inv.answer,rating:'2',comment:'Synthetic: explain cache coverage.'};
 const first=await(await request.get('/api/feedback',{params:query})).json();expect(first.action).toBe('created');expect(first.state).toBe('test');
 const repeat=await(await request.get('/api/feedback',{params:query})).json();expect(repeat.action).toBe('unchanged');expect(repeat.id).toBe(first.id);
 const updated=await(await request.get('/api/feedback',{params:{...query,rating:'1',comment:'Synthetic: the limitation is still unclear.'}})).json();expect(updated.action).toBe('updated');expect(updated.id).toBe(first.id);
 const second=await issue(request);await Promise.all(Array.from({length:8},()=>request.get('/api/feedback',{params:{...query,token:second.token,answer:second.answer}})));
 const rows=await fixture(request,'SELECT COUNT(*) AS count FROM feedback');expect(rows[0].count).toBe(2);
 const stats=await(await request.get('/api/v1/stats')).json();expect(stats.periods['30d'].feedback.count).toBe(0);expect(stats.periods['30d'].counts.total).toBe(0);
});
test('HEAD, prefetch, malformed input, expiry, forgery and plain inspection cannot mutate',async({request})=>{
 const inv=await issue(request);const params={token:inv.token,answer:inv.answer,rating:'3',comment:'Synthetic check'};
 expect((await request.get('/api/feedback')).status()).toBe(200);
 expect((await request.head('/api/feedback',{params})).status()).toBe(204);
 expect((await request.get('/api/feedback',{params,headers:{'Sec-Purpose':'prefetch'}})).status()).toBe(204);
 for(const input of [{token:inv.token,answer:inv.answer,rating:'3'},{token:inv.token,answer:inv.answer,comment:'Only a comment'},{...params,rating:'3.5'},{...params,comment:' '},{...params,comment:'x'.repeat(501)}])expect((await request.get('/api/feedback',{params:input})).status()).toBe(400);
 expect((await request.get('/api/feedback?rating=2&rating=3')).status()).toBe(400);
 expect((await request.get('/api/feedback',{params:{...params,token:'b'.repeat(64)}})).status()).toBe(403);
 await fixture(request,'UPDATE tokens SET expires=?',[Date.now()-1]);expect([403,410]).toContain((await request.get('/api/feedback',{params})).status());
 expect((await fixture(request,'SELECT COUNT(*) AS count FROM feedback'))[0].count).toBe(0);
});
test('challenge publication needs no admin, escapes hostile text, accepts criticism, and permits optional removal',async({request})=>{
 const inv=await issue(request,false);const comment='<img src=x onerror="alert(1)"> Synthetic critical feedback.';
 const created=await(await request.post('/api/feedback',{headers:{'X-Fixture-No-Admin':'1'},data:{token:inv.token,answer:inv.answer,rating:1,comment}})).json();expect(created.state).toBe('eligible');expect(created.verification).toBe('text-sort-v1');
 const adminHeaders={Authorization:'Bearer synthetic-local-test-key-only'};
 expect((await request.post('/api/admin/feedback',{headers:{'X-Fixture-No-Admin':'1'},data:{action:'list'}})).status()).toBe(503);
 await fixture(request,'UPDATE feedback SET updated=? WHERE id=?',[Date.now()-120000,created.id]);
 const stats=await(await request.get('/api/v1/stats')).json();expect(stats.periods['24h'].feedback.count).toBe(1);expect(stats.periods['24h'].feedback.average).toBe(1);
 const html=await(await request.get('/live-lab')).text();expect(html).toContain('&lt;img src=x onerror=');expect(html).not.toContain('<img src=x');expect(html).not.toContain('AggregateRating');expect(html).toContain('Challenge passed · Comment not reviewed');expect(html).toContain('data-untrusted-feedback');
 const update=await(await request.post('/api/feedback',{data:{token:inv.token,answer:inv.answer,rating:2,comment:'Synthetic revised criticism'}})).json();expect(update.state).toBe('eligible');
 await fixture(request,'UPDATE feedback SET updated=? WHERE id=?',[Date.now()-120000,created.id]);
 expect((await(await request.get('/api/v1/stats')).json()).periods['24h'].feedback.average).toBe(2);
 expect((await request.post('/api/admin/feedback',{headers:adminHeaders,data:{action:'moderate',id:created.id,state:'quarantined'}})).status()).toBe(200);
 expect((await request.post('/api/feedback',{data:{token:inv.token,answer:inv.answer,rating:5,comment:'Synthetic attempt to undo removal'}})).status()).toBe(403);
 const after=await(await request.get('/api/v1/stats')).json();expect(after.periods['24h'].feedback.count).toBe(0);
 const testInv=await issue(request);const testRecord=await(await request.post('/api/feedback',{data:{token:testInv.token,answer:testInv.answer,rating:4,comment:'Synthetic test'}})).json();expect((await request.post('/api/admin/feedback',{headers:adminHeaders,data:{action:'moderate',id:testRecord.id,state:'eligible'}})).status()).toBe(400);
 expect((await request.post('/api/admin/feedback',{data:{action:'list'}})).status()).toBe(401);
});
test('real local collection excludes tests, APIs, assets, HEAD and prefetch; rolling windows reconcile',async({request})=>{
 await request.get(article,{headers:{'X-AITraffic-Test':'0','User-Agent':'OAI-SearchBot/1.0',Accept:'text/markdown'}});
 await request.get(article,{headers:{'X-AITraffic-Test':'0','User-Agent':'Mozilla/5.0 Chrome/130 Safari/537','Sec-Fetch-Mode':'navigate','Sec-Fetch-Dest':'document'}});
 await request.get(article,{headers:{'X-AITraffic-Test':'0','User-Agent':'curl/8.0'}});
 await request.get(article,{headers:{'X-AITraffic-Test':'0','User-Agent':'Unidentified-client'}});
 await request.get(article);await request.head(article,{headers:{'X-AITraffic-Test':'0'}});await request.get('/favicon.svg',{headers:{'X-AITraffic-Test':'0'}});await request.get('/api/v1/stats');await request.get(article,{headers:{'X-AITraffic-Test':'0',Purpose:'prefetch'}});await request.get('/live-lab',{headers:{'X-AITraffic-Test':'0'}});
 await expect.poll(async()=>(await fixture(request,'SELECT SUM(count) AS count FROM buckets'))[0].count).toBe(4);
 // Move this isolated fixture's four observations into a complete minute without waiting on wall-clock time.
 await fixture(request,'UPDATE buckets SET minute=minute-2');
 const stats=await(await request.get('/api/v1/stats')).json();const p=stats.periods['24h'];expect(p.counts).toEqual({ai:1,human:1,bot:1,unknown:1,total:4});expect(p.trend.reduce((n:number,x:{requests:number})=>n+x.requests,0)).toBe(4);expect(p.statuses[0].status).toBe(200);expect(p.pages[0].requests).toBe(4);
 const now=Math.floor(Date.now()/60000);await fixture(request,'INSERT INTO buckets VALUES(?,?,?,?,?,?,?)',[now-2000,'home','ai','GPTBot',200,'html',7]);
 const next=await(await request.get('/api/v1/stats')).json();expect(next.periods['24h'].counts.total).toBe(4);expect(next.periods['30d'].counts.total).toBe(11);
});
test('rate limits, changed-submission cap, and storage outage preserve readable content',async({request})=>{
 const inv=await issue(request);for(let i=0;i<10;i++)expect((await request.post('/api/feedback',{data:{token:inv.token,answer:inv.answer,rating:2,comment:`Synthetic revision ${i}`}})).status()).toBe(200);
 expect((await request.post('/api/feedback',{data:{token:inv.token,answer:inv.answer,rating:2,comment:'Synthetic revision 11'}})).status()).toBe(429);
 expect((await request.post('/api/feedback',{data:{token:inv.token,answer:inv.answer,rating:2,comment:'Synthetic revision 9'}})).status()).toBe(200);
 await fixture(request,'INSERT OR REPLACE INTO rate_limits VALUES(?,?,?,?)',[Math.floor(Date.now()/3600000),'global','issue',2000]);
 const limited=await(await request.get(article,{headers:{'User-Agent':'GPTBot/1.0'}})).text();expect(limited).not.toContain('data-feedback-token');expect(limited).toContain('rate limited');
 const response=await request.get(article,{headers:{'X-Fixture-Storage-Failure':'1','User-Agent':'GPTBot/1.0'}});expect(response.status()).toBe(200);const html=await response.text();expect(html).toContain('Four signals, four different questions');expect(html).toContain('Data temporarily unavailable');expect(html).not.toContain('data-feedback-token');
 expect((await request.get('/api/v1/stats',{headers:{'X-Fixture-Storage-Failure':'1'}})).status()).toBe(503);
});
test('no JavaScript required: navigation, test form, feedback submission and period selection',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,extraHTTPHeaders:{'X-AITraffic-Test':'1'},baseURL:'http://127.0.0.1:8788'});const page=await context.newPage();
 await page.goto('/');await expect(page.getByRole('heading',{name:'Understand your AI traffic.'})).toBeVisible();await expect(page.getByText('Last 24 hours',{exact:true})).toBeVisible();
 await page.getByRole('link',{name:'Explore the live lab'}).click();await page.getByRole('link',{name:'Last 30 days',exact:true}).click();await expect(page).toHaveURL(/period=30d/);
 await page.getByRole('link',{name:'Open test mode'}).click();await page.getByRole('button',{name:'Inspect agent response'}).click();await expect(page.getByText('Simulated label:',{exact:false})).toBeVisible();
 await page.getByLabel('Challenge answer').fill(solveChallenge(challengeFromHtml(await page.content())));
 await page.getByLabel('Usefulness rating').selectOption('2');await page.getByLabel('Short comment').fill('Synthetic keyboard and no-JavaScript check.');await page.getByRole('button',{name:'Submit test feedback'}).click();await expect(page.getByRole('heading',{name:'Feedback received.'})).toBeVisible();await expect(page.getByText('Synthetic feedback saved.',{exact:false})).toBeVisible();await context.close();
});
test('mobile widths, keyboard focus, and automated accessibility',async({page})=>{
 test.setTimeout(60_000);
 for(const width of [320,375,390,430,1280]){
  await page.setViewportSize({width,height:900});
  for(const path of ['/',article,'/live-lab','/live-lab/test','/live-lab/test?page=measure-ai-traffic','/methodology']){
   await page.goto(path);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
  }
 }
 for(const path of ['/',article,'/live-lab','/live-lab/test','/live-lab/test?page=measure-ai-traffic']){
  await page.goto(path);const result=await new AxeBuilder({page}).analyze();expect(result.violations.filter(v=>['serious','critical'].includes(v.impact||''))).toEqual([]);
 }
 await page.goto('/');await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();await page.keyboard.press('Enter');await page.keyboard.press('Tab');expect(await page.evaluate(()=>document.activeElement?.tagName)).toBe('A');
});
test('retention removes old aggregates, expired token hashes, and aged feedback',async({request})=>{
 const now=Date.now();
 await fixture(request,'INSERT INTO buckets VALUES(?,?,?,?,?,?,?)',[Math.floor(now/60000)-32*1440,'home','unknown','',200,'html',5]);
 const inv=await issue(request,false);await request.post('/api/feedback',{data:{token:inv.token,answer:inv.answer,rating:1,comment:'Synthetic old record'}});
 await fixture(request,'UPDATE feedback SET updated=?',[now-91*86400000]);await fixture(request,'UPDATE tokens SET expires=?',[now-1000]);
 await request.post('/__fixture',{data:{action:'cleanup'}});
 expect((await fixture(request,'SELECT COUNT(*) AS count FROM buckets'))[0].count).toBe(0);expect((await fixture(request,'SELECT COUNT(*) AS count FROM feedback'))[0].count).toBe(0);expect((await fixture(request,'SELECT COUNT(*) AS count FROM tokens'))[0].count).toBe(0);expect((await fixture(request,'SELECT COUNT(*) AS count FROM challenges'))[0].count).toBe(0);
});
test('answers are scoped, expire before first submission, and lock after three failures including concurrent attempts',async({request})=>{
 const first=await issue(request),second=await issue(request);
 const input={token:second.token,answer:first.answer,rating:4,comment:'Synthetic replay attempt'};
 expect((await request.post('/api/feedback',{data:input})).status()).toBe(403);
 const attempts=await Promise.all(Array.from({length:5},()=>request.post('/api/feedback',{data:{...input,answer:'0'}})));
 expect(attempts.filter(r=>r.status()===403)).toHaveLength(2);expect(attempts.filter(r=>r.status()===429)).toHaveLength(3);
 expect((await request.post('/api/feedback',{data:{...input,answer:second.answer}})).status()).toBe(429);
 expect((await fixture(request,'SELECT MAX(attempts) AS attempts FROM challenges'))[0].attempts).toBe(3);
 await fixture(request,'UPDATE challenges SET expires=?',[Date.now()-1]);
 expect((await request.post('/api/feedback',{data:{...input,token:first.token,answer:first.answer}})).status()).toBe(410);
 expect((await fixture(request,'SELECT COUNT(*) AS count FROM feedback'))[0].count).toBe(0);
 const fresh=await issue(request);
 expect((await request.post('/api/feedback',{data:{...input,token:fresh.token,answer:fresh.answer}})).status()).toBe(200);
 await fixture(request,'UPDATE challenges SET expires=?',[Date.now()-1]);
 expect((await request.post('/api/feedback',{data:{...input,token:fresh.token,answer:fresh.answer,comment:'Synthetic revision after passing'}})).status()).toBe(200);
});
test('legacy pending records remain private and legacy capabilities require a fresh challenge',async({request})=>{
 const inv=await issue(request,false);
 await fixture(request,"INSERT INTO feedback(token_hash,id,page,agent,test,rating,comment,moderation,created,updated) SELECT hash,id,page,agent,test,2,'Synthetic legacy private comment','pending',?,? FROM tokens",[Date.now()-120000,Date.now()-120000]);
 await fixture(request,'DELETE FROM challenges');
 const response=await request.post('/api/feedback',{data:{token:inv.token,answer:inv.answer,rating:2,comment:'Synthetic legacy private comment'}});
 expect(response.status()).toBe(409);
 const rows=await fixture(request,'SELECT moderation,verification FROM feedback');expect(rows[0]).toEqual({moderation:'pending',verification:'legacy-review'});
 expect((await(await request.get('/api/v1/stats')).json()).periods['30d'].feedback.count).toBe(0);
 expect(await(await request.get('/live-lab')).text()).not.toContain('Synthetic legacy private comment');
});
