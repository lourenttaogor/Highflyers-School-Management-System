'use client';import {useState,useEffect} from 'react';import {api} from '@/lib/client';
import Students from '@/components/Students';import Staff from '@/components/Staff';import Clock from '@/components/Clock';
import Assignments from '@/components/Assignments';import Grades from '@/components/Grades';import Approvals from '@/components/Approvals';
import ParentResults from '@/components/ParentResults';import Alerts from '@/components/Alerts';import Overview from '@/components/Overview';import Children from '@/components/Children';import Fees from '@/components/Fees';import Curriculum from '@/components/Curriculum';import Announcements from '@/components/Announcements';
const TABS={admin:['Overview','Students','Curriculum','Staff','Attendance','Assignments','Fees','Approvals','Announcements','Alerts'],teacher:['Overview','Students','Clock','Assignments','Grades','Announcements','Alerts'],parent:['Overview','Children','Results','Fees','Assignments','Announcements','Alerts']};
export default function Dash(){const [u,setU]=useState(null);const [t,setT]=useState('');
 useEffect(()=>{api('/api/auth').then(d=>{if(!d.user){location.href='/';return}setU(d.user);setT(TABS[d.user.role][0])})},[]);
 if(!u)return null;const V={Overview,Children,Fees,Curriculum,Announcements,Students,Staff,Attendance:Clock,Clock,Assignments,Grades,Approvals,Results:ParentResults,Alerts}[t];
 return <><header><img src="/logo.png" alt=""/><b>High Flyers Academy — {u.role}</b><span>{u.name}</span>
  <button className="alt" onClick={async()=>{await api('/api/auth','DELETE');location.href='/'}}>Logout</button></header>
  <nav>{TABS[u.role].map(x=><button key={x} aria-current={x===t} className={x===t?'on':'alt'} onClick={()=>setT(x)}>{x}</button>)}</nav>
  <main id="main">{V&&<V user={u}/>}</main></>}
