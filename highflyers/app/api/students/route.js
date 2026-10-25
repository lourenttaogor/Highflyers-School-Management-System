import {h,guard,kids} from '@/lib/auth';import {Student} from '@/lib/models';
export const GET=h(async req=>{const u=await guard();const c=new URL(req.url).searchParams.get('className');
 if(u.role==='parent')return Student.find({_id:{$in:await kids(u)}});
 return Student.find(c?{className:c}:{}).sort('fullName')});
// Exam number is generated automatically: HFA/<admission session>/<random 4 digits>, e.g. HFA/23/24/0987
export const POST=h(async req=>{await guard('admin');const b=await req.json();const m=/^(\d{4})\/(\d{4})$/.exec((b.admissionSession||'').trim());
 if(!m)throw new Error('Admission session must look like 2023/2024');
 let examNo;for(let i=0;i<50&&!examNo;i++){const c=`HFA/${m[1].slice(2)}/${m[2].slice(2)}/${String(Math.floor(Math.random()*10000)).padStart(4,'0')}`;if(!(await Student.exists({examNo:c})))examNo=c}
 if(!examNo)throw new Error('Could not generate a unique exam number, please try again');
 return Student.create({...b,examNo,admissionSession:`${m[1]}/${m[2]}`})});
export const DELETE=h(async req=>{await guard('admin');await Student.findByIdAndDelete(new URL(req.url).searchParams.get('id'));return {ok:1}});
export const PATCH=h(async req=>{await guard('admin');const {id,language,religion,trade}=await req.json();await Student.updateOne({_id:id},{language,religion,trade});return {ok:1}});
