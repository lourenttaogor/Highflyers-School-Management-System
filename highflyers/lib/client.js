let n=0;const bump=d=>{n+=d;if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('loading',{detail:n}))};
export const api=async(u,m='GET',b)=>{bump(1);try{const r=await fetch(u,{method:m,headers:{'Content-Type':'application/json'},body:b&&JSON.stringify(b)});
 const d=await r.json();if(!r.ok)throw new Error(d.error||'Error');return d}finally{bump(-1)}};
