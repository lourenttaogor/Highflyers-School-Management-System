'use client';import {useState,useEffect} from 'react';import {api} from '@/lib/client';import {LEVELS,CLASSES,CLASS_LEVEL,TERMS,SESSION,LANGS} from '@/lib/config';
const Badge=({o,s})=><span className={'badge '+(o?'nerdc':'school')}>{s||(o?'NERDC':'School-defined')}</span>;
const Sel=({v,set,o,l})=><select aria-label={l} value={v} onChange={e=>set(e.target.value)}>{o.map(x=><option key={x}>{x}</option>)}</select>;
export default function Curriculum(){const [tab,setTab]=useState('Catalogue');
 return <><div className="row" role="tablist" style={{marginBottom:12}}>{['Catalogue','Class setup','Student registration'].map(t=><button key={t} role="tab" aria-selected={t===tab} className={t===tab?'on':'alt'} onClick={()=>setTab(t)}>{t}</button>)}</div>
  {tab==='Catalogue'?<Catalogue/>:tab==='Class setup'?<ClassSetup/>:<Registration/>}</>}
function Catalogue(){const [d,setD]=useState({versions:[],catalogue:[]});const [f,setF]=useState({name:'',kind:'core',levels:[]});const [msg,setMsg]=useState('');const [fs,setFs]=useState(SESSION),[ft,setFt]=useState(TERMS[0]);
 const load=()=>api('/api/curriculum').then(setD);useEffect(()=>{load()},[]);
 const post=async b=>{try{await api('/api/curriculum','POST',b);setMsg('');load()}catch(e){setMsg(e.message)}};
 const groups=[...new Set(d.catalogue.map(c=>c.group))];const tg=l=>setF({...f,levels:f.levels.includes(l)?f.levels.filter(x=>x!==l):[...f.levels,l]});
 return <>{d.versions.map(v=><div key={v._id} className={'card'+(v.status==='confirmed'?'':' warn')}><b>{v.name}</b> <span className="badge">{v.status}</span> <Badge o={v.official}/><p><small>Source: {v.source}</small></p>
  {v.status!=='confirmed'&&<><p>⚠ Check every subject below against the official NERDC documents. Edit or remove anything wrong, then confirm. Confirming automatically adds these subjects to every class; you can then remove any a class does not need.</p><div className="row"><label>Effective from <input value={fs} onChange={e=>setFs(e.target.value)}/></label><Sel l="Term" v={ft} set={setFt} o={TERMS}/><button onClick={()=>post({action:'confirm',id:v._id,fromSession:fs,fromTerm:ft})}>I have reviewed it — confirm and add to all classes</button></div></>}
  {v.confirmedBy&&<small>Confirmed by {v.confirmedBy} on {new Date(v.confirmedAt).toLocaleDateString()}</small>}</div>)}
  {!d.versions.some(v=>v.official)&&<div className="card"><button onClick={()=>post({action:'seed'})}>Import NERDC starter catalogue (as unverified draft)</button></div>}
  <p className="err" role="alert">{msg}</p>
  {groups.map(g=><div key={g} className="card"><h3>{g}</h3><table><tbody>{d.catalogue.filter(c=>c.group===g).map(c=><tr key={c._id}><td>{c.name}</td><td><Badge o={c.official} s={c.src}/></td><td>{c.kind}{c.religion?' · '+c.religion:''}</td><td><small>{c.levels.length>3?`${c.levels[0]} … ${c.levels[c.levels.length-1]}`:c.levels.join(', ')}</small></td>
   <td><button className="alt" onClick={()=>post({action:'remove',id:c._id})}>Remove</button></td></tr>)}</tbody></table></div>)}
</>}
function ClassSetup(){const [lv,setLv]=useState(LEVELS[0]);const [list,setL]=useState([]);const [cat,setCat]=useState([]);const [staff,setSt]=useState([]);const [ses,setSes]=useState(SESSION);const [term,setT]=useState(TERMS[0]);const [msg,setMsg]=useState('');const [pick,setPick]=useState('');const [nm,setNm]=useState('');
 const load=()=>api('/api/class-subjects?level='+encodeURIComponent(lv)).then(setL);
 useEffect(()=>{load();api('/api/curriculum').then(d=>setCat(d.catalogue.filter(c=>d.versions.find(v=>v._id===c.version)?.status==='confirmed'&&c.levels.includes(lv)&&c.kind!=='tradeoption')))},[lv]);
 useEffect(()=>{api('/api/users').then(u=>setSt(u.filter(x=>x.role==='teacher')))},[]);
 const call=async(m,url,b)=>{try{const r=await api(url,m,b);setMsg(r?.added!=null?`Added ${r.added} subjects ✓`:'Saved ✓');load()}catch(e){setMsg(e.message)}};
 const eff={level:lv,fromSession:ses,fromTerm:term};const patch=(id,b)=>call('PATCH','/api/class-subjects',{id,...b});
 const act=list.filter(c=>!c.toSession),old=list.filter(c=>c.toSession);const cls=CLASSES.filter(c=>CLASS_LEVEL[c]===lv);
 return <><div className="card"><h3>Curriculum level</h3><div className="row">{LEVELS.map(l=><button key={l} aria-pressed={l===lv} className={l===lv?'on':'alt'} onClick={()=>setLv(l)}>{l}</button>)}</div>
  <p><small>School classes at this level: {cls.join(', ')||'none mapped'}</small></p>
  <div className="row"><b>Changes take effect from:</b><input aria-label="Session" value={ses} onChange={e=>setSes(e.target.value)}/><Sel l="Term" v={term} set={setT} o={TERMS}/></div><p role="status">{msg}</p></div>
  <div className="card"><h3>{lv} — active subjects ({act.length})</h3>{!act.length&&<p>No subjects yet. If the catalogue has not been confirmed, confirm it in the Catalogue tab and subjects are added to every class automatically.</p>}
  <table><thead><tr><th>Subject</th><th>Optional</th><th>Teacher</th><th>C.A.</th><th>HP/P</th><th>Exam</th><th></th></tr></thead><tbody>{act.map(c=><tr key={c._id}>
   <td>{c.name} <Badge o={c.official} s={c.src}/><br/><small>{c.kind}{c.religion?' · '+c.religion:''} · from {c.fromSession==='2000/2001'?'the start':`${c.fromTerm} ${c.fromSession}`}{c.kind==='language'?' · each student\'s language is set in Student registration':''}{c.kind==='trade'?' · each student selects a trade':''}</small></td>
   <td><input type="checkbox" aria-label={'Optional: '+c.name} checked={!!c.optional} onChange={e=>patch(c._id,{optional:e.target.checked})}/></td>
   <td><select aria-label={'Teacher for '+c.name} value={c.teacher?._id||''} onChange={e=>patch(c._id,{teacher:e.target.value})}><option value="">—</option>{staff.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}</select></td>
   {['ca','project','exam'].map(k=><td key={k}><input type="number" aria-label={k+' max for '+c.name} style={{width:64}} defaultValue={c[k]} onBlur={e=>+e.target.value!==c[k]&&patch(c._id,{[k]:e.target.value})}/></td>)}
   <td><button className="alt" onClick={()=>confirm(`End ${c.name} from ${term} ${ses}? Past results are kept.`)&&call('DELETE',`/api/class-subjects?id=${c._id}&session=${encodeURIComponent(ses)}&term=${encodeURIComponent(term)}`)}>Remove</button></td></tr>)}</tbody></table>
  <small>Maxima must total 100. Changes apply to registrations created afterwards; existing student registrations keep their original maxima.</small></div>
  {old.length>0&&<div className="card"><h3>Removed subjects</h3>{old.map(c=><div key={c._id} className="row"><small style={{flex:1}}>{c.name} — removed from {c.toTerm} {c.toSession}</small><button className="alt" onClick={()=>call('POST','/api/class-subjects',{action:'restore',id:c._id,...eff})}>Restore</button></div>)}</div>}</>}
