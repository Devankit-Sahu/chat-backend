import catchAsyncError from "../utils/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorhandler.js";
import User from "../models/userModel.js";

export const newUser = catchAsyncError(async (req, res, next) => {
  const { username, email, password } = req.body;

  let user = await User.findOne({ email });

  if (user) {
    return next(new ErrorHandler("Email already in use", 404));
  }

  user = await User.create({
    username,
    email,
    password,
  });

  const token = await user.generateJwtToken();

  res
    .cookie("jwtToken", token, {
      expires: new Date(Date.now() + 1800000),
      httpOnly: true,
    })
    .status(200)
    .json({
      success: true,
      message: "User created !!!",
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
    })
    .status(200)
    .json({
      success: true,
      message: "logged in",
    });
});

export const logoutUser = catchAsyncError(async (req, res, next) => {
  res.clearCookie("jwtToken", { path: "/" }).status(200).json({
    success: true,
    message: "Logged out !!!",
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
  const user = await User.findOne({ username: { $regex: usernameRegex } });

  if (!user) {
    return next(
      new ErrorHandler(
        `user with ${req.params.username} username does not exists`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});
