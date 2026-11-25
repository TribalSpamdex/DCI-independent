import {validMemory} from './engine.mjs';
import {validThrow} from './target-evidence.mjs';
import {validateReadiness,dayValid} from './context.mjs';
import {validateDifficulty} from './training.mjs';
export function validateState(raw){
 const s=validMemory(raw),throws=s.throws??[];
 if(!Array.isArray(throws)||throws.length>100000)throw Error('Invalid throw history');
 const ids=new Set();s.throws=throws.map(o=>{const t=validThrow(o);if(ids.has(t.id))throw Error('Duplicate throw');ids.add(t.id);return t});
 for(const i of s.interventions){if(!Array.isArray(i.baselineIds)||i.baselineIds.length>50000||!i.baselineIds.every(x=>typeof x==='string')||typeof i.protocol!=='string'||!['practice','competition'].includes(i.context)||!/^\d{4}-\d{2}-\d{2}$/.test(i.proposedDay)||i.reviewAfterDays!==14||i.maximumDays!==21)throw Error('Invalid intervention record');if(i.status!=='proposed'&&(!i.responseDay||i.responseDay<i.proposedDay))throw Error('Invalid intervention response');}
 for(const [key,validator,id] of [['readiness',validateReadiness,x=>x.day+'/'+x.context],['difficulty',validateDifficulty,x=>x.id]]){const rows=s[key]??[];if(!Array.isArray(rows)||rows.length>50000)throw Error('Invalid '+key+' history');const unique=new Set();s[key]=rows.map(raw=>{const o=validator(raw),k=id(o);if(unique.has(k))throw Error('Duplicate '+key+' record');unique.add(k);return o})}
 for(const e of s.exposure)if(!dayValid(e.day))throw Error('Invalid exposure date');
 return s;
}
