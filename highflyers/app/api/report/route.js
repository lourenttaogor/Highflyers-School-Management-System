import {h,guard,kids} from '@/lib/auth';import {Student,Result} from '@/lib/models';
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;const r2=n=>Math.round(n*100)/100;
// Builds the full report-card data: scores plus class stats, positions and cumulative averages
export const GET=h(async req=>{const u=await guard();const p=new URL(req.url).searchParams;const id=p.get('studentId'),term=p.get('term'),session=p.get('session');
 if(u.role==='parent'&&!(await kids(u)).some(i=>String(i)===id))throw Response.json({error:'Forbidden'},{status:403});
 const student=await Student.findById(id);const result=await Result.findOne({student:id,term,session});
 if(!student||!result||(u.role==='parent'&&result.status!=='approved'))return null;
 const mates=await Student.find({className:student.className}).select('_id');
 const all=await Result.find({student:{$in:mates.map(m=>m._id)},term,session});
 const n=Math.max(1,result.scores.length);
 const totals=all.map(x=>({id:String(x.student),sum:x.scores.reduce((a,s)=>a+s.total,0),n:Math.max(1,x.scores.length)})).sort((a,b)=>b.sum/b.n-a.sum/a.n);
 const mine=result.scores.reduce((a,s)=>a+s.total,0);const yr=await Result.find({student:id,session});
 const subjects=result.scores.map(s=>{const sub=s.subject;
  const col=all.map(x=>x.scores.find(y=>y.subject===sub)?.total).filter(t=>t!=null);
  const cum=yr.map(x=>x.scores.find(y=>y.subject===sub)?.total).filter(t=>t!=null);
  return {subject:sub,ca:s.ca,project:s.project,exam:s.exam,total:s.total,cumAvg:r2(avg(cum)),classAvg:r2(avg(col)),highest:Math.max(...col),lowest:Math.min(...col),position:col.filter(t=>t>s.total).length+1}});
 return {student,result,subjects,summary:{total:mine,average:r2(mine/n),position:totals.findIndex(t=>t.id===id)+1,classSize:mates.length,classAverage:r2(avg(totals.map(t=>t.sum/t.n)))}}});
