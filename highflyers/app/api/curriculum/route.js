import {h,guard} from '@/lib/auth';import {CurriculumVersion,Catalogue} from '@/lib/models';import {VERSION,CATALOGUE} from '@/lib/nerdc';import {LEVELS,SESSION,TERMS} from '@/lib/config';import {applyDefaults} from '@/lib/curriculum';
const seed=async()=>{const v=await CurriculumVersion.create(VERSION);await Catalogue.insertMany(CATALOGUE.map(c=>({...c,version:v._id})))};
export const GET=h(async()=>{await guard('admin','teacher');
 const old=await CurriculumVersion.find({name:/^NERDC starter catalogue/});// replace the earlier unverified draft with the uploaded-document catalogue
 if(old.length){const ids=old.map(v=>v._id);await Catalogue.deleteMany({version:{$in:ids}});await CurriculumVersion.deleteMany({_id:{$in:ids}});if(!(await CurriculumVersion.exists({name:VERSION.name})))await seed()}
 return {versions:await CurriculumVersion.find().sort('createdAt'),catalogue:await Catalogue.find().sort('group name')}});
export const POST=h(async req=>{const u=await guard('admin');const b=await req.json();
 if(b.action==='seed'){if(await CurriculumVersion.findOne({name:VERSION.name}))throw new Error('Already imported');
  const v=await CurriculumVersion.create(VERSION);await Catalogue.insertMany(CATALOGUE.map(c=>({...c,version:v._id})));return {ok:1}}
 if(b.action==='confirm'){await CurriculumVersion.updateOne({_id:b.id},{status:'confirmed',confirmedBy:u.name,confirmedAt:new Date()});
  for(const l of LEVELS)await applyDefaults(l,b.fromSession||SESSION,b.fromTerm||TERMS[0]);return {ok:1}}
 if(b.action==='add'){if(!b.name||!b.levels?.length)throw new Error('Enter a name and choose at least one level');
  const v=await CurriculumVersion.findOne({name:'Highflyers Academy (school-defined)'})||await CurriculumVersion.create({name:'Highflyers Academy (school-defined)',source:'Defined by the school, not NERDC',official:false,status:'confirmed',confirmedBy:u.name,confirmedAt:new Date()});
  await Catalogue.create({version:v._id,name:b.name,group:'School-defined subjects (NOT NERDC)',levels:b.levels,kind:b.kind||'core',official:false});return {ok:1}}
 if(b.action==='remove'){await Catalogue.findByIdAndDelete(b.id);return {ok:1}}
 throw new Error('Unknown action')});
