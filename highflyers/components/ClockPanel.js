'use client';import {useState,useEffect} from 'react';import {api} from '@/lib/client';
const t=d=>d?new Date(d).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'—';
// Teacher clock-in panel: clock yourself in/out, or clock in a friend.
export default function ClockPanel({user,onChange}){const [staff,setS]=useState([]);const [rec,setR]=useState([]);const [fr,setFr]=useState('');const [msg,setMsg]=useState('');const td=new Date().toISOString().slice(0,10);
 const load=()=>Promise.all([api('/api/users'),api('/api/attendance')]).then(([s,r])=>{setS(s.filter(x=>x.role==='teacher'));setR(r)});useEffect(()=>{load()},[]);
 const act=async(id,action)=>{try{await api('/api/attendance','POST',{staffId:id,action});setMsg('');await load();onChange&&onChange()}catch(e){setMsg(e.message)}};
 const today=id=>rec.find(x=>x.date===td&&x.staff?._id===id);
 const Btns=({id,r})=><>{!r&&<button onClick={()=>act(id,'in')}>Clock in</button>}{r&&!r.clockOut&&<button className="on" onClick={()=>act(id,'out')}>Clock out</button>}{r?.clockOut&&<button className="alt" onClick={()=>act(id,'resume')}>Clock in again</button>}</>;
 const me=today(user.id),friends=staff.filter(s=>s._id!==user.id),f=friends.find(s=>s._id===fr),fr2=f&&today(f._id);
 return <><div className="card"><h3>Clock in / out — me</h3><p>{me?<>Clocked in at <b>{t(me.clockIn)}</b>{me.clockOut&&<> · clocked out at <b>{t(me.clockOut)}</b></>}</>:'You have not clocked in today.'}</p><div className="row"><Btns id={user.id} r={me}/></div></div>
  <div className="card"><h3>Clock in a friend</h3>{!friends.length?<p>No other teachers have been added yet. The admin can add them in the Staff tab.</p>:<>
   <select aria-label="Choose a colleague" value={fr} onChange={e=>setFr(e.target.value)}><option value="">Choose a colleague…</option>{friends.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}</select>
   {f&&<div className="row" style={{marginTop:8}}><b style={{minWidth:160}}>{f.name}</b><span>In: <b>{t(fr2?.clockIn)}</b> · Out: <b>{t(fr2?.clockOut)}</b></span><Btns id={f._id} r={fr2}/></div>}</>}
   <p className="err" role="alert">{msg}</p></div></>}
