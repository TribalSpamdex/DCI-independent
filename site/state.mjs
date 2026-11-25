import {validMemory} from './engine.mjs';
import {validThrow} from './target-evidence.mjs';
export function validateState(raw){
 const s=validMemory(raw),throws=s.throws??[];
 if(!Array.isArray(throws)||throws.length>100000)throw Error('Invalid throw history');
 const ids=new Set();s.throws=throws.map(o=>{const t=validThrow(o);if(ids.has(t.id))throw Error('Duplicate throw');ids.add(t.id);return t});
 for(const i of s.interventions){if(!Array.isArray(i.baselineIds)||i.baselineIds.length>50000||!i.baselineIds.every(x=>typeof x==='string')||typeof i.protocol!=='string'||!['practice','competition'].includes(i.context)||!/^\d{4}-\d{2}-\d{2}$/.test(i.proposedDay)||i.reviewAfterDays!==14||i.maximumDays!==21)throw Error('Invalid intervention record');if(i.status!=='proposed'&&(!i.responseDay||i.responseDay<i.proposedDay))throw Error('Invalid intervention response');}
 return s;
}
