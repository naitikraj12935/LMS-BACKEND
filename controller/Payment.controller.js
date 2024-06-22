import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import { instance } from "../server.js";


import crypto from "crypto";
import Payment from "../models/payment.model.js";


const buysubscriptionY=async(req,res,next)=>{
    try {
    const {id}=req.user;
    console.log(id);
    const user=await User.findById(id);
    if(!user)
        {
            return next(new AppError('user not found please login',404));
        }
        if(user.role=='ADMIN')
            {
                return next(new AppError('Admin can not buy subscription',400));
            }
            
            console.log('hello')

            const tenYearsInSeconds = 10 * 365 * 24 * 60 * 60; // 10 years in seconds
const startAtTimestamp = Math.floor(Date.now() / 1000) + tenYearsInSeconds;

const subscription = await instance.subscriptions.create({
    plan_id: process.env.RAZORPAY_YEARLY_PLAN_ID,
    customer_notify: 1,
    quantity: 1, // Assuming one subscription per user
    start_at: startAtTimestamp, // Start in the future but within 10 years
    total_count: 1,
    
    notes: {
        platform_access: "1 year access to all courses" // Additional information
    }
});
     const invoice=await instance.invoices.all({
    'subscription_id':subscription.id
     })

         console.log(invoice);
            
          console.log(subscription)
         user.subscription.id=subscription.id;
         user.subscription.status=subscription.status;
         await user.save();
         res.status(200).json({
            success:true,
            message:'subscription  successfully',
            subscription_id:subscription.id
         })
    } catch (error) {
        console.log(error)
        return next(new AppError(error.message,500));
    }

}
const buysubscriptionM=async(req,res,next)=>{
    try {
    const {id}=req.user;
    console.log(id);
    const user=await User.findById(id);
    if(!user)
        {
            return next(new AppError('user not found please login',404));
        }
        if(user.role=='ADMIN')
            {
                return next(new AppError('Admin can not buy subscription',400));
            }
            
            console.log('hello')

            const tenYearsInSeconds = 30* 24 * 60 * 60; // 1 month in seconds
const startAtTimestamp = Math.floor(Date.now() / 1000) + tenYearsInSeconds;

const subscription = await instance.subscriptions.create({
    plan_id: process.env.RAZORPAY_MONTHLY_PLAN_ID,
    customer_notify: 1,
    quantity: 1, // Assuming one subscription per user
    start_at: startAtTimestamp, // Start in the future but within 10 years
    total_count: 1,
    
    notes: {
        platform_access: "1 Month access to all courses" // Additional information
    }
});
     const invoice=await instance.invoices.all({
    'subscription_id':subscription.id
     })

         console.log(invoice);
            
          console.log(subscription)
         user.Msubscription.id=subscription.id;
         user.Msubscription.status=subscription.status;
         await user.save();
         res.status(200).json({
            success:true,
            message:'subscription  successfully',
            subscription_id:subscription.id
         })
    } catch (error) {
        console.log(error)
        return next(new AppError(error.message,500));
    }

}

const verifyPaayment=async(req,res,next)=>{
    try {
         const {id}=req.user;
         const {razorpay_payment_id,razorpay_signature,razorpay_subscription_id}=req.body;
         const user=await User.findById(id);
         if(!user)
            {
                return next(new AppError('user not found please login',404));
            }
            if(razorpay_payment_id)
                {
                    user.subscription.status='active';
                    user.save();
            res.status(200).json({
                success:true,
                message:'payment verified',
                user
            })

                }
        //  const subscriptionId=user.subscription.id;
        //  const subscriptionIdM=user.Msubscription.id;
        //  const generatedSignature=crypto.createHmac('sha256',process.env.Razorpay_secret_key).update(`${razorpay_payment_id}|${subscriptionId}`).digest('hex'); 
        //  const generatedSignatureM=crypto.createHmac('sha256',process.env.Razorpay_secret_key).update(`${razorpay_payment_id}|${subscriptionIdM}`).digest('hex'); 
        //  if(generatedSignature!==razorpay_signature && generatedSignatureM!==razorpay_signature)
        //     {
        //         return next(new AppError('signature not matched',400));
        //     }
        //     await Payment.create({
        //         razorpay_payment_id,razorpay_signature,razorpay_subscription_id
        //     })

        //     if(generatedSignature==razorpay_signature)
        //         {
        //             user.subscription.status='active';
        //         }
        //         if(generatedSignatureM==razorpay_signature)
        //             {
        //                 user.Msubscription.status='active'
        //             }

           
        //     user.save();
        //     res.status(200).json({
        //         success:true,
        //         message:'payment verified',
        //         user
        //     })
    } catch (error) {
        
        return next(new AppError('unable to verify payment',500));
    }

}
const getRazorpayKey=async(req,res,next)=>{
    res.status(200).json({
     success:true,
     message:'RazorPay key generated',
     key:process.env.Razorpay_key_ID
    })
}

const unsubscribe=async(req,res,next)=>{
    try {
        const {id}=req.user;
  const user=await User.findById(id);
  if(!user || user.role=='ADMIN')
    {
        return next(new AppError('you have nothing purchased',404));
    }
    let subscriptionId;
    if(user.subscription.status==='active')
        {
            subscriptionId=user.subscription.id;
        }
        else if(user.Msubscription.status==='active')
            {
                subscriptionId=user.Msubscription.id;
            }

    const subscription=await instance.subscriptions.cancel(subscriptionId);
     if(subscription.status=='cancelled')
        {
            user.subscription.id='';
            user.subscription.status='inactive'
            user.Msubscription.id='';
            user.Msubscription.status='inactive'
            await user.save();
        }
        res.status(200).json({
            success:true,
            message:'subscription cancelled successfully'
        })
    } catch (error) {
        return next(new AppError('unable to unsubscribe',500));
    }
  
}
const getALLsubscription=async(req,res,next)=>{
    try {
         const {count}=req.query;
         const subscriptions=await instance.subscriptions.all({
            count:count || 10,
         })
         res.status(200).json({
            success:true,
            message:'subscriptions fetched',
            subscriptions
         })
    } catch (error) {
        return next(new AppError('unable to fetch subscriptions',500));
    }
}



export {getALLsubscription,getRazorpayKey,buysubscriptionY,buysubscriptionM,verifyPaayment,unsubscribe};