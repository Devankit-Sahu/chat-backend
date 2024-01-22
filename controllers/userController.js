import catchAsyncError from "../utils/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorhandler.js";
import User from "../models/userModel.js";
import { uploadOnCloudinary } from "../utils/cloudinaryFIleUpload.js";
import cloudinary from "cloudinary";

export const newUser = catchAsyncError(async (req, res, next) => {
  const { username, email, password } = req.body;

  let user = await User.findOne({ email });

  if (user) {
    return next(new ErrorHandler("Email already in use", 404));
  }

  const avatarPath = req.file?.path;

  if (!avatarPath) {
    user = await User.create({
      username,
      email,
      password,
    });
  } else {
    const avatarObj = await uploadOnCloudinary(avatarPath);
    const avatar = {
      public_id: avatarObj.public_id,
      url: avatarObj.url,
    };
    user = await User.create({
      username,
      email,
      password,
      avatar,
    });
  }

  const token = await user.generateJwtToken();

  res
    .cookie("jwtToken", token, {
      expires: new Date(Date.now() + 1800000),
      httpOnly: true,
      // secure: true,
    })
    .status(200)
    .json({
      success: true,
      message: "User created",
    });
});

export const loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password", 404));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(
      new ErrorHandler(
        "User with this email does not exist. Please create new account to use our service",
        404
      )
    );
  }

  const matchedPassword = await user.comparePassword(password);
  if (!matchedPassword) {
    return next(new ErrorHandler("Invalid credential. Enter again !!!"), 404);
  }

  const token = await user.generateJwtToken();
  res
    .cookie("jwtToken", token, {
      expires: new Date(Date.now() + 1800000),
      httpOnly: true,
      secure: true,
    })
    .status(200)
    .json({
      success: true,
      message: "user logged in",
    });
});

export const logoutUser = catchAsyncError(async (req, res, next) => {
  res.clearCookie("jwtToken", { path: "/" }).status(200).json({
    success: true,
    message: "user logged out",
  });
});

export const allusers = catchAsyncError(async (req, res, next) => {
  const users = await User.find({
    _id: {
      $nin: [req.user.id],
    },
  });
  res.status(200).json({
    success: true,
    users,
  });
});

export const userDetails = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    user,
  });
});

export const selectedUserDetails = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({
    success: true,
    user,
  });
});

export const searchUserByName = catchAsyncError(async (req, res, next) => {
  const usernameRegex = new RegExp(req.params.username, "i");
  const users = await User.find({ username: { $regex: usernameRegex } });

  if (!users) {
    return next(
      new ErrorHandler(
        `user with ${req.params.username} username does not exists`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    users,
  });
});

export const updateUserAbout = catchAsyncError(async (req, res, next) => {
  await User.findByIdAndUpdate(
    { _id: req.user._id },
    { $set: { about: req.body.about } },
    { new: true }
  );
  res.status(200).json({
    success: true,
    message: "About updated successfully",
  });
});

export const updateUserAvatar = catchAsyncError(async (req, res, next) => {
  let loggedinuser = await User.findById({ _id: req.user._id });
  const avatarPath = req.file?.path;

  if (!avatarPath) {
    return next(new ErrorHandler("Avatar is missing", 400));
  }

  if (
    loggedinuser.avatar &&
    !loggedinuser.avatar.public_id &&
    !loggedinuser.avatar.url
  ) {
    //uploading new avatar to cloudinary
    const avatarObj = await uploadOnCloudinary(avatarPath);
    await User.findByIdAndUpdate(
      { _id: loggedinuser._id },
      {
        $set: {
          avatar: { public_id: avatarObj.public_id, url: avatarObj.url },
        },
      },
      { new: true }
    );
  } else {
    // deleting image from cloudinary
    await cloudinary.v2.uploader.destroy(loggedinuser.avatar.public_id);
    // updating avatar of user
    const avatarObj = await uploadOnCloudinary(avatarPath);

    await User.findByIdAndUpdate(
      { _id: loggedinuser._id },
      {
        $set: {
          avatar: { public_id: avatarObj.public_id, url: avatarObj.url },
        },
      },
      { new: true }
    );
  }
  res.status(200).json({
    success: true,
    message: "Avatar update successfully",
  });
});

export const changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword) {
    return next(new ErrorHandler("old password is missing", 400));
  }
  if (!newPassword) {
    return next(new ErrorHandler("new password is missing", 400));
  }

  const loggedinuser = await User.findById(req.user._id).populate("password");

  const isPasswordCorrect = await loggedinuser.comparePassword(oldPassword);

  if (!isPasswordCorrect) {
    return next(new ErrorHandler("old password is incorrect", 400));
  }

  loggedinuser.password = newPassword;

  await loggedinuser.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "password changed successfully",
  });
});
