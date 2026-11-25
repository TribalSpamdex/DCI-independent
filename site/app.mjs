import {VERSION,SKILLS,emptyMemory,validMemory,setFact,currentFacts,removeFact,addObservation,rankedRoutes,setup} from './engine.mjs';
import {executive,technicalInvestigation} from './reasoning.mjs';
import {knowledge} from './knowledge.mjs';
import {REGIONS,appendThrow,targetSummaries,modelFor,missAwarePolicy} from './target-evidence.mjs';
import {validateState} from './state.mjs';
const KEY='DCI-independent:foundation:v1';
const $=id=>document.getElementById(id);
let memory=emptyMemory(),blocked=false;
function say(s){$('status').textContent=s}
try{const raw=localStorage.getItem(KEY);if(raw)memory=validateState(JSON.parse(raw))}catch(e){blocked=true;say('Stored data could not be read. Writes disabled to protect it; export the raw backup or explicitly restore.')}
function persist(next){if(blocked)throw Error('Storage writes blocked until a valid backup is restored or reset is confirmed.');next=validateState(next);localStorage.setItem(KEY,JSON.stringify(next));memory=next;render();say('Saved locally.')}
function el(tag,text){const e=document.createElement(tag);e.textContent=text;return e}
function details(parent,title,value){const e=el('details','');e.append(el('summary',title),el('pre',JSON.stringify(value,null,2)));parent.append(e)}
function button(text,fn){const b=el('button',text);b.type='button';b.onclick=()=>run(fn);return b}
function run(fn){try{fn()}catch(e){say(e.message)}}
function render(){$('facts').replaceChildren();for(const f of currentFacts(memory)){const row=el('p',f.key+': '+f.value+' ('+f.kind+') ');row.append(button('Remove',()=>{if(confirm('Remove this fact and its history?'))persist(removeFact(memory,f.key))}));$('facts').append(row)}
 details($('facts'),'Fact history',memory.facts);
 $('records').replaceChildren(el('p',memory.observations.length+' performance records.'));
 for(const o of memory.observations.slice(-10).reverse()){const row=el('p',o.day+' '+o.skill+' '+o.hits+'/'+o.attempts+' '+o.protocol+' ');row.append(button('Remove',()=>{if(confirm('Remove this record?'))persist({...memory,observations:memory.observations.filter(x=>x.id!==o.id)})}));$('records').append(row)}}
function form(id,fn){$(id).addEventListener('submit',e=>{e.preventDefault();run(()=>fn(Object.fromEntries(new FormData(e.currentTarget)),e.currentTarget))})}
function num(s){if(typeof s!=='string'||!s.trim())throw Error('Number required');return Number(s)}
function today(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
$('version').textContent='V'+VERSION;
for(const select of document.querySelectorAll('.skills'))for(const s of SKILLS){const o=el('option',s);o.value=s;select.append(o)}
for(const select of document.querySelectorAll('.aims,.regions'))for(const region of REGIONS){if(select.classList.contains('aims')&&region==='MISS')continue;const option=el('option',region);option.value=region;select.append(option)}
for(const e of document.querySelectorAll('input[type=date]'))e.value=today();
form('fact',d=>persist(setFact(memory,d.key,d.value,d.kind)));
form('performance',d=>persist(addObservation(memory,{...d,id:crypto.randomUUID(),attempts:num(d.attempts),hits:num(d.hits)})));
form('throw',d=>persist(appendThrow(memory,{...d,id:crypto.randomUUID()})));
$('target-report').onclick=()=>run(()=>{const p=$('targets'),throws=memory.throws??[];p.replaceChildren(el('p',throws.length+' recorded darts.'));for(const g of targetSummaries(throws))details(p,g.aim+' '+g.context+' '+g.protocol+' ('+g.hits+'/'+g.attempts+')',g);for(const t of throws.slice(-10).reverse()){const row=el('p',t.day+' '+t.aim+' → '+t.actual+' ');row.append(button('Remove',()=>{if(confirm('Remove this dart?')){persist({...memory,throws:throws.filter(x=>x.id!==t.id)});$('target-report').click()}}));p.append(row)}});
form('exposure',d=>persist({...memory,exposure:[...memory.exposure,{day:d.day,skill:d.skill,minutes:num(d.minutes)}]}));
function report(s,label){const x=executive(s),p=$('report');p.replaceChildren(el('h3',label),el('p','Decision: '+x.decision+(x.focus?' • '+x.focus:'')),el('p','Suggested session: '+x.plan.map(y=>y.minutes+' min '+y.skill).join(' / ')));for(const issue of x.issues)details(p,'Investigate '+issue.skill+' ('+issue.context+')',issue);details(p,'Assessment evidence',x.assessments);details(p,'Limitations',x.limitations)}
$('analyse').onclick=()=>run(()=>report(memory,'Real player only'));
$('demo').onclick=()=>run(()=>{let s=emptyMemory();for(let i=0;i<14;i++){const day='2026-01-'+String(i+1).padStart(2,'0');s=addObservation(s,{id:'demo-d'+i,day,skill:'doubles',context:'practice',protocol:'Fixed D1–D20',attempts:60,hits:i<7?30:12});s=addObservation(s,{id:'demo-s'+i,day,skill:'scoring',context:'practice',protocol:'60 darts at 20',attempts:60,hits:i<7?1000:1250});s.exposure.push({day,skill:'scoring',minutes:40},{day,skill:'doubles',minutes:5})}report(s,'SIMULATION ONLY — never saved')});
form('checkout',d=>{const score=num(d.score),n=num(d.darts),p=$('routes'),rs=rankedRoutes(score,n);p.replaceChildren(el('p',rs.length+' legal scoring routes. Default order uses dart count and provisional double preference, not a win-probability prediction.'));const list=el('ol','');for(const r of rs.slice(0,25))list.append(el('li',r.path.join(' → ')));p.append(list);if(rs.length>25)p.append(el('p','Showing first 25 routes.'));details(p,'Setup / recovery options',setup(score,n).slice(0,15));if(d.protocol.trim())details(p,'Restricted empirical miss-aware policy',missAwarePolicy(score,n,modelFor(memory.throws??[],d.context,d.protocol.trim())))});
form('technical',(d,f)=>{const x=technicalInvestigation({skill:d.skill,symptom:d.symptom,pain:f.elements.pain.checked});$('tech').replaceChildren(el('p',x.action));details($('tech'),'Hypotheses and unknowns',x)});
for(const k of knowledge)details($('knowledge'),k.id+' • '+k.level,k);
$('export').onclick=()=>run(()=>{const data=blocked?localStorage.getItem(KEY):JSON.stringify(memory,null,2);const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=el('a','');a.href=url;a.download='DCI-foundation-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
$('restore').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>10000000)throw Error('Backup exceeds 10 MB');const s=validateState(JSON.parse(await file.text()));if(!confirm('Replace only DCI foundation data?'))return;localStorage.setItem(KEY,JSON.stringify(s));blocked=false;memory=s;render();say('Backup restored.')}catch(err){say(err.message)}finally{e.target.value=''}};
$('clear').onclick=()=>run(()=>{if(!confirm('Delete only DCI foundation data? Export first if needed.'))return;if(!confirm('Confirm permanent deletion of this foundation data.'))return;localStorage.removeItem(KEY);blocked=false;memory=emptyMemory();render();$('report').replaceChildren();say('Foundation data removed.')});
render();
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{if(!blocked)say('Offline cache unavailable; local data still works if storage is available.')});
