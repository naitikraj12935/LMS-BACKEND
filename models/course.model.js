import {Schema,model} from "mongoose"

const courseSchema=new Schema({
    title:{
        type:String,
        required:[true,'title is required'],
        minLength:[8,'title must be atleast 8 character'],
        maxLength:[59,'title must be less than 60 characters'],
        trim:true
    },
    description:{
        type:String,
        required:[true,'description is required'],
        minLength:[8,'description must be atleast 8 character'],
        maxLength:[10000,'description must be less than 10000 characters'],
        trim:true
    },
    category:{
        type:String
    },
    lectures:[
        {
          type:Schema.Types.ObjectId,
          ref:'Lecture',
          required:[true,'lecture id is required']
        }
    ],
    thumbnail:{
        public_id:String,
        secure_url:String,
    },
    numbersOfLectures:{
        type:Number,
        default:0
    },
    createdBy:{
        type:String,
        required:true
    }
},{
    timestamps:true
});


const Course=model('Course',courseSchema);

export default Course;