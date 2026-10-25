import {h,guard} from '@/lib/auth';import {Student,User} from '@/lib/models';
const norm=x=>(x||'').toLowerCase().replace(/\s+/g,' ').trim();
export const POST=h(async req=>{const u=await guard('parent');const {examNo,fullName}=await req.json();
 const x=(examNo||'').trim();const s=await Student.findOne({examNo:{$in:[x,x.toUpperCase()]}});
 if(!s||norm(s.fullName)!==norm(fullName))throw new Error('No learner found with that exam number and name. Check the details or ask the school office.');
 await User.updateOne({_id:u.id},{$addToSet:{children:s._id}});return {ok:1}});
export const DELETE=h(async req=>{const u=await guard('parent');await User.updateOne({_id:u.id},{$pull:{children:new URL(req.url).searchParams.get('id')}});return {ok:1}});
