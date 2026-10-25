import {FeeStructure,Payment,PaymentProof} from './models';
export const sum=async(s,term,session)=>{const f=await FeeStructure.findOne({className:s.className,term,session});const ps=await Payment.find({student:s._id,term,session}).sort('-createdAt');
 const due=f?.amount||0,paid=ps.reduce((a,p)=>a+p.amount,0);const review=await PaymentProof.countDocuments({student:s._id,term,session,status:'review'});
 return {due,paid,balance:due-paid,review,status:review?'In review':!due?'No fee set':paid>=due?'Paid':paid>0?'Part-paid':'Unpaid',payments:ps}};
