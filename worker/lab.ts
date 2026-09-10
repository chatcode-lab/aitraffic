import {DurableObject} from 'cloudflare:workers';
import {pages} from '../src/lib/registry';
import {hash,hex,tokenExpired,type FeedbackInput} from './feedback';
import type {Env,Snapshot,PeriodStats,ContextResult,RequestEvent} from './types';
const MINUTE=60_000,HOUR=60*MINUTE,DAY=24*HOUR;
const zero=()=>({ai:0,human:0,bot:0,unknown:0,total:0});
type Row=Record<string,string|number|null>;
export class TrafficLab extends DurableObject<Env>{
 private cache=new Map<string,{at:number;value:Snapshot}>();
 private salt:string;
 private started:number;
 private lastCleanup=0;
 constructor(ctx:DurableObjectState,env:Env){
  super(ctx,env);
  this.sql(`CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY,value TEXT NOT NULL)`);
  this.sql(`CREATE TABLE IF NOT EXISTS buckets (minute INTEGER NOT NULL,page TEXT NOT NULL,category TEXT NOT NULL,agent TEXT NOT NULL,status INTEGER NOT NULL,format TEXT NOT NULL,count INTEGER NOT NULL,PRIMARY KEY(minute,page,category,agent,status,format))`);
  this.sql(`CREATE INDEX IF NOT EXISTS buckets_page_time ON buckets(page,minute)`);
  this.sql(`CREATE TABLE IF NOT EXISTS tokens (hash TEXT PRIMARY KEY,id TEXT NOT NULL,page TEXT NOT NULL,agent TEXT NOT NULL,test INTEGER NOT NULL,expires INTEGER NOT NULL,changes INTEGER NOT NULL DEFAULT 0)`);
  this.sql(`CREATE INDEX IF NOT EXISTS tokens_expiry ON tokens(expires)`);
  this.sql(`CREATE TABLE IF NOT EXISTS feedback (token_hash TEXT PRIMARY KEY,id TEXT UNIQUE NOT NULL,page TEXT NOT NULL,agent TEXT NOT NULL,test INTEGER NOT NULL,rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),comment TEXT NOT NULL,moderation TEXT NOT NULL,created INTEGER NOT NULL,updated INTEGER NOT NULL)`);
  this.sql(`CREATE INDEX IF NOT EXISTS feedback_public ON feedback(moderation,test,updated,page)`);
  this.sql(`CREATE TABLE IF NOT EXISTS rate_limits (bucket INTEGER NOT NULL,client TEXT NOT NULL,action TEXT NOT NULL,count INTEGER NOT NULL,PRIMARY KEY(bucket,client,action))`);
  this.sql('INSERT OR IGNORE INTO meta(key,value) VALUES(?,?)','salt',hex(crypto.getRandomValues(new Uint8Array(32))));
  this.sql('INSERT OR IGNORE INTO meta(key,value) VALUES(?,?)','started',String(Date.now()));
  this.salt=String(this.sql('SELECT value FROM meta WHERE key=?','salt')[0].value);
  this.started=Number(this.sql('SELECT value FROM meta WHERE key=?','started')[0].value);
  ctx.blockConcurrencyWhile(async()=>{if(await ctx.storage.getAlarm()===null)await ctx.storage.setAlarm(Date.now()+HOUR);});
 }
 private sql(query:string,...params:(string|number|null)[]):Row[]{return this.ctx.storage.sql.exec<Row>(query,...params).toArray();}
 private cleanup(now:number){
  if(now-this.lastCleanup<HOUR)return;
  const retention=Math.min(90,Math.max(31,Number(this.env.RETENTION_DAYS)||31));
  const feedbackRetention=Math.min(365,Math.max(1,Number(this.env.FEEDBACK_RETENTION_DAYS)||90));
  this.ctx.storage.transactionSync(()=>{
   this.sql('DELETE FROM buckets WHERE minute < ?',Math.floor((now-retention*DAY)/MINUTE));
   this.sql('DELETE FROM tokens WHERE expires <= ?',now);
   this.sql('DELETE FROM feedback WHERE (test=1 AND updated < ?) OR updated < ?',now-DAY,now-feedbackRetention*DAY);
   this.sql('DELETE FROM rate_limits WHERE bucket < ?',Math.floor((now-2*DAY)/HOUR));
  });this.lastCleanup=now;
 }
 async alarm(){this.lastCleanup=0;this.cleanup(Date.now());await this.ctx.storage.setAlarm(Date.now()+HOUR);}
 private async fingerprint(ip:string,now:number){return hash(`${this.salt}:${Math.floor(now/DAY)}:${ip}`);}
 private rate(client:string,action:'issue'|'submit',now:number):boolean{
  const bucket=Math.floor(now/HOUR),limit=action==='issue'?20:60,global=action==='issue'?2000:3000;
  const rows=this.sql('SELECT client,count FROM rate_limits WHERE bucket=? AND action=? AND client IN (?,?)',bucket,action,client,'global');
  if(rows.some(r=>Number(r.count)>=(r.client==='global'?global:limit)))return false;
  for(const c of [client,'global'])this.sql('INSERT INTO rate_limits(bucket,client,action,count) VALUES(?,?,?,1) ON CONFLICT(bucket,client,action) DO UPDATE SET count=count+1',bucket,c,action);
  return true;
 }
 private record(event:RequestEvent,now:number){
  if(!pages.some(p=>p.id===event.page)||!['ai','human','bot','unknown'].includes(event.category))return;
  this.sql('INSERT INTO buckets(minute,page,category,agent,status,format,count) VALUES(?,?,?,?,?,?,1) ON CONFLICT(minute,page,category,agent,status,format) DO UPDATE SET count=count+1',Math.floor(now/MINUTE),event.page,event.category,event.agent,event.status,event.format);
 }
 private period(page:string,minutes:number,end:number):PeriodStats{
  const start=end-minutes,condition='minute >= ? AND minute < ? AND (? = \'\' OR page=?)',params=[start,end,page,page];
  const rows=this.sql(`SELECT category,SUM(count) AS requests FROM buckets WHERE ${condition} GROUP BY category`,...params);
  const counts=zero();for(const r of rows){const key=String(r.category) as 'ai'|'human'|'bot'|'unknown';counts[key]=Number(r.requests);counts.total+=Number(r.requests);}
  const pageRows=this.sql(`SELECT page,SUM(count) AS requests FROM buckets WHERE ${condition} GROUP BY page ORDER BY requests DESC,page`,...params);
  const agents=this.sql(`SELECT agent,SUM(count) AS requests FROM buckets WHERE ${condition} AND category='ai' GROUP BY agent ORDER BY requests DESC,agent`,...params);
  const statuses=this.sql(`SELECT status,SUM(count) AS requests FROM buckets WHERE ${condition} GROUP BY status ORDER BY status`,...params);
  const formats=this.sql(`SELECT format,SUM(count) AS requests FROM buckets WHERE ${condition} GROUP BY format ORDER BY format`,...params);
  const slots=minutes===1440?24:30,step=minutes/slots;
  const trendRows=this.sql(`SELECT CAST((minute-?)/? AS INTEGER) AS slot,SUM(count) AS requests FROM buckets WHERE ${condition} GROUP BY slot`,start,step,...params);
  const trend=Array.from({length:slots},(_,i)=>({from:new Date((start+i*step)*MINUTE).toISOString(),to:new Date((start+(i+1)*step)*MINUTE).toISOString(),requests:Number(trendRows.find(r=>Number(r.slot)===i)?.requests||0)}));
  const feedbackStart=Math.max(start*MINUTE,Date.now()-(Number(this.env.FEEDBACK_RETENTION_DAYS)||90)*DAY);
  const feedbackWhere=`moderation='eligible' AND test=0 AND updated>=? AND updated<? AND (?='' OR page=?)`;
  const feedbackParams=[feedbackStart,end*MINUTE,page,page];
  const summary=this.sql(`SELECT COUNT(*) AS count,AVG(rating) AS average FROM feedback WHERE ${feedbackWhere}`,...feedbackParams)[0];
  const feedbackRows=this.sql(`SELECT id,page,agent,rating,comment,updated FROM feedback WHERE ${feedbackWhere} ORDER BY updated DESC,id LIMIT 20`,...feedbackParams);
  return {from:new Date(start*MINUTE).toISOString(),to:new Date(end*MINUTE).toISOString(),counts,pages:pageRows.map(r=>({id:String(r.page),requests:Number(r.requests)})),agents:agents.map(r=>({label:String(r.agent),requests:Number(r.requests)})),statuses:statuses.map(r=>({status:Number(r.status),requests:Number(r.requests)})),formats:formats.map(r=>({format:String(r.format),requests:Number(r.requests)})),trend,feedback:{count:Number(summary.count),average:summary.average===null?null:Number(summary.average),items:feedbackRows.map(r=>({id:String(r.id),page:String(r.page),agent:String(r.agent),rating:Number(r.rating),comment:String(r.comment),updatedAt:new Date(Number(r.updated)).toISOString()}))}};
 }
 private snapshot(page:string,now:number):Snapshot{
  const cached=this.cache.get(page);if(cached&&now-cached.at<30_000)return cached.value;
  const end=Math.floor(now/MINUTE);
  const value:Snapshot={schemaVersion:1,classifierVersion:'2026-09-10.1',scope:page||'site',collectedSince:new Date(this.started).toISOString(),asOf:new Date(end*MINUTE).toISOString(),periods:{'24h':this.period(page,1440,end),'30d':this.period(page,43200,end)}};
  this.cache.set(page,{at:now,value});return value;
 }
 async fetch(request:Request){
  const path=new URL(request.url).pathname,now=Date.now();this.cleanup(now);
  if(path==='/snapshot'){const page=new URL(request.url).searchParams.get('page')||'';return Response.json(this.snapshot(page,now));}
  if(path==='/record'){this.record(await request.json<RequestEvent>(),now);return new Response(null,{status:204});}
  if(path==='/context'){
   const input=await request.json<{page:string;issue:boolean;agent:string;test:boolean;ip:string}>();
   const result:ContextResult={snapshot:this.snapshot(input.page,now)};
   if(input.issue){
    const client=await this.fingerprint(input.ip,now);
    const token=hex(crypto.getRandomValues(new Uint8Array(32))),digest=await hash(token);
    const ttl=Math.min(3600,Math.max(1,Number(this.env.TOKEN_TTL_SECONDS)||1800));
    const expires=now+ttl*1000;
    const issued=this.ctx.storage.transactionSync(()=>{if(!this.rate(client,'issue',now))return false;this.sql('INSERT INTO tokens(hash,id,page,agent,test,expires) VALUES(?,?,?,?,?,?)',digest,crypto.randomUUID(),input.page,input.agent,input.test?1:0,expires);return true;});
    if(issued)result.invitation={token,expiresAt:new Date(expires).toISOString(),page:input.page,agent:input.agent,test:input.test};else result.invitationUnavailable=true;
   }
   return Response.json(result);
  }
  if(path==='/feedback'){
   const {input,ip}=await request.json<{input:FeedbackInput;ip:string}>();const digest=await hash(input.token),client=await this.fingerprint(ip,now);
   return this.ctx.storage.transactionSync(()=>{
    if(!this.rate(client,'submit',now))return Response.json({error:'Feedback rate limit reached. Try later.'},{status:429});
    const token=this.sql('SELECT * FROM tokens WHERE hash=?',digest)[0];
    if(!token)return Response.json({error:'Token is invalid or expired.'},{status:403});
    if(tokenExpired(Number(token.expires),now))return Response.json({error:'Token has expired.'},{status:410});
    const existing=this.sql('SELECT * FROM feedback WHERE token_hash=?',digest)[0];
    const unchanged=existing&&Number(existing.rating)===input.rating&&existing.comment===input.comment;
    if(!unchanged&&Number(token.changes)>=10)return Response.json({error:'This token has reached its update limit.'},{status:429});
    if(!unchanged){
     this.sql(`INSERT INTO feedback(token_hash,id,page,agent,test,rating,comment,moderation,created,updated) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(token_hash) DO UPDATE SET rating=excluded.rating,comment=excluded.comment,moderation=excluded.moderation,updated=excluded.updated`,digest,String(token.id),String(token.page),String(token.agent),Number(token.test),input.rating,input.comment,Number(token.test)?'test':'pending',now,now);
     this.sql('UPDATE tokens SET changes=changes+1 WHERE hash=?',digest);this.cache.clear();
    }
    return Response.json({ok:true,id:token.id,state:Number(token.test)?'test':unchanged?String(existing.moderation):'pending',action:unchanged?'unchanged':existing?'updated':'created',test:Boolean(token.test),message:Number(token.test)?'Synthetic feedback saved. Excluded from production statistics and public feedback.':'Feedback saved for moderation. It is not yet public unless its unchanged version was already approved.'});
   });
  }
  if(path==='/admin'){
   const input=await request.json<{action:string;id?:string;state?:string}>();
   if(input.action==='list')return Response.json({items:this.sql('SELECT id,page,agent,test,rating,comment,moderation,created,updated FROM feedback ORDER BY updated DESC LIMIT 100')});
   if(input.action==='moderate'&&input.id&&['eligible','quarantined','pending'].includes(input.state||'')){
    const row=this.sql('SELECT id,test FROM feedback WHERE id=?',input.id)[0];
    if(!row)return Response.json({error:'Record not found.'},{status:404});
    if(Number(row.test))return Response.json({error:'Test feedback cannot be published.'},{status:400});
    this.sql('UPDATE feedback SET moderation=? WHERE id=?',input.state!,input.id);this.cache.clear();return Response.json({ok:true,id:input.id,state:input.state});
   }
   return Response.json({error:'Invalid moderation action.'},{status:400});
  }
  return new Response('Not found',{status:404});
 }
}
