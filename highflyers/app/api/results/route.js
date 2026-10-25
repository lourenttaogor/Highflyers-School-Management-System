import {h,guard,kids} from '@/lib/auth';import {Result,User,Student} from '@/lib/models';import {MAX,CLASS_LEVEL} from '@/lib/config';import {notifyParents} from '@/lib/notify';import {getReg} from '@/lib/curriculum';
const c=(v,m)=>Math.min(m,Math.max(0,Number(v)||0));
export const GET=h(async req=>{const u=await guard();const p=new URL(req.url).searchParams;
 if(p.get('status')){await guard('admin');return Result.find({status:p.get('status')}).populate('student')}
 const q={student:p.get('studentId'),term:p.get('term'),session:p.get('session')};
 if(u.role==='parent'){if(!(await kids(u)).some(i=>String(i)===q.student))throw Response.json({error:'Forbidden'},{status:403});q.status='approved'}
 return Result.findOne(q)});
export const PUT=h(async req=>{await guard('teacher','admin');const b=await req.json();const st=await Student.findById(b.studentId);
 const r=await Result.findOne({student:b.studentId,term:b.term,session:b.session})||new Result({student:b.studentId,term:b.term,session:b.session,className:st.className,level:CLASS_LEVEL[st.className]});
 if(r.status==='approved')throw new Error('Result already published');
 if(b.kind==='details'){const n=v=>v===''||v==null?undefined:Number(v);
  r.set({affective:b.affective||{},psycho:b.psycho||{},comments:b.comments||{},daysOpened:n(b.daysOpened),daysPresent:n(b.daysPresent),nextTerm:b.nextTerm,termEnded:b.termEnded,promotedTo:b.promotedTo});
  r.markModified('affective');r.markModified('psycho')}
 else{const {reg}=await getReg(st,b.session,b.term);const sub=reg?.subjects.find(x=>x.name===b.subject);
  if(!sub)throw new Error('This subject is not registered for the student in this session/term');
  const m={ca:sub.ca??MAX.ca,project:sub.project??MAX.project,exam:sub.exam??MAX.exam};
  const s={subject:b.subject,ca:c(b.ca,m.ca),project:c(b.project,m.project),exam:c(b.exam,m.exam),max:m};s.total=s.ca+s.project+s.exam;
  const i=r.scores.findIndex(x=>x.subject===b.subject);i>=0?r.scores.set(i,s):r.scores.push(s)}
 if(r.status==='pending')r.status='draft';await r.save();return r});
export const PATCH=h(async req=>{const {id,action}=await req.json();const r=await Result.findById(id).populate('student');
 if(action==='submit'||action==='approve'){await guard(...(action==='approve'?['admin']:['teacher','admin']));
  const {reg}=await getReg(r.student,r.session,r.term);const missing=(reg?.subjects||[]).filter(s=>!r.scores.some(x=>x.subject===s.name)).map(s=>s.name);
  if(!reg?.subjects.length)throw new Error('The student has no registered subjects');
  if(missing.length)throw new Error('Still to enter: '+missing.join(', '))}
 else await guard('admin');
 r.status=action==='submit'?'pending':action==='approve'?'approved':'draft';await r.save();
 if(action==='approve')await notifyParents(await User.find({children:r.student._id}),`${r.student.fullName}'s ${r.term} result has been published. Log in to view and download it.`);
 return {ok:1}});
