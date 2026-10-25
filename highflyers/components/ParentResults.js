'use client';import {useState,useEffect} from 'react';import {api} from '@/lib/client';import {TERMS,SESSION} from '@/lib/config';import ReportCard from '@/components/ReportCard';
export default function ParentResults(){const [kids,setK]=useState([]);const [s,setS]=useState(null);const [term,setT]=useState(TERMS[0]);const [session,setSe]=useState(SESSION);const [d,setD]=useState(null);
 useEffect(()=>{api('/api/students').then(k=>{setK(k);setS(k[0])})},[]);
 useEffect(()=>{setD(null);s&&api(`/api/report?studentId=${s._id}&term=${encodeURIComponent(term)}&session=${encodeURIComponent(session)}`).then(setD)},[s,term,session]);
 return <><div className="card row">{kids.map(k=><button key={k._id} className={k._id===s?._id?'on':'alt'} onClick={()=>setS(k)}>{k.fullName}</button>)}
  <select value={term} onChange={e=>setT(e.target.value)}>{TERMS.map(t=><option key={t}>{t}</option>)}</select><input value={session} onChange={e=>setSe(e.target.value)} placeholder="Session"/></div>
  {d?<div className="card"><ReportCard data={d}/></div>:<div className="card">{kids.length?'No published result for this term yet.':'Add your child first in the Children tab.'}</div>}</>}
