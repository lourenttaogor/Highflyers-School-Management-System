import {SignJWT,jwtVerify} from 'jose';import {cookies} from 'next/headers';import db from './db';
const key=()=>new TextEncoder().encode(process.env.JWT_SECRET);
export const sign=u=>new SignJWT(u).setProtectedHeader({alg:'HS256'}).setExpirationTime('7d').sign(key());
export async function me(){try{return (await jwtVerify(cookies().get('t')?.value,key())).payload}catch{return null}}
export async function guard(...roles){const u=await me();
 if(!u||(roles.length&&!roles.includes(u.role)))throw Response.json({error:'Forbidden'},{status:403});return u}
export const h=fn=>async(...a)=>{try{await db();return Response.json(await fn(...a))}
 catch(e){return e instanceof Response?e:Response.json({error:e.message},{status:500})}};
export const today=()=>new Date().toISOString().slice(0,10);
import {User} from './models';
export const kids=async u=>(await User.findById(u.id).select('children')).children||[];
