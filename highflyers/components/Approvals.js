'use client';import {useState,useEffect} from 'react';import {api} from '@/lib/client';import {Preview} from '@/components/ReportCard';
export default function Approvals(){const [l,setL]=useState([]);const [pv,setPv]=useState(null);const load=()=>api('/api/results?status=pending').then(setL);useEffect(()=>{load()},[]);
 const act=async(id,action)=>{await api('/api/results','PATCH',{id,action});load()};
 return <>{!l.length&&<div className="card">No results awaiting approval.</div>}{l.map(r=><div key={r._id} className="card row"><b style={{flex:1}}>{r.student?.fullName} — {r.student?.className} — {r.term} {r.session}</b>
  <button className="alt" onClick={()=>setPv(r)}>Preview</button><button onClick={()=>act(r._id,'approve')}>Publish & notify parent</button><button className="alt" onClick={()=>act(r._id,'reject')}>Send back</button></div>)}
  {pv&&<Preview studentId={pv.student._id} term={pv.term} session={pv.session} onClose={()=>setPv(null)}/>}</>}
