
import {Router} from "express"
import { getAllCourse,getLecturesByCourseId ,createCoures, updateCourse,deleteCourse,UploadLecture,DeleteLecture} from "../controller/course.controller.js";
import { isloggedin,authorized } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middle.js";
const router=new Router();

router.route('/')
.get(getAllCourse)
.post(isloggedin,authorized('ADMIN'),upload.single('thumbnail'),createCoures);
router.route('/:id').get(isloggedin,getLecturesByCourseId).put(isloggedin,authorized('ADMIN'),upload.single('thumbnail'),updateCourse).delete(isloggedin,authorized('ADMIN'),deleteCourse);

//here id is of course
router.route('/Lecture/:id').post(isloggedin,authorized('ADMIN'),upload.single('Lecture'),UploadLecture)

router.route('/delete/Lecture').post(isloggedin,authorized('ADMIN'),DeleteLecture);




export default router;