import {h,guard,kids} from '@/lib/auth';import {Student,FeeStructure,Payment} from '@/lib/models';import {sum} from '@/lib/fees';
export const GET=h(async req=>{const u=await guard('admin','parent');const p=new URL(req.url).searchParams;const term=p.get('term'),session=p.get('session');
 if(p.get('className')){await guard('admin');const ss=await Student.find({className:p.get('className')}).sort('fullName');return Promise.all(ss.map(async s=>({student:s,...await sum(s,term,session)})))}
 const id=p.get('studentId');if(u.role==='parent'&&!(await kids(u)).some(i=>String(i)===id))throw Response.json({error:'Forbidden'},{status:403});
 return sum(await Student.findById(id),term,session)});
export const POST=h(async req=>{const u=await guard('admin');const b=await req.json();
 if(b.kind==='structure'){await FeeStructure.updateOne({className:b.className,term:b.term,session:b.session},{$set:{amount:+b.amount}},{upsert:true});return {ok:1}}
 await Payment.create({student:b.studentId,term:b.term,session:b.session,amount:+b.amount,method:b.method,by:u.name});return {ok:1}});
