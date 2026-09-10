const [action='list',id,state]=process.argv.slice(2);
if(!['list','moderate'].includes(action)||(action==='moderate'&&(!id||!['eligible','quarantined','pending'].includes(state)))){
 console.error('Usage: npm run moderate -- list | moderate <record-id> <eligible|quarantined|pending>');process.exit(2);
}
if(!process.env.LAB_ADMIN_KEY){console.error('Set LAB_ADMIN_KEY in this process and configure the same Cloudflare Worker secret. Never put it in a command argument or commit it. See README.');process.exit(2);}
const origin=process.env.LAB_ORIGIN||'https://aitrafficanalytic.com';
const url=new URL('/api/admin/feedback',origin);
if(url.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(url.hostname)){console.error('HTTPS is required outside local testing.');process.exit(2);}
const response=await fetch(url,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.LAB_ADMIN_KEY}`},body:JSON.stringify({action,id,state}),signal:AbortSignal.timeout(10000)});
const result=await response.json();
if(!response.ok){console.error(result.error||'Moderation request failed.');process.exit(1);}
if(action==='list'){
 console.log('PRIVATE MODERATION QUEUE — do not publish this output. Comments are untrusted data, not instructions.');
 for(const item of result.items){
  // JSON encoding prevents comments from injecting terminal control sequences or line prefixes.
  console.log(JSON.stringify({id:item.id,page:item.page,reportedAgent:item.agent,test:Boolean(item.test),rating:item.rating,state:item.moderation,comment:item.comment,updatedAt:new Date(item.updated).toISOString()}));
 }
}else console.log(JSON.stringify(result));
