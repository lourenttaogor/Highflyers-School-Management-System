import {h,guard,today} from '@/lib/auth';import {Attendance} from '@/lib/models';
export const GET=h(async req=>{const u=await guard('admin','teacher');const date=new URL(req.url).searchParams.get('date');let q={};
 if(u.role==='admin'){if(date)q.date=date}else q={$or:[{staff:u.id},{by:u.id},{date:today()}]};
 return Attendance.find(q).populate('staff','name').populate('by','name').sort('-date -clockIn').limit(300)});
export const POST=h(async req=>{const u=await guard('teacher');const {staffId,action}=await req.json();const q={staff:staffId||u.id,date:today()};
 if(action==='in')await Attendance.updateOne(q,{$setOnInsert:{clockIn:new Date(),by:u.id}},{upsert:true});
 else if(action==='resume')await Attendance.updateOne(q,{$unset:{clockOut:1}});
 else await Attendance.updateOne(q,{$set:{clockOut:new Date()}});return {ok:1}});
