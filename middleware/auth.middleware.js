import AppError from "../utils/error.util.js";
import jwt from 'jsonwebtoken'
const isloggedin= async (req,res,next)=>{
  console.log(req)
   const {token}=req.cookies;
   if(!token)
   {
     return next(new AppError('unauthenticated user',404))
   }

   const userDetails= await jwt.verify(token, process.env.SECRET_KEY);
    req.user=userDetails;
    console.log(req.user)

    next();
}

const authorized=(...roles)=>async(req,res,next)=>{
   
    const currentuserrole=req.user.role;
    console.log(currentuserrole,roles);
    if(!roles.includes(currentuserrole))
      {
         return next(new AppError('you are not authorized to access this route',403));
      }
      next();
}

export {isloggedin,authorized};