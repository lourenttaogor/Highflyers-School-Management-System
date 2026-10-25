import {LEVELS} from './config';import {PLAN} from './subjects';
export const VERSION={official:true,status:'draft',name:'Uploaded curriculum documents (2026)',
 source:'Pre-Nursery to Nursery 3: "The Complete Scheme of Work for Pre-Primary & Primary Schools" (NAPPS-aligned). Primary 1–6: same document (NERDC-aligned). JSS 1 to SSS 3: "New curriculum for secondary schools" (NEW NERDC SCHEME). Arabic, French, Igbo, language and trade subjects excluded as instructed.'};
// Catalogue = each distinct subject with the levels it appears in
export const CATALOGUE=(()=>{const m=new Map();
 for(const l of LEVELS)for(const c of PLAN[l]||[]){const k=`${c.name}|${c.kind}|${c.religion||''}|${c.src}`;
  if(!m.has(k))m.set(k,{name:c.name,group:c.src==='NERDC'?'NERDC-aligned (Primary 1 – SSS 3)':'NAPPS-aligned pre-primary (Pre-Nursery – Nursery 3)',levels:[],kind:c.kind,official:c.official,religion:c.religion,src:c.src});
  m.get(k).levels.push(l)}
 return [...m.values()]})();
