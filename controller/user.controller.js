import AppError from "../utils/error.util.js";
import User from "../models/user.model.js";
import { json } from "express";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import sendEmail from "../utils/sendemail.js";
import crypto from "crypto";
const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // Set maxAge in milliseconds
  httpOnly: true,
  sameSite: "None",
  secure: true, // Enable this in production if using HTTPS
};

const register = async (req, res, next) => {
  const { fullName, email, password } = req.body;

  try {
    // Check if all required fields are provided
    if (!fullName || !email || !password) {
      throw new AppError("All fields are required", 400);
    }

    // Check if a user with the provided email already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
      throw new AppError("Email already exists", 400);
    }

    // Create a new user in the database
    let userdetail = {
      fullName,
      email,
      password,
      avatar: {
        public_id: undefined,
        secure_url: undefined,
      },
    };
    if (req.file) {
      console.log(req.file);
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "Lms",
          width: 250,
          height: 250,
          gravity: "faces",
          crop: "fill",
        });

        if (result) {
          console.log(result);
          const avatar = {
            public_id: result.public_id,
            secure_url: result.secure_url,
          };
          userdetail.avatar = avatar;

          // Remove the uploaded file from the server
          fs.rm(req.file.path);
        }
      } catch (error) {
        return next(new AppError("file not uploaded please try again", 500));
      }
    }
    const user = await User.create(userdetail);
    // Generate JWT token for the user
    const token = await user.generateJWTToken();

    // Set the token as a cookie
    res.cookie("token", token, cookieOptions);

    // Send success response with user data
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    // Pass the error to the error handling middleware
    next(error);
  }
};
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError("All fields are required", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    
    console.log(user);
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError("Email or password does not match", 401));
    }

    const token = await user.generateJWTToken();
    user.password = undefined;
    res.cookie("token", token, cookieOptions);
    res.status(200).json({
      success: true,
      token: token,
      user:user,
      message: "User logged in successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const logout = (req, res) => {
  res.cookie("token", null, {
    secure: true,
    maxAge: 0,
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "user logout sucessfully",
  });
};

const getprofile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    console.log(user)
    return res.status(
      200).
      json({
        success: true,
        message: "user details",
        user,
      });
  } catch (error) {
    return next(new AppError("failed to fetch profile data", 400));
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;

    const forgetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      forgetPasswordToken,
      forgetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError("invalid reset token or token expired", 404));
    }

    user.password = password;
    user.forgetPasswordExpiry = undefined;
    user.forgetPasswordToken = undefined;
    user.save();

    res.status(200).json({
      success: true,
      message: "your password changed successfully",
    });
  } catch (error) {
    return next(
      new AppError("unable to reset password please try again.....", 500)
    );
  }
};

const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new AppError("Email is required", 400));
    }
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError("user is not registered", 404));
    }

    const resetToken = await user.generatePassowrdResetToken();

    console.log(resetToken);

    await user.save();
    const resetPasswordURL = 'https://coursify1.netlify.app/reset-password/${resetToken}';

    await sendEmail(email, resetPasswordURL, "update your password");

    res.status(200).json({
      success: true,
      message: `Reset password token has send to ${email}`,
    });
  } catch (error) {
    return next(new AppError(error.message), 500);
  }
};

const changepassword = async (req, res, next) => {
  try {
    console.log(req.body);

    const { password, newpassword } = req.body;
    const userId = req.user.id; // Assuming req.user is populated with the authenticated user's data
    console.log(userId)
    if (!password || !newpassword) {
      return next(new AppError("All fields are required", 400));
    }

    // Fetch the user with the password field included
    const user = await User.findById(userId).select('+password');
    console.log(user)

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (await user.comparePassword(password)) {
      console.log('Password matches');
      user.password = newpassword;
      await user.save();
      res.status(200).json({
        success: true,
        message: "Your password has been successfully changed",
      });
    } else {
      return next(new AppError("Current password is incorrect. Please use the 'Forgot Password' feature if needed.", 404));
    }
  } catch (error) {
    console.error(error);
    return next(new AppError(error.message, 500));
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { fullName } = req.body;
    console.log(req.user);
    let user = await User.findById(req.user.id);
    user.fullName = fullName;
   console.log(req.file);
  //  console.log(user)
    if (req.file) {
      if (user.public_id) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
      }
      console.log(req.file);
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "Lms",
          width: 250,
          height: 250,
          gravity: "faces",
          crop: "fill",
        });

        if (result) {
          console.log("result",result);
          const avatar = {
            public_id: result.public_id,
            secure_url: result.secure_url,
          };
          user.avatar = avatar;

          // Remove the uploaded file from the server
          fs.rm(req.file.path);
        }
      } catch (error) {
        console.log(error)
        return next(new AppError(error.message, 500));
      }
    }

     await user.save();
    res.status(200).json({
      status: "success",
      message: "User details updated successfully",
    });
  } catch (error) {
    console.log(error)
    return next(
      new AppError("unable upadte your detail please try again"),
      500
    );
  }
};

export {
  register,
  login,
  logout,
  getprofile,
  forgetPassword,
  resetPassword,
  changepassword,
  updateUser,
};
