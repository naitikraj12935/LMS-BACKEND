import { Router } from "express";
import { getALLsubscription,getRazorpayKey,buysubscriptionY ,buysubscriptionM,unsubscribe,verifyPaayment } from "../controller/Payment.controller.js";
import { isloggedin,authorized } from "../middleware/auth.middleware.js";
const router=new Router();

router.route('/razorpay-key')
.get(isloggedin,getRazorpayKey);


router.route('/Ysubscribe')
.post(isloggedin,buysubscriptionY);
router.route('/Msubscribe')
.post(isloggedin,buysubscriptionM);


router.route('/verify')
.post(isloggedin,verifyPaayment);


router.route('/unsubscribe')
 .post(isloggedin,unsubscribe);

 router.route('/:count')
 .get(isloggedin,authorized('ADMIN'),getALLsubscription);







export default router;