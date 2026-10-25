'use client';import {useState,useEffect} from 'react';import {api} from '@/lib/client';
export default function Alerts(){const [l,setL]=useState([]);useEffect(()=>{api('/api/notifications').then(setL)},[]);
 return <div className="card">{!l.length&&'No notifications.'}{l.map(n=><p key={n._id}>🔔 {n.message} <small>{new Date(n.createdAt).toLocaleString()}</small></p>)}</div>}
