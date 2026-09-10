export interface FeedbackInput {token:string;rating:number;comment:string}
export function validateFeedback(input:Record<string,unknown>):{value:FeedbackInput}|{error:string} {
 if(Object.keys(input).some(k=>!['token','rating','comment'].includes(k)))return {error:'Only token, rating, and comment are accepted.'};
 if(typeof input.token!=='string'||!/^[a-f0-9]{64}$/.test(input.token))return {error:'A valid issued token is required.'};
 const r=input.rating;
 if(!(typeof r==='number'&&Number.isInteger(r)&&r>=1&&r<=5)&&!(typeof r==='string'&&/^[1-5]$/.test(r)))return {error:'Rating must be an integer from 1 to 5.'};
 if(typeof input.comment!=='string')return {error:'A nonempty plain-text comment is required.'};
 const comment=input.comment.trim();
 if(Array.from(comment).length<1||Array.from(comment).length>500||/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(comment))return {error:'Comment must contain 1–500 Unicode characters of plain text, without control characters.'};
 return {value:{token:input.token,rating:Number(r),comment}};
}
export const tokenExpired=(expires:number,now:number)=>now>=expires;
export const hex=(bytes:Uint8Array)=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
export const hash=async(value:string)=>hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))));
