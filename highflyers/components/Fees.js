'use client';import {useState,useEffect,useRef} from 'react';import {api} from '@/lib/client';import {CLASSES,TERMS,SESSION,CUR} from '@/lib/config';
const m=n=>CUR+(n||0).toLocaleString();const bal=r=>!r.due?'—':r.balance<0?`Credit ${m(-r.balance)}`:m(r.balance);const Sel=({v,set,o})=><select value={v} onChange={e=>set(e.target.value)}>{o.map(x=><option key={x}>{x}</option>)}</select>;
const shrink=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const k=Math.min(1,1100/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.7))};i.onerror=rej;i.src=r.result};r.readAsDataURL(f)});
export default function Fees({user}){return user.role==='admin'?<Admin/>:<Parent/>}
function Pay({s,term,onBack}){const [img,setImg]=useState('');const [amt,setAmt]=useState('');const [msg,setMsg]=useState('');const [done,setDone]=useState(false);const ref=useRef();
 const submit=async()=>{try{await api('/api/payments','POST',{studentId:s._id,term,session:SESSION,amount:amt,receipt:img});setDone(true)}catch(x){setMsg(x.message)}};
 return <div className="card"><button className="alt" onClick={onBack}>← Back to fees</button><h3>Pay school fees — {s.fullName} ({term})</h3>
  <table><tbody><tr><td>Account number</td><td><b>0059725939</b></td></tr><tr><td>Account name</td><td><b>Highflyers Leadership</b></td></tr><tr><td>Bank</td><td><b>Union Bank</b></td></tr></tbody></table>
  <p>Make your transfer, then upload a photo of the receipt for the school to confirm.</p>
  {done?<p className="ok" role="status">Submitted ✓ Your payment is now in review. You will be notified once the school confirms it.</p>:<>
   <input ref={ref} type="file" accept="image/*" hidden onChange={async e=>e.target.files[0]&&setImg(await shrink(e.target.files[0]))}/>
   <button onClick={()=>ref.current.click()}>Upload Proof of Payment</button>
   {img&&<div><img src={img} alt="Receipt preview" style={{maxWidth:280,display:'block',margin:'10px 0',border:'1px solid #ccd'}}/><label>Amount paid (optional) <input type="number" value={amt} onChange={e=>setAmt(e.target.value)}/></label><br/><button onClick={submit}>Submit</button></div>}
   <p className="err" role="alert">{msg}</p></>}</div>}
function Parent(){const [k,setK]=useState([]);const [term,setT]=useState(TERMS[0]);const [d,setD]=useState({});const [pay,setPay]=useState(null);
 const load=()=>k.forEach(s=>api(`/api/fees?studentId=${s._id}&term=${term}&session=${SESSION}`).then(r=>setD(x=>({...x,[s._id]:r}))));
 useEffect(()=>{api('/api/students').then(setK)},[]);useEffect(()=>{load()},[k,term]);
 if(pay)return <Pay s={pay} term={term} onBack={()=>{setPay(null);load()}}/>;
 return <><Sel v={term} set={setT} o={TERMS}/>{k.map(s=>{const r=d[s._id];return <div key={s._id} className="card"><h3>{s.fullName} <small>({s.className})</small></h3>
  {r&&<><p>Fee: <b>{m(r.due)}</b> · Paid: <b>{m(r.paid)}</b> · Balance: <b>{bal(r)}</b> · <b className={r.status==='Paid'?'ok':r.status==='In review'?'':'err'}>{r.status}</b></p>
  {r.status==='In review'&&<p>Your proof of payment is being reviewed by the school.</p>}
  {r.payments.map(p=><div key={p._id}><small>{new Date(p.createdAt).toLocaleDateString()} — {m(p.amount)} ({p.method})</small></div>)}
  {r.status!=='Paid'&&<button style={{marginTop:8}} onClick={()=>setPay(s)}>Pay fee</button>}</>}</div>})}
  {!k.length&&<div className="card">Add your child first in the Children tab.</div>}</>}
function Admin(){const [cls,setC]=useState(CLASSES[0]);const [term,setT]=useState(TERMS[0]);const [rows,setR]=useState([]);const [amt,setA]=useState('');const [pf,setPf]=useState([]);const [msg,setMsg]=useState('');const [fe,setFe]=useState({});
 const load=()=>{api(`/api/fees?className=${encodeURIComponent(cls)}&term=${term}&session=${SESSION}`).then(setR);api('/api/payments').then(setPf)};useEffect(()=>{load()},[cls,term]);
 const setFee=async()=>{await api('/api/fees','POST',{kind:'structure',className:cls,term,session:SESSION,amount:amt});setA('');load()};
 const pay=async s=>{const a=+prompt(`Amount paid for ${s.fullName} (${CUR})`);if(!a)return;const method=prompt('Method (Cash / Transfer / POS)','Transfer')||'Cash';
  await api('/api/fees','POST',{kind:'payment',studentId:s._id,term,session:SESSION,amount:a,method});load()};
 const review=async(p,action)=>{let amount,note;if(action==='part'){amount=prompt(`Amount received (${CUR})`,p.amount||'');if(!amount)return}if(action==='reject'){note=prompt('Reason (optional)')||''}
  try{await api('/api/payments','PATCH',{id:p._id,action,amount,note,fee:p.due?undefined:(fe[p._id]??p.amount)});setMsg('Updated ✓');load()}catch(x){setMsg(x.message)}};
 return <>{pf.length>0&&<div className="card warn"><h3>Payments to review ({pf.length})</h3>{pf.map(p=><div key={p._id} className="card"><b>{p.student?.fullName}</b> <small>· {p.student?.className} · {p.term} {p.session} · from {p.by}{p.amount?` · states ${m(p.amount)}`:''}</small>
   <img src={p.receipt} alt="Payment receipt" style={{display:'block',width:300,maxWidth:'100%',margin:'8px 0',cursor:'zoom-in',border:'1px solid #ccd'}} onClick={e=>{e.target.style.width=e.target.style.width==='100%'?'300px':'100%'}}/>
   <p>Fee: <b>{p.due?m(p.due):'not set'}</b> · Confirmed so far: <b>{m(p.paid)}</b> · Balance: <b>{bal(p)}</b></p>{!p.due&&<label>Total fee for {p.student?.className}, {p.term} <input type="number" value={fe[p._id]??p.amount??''} onChange={e=>setFe({...fe,[p._id]:e.target.value})}/></label>}<div className="row"><button onClick={()=>review(p,'paid')}>Paid in full</button><button className="alt" onClick={()=>review(p,'part')}>Part payment</button><button className="alt" onClick={()=>review(p,'reject')}>Not paid</button></div></div>)}<p role="status">{msg}</p></div>}
  <div className="card row"><Sel v={cls} set={setC} o={CLASSES}/><Sel v={term} set={setT} o={TERMS}/><input type="number" placeholder="Fee for this class" value={amt} onChange={e=>setA(e.target.value)}/><button onClick={setFee}>Save fee</button></div>
  <div className="card"><table><thead><tr><th>Learner</th><th>Fee</th><th>Paid</th><th>Balance</th><th>Status</th><th></th></tr></thead><tbody>
  {rows.map(({student:s,...r})=><tr key={s._id}><td>{s.fullName}</td><td>{m(r.due)}</td><td>{m(r.paid)}</td><td>{bal(r)}</td><td className={r.status==='Paid'?'ok':r.status==='In review'?'':'err'}>{r.status}</td><td><button className="alt" onClick={()=>r.due?pay(s):alert('Set the fee for this class and term first, using "Fee for this class" above.')}>Record payment</button></td></tr>)}</tbody></table></div></>}
