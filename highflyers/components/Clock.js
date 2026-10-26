'use client';import {useState,useEffect} from 'react';import {api} from '@/lib/client';import ClockPanel from '@/components/ClockPanel';
const t=d=>d?new Date(d).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'—';
const day=d=>new Date(d+'T00:00:00').toLocaleDateString([],{weekday:'short',day:'numeric',month:'short',year:'numeric'});
export default function Clock({user}){return user.role==='admin'?<Admin/>:<Teacher user={user}/>}
function Loc({l,on}){if(!on)return null;if(!l)return <div><small>No location recorded</small></div>;
 const d=l.dist>=1000?(l.dist/1000).toFixed(1)+' km':l.dist+' m';
 return <div style={{marginTop:4}}><div>📍 <b>{[l.street,l.community].filter(Boolean).join(', ')||'Street not found'}</b></div><small>{[l.town,l.state].filter(Boolean).join(', ')}</small>
  <div>{l.dist!=null&&<span className={'badge '+(l.away?'school':'nerdc')}>{l.away?`Away from school · ${d}`:'At school'}</span>} <a href={`https://www.google.com/maps?q=${l.lat},${l.lng}`} target="_blank" rel="noreferrer">Map</a>{l.acc&&<small> · ±{l.acc} m</small>}</div></div>}
function Admin(){const [rec,setR]=useState([]);const [date,setD]=useState('');
 useEffect(()=>{api('/api/attendance'+(date?'?date='+date:'')).then(setR)},[date]);
 return <div className="card"><h3>Staff attendance</h3><div className="row"><label>Filter by day <input type="date" value={date} onChange={e=>setD(e.target.value)}/></label>{date&&<button className="alt" onClick={()=>setD('')}>Show all days</button>}</div>
  <table><thead><tr><th>Date</th><th>Staff</th><th>Clocked in</th><th>Clocked out</th></tr></thead><tbody>
  {rec.map(r=><tr key={r._id} style={{verticalAlign:'top'}}><td>{day(r.date)}</td><td>{r.staff?.name}</td>
   <td><b>{t(r.clockIn)}</b>{r.by&&r.by._id!==r.staff?._id&&<small> · by {r.by.name}</small>}<Loc l={r.inLoc} on={r.clockIn}/></td>
   <td><b>{t(r.clockOut)}</b>{r.outBy&&r.outBy._id!==r.staff?._id&&<small> · by {r.outBy.name}</small>}<Loc l={r.outLoc} on={r.clockOut}/></td></tr>)}</tbody></table>{!rec.length&&<p>No attendance records.</p>}</div>}
function Teacher({user}){const [rec,setR]=useState([]);const load=()=>api('/api/attendance').then(setR);useEffect(()=>{load()},[]);
 const mine=rec.filter(r=>r.staff?._id===user.id),others=rec.filter(r=>r.by?._id===user.id&&r.staff?._id!==user.id);
 return <><ClockPanel user={user} onChange={load}/>
  <div className="card"><h3>My attendance days</h3><table><thead><tr><th>Date</th><th>In</th><th>Out</th><th>Clocked by</th></tr></thead><tbody>
  {mine.map(r=><tr key={r._id}><td>{day(r.date)}</td><td>{t(r.clockIn)}</td><td>{t(r.clockOut)}</td><td>{r.by?._id===user.id?'Self':r.by?.name}</td></tr>)}</tbody></table></div>
  <div className="card"><h3>Staff I clocked in</h3><table><thead><tr><th>Date</th><th>Staff</th><th>In</th><th>Out</th></tr></thead><tbody>
  {others.map(r=><tr key={r._id}><td>{day(r.date)}</td><td>{r.staff?.name}</td><td>{t(r.clockIn)}</td><td>{t(r.clockOut)}</td></tr>)}</tbody></table></div></>}
