import mongoose from 'mongoose';
const c=global._m||(global._m={});
export default async function db(){if(!c.p)c.p=mongoose.connect(process.env.MONGODB_URI);await c.p}
