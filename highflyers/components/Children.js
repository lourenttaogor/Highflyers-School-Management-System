'use client';import {useState,useEffect} from 'react';import {api} from '@/lib/client';
export default function Children(){const [l,setL]=useState([]);const [f,setF]=useState({examNo:'',fullName:''});const [e,setE]=useState('');
 const load=()=>api('/api/students').then(setL);useEffect(()=>{load()},[]);
 const add=async ev=>{ev.preventDefault();try{await api('/api/children','POST',f);setF({examNo:'',fullName:''});setE('');load()}catch(x){setE(x.message)}};
 return <><form className="card" onSubmit={add}><h3>Add a child</h3><input required placeholder="Exam number" value={f.examNo} onChange={x=>setF({...f,examNo:x.target.value})}/>
  <input required placeholder="Child's full name (as registered)" value={f.fullName} onChange={x=>setF({...f,fullName:x.target.value})}/><button>Add child</button><p className="err">{e}</p></form>
  <div className="card"><div className="grid">{l.map(s=><div key={s._id} className="stu">{s.photo?<img src={s.photo} alt=""/>:<div className="ph" style={{margin:'auto'}}/>}<b>{s.fullName}</b><div>{s.className} · {s.examNo}</div>
  <button className="alt" onClick={async()=>{confirm('Remove from your account?')&&(await api('/api/children?id='+s._id,'DELETE'),load())}}>Remove</button></div>)}</div>{!l.length&&<p>No children added yet.</p>}</div></>}
