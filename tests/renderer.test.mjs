import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const script=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
const digest='abcdef0123456789'.repeat(4);
const other='1'.repeat(64);
function harness(record,{input=digest,ok=true}={}) {
 const elements=new Map();
 const element=id=>{
  if(!elements.has(id))elements.set(id,{value:'',textContent:'',innerHTML:'',style:{},className:'',classList:{add(){}},addEventListener(){},scrollIntoView(){}});
  return elements.get(id);
 };
 element('hashInput').value=input;
 const calls=[];
 const context=vm.createContext({document:{getElementById:element},location:{hash:''},fetch:async url=>{
  calls.push(url);
  if(url.endsWith('/chain'))return {ok:true,json:async()=>({chain_unbroken:true})};
  if(url.endsWith('/recent'))return {ok:true,json:async()=>({records:[]})};
  return {ok,json:async()=>record};
 }});
 // Execute the actual renderer and startup in an async wrapper to support top-level await.
 const ready=vm.runInContext(`(async()=>{${script}\nreturn {verifyHash,resolveLookupRecord,showVerified};})()`,context);
 return {ready,element,calls};
}
function freeze(value){if(value&&typeof value==='object'){Object.freeze(value);Object.values(value).forEach(freeze);}return value;}

test('pre-2.0 missing canonical hash uses normalized successful lookup, without backfilling',async()=>{
 const record=freeze({status:'verified',filename:'historical.txt',author:'Historical author'});
 const h=harness(record,{input:`  ${digest.toUpperCase()}  `});const renderer=await h.ready;await renderer.verifyHash();
 assert.match(h.element('statusText').textContent,/Verified/);
 assert.ok(h.element('recordGrid').innerHTML.includes(digest));assert.ok(!h.element('recordGrid').innerHTML.includes('undefined'));
 assert.equal(Object.hasOwn(record,'hash'),false);
 const lookup=renderer.resolveLookupRecord(record,digest.toUpperCase());assert.equal(lookup.record,record);assert.equal(lookup.lookupDigest,digest);assert.equal(lookup.storedRecordHashes.length,0);
 assert.ok(h.calls.includes(`https://haawke-verify.haawkeai.workers.dev/verify/${digest}`));
});
test('legacy stored matching hash and uppercase hash validate without mutation',async()=>{
 const record=freeze({status:'verified',hash:digest.toUpperCase()});const h=harness(record);await (await h.ready).verifyHash();
 assert.match(h.element('statusText').textContent,/Verified/);assert.equal(record.hash,digest.toUpperCase());assert.ok(h.element('recordGrid').innerHTML.includes(digest));
});
test('current record validates nested output hash and keeps stored fields unchanged',async()=>{
 const record=freeze({status:'verified',schema_version:'2.0',content:{output_hash:digest,filename:'current.txt'},identity:{author:'Current'},certificate_valid:true});
 const h=harness(record);await (await h.ready).verifyHash();assert.match(h.element('statusText').textContent,/Verified/);assert.ok(h.element('recordGrid').innerHTML.includes(digest));assert.equal(Object.hasOwn(record,'hash'),false);
});
test('missing record displays Not Found and lookup digest, clears prior success state',async()=>{
 const h=harness({status:'not_found'});await h.ready;h.element('otsNote').style.display='block';h.element('thumbnailImg').src='old';await (await h.ready).verifyHash();
 assert.match(h.element('statusText').textContent,/Not Found/);assert.ok(h.element('recordGrid').innerHTML.includes(digest));assert.equal(h.element('otsNote').style.display,'none');assert.equal(h.element('thumbnailImg').src,'');
});
test('malformed lookup hashes never query verify endpoint or display Verified',async()=>{
 for(const input of ['', 'a'.repeat(63), 'g'.repeat(64), '<script>', 'a'.repeat(65)]){
  const h=harness({status:'verified'},{input});await (await h.ready).verifyHash();assert.equal(h.element('statusText').textContent,'Error');assert.match(h.element('recordGrid').innerHTML,/Invalid hash/);assert.ok(!h.calls.some(url=>url.includes('/verify/')));
 }
});
test('stored disagreement or malformed hash produces integrity error before Verified',async()=>{
 for(const fields of [{hash:other},{hash:'bad'},{hash:null},{schema_version:'2.0',content:{output_hash:other}},{schema_version:'2.0',content:{}},{schema_version:'2.0',hash:other,content:{output_hash:digest}},{schema_version:'2.0',hash:digest,content:{output_hash:other}}]){
  const record=freeze({status:'verified',...fields});const before=JSON.stringify(record);const h=harness(record);h.element('otsNote').style.display='block';await (await h.ready).verifyHash();
  assert.equal(h.element('statusText').textContent,'Error');assert.match(h.element('recordGrid').innerHTML,/Integrity error/);assert.equal(h.element('otsNote').style.display,'none');assert.equal(JSON.stringify(record),before);assert.ok(!h.calls.some(url=>url.endsWith('/chain')));
 }
});
test('unsuccessful HTTP response cannot claim Verified even with a verified body',async()=>{
 const h=harness({status:'verified',hash:digest},{ok:false});await (await h.ready).verifyHash();assert.equal(h.element('statusText').textContent,'Error');assert.ok(!h.element('recordGrid').innerHTML.includes('undefined'));
});
test('actual v2 API projection shows model, registry sequence and honest withheld-session state',async()=>{
 const record=freeze({status:'verified',schema_version:'2.0',sha256:digest,content:{output_hash:digest,filename:'sealed-text.txt'},identity:{author:'Haawke artifact service',session_type:'human-initiated'},anthropic:{model:'deepseek-ai/DeepSeek-V4.1-Flash'},chain:{sequence_number:42},timestamp:{registered_at:'2026-10-02T00:00:00Z'},anchor:{ots_status:'pending'},verification:{},certificate_valid:true});const before=JSON.stringify(record);const h=harness(record);await(await h.ready).verifyHash();const html=h.element('recordGrid').innerHTML;assert.ok(html.includes('deepseek-ai/DeepSeek-V4.1-Flash'));assert.ok(html.includes('#00042'));assert.ok(html.includes('not exposed by this session'));assert.ok(!html.includes('pre-2.0'));assert.equal(JSON.stringify(record),before);
});
test('current-schema public labels are escaped and unspecified session type does not invent human initiation',async()=>{
 const record=freeze({status:'verified',schema_version:'2.0',content:{output_hash:digest,filename:'<img src=x onerror=alert(1)>'},identity:{author:'<script>unsafe</script>',session_type:'api'},anthropic:{model:'<img onerror=alert(1)>'},certificate_valid:true});const h=harness(record);await(await h.ready).verifyHash();const html=h.element('recordGrid').innerHTML;assert.ok(!html.includes('<img'));assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;img'));assert.ok(html.includes('Not specified by registrant'));
 const legacy=freeze({status:'verified',hash:digest,author:'Legacy'});const old=harness(legacy);await(await old.ready).verifyHash();assert.ok(old.element('recordGrid').innerHTML.includes('pre-2.0 record — chain/model/session fields not available'));
});
