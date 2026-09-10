import {hex} from './feedback';

export const CHALLENGE_VERSION='text-sort-v1';
export const CHALLENGE_TTL_MS=120_000;
export const CHALLENGE_MAX_ATTEMPTS=3;
export interface Challenge {
 version:typeof CHALLENGE_VERSION;
 expiresAt:string;
 maxAttempts:number;
 prompt:string;
 rows:{rank:number;method:string;status:number;format:string;tag:string}[];
}
const choose=(n:number)=>{
 // Rejection sampling keeps choices uniform without Math.random().
 const limit=Math.floor(0x100000000/n)*n;
 let value:number;do{value=crypto.getRandomValues(new Uint32Array(1))[0];}while(value>=limit);
 return value%n;
};
function shuffle<T>(values:T[]):T[]{
 for(let i=values.length-1;i>0;i--){const j=choose(i+1);[values[i],values[j]]=[values[j],values[i]];}return values;
}
// A bounded instruction-following exercise, not an LLM or provider identity test.
// No runtime model, external service, real traffic, or user content is involved.
export function createChallenge(expires:number):{challenge:Challenge;answer:string}{
 const method=choose(2)?'GET':'HEAD',status=choose(2)?200:304,format=choose(2)?'html':'markdown';
 const descending=Boolean(choose(2)),reverse=Boolean(choose(2)),matches=3+choose(3);
 const ranks=shuffle(Array.from({length:8},(_,i)=>i+1));
 const rows=Array.from({length:8},(_,i)=>{
  const row={rank:ranks[i],method,status,format,tag:hex(crypto.getRandomValues(new Uint8Array(3)))};
  if(i>=matches){switch(choose(3)){case 0:row.method=method==='GET'?'HEAD':'GET';break;case 1:row.status=status===200?304:200;break;case 2:row.format=format==='html'?'markdown':'html';}}
  return row;
 });
 const answer=rows.filter(r=>r.method===method&&r.status===status&&r.format===format)
  .sort((a,b)=>descending?b.rank-a.rank:a.rank-b.rank)
  .map(r=>reverse?Array.from(r.tag).reverse().join(''):r.tag).join('-');
 return {answer,challenge:{version:CHALLENGE_VERSION,expiresAt:new Date(expires).toISOString(),maxAttempts:CHALLENGE_MAX_ATTEMPTS,
  prompt:`These are synthetic records. Keep only rows with method ${method}, status ${status}, and format ${format}. Sort the kept rows by rank from ${descending?'highest to lowest':'lowest to highest'}. ${reverse?'Reverse the characters of each tag.':'Keep each tag unchanged.'} Join the resulting tags with a single hyphen, without spaces. Submit that string as answer together with your own rating and comment.`,rows:shuffle(rows)}};
}
