import {h,guard} from '@/lib/auth';import {Announcement,User} from '@/lib/models';import {notifyParents} from '@/lib/notify';
export const GET=h(async()=>{const u=await guard();const aud=u.role==='admin'?['all','parents','teachers']:['all',u.role==='parent'?'parents':'teachers'];return Announcement.find({audience:{$in:aud}}).sort('-createdAt').limit(30)});
export const POST=h(async req=>{const u=await guard('admin');const b=await req.json();if(!b.title||!b.body)throw new Error('Enter a title and a message');
 const a=await Announcement.create({title:b.title,body:b.body,audience:b.audience||'all',by:u.name});
 const roles=b.audience==='parents'?['parent']:b.audience==='teachers'?['teacher']:['parent','teacher'];
 await notifyParents(await User.find({role:{$in:roles}}),`${b.title}: ${b.body}`,b.title);return a});
export const DELETE=h(async req=>{await guard('admin');await Announcement.findByIdAndDelete(new URL(req.url).searchParams.get('id'));return {ok:1}});
