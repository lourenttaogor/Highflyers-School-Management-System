import {h,guard,kids} from '@/lib/auth';import {Assignment,Student,User} from '@/lib/models';import {notifyParents} from '@/lib/notify';
export const GET=h(async()=>{const u=await guard();let q={};
 if(u.role==='parent')q={className:{$in:await Student.distinct('className',{_id:{$in:await kids(u)}})}};
 return Assignment.find(q).sort('-createdAt').limit(50)});
export const POST=h(async req=>{const u=await guard('teacher','admin');const b=await req.json();const a=await Assignment.create({...b,by:u.name});
 const sids=await Student.distinct('_id',{className:b.className});
 await notifyParents(await User.find({children:{$in:sids}}),`New ${b.subject} assignment for ${b.className}: ${b.title}. Log in to view it.`);return a});
