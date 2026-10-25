'use client';import {useState,useEffect} from 'react';import {api} from '@/lib/client';import {CLASSES,SESSION} from '@/lib/config';
export default function Students({user}){const [cls,setCls]=useState('');const [list,setList]=useState([]);const [err,setErr]=useState('');const [ok,setOk]=useState('');
 const [f,setF]=useState({fullName:'',admissionSession:SESSION,age:'',gender:'Male',className:CLASSES[0],photo:''});
 const load=c=>api('/api/students?className='+encodeURIComponent(c)).then(setList);useEffect(()=>{cls&&load(cls)},[cls]);
 const photo=e=>{const r=new FileReader();r.onload=()=>setF({...f,photo:r.result});r.readAsDataURL(e.target.files[0])};
 const add=async e=>{e.preventDefault();try{const s=await api('/api/students','POST',f);setF({...f,fullName:'',age:'',photo:''});setErr('');setOk(`Added ${s.fullName} — exam number ${s.examNo}`);cls&&load(cls)}catch(x){setOk('');setErr(x.message)}};
 return <>{user.role==='admin'&&<form className="card" onSubmit={add}><h3>Add learner</h3>
  <input required placeholder="Full name" value={f.fullName} onChange={e=>setF({...f,fullName:e.target.value})}/>
  <input required aria-label="Admission session" placeholder="Admission session e.g. 2023/2024" value={f.admissionSession} onChange={e=>setF({...f,admissionSession:e.target.value})}/>
  <input required type="number" placeholder="Age" value={f.age} onChange={e=>setF({...f,age:e.target.value})}/>
  <select aria-label="Gender" value={f.gender} onChange={e=>setF({...f,gender:e.target.value})}><option>Male</option><option>Female</option></select>
  <select aria-label="Class" value={f.className} onChange={e=>setF({...f,className:e.target.value})}>{CLASSES.map(c=><option key={c}>{c}</option>)}</select>
  <input type="file" accept="image/*" aria-label="Photo" onChange={photo}/><button>Add</button><p><small>The exam number is generated automatically (e.g. HFA/23/24/0987).</small></p><p className="ok" role="status">{ok}</p><p className="err" role="alert">{err}</p></form>}
  <div className="card"><h3>Classes</h3><div className="row">{CLASSES.map(c=><button key={c} aria-pressed={c===cls} className={c===cls?'on':'alt'} onClick={()=>setCls(c)}>{c}</button>)}</div></div>
  {cls&&<div className="card"><h3>{cls} — {list.length} learners</h3><div className="grid">{list.map(s=><div key={s._id} className="stu">
   {s.photo?<img src={s.photo} alt=""/>:<div className="ph" style={{margin:'auto'}}/>}<b>{s.fullName}</b><div>{s.examNo} · {s.age}yrs</div>
   {user.role==='admin'&&<button className="alt" onClick={async()=>{confirm('Remove learner?')&&(await api('/api/students?id='+s._id,'DELETE'),load(cls))}}>Remove</button>}</div>)}</div></div>}</>}
