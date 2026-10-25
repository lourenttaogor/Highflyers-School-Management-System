'use client';import {useRef,useState,useEffect} from 'react';import {api} from '@/lib/client';import {AFFECTIVE,PSYCHO,TERMS,gradeOf} from '@/lib/config';
const T='#0b7f77';
const css=`.rc{width:794px;background:#fff;color:#111;font:11px Arial,sans-serif;padding:14px}.rc table{width:100%;border-collapse:collapse}.rc td,.rc th{border:1px solid #333;padding:2px 4px}.rc th{background:${T};color:#fff;font-size:10px}.rc .c{text-align:center}.rc .g{background:#e6e6e6;font-weight:700}`;
const Tbl=({t,items,vals})=><table><thead><tr><th style={{textAlign:'left'}}>{t}</th><th>RATING</th></tr></thead><tbody>{items.map(i=><tr key={i}><td><b>{i}</b></td><td className="c">{vals?.[i]||''}</td></tr>)}</tbody></table>;
const RANGE=[['0% - <30%','F','Fail'],['>=30% - <40%','E','Poor'],['>=40% - <50%','D','Pass'],['>=50% - <60%','C','Good'],['>=60% - <70%','B','Very good'],['>=70% - 100%','A','Excellent']];
const KEY=[[5,'Maintains an excellent degree of observation'],[4,'Maintains high level of observation trait'],[3,'Acceptable level of observation trait'],[2,'Shows minimal level of observation trait'],[1,'Has no regard for observation trait']];
export default function ReportCard({data}){const ref=useRef();const {student:s,result:r,subjects,summary:m}=data;const ti=TERMS.indexOf(r.term)+1;
 const name=`${s.fullName}-${r.term}`.replace(/\s+/g,'_');const nth=['','1st','2nd','3rd'][ti];
 const shot=async()=>(await import('html2canvas')).default(ref.current,{scale:2,backgroundColor:'#fff',useCORS:true});
 const png=async()=>{const c=await shot();const a=document.createElement('a');a.download=name+'.png';a.href=c.toDataURL('image/png');a.click()};
 const pdf=async()=>{const c=await shot();const {jsPDF}=await import('jspdf');const d=new jsPDF('p','mm','a4');const hh=c.height*210/c.width,k=Math.min(1,297/hh);
  d.addImage(c.toDataURL('image/jpeg',.95),'JPEG',(210-210*k)/2,0,210*k,hh*k);d.save(name+'.pdf')};
 const absent=r.daysOpened!=null&&r.daysPresent!=null?r.daysOpened-r.daysPresent:'';
 const info=[['Session',`${r.session}/Term${ti}`,'Term',nth,'Age',s.age?s.age+'yrs':''],['Name of student',s.fullName.toUpperCase(),'Reg. No',s.examNo,'Gender',s.gender],
  ['Class',s.className,'Next term begins',r.nextTerm,'Term ended',r.termEnded],
  ['Position in class',m.position,'No. of students in class',m.classSize,'No. of days school opened',r.daysOpened],
  ['Overall total score',m.total,'Class average score',m.classAverage,'No. of days present',r.daysPresent],
  ["Student's average score",m.average,'Overall performance',gradeOf(m.average)[1],'No. of days absent',absent]];
 const rows=subjects.filter(x=>x.total!=null);
 return <div><style>{css}</style><div className="row" style={{marginBottom:8}}><button onClick={png}>Download PNG</button><button onClick={pdf}>Download PDF</button></div>
 <div style={{overflowX:'auto'}}><div ref={ref} className="rc">
  <div style={{display:'flex',alignItems:'center',gap:12}}><img src="/logo.png" width="80" alt=""/><div style={{flex:1}}><div style={{font:'700 30px Georgia,serif',color:T}}>HIGHFLYERS ACADEMY</div>
   <div style={{fontSize:13}}>Raising A Sign And Wonder</div><div>Address: 19 Maternity Road, Ovwian</div><div>Phone No: 08063812091</div><div style={{color:T}}>Email: highflyersacademydelta@gmail.com</div></div>
   {s.photo&&<img src={s.photo} width="80" height="80" style={{objectFit:'cover'}} alt=""/>}</div>
  <div className="c" style={{fontWeight:700,margin:'6px 0 2px'}}>END OF TERM RESULT</div>
  <table><tbody>{info.map((row,i)=><tr key={i}>{[0,2,4].map(j=><><td>{row[j]}</td><td><b>{row[j+1]}</b></td></>)}</tr>)}</tbody></table>
  <table style={{marginTop:6}}><thead><tr><th style={{textAlign:'left'}}>SUBJECT</th><th>C.A (30)</th><th>HP/P (20)</th><th>EXAM (50)</th><th>TOTAL (100)</th><th>CUM. AVG</th><th>GRADE</th><th>SUBJ. POS</th><th>CLASS AVG</th><th>HIGHEST</th><th>LOWEST</th><th>REMARK</th></tr></thead>
   <tbody>{rows.map(x=>{const[g,rm]=gradeOf(x.total);return <tr key={x.subject} className="c"><td style={{textAlign:'left'}}>{x.subject}</td><td>{x.ca}</td><td>{x.project}</td><td>{x.exam}</td><td><b>{x.total}</b></td><td>{x.cumAvg}</td><td>{g}</td><td>{x.position}</td><td>{x.classAvg}</td><td>{x.highest}</td><td>{x.lowest}</td><td>{rm}</td></tr>})}</tbody></table>
  <table style={{marginTop:6}}><tbody><tr style={{verticalAlign:'top'}}>
   <td style={{border:0,padding:'0 3px 0 0',width:'33%'}}><Tbl t="AFFECTIVE TRAITS" items={AFFECTIVE.slice(0,13)} vals={r.affective}/></td>
   <td style={{border:0,padding:'0 3px',width:'33%'}}><Tbl t="AFFECTIVE TRAITS" items={AFFECTIVE.slice(13)} vals={r.affective}/><div style={{height:8}}/><Tbl t="PSYCHOMOTOR SKILLS" items={PSYCHO} vals={r.psycho}/></td>
   <td style={{border:0,padding:'0 0 0 3px'}}><table><thead><tr><th>SCORE RANGE</th><th>GRADE</th><th>MEANING</th></tr></thead><tbody>{RANGE.map(x=><tr key={x[1]} className="c"><td>{x[0]}</td><td>{x[1]}</td><td>{x[2]}</td></tr>)}</tbody></table>
    <div style={{height:8}}/><table><thead><tr><th>KEY</th><th>MEANING</th></tr></thead><tbody>{KEY.map(x=><tr key={x[0]}><td className="c">{x[0]}</td><td>{x[1]}</td></tr>)}</tbody></table></td></tr></tbody></table>
  <table style={{marginTop:6}}><tbody>{[["Academic adviser's report",r.comments?.adviser],["Form master's report",r.comments?.formMaster],["Principal's report",r.comments?.principal],['Promoted to',r.promotedTo]].map(([a,b])=><tr key={a}><td className="g" style={{width:150}}>{a}</td><td>{b}</td></tr>)}</tbody></table>
 </div></div></div>}
export function Preview({studentId,term,session,onClose}){const [d,setD]=useState(null);const [e,setE]=useState('Loading…');
 useEffect(()=>{api(`/api/report?studentId=${studentId}&term=${encodeURIComponent(term)}&session=${encodeURIComponent(session)}`).then(x=>x?(setD(x),setE('')):setE('No result entered yet.')).catch(x=>setE(x.message))},[]);
 return <div style={{position:'fixed',inset:0,background:'#000a',overflow:'auto',zIndex:9,padding:16}}><div style={{background:'#fff',borderRadius:12,padding:16,width:'fit-content',maxWidth:'100%',margin:'auto'}}>
  <button className="alt" onClick={onClose}>Close preview</button> {e}{d&&<ReportCard data={d}/>}</div></div>}
