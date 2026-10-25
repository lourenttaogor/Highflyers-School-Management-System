import {h,guard} from '@/lib/auth';import {ClassSubject,Catalogue,CurriculumVersion} from '@/lib/models';import {applyDefaults,ensureLevel,isExcluded} from '@/lib/curriculum';import {SESSION,TERMS} from '@/lib/config';
const ok100=n=>{if(n.ca+n.project+n.exam!==100)throw new Error('C.A., HP/P and Exam maxima must add up to 100')};
const opt=k=>['optional','elective'].includes(k);
export const GET=h(async req=>{await guard('admin','teacher');const level=new URL(req.url).searchParams.get('level');
 await ensureLevel(level);
 return (await ClassSubject.find({level}).populate('teacher','name').sort('kind name')).filter(c=>!isExcluded(c))});
export const POST=h(async req=>{await guard('admin');const b=await req.json();
 if(!b.fromSession||!b.fromTerm)throw new Error('Choose the effective session and term');
 const base={ca:30,project:20,exam:50,fromSession:b.fromSession,fromTerm:b.fromTerm};
 const has=async n=>!!(await ClassSubject.findOne({level:b.level,name:n,toSession:{$exists:false}}));
 if(b.action==='apply'){if(!(await CurriculumVersion.countDocuments({status:'confirmed'})))throw new Error('Confirm the catalogue first (Catalogue tab)');return {added:await applyDefaults(b.level,b.fromSession,b.fromTerm)}}
 if(b.action==='add'){let s;
  if(b.catalogueId){const c=await Catalogue.findById(b.catalogueId);if((await CurriculumVersion.findById(c.version)).status!=='confirmed')throw new Error('Confirm the catalogue first');
   s={name:c.name,kind:c.kind,official:c.official,religion:c.religion,optional:opt(c.kind),version:c.version}}
  else{if(!b.name)throw new Error('Enter a subject name');s={name:b.name,kind:'core',official:false,optional:!!b.optional}}
  if(await has(s.name))throw new Error('Already on this class curriculum');return ClassSubject.create({level:b.level,...s,...base})}
 if(b.action==='restore'){const c=await ClassSubject.findById(b.id);if(await has(c.name))throw new Error('Already on this class curriculum');
  const {_id,toSession,toTerm,createdAt,updatedAt,__v,...rest}=c.toObject();return ClassSubject.create({...rest,fromSession:b.fromSession,fromTerm:b.fromTerm})}
 throw new Error('Unknown action')});
export const PATCH=h(async req=>{await guard('admin');const {id,...b}=await req.json();const c=await ClassSubject.findById(id);
 const n={ca:+(b.ca??c.ca),project:+(b.project??c.project),exam:+(b.exam??c.exam)};ok100(n);
 const set={...n};if(b.optional!=null)set.optional=b.optional;if(b.teacher!==undefined)set.teacher=b.teacher||null;
 await ClassSubject.updateOne({_id:id},{$set:set});return {ok:1}});
// "Remove" ends the subject from a session/term onward; the record is kept so history is untouched.
export const DELETE=h(async req=>{await guard('admin');const p=new URL(req.url).searchParams;await ClassSubject.updateOne({_id:p.get('id')},{toSession:p.get('session'),toTerm:p.get('term')});return {ok:1}});
