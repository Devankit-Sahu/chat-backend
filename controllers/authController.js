import catchAsyncError from "../utils/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorhandler.js";
import { uploadOnCloudinary } from "../utils/cloudinaryFIleUpload.js";
import { User } from "../models/userModel.js";

const register = catchAsyncError(async (req, res, next) => {
  const { username, email, password, about } = req.body;

  if (!username) return next(new ErrorHandler("username is required", 400));

  if (!email) return next(new ErrorHandler("email is required", 400));

  if (!password) return next(new ErrorHandler("password is required", 400));

  let user = await User.findOne({ email });

  if (user) {
    return next(new ErrorHandler("Email already in use", 404));
  }

  const avatarPath = req.file?.path;

  user = await User.create({
    username,
    email,
    password,
    about,
  });

  if (avatarPath) {
    const avatarObj = await uploadOnCloudinary(avatarPath);
    const avatar = {
      public_id: avatarObj.public_id,
      url: avatarObj.secure_url,
    };
    user.avatar = avatar;
    await user.save({ validateBeforeSave: false });
  }

  const token = await user.generateJwtToken();

  res
    .cookie("jwtToken", token, {
      maxAge: new Date(Date.now() + 1800000),
      httpOnly: true,
      secure: true,
    })
    .status(200)
    .json({
      success: true,
      message: `Welcome back ${user.username}`,
      user,
    });
});

const login = catchAsyncError(async (req, res, next) => {
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
  res.cookie("jwtToken", token, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.status(200).json({
    success: true,
    message: `Welcome back ${user.username}`,
    user,
  });
});

const logout = catchAsyncError(async (req, res, next) => {
  res.clearCookie("jwtToken", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  res.status(200).json({
    success: true,
    message: "logged out",
  });
});

export { register, login, logout };
