import {h,guard,today} from '@/lib/auth';import {Attendance} from '@/lib/models';
// Street and community name from coordinates (OpenStreetMap Nominatim). If it can't be reached, the coordinates are still saved.
async function geocode(lat,lng){try{const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${lat}&lon=${lng}`,
  {headers:{'User-Agent':'HighFlyersAcademy-SMS/1.0 (highflyersacademydelta@gmail.com)','Accept-Language':'en'},signal:AbortSignal.timeout(6000)});
 const d=await r.json(),a=d.address||{};
 return {street:a.road||a.pedestrian||a.footway||a.path||'',community:a.neighbourhood||a.suburb||a.village||a.hamlet||a.quarter||a.city_district||'',town:a.city||a.town||a.municipality||a.county||'',state:a.state||'',full:d.display_name||''}}catch{return null}}
const metres=(a,b,c,d)=>{const R=6371000,t=x=>x*Math.PI/180,k=Math.sin(t(c-a)/2)**2+Math.cos(t(a))*Math.cos(t(c))*Math.sin(t(d-b)/2)**2;return Math.round(2*R*Math.asin(Math.sqrt(k)))};
async function place(lat,lng,acc){const g=(await geocode(lat,lng))||{};const sl=+process.env.SCHOOL_LAT,sg=+process.env.SCHOOL_LNG;let dist=null,away=false;
 if(sl&&sg){dist=metres(lat,lng,sl,sg);away=dist>(+process.env.SCHOOL_RADIUS_M||300)}
 return {lat,lng,acc:Math.round(acc)||null,...g,dist,away}}
export const GET=h(async req=>{const u=await guard('admin','teacher');const date=new URL(req.url).searchParams.get('date');let q={};
 if(u.role==='admin'){if(date)q.date=date}else q={$or:[{staff:u.id},{by:u.id},{date:today()}]};
 return Attendance.find(q).populate('staff','name').populate('by','name').populate('outBy','name').sort('-date -clockIn').limit(300)});
// Clocking in/out requires the device's location, which is saved for the admin.
export const POST=h(async req=>{const u=await guard('teacher');const {staffId,action,lat,lng,acc}=await req.json();
 if(!Number.isFinite(+lat)||!Number.isFinite(+lng)||lat==null||Math.abs(lat)>90||Math.abs(lng)>180)throw new Error("Location is required. Turn on your phone's location, allow it for this site, and try again.");
 const loc=await place(+lat,+lng,+acc),q={staff:staffId||u.id,date:today()},ev={type:action,at:new Date(),by:u.id,loc};
 if(action==='in')await Attendance.updateOne(q,{$setOnInsert:{clockIn:new Date(),by:u.id,inLoc:loc},$push:{log:ev}},{upsert:true});
 else if(action==='resume')await Attendance.updateOne(q,{$unset:{clockOut:1,outLoc:1,outBy:1},$push:{log:ev}});
 else await Attendance.updateOne(q,{$set:{clockOut:new Date(),outLoc:loc,outBy:u.id},$push:{log:ev}});
 return {ok:1}});
