import { Schema,model } from "mongoose";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { type } from "os";
const userSchema=new Schema({
    fullName:{
        type:String,
        required:[true,'Name is required'],
        minLength:[5,'Name must be at least 5 character'],
        maxLength:[50,'Name should be less than 50 characters'],
        lowercase:true,
        trim:true

    },
    email:{
        type:String,
        required:[true,'email is required'],
        unique:true,
        lowercase:true,
        trim:true,
        

    },
    password:{
        type:String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        
        select:false
    },
    avatar:{
        public_id:{
            type:String,

        },
        secure_url:{
            type:String
        }
    },
    forgetPasswordToken:String,
    forgetPasswordExpiry:String,
    subscription:{
         id:String,
         status:{
            type:String,
            default:'inactive'
         },
        
    },
    Msubscription:{
        id:String,
        status:{
           type:String,
           default:'inactive'
        },
       
   },
    role:{
        type:String,
        enum:['USER','ADMIN'],
        default:'USER'
    }

},{
    timestamps:true
})

userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password=await bcrypt.hash(this.password,10);

})
userSchema.methods.generateJWTToken = async function () {
    // Generating JWT token
    return await jwt.sign(
        {
            id: this._id,
            email: this.email,
            role:this.role
            // subscription: this.subscription
        },
        process.env.SECRET_KEY,
        {
            expiresIn: '2d' // Token expires in 2 days
        }
    );
    
};
userSchema.methods.comparePassword=async function(plaintextpassword){
      return await bcrypt.compare(plaintextpassword,this.password);
}
userSchema.methods.generatePassowrdResetToken=async function () {
    // Generating JWT token
      const resetToken=crypto.randomBytes(20).toString('hex');
      this.forgetPasswordToken=crypto.createHash('sha256').update(resetToken).digest('hex');
      this.forgetPasswordExpiry=Date.now()+15*60*1000;
      
      return resetToken;
    
};

const User=model('User',userSchema);



export default User;