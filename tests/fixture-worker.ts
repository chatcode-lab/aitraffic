// Local-only integration harness. This file is never referenced by production Wrangler configuration.
import worker from '../worker/index';
import {TrafficLab} from '../worker/lab';
import type {Env} from '../worker/types';
export class TrafficLabFixture extends TrafficLab {
 async fetch(request:Request){
  if(new URL(request.url).pathname==='/fixture'){
   const input=await request.json<{action:string;query?:string;params?:(string|number|null)[]}>();
   if(input.action==='reset'){
    // This isolated fixture database contains only synthetic test data.
    for(const table of ['buckets','tokens','feedback','rate_limits'])this.ctx.storage.sql.exec(`DELETE FROM ${table}`);
    (this as unknown as {cache:Map<string,unknown>}).cache.clear();
    return Response.json({ok:true});
   }
   if(input.action==='sql'){
    (this as unknown as {cache:Map<string,unknown>}).cache.clear();
    return Response.json(this.ctx.storage.sql.exec(input.query!,...(input.params||[])).toArray());
   }
   if(input.action==='cleanup'){await this.alarm();return Response.json({ok:true});}
  }
  return super.fetch(request);
 }
}
export default {
 async fetch(request:Request,env:Env,ctx:ExecutionContext){
  const url=new URL(request.url);
  if(!['localhost','127.0.0.1','[::1]'].includes(url.hostname))return new Response('Local fixtures only',{status:403});
  if(url.pathname==='/__fixture')return env.LAB.get(env.LAB.idFromName('production-v1')).fetch('https://lab.internal/fixture',new Request(request));
  if(url.pathname==='/__fixture-context')return env.LAB.get(env.LAB.idFromName('production-v1')).fetch('https://lab.internal/context',new Request(request));
  if(request.headers.has('X-Fixture-Storage-Failure')){
   const broken={idFromName:()=>({}),get:()=>({fetch:async()=>{throw new Error('Synthetic storage outage');}})} as unknown as DurableObjectNamespace;
   return worker.fetch(request,{...env,LAB:broken},ctx);
  }
  return worker.fetch(request,env,ctx);
 }
} satisfies ExportedHandler<Env>;
