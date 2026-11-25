import {validMemory} from './engine.mjs';
import {validThrow} from './target-evidence.mjs';
export function validateState(raw){
 const s=validMemory(raw),throws=s.throws??[];
 if(!Array.isArray(throws)||throws.length>100000)throw Error('Invalid throw history');
 const ids=new Set();s.throws=throws.map(o=>{const t=validThrow(o);if(ids.has(t.id))throw Error('Duplicate throw');ids.add(t.id);return t});
 return s;
}
