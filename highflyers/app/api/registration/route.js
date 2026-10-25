import {h,guard} from '@/lib/auth';import {Student,Result} from '@/lib/models';import {getReg,build} from '@/lib/curriculum';
export const GET=h(async req=>{await guard('admin','teacher');const p=new URL(req.url).searchParams;const st=await Student.findById(p.get('studentId'));
 const {reg,warn,cs}=await getReg(st,p.get('session'),p.get('term'));return {reg,warn,cs}});
export const PUT=h(async req=>{await guard('admin');const b=await req.json();const st=await Student.findById(b.studentId);const {reg,cs}=await getReg(st,b.session,b.term);
 if(!reg)throw new Error('No subjects are configured for this class yet. Set up the class curriculum first.');
 const res=await Result.findOne({student:st._id,term:b.term,session:b.session});
 if(b.action==='add'){const c=cs.find(x=>String(x._id)===b.csId);if(!c)throw new Error('That subject is not active for this class');
  if(reg.subjects.some(x=>x.name===c.name))throw new Error('Already registered');reg.subjects.push({name:c.name,kind:c.kind,official:c.official,ca:c.ca,project:c.project,exam:c.exam,teacher:c.teacher})}
 if(b.action==='remove'){if(res?.scores.some(x=>x.subject===b.name))throw new Error('Scores already entered for this subject, so it cannot be removed');reg.subjects=reg.subjects.filter(x=>x.name!==b.name)}
 if(b.action==='regenerate'){const bl=await build(st,b.session,b.term);for(const s of bl.subjects)if(!reg.subjects.some(x=>x.name===s.name))reg.subjects.push(s)}
 await reg.save();return {ok:1}});
