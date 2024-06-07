import { Schema,model } from "mongoose";

const LectureSchema=new Schema({
    title:String,
          description:String,
          lecture:{
            public_id:String,
            secure_url:String,
          }
},{timestamps:true});


const Lecture=model('Lecture',LectureSchema);

export default Lecture;