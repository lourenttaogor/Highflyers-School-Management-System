import {h,guard,kids,today} from '@/lib/auth';import {User,Student,Attendance,Result,Payment,Assignment,Notification,PaymentProof} from '@/lib/models';
export const GET=h(async()=>{const u=await guard();
 if(u.role==='admin'){const [students,teachers,clocked,pending,p]=await Promise.all([Student.countDocuments(),User.countDocuments({role:'teacher'}),
  Attendance.countDocuments({date:today(),clockOut:null}),Result.countDocuments({status:'pending'}),Payment.aggregate([{$group:{_id:null,t:{$sum:'$amount'}}}])]);
  return {students,teachers,clocked,pending,collected:p[0]?.t||0,proofs:await PaymentProof.countDocuments({status:'review'})}}
 if(u.role==='teacher'){const r=await Attendance.findOne({staff:u.id,date:today()});
  return {clockedIn:!!r,clockOut:r?.clockOut,assignments:await Assignment.countDocuments({by:u.name}),students:await Student.countDocuments()}}
 return {children:(await kids(u)).length,alerts:await Notification.countDocuments({email:u.email})}});