function Registration(){const [cls,setCls]=useState('');const [stu,setStu]=useState([]);const [s,setS]=useState(null);const [ses,setSes]=useState(SESSION);const [term,setT]=useState(TERMS[0]);const [reg,setReg]=useState(null);const [warn,setW]=useState([]);const [cs,setCs]=useState([]);const [trades,setTr]=useState([]);const [p,setP]=useState({language:'',religion:'',trade:''});const [msg,setMsg]=useState('');const [add,setAdd]=useState('');
 useEffect(()=>{cls&&api('/api/students?className='+encodeURIComponent(cls)).then(setStu)},[cls]);
 useEffect(()=>{api('/api/curriculum').then(d=>setTr([...new Set(d.catalogue.filter(c=>c.kind==='tradeoption').map(c=>c.name))]))},[]);
 const q=()=>`studentId=${s._id}&session=${encodeURIComponent(ses)}&term=${encodeURIComponent(term)}`;
 const load=()=>api('/api/registration?'+q()).then(g=>{setReg(g.reg);setW(g.warn);setCs(g.cs)});
 useEffect(()=>{if(!s)return;setP({language:s.language||'',religion:s.religion||'',trade:s.trade||''});load()},[s?._id,ses,term]);
 const saveP=async()=>{await api('/api/students','PATCH',{id:s._id,...p});setStu(stu.map(x=>x._id===s._id?{...x,...p}:x));setMsg('Profile saved ✓ — use "Add missing subjects" to refresh the registration');load()};
 const put=async(action,b={})=>{try{await api('/api/registration','PUT',{studentId:s._id,session:ses,term,action,...b});setMsg('Updated ✓');load()}catch(e){setMsg(e.message)}};
 const cand=cs.filter(c=>c.optional&&!reg?.subjects.some(x=>x.name===c.name));
 return <><div className="card"><div className="row"><Sel l="Term" v={term} set={setT} o={TERMS}/><input aria-label="Session" value={ses} onChange={e=>setSes(e.target.value)}/></div>
  <div className="row" style={{marginTop:8}}>{CLASSES.map(c=><button key={c} aria-pressed={c===cls} className={c===cls?'on':'alt'} onClick={()=>{setCls(c);setS(null)}}>{c}</button>)}</div>
  {cls&&<div className="row" style={{marginTop:8}}>{stu.map(x=><button key={x._id} aria-pressed={s?._id===x._id} className={s?._id===x._id?'on':'alt'} onClick={()=>setS(x)}>{x.fullName}</button>)}</div>}</div>
  {s&&<><div className="card"><h3>{s.fullName} — profile</h3><label>Religion <select value={p.religion} onChange={e=>setP({...p,religion:e.target.value})}><option value="">—</option><option value="CRS">Christian Religious Studies</option><option value="IRS">Islamic Studies</option></select></label>
   <button onClick={saveP}>Save profile</button></div>
  <div className="card"><h3>Registered subjects — {term} {ses}</h3>
   {warn.length>0&&<p className="err" role="alert">Incomplete: {warn.join(', ')}.</p>}{!reg&&<p>No subjects configured for this class yet. Set up the class curriculum first.</p>}
   {reg?.subjects.map(x=><div key={x.name} className="row"><span style={{flex:1}}>{x.name} <Badge o={x.official}/> <small>{x.ca}/{x.project}/{x.exam}</small></span><button className="alt" onClick={()=>put('remove',{name:x.name})}>Remove</button></div>)}
   {reg&&<div className="row" style={{marginTop:8}}><button onClick={()=>put('regenerate')}>Add missing subjects</button>
    <select aria-label="Optional subject" value={add} onChange={e=>setAdd(e.target.value)}><option value="">Add optional / elective subject…</option>{cand.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select><button disabled={!add} onClick={()=>{put('add',{csId:add});setAdd('')}}>Add</button></div>}
   <p role="status">{msg}</p></div></>}</>}
