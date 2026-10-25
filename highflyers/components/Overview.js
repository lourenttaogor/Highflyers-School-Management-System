'use client';import {useState,useEffect} from 'react';import {api} from '@/lib/client';import {CUR} from '@/lib/config';import ClockPanel from '@/components/ClockPanel';
const C=({t,v})=><div className="card" style={{textAlign:'center',margin:0,display:'flex',flexDirection:'column',justifyContent:'center'}}><div style={{fontSize:26,fontWeight:700,color:'#2b2d7e'}}>{v}</div><small>{t}</small></div>;
export default function Overview({user}){const [s,setS]=useState(null);const load=()=>api('/api/stats').then(setS);useEffect(()=>{load()},[]);
 if(!s)return null;const a=user.role==='admin',t=user.role==='teacher';
 return <><h2>Welcome, {user.name}</h2><div className="stats">
  {a&&<><C t="Learners" v={s.students}/><C t="Teachers" v={s.teachers}/><C t="Staff in school now" v={s.clocked}/><C t="Results awaiting approval" v={s.pending}/><C t="Fees collected" v={CUR+s.collected.toLocaleString()}/><C t="Payments to review" v={s.proofs}/></>}
  {t&&<><C t="Assignments posted" v={s.assignments}/><C t="Attendance today" v={s.clockedIn?(s.clockOut?'Clocked out':'Clocked in'):'Not clocked in'}/></>}
  {!a&&!t&&<><C t="My children" v={s.children}/><C t="Notifications" v={s.alerts}/></>}</div>
  {t&&<ClockPanel user={user} onChange={load}/>}</>}
