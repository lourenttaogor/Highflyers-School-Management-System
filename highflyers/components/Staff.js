'use client';import {useState,useEffect} from 'react';import {api} from '@/lib/client';
export default function Staff(){const [l,setL]=useState([]);const [f,setF]=useState({name:'',email:'',phone:''});const [err,setErr]=useState('');
 const load=()=>api('/api/users').then(setL);useEffect(()=>{load()},[]);
 const add=async e=>{e.preventDefault();try{await api('/api/users','POST',f);setF({name:'',email:'',phone:''});setErr('');load()}catch(x){setErr(x.message)}};
 return <><form className="card" onSubmit={add}><h3>Add teacher (they log in with this email)</h3>
  <input required placeholder="Full name" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
  <input required type="email" placeholder="Email" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/><input type="tel" placeholder="Phone (for SMS alerts)" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/><button>Add</button><span className="err"> {err}</span></form>
  <div className="card"><table><tbody>{l.map(s=><tr key={s._id}><td>{s.name}</td><td>{s.email}</td><td>{s.role}</td>
  <td>{s.role==='teacher'&&<button className="alt" onClick={async()=>{confirm('Remove '+s.name+'?')&&(await api('/api/users?id='+s._id,'DELETE'),load())}}>Remove</button>}</td></tr>)}</tbody></table></div></>}
