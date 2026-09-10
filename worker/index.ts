import {pages,site,pageByPath,markdownPath,isMeasured,type Page} from '../src/lib/registry';
import {classify,AGENTS,isPrefetch} from '../src/lib/classify';
import {negotiate} from '../src/lib/accept';
import {validateFeedback,hash} from './feedback';
import {renderActivity,renderAgent,renderDashboard,esc} from './render';
import type {Env,Snapshot,ContextResult} from './types';
export {TrafficLab} from './lab';
const productionHost=new URL(site.url).hostname;
const localHost=(host:string)=>['localhost','127.0.0.1','0.0.0.0','[::1]'].includes(host);
const noStore={'Cache-Control':'private, no-store, max-age=0','CDN-Cache-Control':'no-store','Cloudflare-CDN-Cache-Control':'no-store'};
function headers(response:Response,request:Request,options:{noindex?:boolean;vary?:boolean}={}){
 const h=new Headers(response.headers);for(const [k,v]of Object.entries(noStore))h.set(k,v);
 h.set('X-Content-Type-Options','nosniff');h.set('Referrer-Policy','no-referrer');h.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
 h.set('Content-Security-Policy',"default-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; script-src 'none'; connect-src 'none'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
 if(options.vary)h.set('Vary','Accept, User-Agent');
 if(options.noindex||new URL(request.url).hostname!==productionHost)h.set('X-Robots-Tag','noindex, follow');
 h.delete('etag');h.delete('last-modified');h.delete('content-length');
 return new Response(request.method==='HEAD'?null:response.body,{status:response.status,statusText:response.statusText,headers:h});
}
async function bounded<T>(promise:Promise<T>,ms=800):Promise<T|null>{
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{return await Promise.race([promise,new Promise<null>(resolve=>{timer=setTimeout(()=>resolve(null),ms)})]);}catch{return null;}finally{if(timer)clearTimeout(timer);}
}
function lab(env:Env){return env.LAB.get(env.LAB.idFromName('production-v1'));}
async function rpc<T>(env:Env,path:string,body?:unknown):Promise<T>{
 const response=await lab(env).fetch(`https://lab.internal${path}`,body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 if(!response.ok)throw new Error('Lab storage unavailable');return response.json<T>();
}
async function asset(env:Env,request:Request,path:string){
 const url=new URL(request.url);url.pathname=path;url.search='';
 return env.ASSETS.fetch(new Request(url,{method:'GET'}));
}
async function errorPage(env:Env,request:Request,status=404){
 const response=await asset(env,request,'/404.html');
 return headers(new Response(response.body,{status,headers:{'Content-Type':'text/html; charset=utf-8'}}),request,{noindex:true});
}
function safeJson(value:unknown,request:Request,status=200){return headers(Response.json(value,{status}),request,{noindex:true});}
async function feedback(request:Request,env:Env){
 const url=new URL(request.url);
 if(url.hostname!==productionHost&&!localHost(url.hostname))return safeJson({error:'Use the production canonical host or local test environment; feedback is not redirected.'},request,400);
 if(!['GET','HEAD','POST'].includes(request.method))return safeJson({error:'Use GET parameters or POST JSON.'},request,405);
 if(request.method==='HEAD'||isPrefetch(request.headers))return headers(new Response(null,{status:204}),request,{noindex:true});
 let input:Record<string,unknown>=Object.create(null);
 if(request.method==='GET'){
  if(!url.search)return safeJson({experiment:true,endpoint:'/api/feedback',methods:['GET','POST'],required:['token','answer','rating','comment'],challenge:'A fresh, response-scoped text exercise; first submission within two minutes, three incorrect attempts maximum. Revisions require the same answer and token before its 30-minute expiry.',rating:'integer 1–5',comment:'nonempty plain text, 1–500 Unicode characters',semantics:'GET submission deliberately changes state. Inspection and HEAD never submit. Obtain a scoped invitation from an eligible HTML response.'},request);
  if(url.search.length>10_000)return safeJson({error:'Request exceeds the input limit.'},request,413);
  for(const key of url.searchParams.keys()){if(url.searchParams.getAll(key).length!==1)return safeJson({error:'Duplicate fields are not accepted.'},request,400);input[key]=url.searchParams.get(key);}
 }else{
  if(!request.headers.get('content-type')?.includes('application/json'))return safeJson({error:'POST requires application/json.'},request,415);
  const text=await readLimited(request,8192);if(text===null)return safeJson({error:'Request exceeds the input limit.'},request,413);
  try{const data=JSON.parse(text);if(!data||typeof data!=='object'||Array.isArray(data))throw new Error();input=data;}catch{return safeJson({error:'Invalid JSON object.'},request,400);}
 }
 const parsed=validateFeedback(input);if('error'in parsed)return safeJson({error:parsed.error},request,400);
 const response=await bounded(lab(env).fetch('https://lab.internal/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:parsed.value,ip:request.headers.get('CF-Connecting-IP')||'unavailable'})}),3000);
 if(!response)return safeJson({error:'Feedback storage temporarily unavailable; submission status is unknown. Retry the identical request safely with the same token.'},request,503);
 const result=await response.json<Record<string,unknown>>();
 if(request.headers.get('accept')?.includes('text/html')){
  const template=await asset(env,request,'/live-lab.html');
  const output=new HTMLRewriter().on('.page-header h1',{element(e){e.setInnerContent(response.ok?'Feedback received.':'Feedback was not accepted.');}}).on('.page-header .lede',{element(e){e.setInnerContent(response.ok?'Challenge-passed production feedback is eligible without review. Synthetic tests stay private.':'Check the response below. No new publication is implied.');}}).on('lab-dashboard',{element(e){e.setInnerContent(`<section class="feedback-result">${result.test?'<span class="test-badge">SYNTHETIC TEST</span>':''}<h2>${esc(result.action||'Submission response')}</h2><p>${esc(result.message||result.error||'Unable to process request.')}</p>${result.id?`<p class="small">Record: ${esc(result.id)} · State: ${esc(result.state)}</p>`:''}<p><a href="/live-lab/test">Return to test mode →</a></p><p class="small">Keep the original invitation if you intend to update this record before expiry. Do not share its token.</p></section>`,{html:true});}}).on('.experiment-banner',{element(e){e.remove();}}).transform(template);
  return headers(new Response(output.body,{status:response.status,headers:{'Content-Type':'text/html; charset=utf-8'}}),request,{noindex:true});
 }
 return safeJson(result,request,response.status);
}
async function readLimited(request:Request,limit:number):Promise<string|null>{
 const reader=request.body?.getReader();if(!reader)return '';
 let size=0;const chunks:Uint8Array[]=[];
 for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();return null;}chunks.push(value);}
 const out=new Uint8Array(size);let offset=0;for(const c of chunks){out.set(c,offset);offset+=c.length;}return new TextDecoder().decode(out);
}
export default {
 async fetch(request:Request,env:Env,ctx:ExecutionContext):Promise<Response>{
  const url=new URL(request.url),path=url.pathname;
  if(path==='/api/feedback')return feedback(request,env);
  if(path==='/api/admin/feedback'){
   if(request.method!=='POST')return safeJson({error:'Method not allowed.'},request,405);
   if(!env.LAB_ADMIN_KEY)return safeJson({error:'Moderation is not configured.'},request,503);
   const supplied=request.headers.get('authorization')||'';
   if(await hash(supplied)!==await hash(`Bearer ${env.LAB_ADMIN_KEY}`))return safeJson({error:'Unauthorized.'},request,401);
   if(!request.headers.get('content-type')?.includes('application/json'))return safeJson({error:'JSON required.'},request,415);
   const raw=await readLimited(request,2048);if(raw===null)return safeJson({error:'Input too large.'},request,413);
   let value:unknown;try{value=JSON.parse(raw);}catch{return safeJson({error:'Invalid JSON.'},request,400);}
   const result=await bounded(lab(env).fetch('https://lab.internal/admin',{method:'POST',body:JSON.stringify(value)}),3000);
   return result?headers(result,request,{noindex:true}):safeJson({error:'Storage unavailable.'},request,503);
  }
  if(!['GET','HEAD'].includes(request.method))return safeJson({error:'Method not allowed.'},request,405);
  if(url.hostname===`www.${productionHost}`){const target=new URL(path+url.search,site.url);return headers(new Response(null,{status:308,headers:{Location:target.href}}),request);}
  if(url.protocol==='http:'&&url.hostname===productionHost)return headers(new Response(null,{status:308,headers:{Location:site.url+path+url.search}}),request);
  const markedTest=request.headers.get('X-AITraffic-Test')==='1'||url.searchParams.get('test')==='1';
  const prefetch=isPrefetch(request.headers);
  const aliases=site.aliases as Record<string,string>;
  const withoutSlash=path!=='/'?path.replace(/\/+$/,''):path;
  const explicit=withoutSlash.endsWith('.md');
  const base=explicit?(withoutSlash==='/index.md'?'/':withoutSlash.slice(0,-3)):withoutSlash;
  const alias=aliases[base];
  if(alias)return headers(new Response(null,{status:308,headers:{Location:(explicit?markdownPath(alias):alias)+url.search}}),request);
  const page=pageByPath(base);
  if(path!==withoutSlash&&page)return headers(new Response(null,{status:308,headers:{Location:withoutSlash+url.search}}),request);
  const period=url.searchParams.get('period')==='30d'?'30d':'24h';
  if(path==='/api/v1/stats'){
   const id=url.searchParams.get('page')||'';
   if((id&&!pages.some(p=>p.id===id&&isMeasured(p)))||(url.searchParams.has('period')&&!['24h','30d'].includes(url.searchParams.get('period')!)))return safeJson({error:'Unknown page or period.'},request,400);
   if(request.method==='HEAD')return safeJson({},request);
   const snapshot=await bounded(rpc<Snapshot>(env,'/snapshot?page='+encodeURIComponent(id)));
   return snapshot?safeJson(url.searchParams.has('period')?{...snapshot,periods:{[period]:snapshot.periods[period]}}:snapshot,request):safeJson({available:false,error:'Data temporarily unavailable.'},request,503);
  }
  let scope:Page|undefined;
  if(path.startsWith('/live-lab/pages/')){
   scope=pages.find(p=>p.id===path.slice('/live-lab/pages/'.length)&&isMeasured(p));if(!scope)return errorPage(env,request);
  }
  if(page||scope){
   const current=page||pageByPath('/live-lab')!;
   const selected=explicit?'markdown':negotiate(request.headers.get('accept'));
   const classification=classify(request.headers.get('user-agent'),request.headers);
   const record=(status:number,format:'html'|'markdown')=>{
    if(!page||!isMeasured(page)||request.method!=='GET'||markedTest||prefetch||!(url.hostname===productionHost||localHost(url.hostname)))return;
    ctx.waitUntil(bounded(lab(env).fetch('https://lab.internal/record',{method:'POST',body:JSON.stringify({page:page.id,category:classification.category,agent:classification.category==='ai'?classification.label:'',status,format})}),3000).then(()=>{}));
   };
   if(selected==='unacceptable'){record(406,'html');return headers(new Response('Available representations: text/html and text/markdown.',{status:406,headers:{'Content-Type':'text/plain; charset=utf-8'}}),request,{vary:true,noindex:true});}
   if(selected==='markdown'&&scope)return headers(new Response('Use the JSON statistics endpoint or the HTML verification view.',{status:406}),request,{noindex:true});
   const assetPath=selected==='markdown'?markdownPath(current.path):current.path==='/'?'/index.html':`${current.path}.html`;
   const response=await asset(env,request,assetPath);
   if(response.status!==200){record(response.status,selected);return errorPage(env,request,response.status);}
   const h=new Headers(response.headers);
   h.set('Link',`<${site.url+(scope?path:current.path)}>; rel="canonical"${scope?'':`, <${site.url+markdownPath(current.path)}>; rel="alternate"; type="text/markdown"`}`);
   h.set('Content-Type',selected==='markdown'?'text/markdown; charset=utf-8':'text/html; charset=utf-8');
   const noindex=Boolean(scope)||explicit||current.kind==='test'||markedTest;
   if(request.method==='HEAD')return headers(new Response(null,{headers:h}),request,{vary:!explicit,noindex});
   if(selected==='markdown'){record(200,'markdown');return headers(new Response(response.body,{headers:h}),request,{vary:!explicit,noindex});}
   let rewriter=new HTMLRewriter();
   if(current.kind==='lab'){
    const snapshot=await bounded(rpc<Snapshot>(env,'/snapshot?page='+(scope?.id||'')));
    rewriter=rewriter.on('lab-dashboard',{element(e){e.setInnerContent(renderDashboard(snapshot,period,scope),{html:true});}});
    if(scope){
     rewriter=rewriter.on('title',{element(e){e.setInnerContent(`Page verification: ${scope!.seoTitle}`);}}).on('link[rel="canonical"]',{element(e){e.setAttribute('href',site.url+path);}}).on('link[rel="alternate"]',{element(e){e.remove();}}).on('.page-header h1',{element(e){e.setInnerContent(scope!.title);}}).on('.page-header .lede',{element(e){e.setInnerContent('A stable verification view of this page’s aggregate requests and eligible feedback.');}});
    }
   }else if(current.kind==='test'){
    if(url.searchParams.has('page')){
     const target=pages.find(p=>p.id===url.searchParams.get('page')&&isMeasured(p));
     const agent=url.searchParams.get('agent')||'OAI-SearchBot';
     if(!target||!AGENTS.includes(agent as typeof AGENTS[number]))return safeJson({error:'Choose a known page and simulated agent.'},request,400);
     const result=await bounded(rpc<ContextResult>(env,'/context',{page:target.id,issue:!prefetch,agent,test:true,ip:request.headers.get('CF-Connecting-IP')||'unavailable'}));
     rewriter=rewriter.on('lab-test',{element(e){e.setInnerContent(renderActivity(result?.snapshot||null,target)+renderAgent({category:'ai',label:agent,confidence:'Simulated'},result,true,true),{html:true});}}).on('#page-select option',{element(e){if(e.getAttribute('value')===target.id)e.setAttribute('selected','');}});
    }
   }else if(current.kind==='home'||current.kind==='guide'){
    const result=await bounded(rpc<ContextResult>(env,'/context',{page:current.id,issue:classification.category==='ai'&&!prefetch,agent:classification.label,test:markedTest||url.hostname!==productionHost,ip:request.headers.get('CF-Connecting-IP')||'unavailable'}));
    rewriter=rewriter.on('lab-activity',{element(e){e.setInnerContent(renderActivity(result?.snapshot||null,current),{html:true});}});
    if(classification.category==='ai')rewriter=rewriter.on('lab-agent',{element(e){e.setInnerContent(renderAgent(classification,result,markedTest),{html:true});}});
   }
   record(200,'html');
   const output=rewriter.transform(new Response(response.body,{headers:h}));return headers(output,request,{vary:true,noindex});
  }
  if(['/.env','/.git/config'].includes(path)||path.endsWith('.html')||path.startsWith('/api/')&&path!=='/api/v1/catalog.json')return errorPage(env,request);
  if(path==='/robots.txt'&&url.hostname!==productionHost)return headers(new Response('User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain'}}),request,{noindex:true});
  const response=await asset(env,request,path);if(response.status!==200)return errorPage(env,request);
  const output=headers(response,request,{noindex:path.startsWith('/api/')});
  if(path.startsWith('/_astro/')&&url.hostname===productionHost){
   output.headers.set('Cache-Control','public, max-age=31536000, immutable');output.headers.set('CDN-Cache-Control','public, max-age=31536000');output.headers.set('Cloudflare-CDN-Cache-Control','public, max-age=31536000');
  }
  return output;
 }
} satisfies ExportedHandler<Env>;
