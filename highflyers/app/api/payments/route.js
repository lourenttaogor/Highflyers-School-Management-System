import {h,guard,kids} from '@/lib/auth';import {Student,Payment,PaymentProof,User,FeeStructure} from '@/lib/models';import {sum} from '@/lib/fees';import {notifyParents} from '@/lib/notify';import {CUR} from '@/lib/config';
export const GET=h(async req=>{const u=await guard('admin','parent');const p=new URL(req.url).searchParams;
 if(u.role==='admin'){const ps=await PaymentProof.find({status:p.get('status')||'review'}).populate('student','fullName className examNo').sort('createdAt');
  return Promise.all(ps.map(async x=>{const s=await sum(x.student,x.term,x.session);return {...x.toObject(),due:s.due,paid:s.paid,balance:s.balance}}))}
 const id=p.get('studentId');if(!(await kids(u)).some(i=>String(i)===id))throw Response.json({error:'Forbidden'},{status:403});
 return PaymentProof.find({student:id}).select('-receipt').sort('-createdAt').limit(10)});
export const POST=h(async req=>{const u=await guard('parent');const b=await req.json();
 if(!(await kids(u)).some(i=>String(i)===b.studentId))throw Response.json({error:'Forbidden'},{status:403});
 if(!b.receipt?.startsWith('data:image/'))throw new Error('Upload a photo of your payment receipt');
 if(b.receipt.length>2000000)throw new Error('The image is too large. Please upload a smaller photo.');
 const st=await Student.findById(b.studentId);await PaymentProof.create({student:st._id,term:b.term,session:b.session,amount:+b.amount||undefined,receipt:b.receipt,by:u.name,status:'review'});
 await notifyParents(await User.find({role:'admin'}),`${u.name} uploaded proof of payment for ${st.fullName} (${b.term}). Please review it in the Fees tab.`,'Payment to review');return {ok:1}});
export const PATCH=h(async req=>{const u=await guard('admin');const {id,action,amount,note,fee}=await req.json();const pr=await PaymentProof.findById(id).populate('student');
 if(pr.status!=='review')throw new Error('Already reviewed');const st=pr.student;pr.reviewedBy=u.name;let msg;
 if(action==='reject'){pr.status='rejected';pr.note=note;await pr.save();msg=`We could not confirm your payment for ${st.fullName} (${pr.term}).${note?' Reason: '+note:''}`}
 else{let s=await sum(st,pr.term,pr.session);
  if(!s.due&&+fee>0){await FeeStructure.updateOne({className:st.className,term:pr.term,session:pr.session},{$set:{amount:+fee}},{upsert:true});s=await sum(st,pr.term,pr.session)}
  if(!s.due)throw new Error('Set the total fee for this class and term first');
  const amt=action==='paid'?s.balance:+amount;if(!(amt>0))throw new Error(action==='paid'?'Nothing is outstanding for this term':'Enter the amount received');
  await Payment.create({student:st._id,term:pr.term,session:pr.session,amount:amt,method:'Bank transfer (proof)',by:u.name});pr.status='confirmed';pr.confirmedAmount=amt;await pr.save();
  const n=await sum(st,pr.term,pr.session);msg=`Payment for ${st.fullName} (${pr.term}) confirmed. Status: ${n.status}${n.balance>0?`, balance ${CUR}${n.balance.toLocaleString()}`:''}.`}
 await notifyParents(await User.find({children:st._id}),msg,'Fee payment update');return {ok:1}});
