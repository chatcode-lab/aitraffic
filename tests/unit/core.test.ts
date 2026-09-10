import {test} from 'node:test';
import assert from 'node:assert/strict';
import {negotiate} from '../../src/lib/accept';
import {classify,isPrefetch} from '../../src/lib/classify';
import {validateFeedback,tokenExpired,hash} from '../../worker/feedback';
import {esc,renderActivity} from '../../worker/render';
import {pages} from '../../src/lib/registry';
import {createChallenge} from '../../worker/challenge';
import {solveChallenge} from '../challenge-solver.mjs';
const matrix:[string|null,string][]=[
 [null,'html'],['','html'],['*/*','html'],['text/*','html'],['text/html','html'],['text/markdown','markdown'],
 ['text/markdown;q=0,text/html','html'],['text/markdown;q=0.3,text/html;q=0.9','html'],
 ['text/markdown;q=1,text/html;q=0.5','markdown'],['text/html;q=0.5,text/markdown;q=0.5','markdown'],
 ['text/markdown;q=0,*/*;q=1','html'],['text/html;q=0,text/*;q=1','unacceptable'],
 ['application/json','unacceptable'],['text/html;q=0,text/markdown;q=0','unacceptable'],
 ['TEXT/MARKDOWN;Q=1, text/html;q=0.9','markdown'],['text/markdown;q=garbage,text/html','html'],
 ['text/markdown;q=2,text/html','html'],['text/markdown;q=0.1234,text/html','html'],
 ['text/html;q=0.2,*/*;q=1,text/markdown;q=0.3','markdown'],
];
for(const [input,expected]of matrix)test(`Accept ${input} → ${expected}`,()=>assert.equal(negotiate(input),expected));
test('classifications are exclusive, cautious, and label-boundary aware',()=>{
 const browser=new Headers({'sec-fetch-mode':'navigate','sec-fetch-dest':'document'});
 assert.equal(classify('Mozilla/5.0 Chrome/130 Safari/537',browser).category,'human');
 assert.equal(classify('Mozilla/5.0 Chrome/130 Safari/537',new Headers()).category,'unknown');
 assert.equal(classify('Mozilla/5.0 Chrome/130 compatible; GPTBot/1.2',browser).category,'ai');
 assert.equal(classify('notGPTBot/1.0',browser).category,'bot');
 assert.equal(classify('GPTBot/1.0 ChatGPT-User/1.0',browser).category,'unknown');
 assert.equal(classify(null,browser).category,'unknown');
 assert.equal(classify('Mozilla/5.0 HeadlessChrome/130 Safari/537',browser).category,'bot');
 assert.equal(classify('Googlebot/2.1',browser).category,'bot');
 assert.equal(classify('Claude-SearchBot/1.0',browser).label,'Claude-SearchBot');
});
test('prefetch and prerender markers are rejected from mutation eligibility',()=>{
 assert.ok(isPrefetch(new Headers({'sec-purpose':'prefetch;prerender'})));
 assert.ok(isPrefetch(new Headers({'purpose':'prefetch'})));
 assert.equal(isPrefetch(new Headers()),false);
});
test('feedback requires both fields and strict integer rating',()=>{
 const base={token:'a'.repeat(64),answer:'abcdef-123456-a1b2c3',rating:3,comment:'Useful, but clarify the cache boundary.'};
 assert.ok('value' in validateFeedback(base));
 for(const answer of [undefined,null,'',' ',42,'x'.repeat(101),'<script>'])assert.ok('error'in validateFeedback({...base,answer}));
 for(const rating of [0,6,-1,NaN,3.5,'3.0',' 3','+3',null])assert.ok('error'in validateFeedback({...base,rating}));
 for(const comment of ['', '   ',null,'x'.repeat(501),'hello\u0000'])assert.ok('error'in validateFeedback({...base,comment}));
 assert.ok('error'in validateFeedback({token:base.token,rating:3}));
 assert.ok('error'in validateFeedback({token:base.token,comment:'Good'}));
 assert.ok('error'in validateFeedback({...base,page:'wrong-page'}));
 assert.ok('value'in validateFeedback({...base,comment:'🙂'.repeat(500)}));
 assert.ok('value'in validateFeedback({...base,comment:'<script>alert(1)</script>'}));
});
test('tokens expire at the boundary, not one millisecond later',()=>{
 assert.equal(tokenExpired(1000,999),false);assert.equal(tokenExpired(1000,1000),true);assert.equal(tokenExpired(1000,1001),true);
});
test('token hashes are deterministic and do not expose their input',async()=>{
 const value=await hash('synthetic-capability');assert.equal(value.length,64);assert.equal(value,await hash('synthetic-capability'));assert.notEqual(value,await hash('different-synthetic-capability'));
});
test('untrusted feedback is escaped as text',()=>{
 assert.equal(esc('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});
test('unavailable activity is distinct from zero observations',()=>{
 const html=renderActivity(null,pages[0]);assert.match(html,/temporarily unavailable/);assert.doesNotMatch(html,/No observations yet/);assert.match(html,/Last 24 hours/);assert.match(html,/Last 30 days/);
});

test('random challenges have one reproducible answer from public instructions',()=>{
 const prompts=new Set(),answers=new Set();
 for(let i=0;i<80;i++){
  const {challenge,answer}=createChallenge(180000);
  assert.equal(solveChallenge(challenge),answer);
  assert.equal(challenge.rows.length,8);assert.equal(new Set(challenge.rows.map(r=>r.rank)).size,8);
  assert.ok(answer.split('-').length>=3&&answer.split('-').length<=5);
  assert.equal(challenge.expiresAt,'1970-01-01T00:03:00.000Z');assert.equal(challenge.maxAttempts,3);
  assert.ok(!JSON.stringify(challenge).includes(answer));
  prompts.add(challenge.prompt);answers.add(answer);
 }
 assert.ok(prompts.size>1);assert.equal(answers.size,80);
});
