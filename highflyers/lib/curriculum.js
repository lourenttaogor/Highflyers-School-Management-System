import {ClassSubject,Registration,Catalogue,CurriculumVersion,Result} from './models';import {CLASS_LEVEL,TERMS} from './config';import {PLAN} from './subjects';
export const key=(s,t)=>(parseInt(s)||0)*10+TERMS.indexOf(t)+1;
export const activeAt=(c,s,t)=>{const k=key(s,t);return key(c.fromSession,c.fromTerm)<=k&&(!c.toSession||k<key(c.toSession,c.toTerm))};
// Not offered: Arabic, French, Igbo, Nigerian-language and trade subjects.
export const isExcluded=c=>['language','trade','tradeoption'].includes(c.kind)||/arabic|french|igbo/i.test(c.name||'');
const V='docs-v1';const snap=(c,name)=>({name,kind:c.kind,official:c.official,ca:c.ca,project:c.project,exam:c.exam,teacher:c.teacher});
// Creates a level's subject list from the curriculum documents the first time it is used (replacing any earlier auto-generated list). Effective from the start, so any session works.
async function run(level){if(await ClassSubject.exists({level,plan:V}))return;await ClassSubject.deleteMany({level,plan:{$ne:V}});
 const items=(PLAN[level]||[]).filter(c=>!isExcluded(c));
 if(items.length)await ClassSubject.bulkWrite(items.map(c=>({updateOne:{filter:{level,name:c.name,plan:V},upsert:true,
  update:{$setOnInsert:{kind:c.kind,official:c.official,src:c.src,...(c.religion&&{religion:c.religion}),optional:c.kind==='elective',ca:30,project:20,exam:50,fromSession:'2000/2001',fromTerm:TERMS[0]}}}})))}
const locks={};
export function ensureLevel(level){if(!level)return;return locks[level]||(locks[level]=run(level).finally(()=>{delete locks[level]}))}
// A student's subjects = the class's compulsory subjects. Electives are never assumed.
// Religion: the student's own (CRS/IRS) if recorded, otherwise Christian Religious Studies.
// One-time fix: earlier results/registrations used the name 'Religious Studies'; rename to 'Christian Religious Studies'.
let migrated;async function migrate(){if(migrated)return;migrated=true;
 await Result.updateMany({'scores.subject':'Religious Studies'},{$set:{'scores.$[e].subject':'Christian Religious Studies'}},{arrayFilters:[{'e.subject':'Religious Studies'}]});
 await Registration.updateMany({'subjects.name':'Religious Studies'},{$set:{'subjects.$[e].name':'Christian Religious Studies'}},{arrayFilters:[{'e.name':'Religious Studies'}]})}
export async function build(st,session,term){const level=CLASS_LEVEL[st.className];await migrate();await ensureLevel(level);
 const cs=(await ClassSubject.find({level})).filter(c=>activeAt(c,session,term)&&!isExcluded(c));const subjects=[];
 for(const c of cs){if(c.optional)continue;
  if(c.kind==='religion'){if(st.religion&&c.religion&&c.religion!==st.religion)continue;const name=st.religion?c.name:'Christian Religious Studies';if(!subjects.some(x=>x.name===name))subjects.push(snap(c,name));continue}
  subjects.push(snap(c,c.name))}
 return {level,subjects,warn:[],cs}}
export async function getReg(st,session,term){let reg=await Registration.findOne({student:st._id,session,term});const b=await build(st,session,term);
 if(reg){const res=await Result.findOne({student:st._id,session,term});const scored=n=>res?.scores.some(x=>x.subject===n);
  if(reg.v!==2){// refresh an older registration to the current list, keeping any subject that already has scores
   const keep=reg.subjects.filter(s=>scored(s.name)&&!isExcluded(s)),have=new Set(keep.map(s=>s.name));
   reg.subjects=[...keep,...b.subjects.filter(s=>!have.has(s.name))];reg.v=2;await reg.save()}
  else if(reg.subjects.some(isExcluded)){reg.subjects=reg.subjects.filter(s=>!isExcluded(s)||scored(s.name));await reg.save()}}
 if(!reg&&b.subjects.length)reg=await Registration.create({v:2,student:st._id,session,term,level:b.level,className:st.className,subjects:b.subjects});
 return {reg,warn:b.warn,cs:b.cs}}
export async function applyDefaults(level,fromSession,fromTerm){
 const ids=(await CurriculumVersion.find({status:'confirmed'})).map(v=>v._id);if(!ids.length)return 0;
 const have=new Set((await ClassSubject.find({level}).select('name')).map(x=>x.name)),seen=new Set();
 const items=(await Catalogue.find({version:{$in:ids},levels:level,kind:{$ne:'tradeoption'}})).filter(c=>!isExcluded(c)&&!have.has(c.name)&&!seen.has(c.name)&&seen.add(c.name));
 await ClassSubject.insertMany(items.map(c=>({level,name:c.name,kind:c.kind,official:c.official,src:c.src,religion:c.religion,optional:['optional','elective'].includes(c.kind),version:c.version,ca:30,project:20,exam:50,fromSession,fromTerm})));
 return items.length}
