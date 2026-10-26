let n=0;const bump=d=>{n+=d;if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('loading',{detail:n}))};
export const api=async(u,m='GET',b)=>{bump(1);try{const r=await fetch(u,{method:m,headers:{'Content-Type':'application/json'},body:b&&JSON.stringify(b)});
 const t=await r.text();let d;try{d=JSON.parse(t)}catch{throw new Error(`The server returned an error (code ${r.status}). Please try again, or contact the school if it continues.`)}
 if(!r.ok)throw new Error(d.error||'Something went wrong');return d}finally{bump(-1)}};
// Asks the device for its exact position. Fails (with a clear message) if location is off or blocked.
export const getLocation=()=>new Promise((res,rej)=>{if(typeof navigator==='undefined'||!navigator.geolocation)return rej(new Error('This device or browser does not support location.'));
 navigator.geolocation.getCurrentPosition(p=>res({lat:p.coords.latitude,lng:p.coords.longitude,acc:p.coords.accuracy}),
  e=>rej(new Error(e.code===1?"Location is turned off or blocked for this site. Turn on your phone's location and allow it in the browser, then try again.":e.code===3?'Could not get your location in time. Move to an open area and try again.':'Could not get your location. Please try again.')),
  {enableHighAccuracy:true,timeout:20000,maximumAge:0})});
