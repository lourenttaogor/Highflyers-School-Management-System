'use client';import {useEffect,useState} from 'react';
// Animated loading indicator for any in-flight request, plus a visible "clicked" highlight on buttons/links.
export default function Loader(){const [n,setN]=useState(0);
 useEffect(()=>{const f=e=>setN(e.detail);window.addEventListener('loading',f);
  const click=e=>{const el=e.target.closest?.('button,a,[role=tab]');if(!el)return;el.setAttribute('data-clicked','1');setTimeout(()=>el.removeAttribute('data-clicked'),700)};
  document.addEventListener('click',click);return()=>{window.removeEventListener('loading',f);document.removeEventListener('click',click)}},[]);
 return n>0?<div className="loader" role="status" aria-live="polite" aria-label="Loading"><div className="spin"/></div>:null}
