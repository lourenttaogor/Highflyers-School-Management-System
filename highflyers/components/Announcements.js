'use client';import {useState,useEffect} from 'react';import {api} from '@/lib/client';
export default function Announcements({user}){const [l,setL]=useState([]);const [f,setF]=useState({title:'',body:'',audience:'all'});const [msg,setMsg]=useState('');
 const load=()=>api('/api/announcements').then(setL);useEffect(()=>{load()},[]);
 const post=async e=>{e.preventDefault();try{await api('/api/announcements','POST',f);setF({...f,title:'',body:''});setMsg('Published — recipients notified ✓');load()}catch(x){setMsg(x.message)}};
 return <>{user.role==='admin'&&<form className="card" onSubmit={post}><h3>New announcement</h3><input required placeholder="Title" value={f.title} onChange={e=>setF({...f,title:e.target.value})}/>
  <select aria-label="Audience" value={f.audience} onChange={e=>setF({...f,audience:e.target.value})}><option value="all">Parents & teachers</option><option value="parents">Parents only</option><option value="teachers">Teachers only</option></select>
  <textarea required style={{width:'100%'}} placeholder="Message" value={f.body} onChange={e=>setF({...f,body:e.target.value})}/><button>Publish & notify</button> <span role="status">{msg}</span></form>}
  {!l.length&&<div className="card">No announcements yet.</div>}
  {l.map(a=><div key={a._id} className="card"><b>{a.title}</b> <small>· {new Date(a.createdAt).toLocaleDateString()} · to {a.audience}</small><p>{a.body}</p>
   {user.role==='admin'&&<button className="alt" onClick={async()=>{confirm('Delete this announcement?')&&(await api('/api/announcements?id='+a._id,'DELETE'),load())}}>Delete</button>}</div>)}</>}
