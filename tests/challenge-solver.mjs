// Independent synthetic-test solver: interprets only the public exercise.
// Its existence also demonstrates that passing cannot prove an LLM identity.
export function solveChallenge(challenge){
 const [,method,status,format]=challenge.prompt.match(/method (GET|HEAD), status (200|304), and format (html|markdown)/)||[];
 if(!method)throw new Error('Unrecognized public challenge instruction');
 const rows=challenge.rows.filter(r=>r.method===method&&r.status===Number(status)&&r.format===format);
 const byRank=new Map(rows.map(r=>[r.rank,r.tag]));
 const order=Array.from({length:8},(_,i)=>i+1);
 if(challenge.prompt.includes('highest to lowest'))order.reverse();
 return order.filter(n=>byRank.has(n)).map(n=>{
  const tag=byRank.get(n);
  return challenge.prompt.includes('Reverse the characters')?tag.split('').reverse().join(''):tag;
 }).join('-');
}
export function challengeFromHtml(html){
 const prompt=html.match(/data-challenge-prompt[^>]*>([^<]+)</)?.[1];
 const raw=html.match(/data-challenge-rows[^>]*>([^<]+)</)?.[1];
 if(!prompt||!raw)throw new Error('Challenge missing from HTML');
 const rows=raw.trim().split('\n').slice(1).map(line=>{
  const [rank,method,status,format,tag]=line.trim().split(/\s+/);
  return {rank:Number(rank),method,status:Number(status),format,tag};
 });
 return {prompt,rows};
}
