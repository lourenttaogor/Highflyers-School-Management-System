import {h,guard} from '@/lib/auth';import {User} from '@/lib/models';
export const GET=h(async()=>{await guard('admin','teacher');return User.find({role:{$in:['teacher','admin']}}).select('-password').sort('name')});
export const POST=h(async req=>{await guard('admin');const b=await req.json();await User.create({name:b.name,email:b.email,role:'teacher',phone:(b.phone||'').trim()});return {ok:1}});
export const DELETE=h(async req=>{await guard('admin');await User.findOneAndDelete({_id:new URL(req.url).searchParams.get('id'),role:'teacher',phone:(b.phone||'').trim()});return {ok:1}});
