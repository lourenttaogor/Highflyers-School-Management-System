'use client';import {useState} from 'react';import {api} from '@/lib/client';
export default function Login(){const [role,setRole]=useState('parent');const [su,setSu]=useState(false);const [f,setF]=useState({name:'',phone:'',email:'',password:''});const [e,setE]=useState('');
 const sign=su&&role==='parent';
 const go=async ev=>{ev.preventDefault();try{await api('/api/auth','POST',{...f,role,mode:sign?'signup':'login'});location.href='/dashboard'}catch(x){setE(x.message)}};
 const inp=(k,ph,type='text')=><input required style={{width:'100%'}} type={type} placeholder={ph} value={f[k]} onChange={x=>setF({...f,[k]:x.target.value})}/>;
 return <main style={{maxWidth:400,marginTop:40}}><form className="card" onSubmit={go} style={{textAlign:'center'}}>
  <img src="/logo.png" width="130" alt="logo"/><h2>High Flyers Academy</h2>
  <div className="row" style={{justifyContent:'center'}}>{['admin','teacher','parent'].map(r=><button type="button" key={r} className={r===role?'on':'alt'} onClick={()=>{setRole(r);setE('');setSu(false)}}>{r[0].toUpperCase()+r.slice(1)}</button>)}</div>
  <p>{role==='teacher'?'Log in with the email the school registered for you.':role==='admin'?'Administrator login':sign?'Create a parent account':'Parent login'}</p>
  {sign&&inp('name','Your full name')}{sign&&inp('phone','Phone number (for SMS alerts)','tel')}{inp('email','Email','email')}{role!=='teacher'&&inp('password','Password','password')}
  <p className="err">{e}</p><button style={{width:'100%'}}>{sign?'Sign up':'Log in'}</button>
  {role==='parent'&&<p><button type="button" className="alt" onClick={()=>{setSu(!su);setE('')}}>{su?'Have an account? Log in':'New parent? Sign up'}</button></p>}</form></main>}
