import {h,guard} from '@/lib/auth';import {Notification} from '@/lib/models';
export const GET=h(async()=>{const u=await guard();return Notification.find({email:u.email}).sort('-createdAt').limit(30)});
