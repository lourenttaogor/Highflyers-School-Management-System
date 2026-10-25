import {h,me,sign} from '@/lib/auth';import {User} from '@/lib/models';import bcrypt from 'bcryptjs';import {cookies} from 'next/headers';
export const GET=h(async()=>({user:await me()}));
export const POST=h(async req=>{const b=await req.json();const email=b.email?.toLowerCase().trim();let u;
 if(b.mode==='signup'){
  if(!b.name||!email||(b.password||'').length<6)throw new Error('Name, email and a password of 6+ characters are required');
  if(await User.findOne({email}))throw new Error('An account with this email already exists');
  u=await User.create({name:b.name.trim(),email,role:'parent',phone:(b.phone||'').trim(),password:await bcrypt.hash(b.password,10)})}
 else{u=await User.findOne({email,role:b.role});
  if(b.role==='teacher'&&!u)throw Response.json({error:'This email has not been registered as a teacher. Please contact the school admin.'},{status:401});
  if(!u||(b.role!=='teacher'&&!(await bcrypt.compare(b.password||'',u.password||''))))throw Response.json({error:'Invalid email or password'},{status:401})}
 cookies().set('t',await sign({id:u.id,name:u.name,email:u.email,role:u.role}),{httpOnly:true,sameSite:'lax',path:'/',maxAge:604800});return {ok:1}});
export const DELETE=h(async()=>{cookies().delete('t');return {ok:1}});
