'use client';import {useState,useEffect} from 'react';import {api} from '@/lib/client';import {CLASSES} from '@/lib/config';
export default function Assignments({user}){const [l,setL]=useState([]);const [f,setF]=useState({className:CLASSES[0],subject:'',title:'',description:'',dueDate:''});
 const load=()=>api('/api/assignments').then(setL);useEffect(()=>{load()},[]);
 const post=async e=>{e.preventDefault();await api('/api/assignments','POST',f);setF({...f,title:'',description:''});load()};
 return <>{user.role!=='parent'&&<form className="card" onSubmit={post}><h3>Post assignment (parents are notified)</h3>
  <select value={f.className} onChange={e=>setF({...f,className:e.target.value})}>{CLASSES.map(c=><option key={c}>{c}</option>)}</select>
  <input required placeholder="Subject" value={f.subject} onChange={e=>setF({...f,subject:e.target.value})}/>
  <input required placeholder="Title" value={f.title} onChange={e=>setF({...f,title:e.target.value})}/><input type="date" value={f.dueDate} onChange={e=>setF({...f,dueDate:e.target.value})}/>
  <textarea style={{width:'100%'}} placeholder="Instructions" value={f.description} onChange={e=>setF({...f,description:e.target.value})}/><button>Post</button></form>}
  {l.map(a=><div key={a._id} className="card"><b>{a.title}</b> <small>· {a.className} · {a.subject} · due {a.dueDate||'—'} · by {a.by}</small><p>{a.description}</p></div>)}</>}
