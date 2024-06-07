import app from './app.js';
import { config } from 'dotenv';
import connectionDb from './config/dbConnection.js';
import cloudinary from 'cloudinary'
import Razorpay from 'razorpay';
config();
const PORT = process.env.PORT || 5000;
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret:process.env.CLOUD_SECRATE_KEY
  });
  
  export const instance=new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_SECRET_KEY
  })

app.listen(PORT, async () => {
    await connectionDb();
    console.log(`App is running at http://localhost:${PORT}`);
});


