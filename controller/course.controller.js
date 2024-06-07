
import AppError from "../utils/error.util.js"
import Course from "../models/course.model.js"
import cloudinary from "cloudinary"
import fs from "fs/promises"
import Lecture from "../models/Lecture.model.js"
const getAllCourse=async(req,res,next)=>{
    try {
        const course=await Course.find({}).select('-lectures');
    res.status(200).json({
        success:true,
        message:'All Course',
        course
    })
        
    } catch (error) {
        return next(new AppError('unable to find course',500))
    }
    
}

const getLecturesByCourseId=async(req,res,next)=>{
    try{
       const {id}=req.params;
       const course=await Course.findById(id).populate('lectures');
       if(!course)
        {
            return next(new AppError('id is not correct',404));
        }
       res.status(200).json({
        success:true,
        message:'course lectures ',
        lectures:course.lectures
       })
    }
    catch(error){
        return next(new AppError('unable to find course'),500);
    }

}
const createCoures=async(req,res,next)=>{
   try {
    console.log(req.body);
        const {title,description,category,createdBy}=req.body;
        if(!title ||!description || !category || !createdBy)
        {
            return next(new AppError('All fields are required',400));
        }
        let course=await  Course.create({title,description,category,createdBy});
        console.log('course',course);
        if(!course)
            {
                return next(new AppError('unable to create course please try again',500));
            }
        if(req.file)
            {
                const result=await cloudinary.v2.uploader.upload(req.file.path,{
                    folder:'Lms/Course'
                });
                if(result)
                    {
                        course.thumbnail.public_id=result.public_id;
                        course.thumbnail.secure_url=result.secure_url;
                        fs.rm(req.file.path);
                    }
            }

            await course.save();
            res.status(200).json({
                success:true,
                message:'course created',
                course,
            })

        }
   catch(error) {
       return next(new AppError(error.message,500));
   }
}
const updateCourse=async(req,res,next)=>{
    try {
        const {id}=req.params;
        let course=await Course.findByIdAndUpdate(id,{
            $set:req.body
        },
    {
        runValidators:true
    });
        if(!course)
        {
                return next(new AppError('course not found',404));
        }
        if(req.file)
            {
                if(course.thumbnail.public_id)
                    {
                        await cloudinary.v2.uploader.destroy(course.thumbnail.public_id);
                    }
                    const result=await cloudinary.v2.uploader.upload(req.file.path,{
                        folder:'Lms/Course'
                    });
                    if(result){
                        course.thumbnail.public_id=result.public_id;
                        course.thumbnail.secure_url=result.secure_url;
                        fs.rm(req.file.path);
                    }
                   
            }

            await course.save();

            const updatecoursedata=await Course.findById(id);

        
        res.status(200).json({
            success:true,
            message:'course updated',
            updatecoursedata
        })
    }
    catch(error){
        return next(new AppError('unable to update course',500));
    }
}
const deleteCourse=async(req,res,next)=>{
  try {
    const {id}=req.params;
    const course=await Course.findById(id);
    if(!course)
        {
            return next(new AppError('course is not avilable',404));

        }

        if(course.thumbnail.public_id)
        {
            await cloudinary.v2.uploader.destroy(course.thumbnail.public_id);
        }        


     await Course.findByIdAndDelete(id);
     res.status(200).json({
        success:true,
        message:'course deleted'
     })
    
  } catch (error) {
      return next(new AppError('unable to delete course ',500));
  }
}
const UploadLecture=async(req,res,next)=>{
    try {
        console.log(req.body)
        const {title,description}=req.body;  
        if(!req.file || !title || !description)
            {
                return next(new AppError('all fields are required',400));
            }
        const {id}=req.params;
        const course=await Course.findById(id);
        if(!course)
            {
                return next(new AppError('course not found',404));
            }
       
       
       let data={title,description};
       let lecture=await Lecture.create(data);

       if(req.file)
        {
            console.log(req.file);
            const result=await cloudinary.v2.uploader.upload(req.file.path,{
                folder:'Lms/Lecture',
                resource_type:'video'
            })

            if(result)
                {
                    lecture.lecture.public_id=result.public_id;
                    lecture.lecture.secure_url=result.secure_url;
                    fs.rm(req.file.path);
                }

        }
           await lecture.save();
        
        if(!lecture)
            {
                return next(new AppError('unable to upload lecture',500));
            }
            course.lectures.push(lecture._id);
            let num=course.lectures.length;
            course.numbersOfLectures=num;
            await course.save();

           res.status(200).json({
            success:true,
            message:'lecture uploaded',
            lecture
           }) 
        
    } catch (error) {
         return next(new AppError(error.message,500));
    }

}
const DeleteLecture=async (req,res,next)=>{
    try {
        const {courseId,lectureId}=req.body;
        const lect=await Lecture.findById(lectureId);
        const course=await Course.findById(courseId);
        if(!lect || !course)
            {
                return next(new AppError('content not found',404));
            }

            if(lect?.lecture?.public_id)
                {
                    await cloudinary.v2.uploader.destroy(lect.lecture.public_id);
                }
               await Lecture.findByIdAndDelete(lectureId);
               
           const lectures=course.lectures.filter((data)=>data.id!==lectureId);
           course.lectures=lectures;
           await course.save();
           
           res.status(200).json({
            success:true,
            message:'lecture deleted successfully'
           })
        
    } catch (error) {
        console.log(error)
        return next(new AppError(error?.message,500));
    }

}

export {
    getAllCourse,getLecturesByCourseId,createCoures,updateCourse,deleteCourse,UploadLecture,DeleteLecture
}