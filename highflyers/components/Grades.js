'use client';import {useState,useEffect,useRef} from 'react';import {api} from '@/lib/client';import {CLASSES,TERMS,SESSION,AFFECTIVE,PSYCHO} from '@/lib/config';import {Preview} from '@/components/ReportCard';
const init=r=>({affective:r?.affective||{},psycho:r?.psycho||{},comments:{adviser:'',formMaster:'',principal:'',...(r?.comments||{})},daysOpened:r?.daysOpened??'',daysPresent:r?.daysPresent??'',nextTerm:r?.nextTerm||'',termEnded:r?.termEnded||'',promotedTo:r?.promotedTo||''});
export default function Grades({user}){const [term,setTerm]=useState(TERMS[0]);const [session,setSession]=useState(SESSION);const [sd,setSd]=useState(SESSION);const [cls,setCls]=useState('');const [stu,setStu]=useState([]);const [s,setS]=useState(null);
 const [res,setRes]=useState(null);const [reg,setReg]=useState(null);const [warn,setWarn]=useState([]);const [sub,setSub]=useState(null);const [v,setV]=useState({ca:'',project:'',exam:''});const [d,setD]=useState(init());const [tab,setTab]=useState('scores');const [msg,setMsg]=useState('');const [pv,setPv]=useState(false);
 const dirty=useRef(false),dd=useRef(false);
 const q=()=>`studentId=${s._id}&term=${encodeURIComponent(term)}&session=${encodeURIComponent(session)}`;const base=()=>({studentId:s._id,term,session});
 useEffect(()=>{cls&&api('/api/students?className='+encodeURIComponent(cls)).then(setStu)},[cls]);
 useEffect(()=>{setSub(null);setRes(null);setReg(null);setWarn([]);setD(init());s&&Promise.all([api('/api/results?'+q()),api('/api/registration?'+q())]).then(([r,g])=>{setRes(r);setD(init(r));setReg(g.reg);setWarn(g.warn)})},[s,term,session]);
 const save=async()=>{if(!sub||!dirty.current)return;dirty.current=false;try{setRes(await api('/api/results','PUT',{...base(),subject:sub.name,...v}));setMsg('Saved ✓')}catch(x){setMsg(x.message)}};
 const saveD=async()=>{if(!s||!dd.current)return;dd.current=false;try{setRes(await api('/api/results','PUT',{kind:'details',...base(),...d}));setMsg('Saved ✓')}catch(x){setMsg(x.message)}};
 const flush=async()=>{await save();await saveD()};
 const open=async x=>{await save();const e=res?.scores?.find(i=>i.subject===x.name);setV({ca:e?.ca??'',project:e?.project??'',exam:e?.exam??''});setSub(x);setMsg('')};
 const setSc=k=>e=>{dirty.current=true;setV({...v,[k]:e.target.value})};const det=fn=>{dd.current=true;setD(fn)};
 const act=async action=>{await flush();try{const r=await api('/api/results?'+q());if(!r)throw new Error('Enter scores first');await api('/api/results','PATCH',{id:r._id,action});
  setMsg(action==='submit'?'Submitted for admin approval':'Published — parents notified');setRes(await api('/api/results?'+q()))}catch(x){setMsg(x.message)}};
 const R=(k,t)=><select value={d[k][t]||''} onChange={e=>det(x=>({...x,[k]:{...x[k],[t]:e.target.value}}))}><option value="">—</option>{[5,4,3,2,1].map(n=><option key={n}>{n}</option>)}</select>;
 const F=(k,l,type='text')=><label>{l} <input type={type} value={d[k]} onChange={e=>det(x=>({...x,[k]:e.target.value}))}/></label>;
 const subs=reg?.subjects||[],done=n=>res?.scores?.some(i=>i.subject===n),nd=subs.filter(x=>done(x.name)).length,total=(+v.ca||0)+(+v.project||0)+(+v.exam||0);
 return <><div className="card"><h3>1. Term, session & class</h3><div className="row"><select aria-label="Term" value={term} onChange={async e=>{await flush();setTerm(e.target.value)}}>{TERMS.map(t=><option key={t}>{t}</option>)}</select>
  <input aria-label="Session" value={sd} placeholder="Session e.g. 2025/2026" onChange={e=>setSd(e.target.value)} onBlur={async()=>{if(sd!==session){await flush();setSession(sd)}}}/></div>
  <div className="row" style={{marginTop:8}}>{CLASSES.map(c=><button key={c} aria-pressed={c===cls} className={c===cls?'on':'alt'} onClick={async()=>{await flush();setCls(c);setS(null)}}>{c}</button>)}</div></div>
  {cls&&<div className="card"><h3>2. Learner</h3><div className="row">{stu.map(x=><button key={x._id} aria-pressed={s?._id===x._id} className={s?._id===x._id?'on':'alt'} onClick={async()=>{await flush();setS(x)}}>{x.fullName}</button>)}</div></div>}
  {s&&<div className="card"><h3>3. {s.fullName} <small>Status: {res?.status||'not started'}</small></h3>
   {warn.length>0&&<p className="err" role="alert">Registration incomplete: {warn.join(', ')}. Ask the admin to update the learner's profile (Curriculum → Student registration).</p>}
   <div className="row"><button className={tab==='scores'?'on':'alt'} onClick={async()=>{await flush();setTab('scores')}}>Subject scores</button><button className={tab==='details'?'on':'alt'} onClick={async()=>{await flush();setTab('details')}}>Ratings, comments & attendance</button></div>
   {tab==='scores'&&<>{!subs.length&&<p>No subjects are registered for this learner in this session and term. The admin must configure the class curriculum first.</p>}
    <div className="row" style={{margin:'8px 0'}}>{subs.map(x=><button key={x.name} aria-pressed={x.name===sub?.name} className={x.name===sub?.name?'on':'alt'} onClick={()=>open(x)}>{done(x.name)?'✓ ':''}{x.name}</button>)}</div>
    {sub&&<table><caption style={{textAlign:'left'}}><b>{sub.name}</b></caption><thead><tr><th>C.A. ({sub.ca})</th><th>HP/P ({sub.project})</th><th>Exam ({sub.exam})</th><th>Total (100)</th></tr></thead><tbody><tr>
     {[['ca',sub.ca],['project',sub.project],['exam',sub.exam]].map(([k,m])=><td key={k}><input type="number" min="0" max={m} aria-label={k} style={{width:90}} value={v[k]} onChange={setSc(k)} onBlur={save}/></td>)}<td><b>{total}</b></td></tr></tbody></table>}</>}
   {tab==='details'&&<div onBlur={saveD} style={{marginTop:8}}><h4>Affective traits (5 = excellent … 1 = none)</h4><div className="grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))'}}>{AFFECTIVE.map(t=><label key={t}>{t} {R('affective',t)}</label>)}</div>
    <h4>Psychomotor skills</h4><div className="grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))'}}>{PSYCHO.map(t=><label key={t}>{t} {R('psycho',t)}</label>)}</div>
    <h4>Attendance & dates</h4><div className="row">{F('daysOpened','Days school opened','number')}{F('daysPresent','Days present','number')}{F('termEnded','Term ended','date')}{F('nextTerm','Next term begins','date')}{F('promotedTo','Promoted to')}</div>
    <h4>Comments</h4>{[['adviser',"Academic adviser's report"],['formMaster',"Form master's report"],['principal',"Principal's report"]].map(([k,l])=><textarea key={k} style={{width:'100%'}} placeholder={l} aria-label={l} value={d.comments[k]} onChange={e=>det(x=>({...x,comments:{...x.comments,[k]:e.target.value}}))}/>)}</div>}</div>}
  {s&&<div className="card row"><button className="alt" onClick={async()=>{await flush();setPv(true)}}>Preview result</button>
   <button onClick={()=>act('submit')} disabled={!res||!subs.length||nd<subs.length||['pending','approved'].includes(res.status)}>Submit for approval ({nd}/{subs.length} subjects)</button>
   {user.role==='admin'&&<button onClick={()=>act('approve')} disabled={!res||nd<subs.length||res.status==='approved'}>Publish to parents</button>}<span role="status">{msg}</span></div>}
  {pv&&<Preview studentId={s._id} term={term} session={session} onClose={()=>setPv(false)}/>}</>}
