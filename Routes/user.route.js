import { Router } from "express";
import { register,login,logout,getprofile,forgetPassword,resetPassword,changepassword,updateUser } from "../controller/user.controller.js";
import { isloggedin } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middle.js";
const userRoutes=Router();

userRoutes.post('/register',upload.single("avatar"),register);
userRoutes.post('/login',login);
userRoutes.get('/logout',logout);
userRoutes.get('/profile',isloggedin,getprofile);
userRoutes.post('/forget/password',forgetPassword);
userRoutes.post('/reset-password/:resetToken',resetPassword);
userRoutes.post('/change-password/',isloggedin,changepassword);
userRoutes.post('/updateProfile/',isloggedin,upload.single("avatar"),updateUser);




export default userRoutes;
