import mongoose from 'mongoose';import bcrypt from 'bcryptjs';
await mongoose.connect(process.env.MONGODB_URI);
await mongoose.connection.collection('users').updateOne({email:'admin@highflyers.school'},{$set:{name:'Administrator',role:'admin',password:await bcrypt.hash('academy123',10)}},{upsert:true});
console.log('Admin: admin@highflyers.school / academy123');process.exit();
