import mongoose from 'mongoose';
const {Schema,models,model}=mongoose;const OID=Schema.Types.ObjectId;
const M=(n,s)=>models[n]||model(n,new Schema(s,{timestamps:true}));
export const User=M('User',{name:String,email:{type:String,unique:true,lowercase:true,trim:true},phone:String,password:String,role:{type:String,enum:['admin','teacher','parent']},children:[OID]});
export const Student=M('Student',{fullName:String,examNo:{type:String,unique:true},age:Number,gender:String,className:String,photo:String,admissionSession:String,language:String,religion:String,trade:String});
export const Attendance=M('Attendance',{staff:{type:OID,ref:'User'},date:String,clockIn:Date,clockOut:Date,by:{type:OID,ref:'User'},outBy:{type:OID,ref:'User'},inLoc:Object,outLoc:Object,log:[Object]});
export const Assignment=M('Assignment',{className:String,subject:String,title:String,description:String,dueDate:String,by:String});
export const Result=M('Result',{student:{type:OID,ref:'Student'},term:String,session:String,className:String,level:String,status:{type:String,default:'draft'},
 scores:[{subject:String,ca:Number,project:Number,exam:Number,total:Number,max:{ca:Number,project:Number,exam:Number}}],affective:Object,psycho:Object,
 comments:{adviser:String,formMaster:String,principal:String},daysOpened:Number,daysPresent:Number,nextTerm:String,termEnded:String,promotedTo:String});
export const Notification=M('Notification',{email:String,message:String,read:{type:Boolean,default:false}});
export const FeeStructure=M('FeeStructure',{className:String,term:String,session:String,amount:Number});
export const Payment=M('Payment',{student:OID,term:String,session:String,amount:Number,method:String,by:String});
export const CurriculumVersion=M('CurriculumVersion',{name:String,source:String,official:Boolean,status:{type:String,default:'draft'},confirmedBy:String,confirmedAt:Date});
export const Catalogue=M('Catalogue',{version:OID,name:String,group:String,levels:[String],kind:String,official:Boolean,religion:String,src:String});
// A subject on a level's curriculum, effective from a session/term and (optionally) ended later. Never deleted, so history stays intact.
export const ClassSubject=M('ClassSubject',{level:String,name:String,kind:String,official:Boolean,optional:Boolean,religion:String,teacher:{type:OID,ref:'User'},
 ca:Number,project:Number,exam:Number,fromSession:String,fromTerm:String,toSession:String,toTerm:String,version:OID,src:String,plan:String});
// The subjects a student is actually registered for in a given session and term (a snapshot).
export const Registration=M('Registration',{v:Number,student:OID,session:String,term:String,level:String,className:String,
 subjects:[{name:String,kind:String,official:Boolean,ca:Number,project:Number,exam:Number,teacher:OID}]});
export const PaymentProof=M('PaymentProof',{student:{type:OID,ref:'Student'},term:String,session:String,amount:Number,receipt:String,by:String,status:{type:String,default:'review'},note:String,confirmedAmount:Number,reviewedBy:String});
export const Announcement=M('Announcement',{title:String,body:String,audience:{type:String,default:'all'},by:String});
