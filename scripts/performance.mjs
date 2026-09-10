import lighthouse from 'lighthouse';
import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import net from 'node:net';
const server=net.createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;await new Promise(r=>server.close(r));
const libs=resolve('artifacts/browser-deps/root/usr/lib/x86_64-linux-gnu');
const browser=await chromium.launch({args:[`--remote-debugging-port=${port}`],...existsSync(libs)?{env:{...process.env,LD_LIBRARY_PATH:libs+(process.env.LD_LIBRARY_PATH?':'+process.env.LD_LIBRARY_PATH:'')}}:{}});
const url='http://localhost:8787/guides/measure-ai-traffic';
await mkdir('artifacts',{recursive:true});const runs=[];
try{
 for(let i=0;i<3;i++){
  const result=await lighthouse(url,{port,output:'json',logLevel:'error',onlyCategories:['performance','accessibility'],extraHeaders:{'X-AITraffic-Test':'1'},formFactor:'mobile'});
  if(result.lhr.runtimeError)throw new Error(result.lhr.runtimeError.message);
  const a=result.lhr.audits;
  const summary={run:i+1,url,measuredAt:result.lhr.fetchTime,mode:'Lighthouse simulated mobile, default throttling; local Worker; X-AITraffic-Test: 1',performance:result.lhr.categories.performance.score*100,accessibility:result.lhr.categories.accessibility.score*100,cls:a['cumulative-layout-shift'].numericValue,lcpMs:a['largest-contentful-paint'].numericValue,totalByteWeight:a['total-byte-weight'].numericValue};
  runs.push(summary);console.log(JSON.stringify(summary));await writeFile(`artifacts/lighthouse-${i+1}.json`,result.report);
 }
 await writeFile('artifacts/performance-summary.json',JSON.stringify(runs,null,2)+'\n');
 if(runs.some(r=>r.performance<95||r.cls>0.1))process.exitCode=1;
}finally{await browser.close();}
