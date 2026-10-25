import {Notification} from './models';
// In-app alert + email (Resend) + SMS (Termii). Email/SMS are skipped if keys are not set.
export async function notifyParents(parents,msg,subject){
 if(!parents.length)return;
 await Notification.insertMany(parents.map(p=>({email:p.email,message:msg})));
 await Promise.all(parents.map(async p=>{
  try{if(process.env.RESEND_API_KEY)await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},
   body:JSON.stringify({from:process.env.FROM_EMAIL,to:p.email,subject:subject||'High Flyers Academy',text:msg})})}catch(e){console.error('email failed',e.message)}
  try{if(process.env.TERMII_API_KEY&&p.phone)await fetch('https://api.ng.termii.com/api/sms/send',{method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({api_key:process.env.TERMII_API_KEY,to:p.phone.replace(/\D/g,'').replace(/^0/,'234'),from:process.env.TERMII_SENDER||'HighFlyers',sms:msg,type:'plain',channel:'generic'})})}catch(e){console.error('sms failed',e.message)}
 }))}
