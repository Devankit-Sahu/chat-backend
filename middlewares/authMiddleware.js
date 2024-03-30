import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorhandler.js";
import { User } from "../models/userModel.js";

export const verifiedRoute = async (req, res, next) => {
  const { jwtToken } = req.cookies;
  jwt.verify(jwtToken, process.env.JWT_SECRET, async (err, decode) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return next(
          new ErrorHandler("Token has expired. Please login again", 401)
        );
      }
      if (err.name === "JsonWebTokenError") {
        return next(new ErrorHandler("Invalid token. Please login again", 401));
      }
    } else {
      req.user = decode._id;
      next();
    }
  });
};

export const socketAuthenticator = async (err, socket, next) => {
  try {
    if (err) return next(err);
    const authToken = socket.request.cookies["jwtToken"];

    if (!authToken)
      return next(new ErrorHandler("Please login to access this route", 401));

    const decodedData = jwt.verify(authToken, process.env.JWT_SECRET);

    const user = await User.findById(decodedData._id);

    if (!user)
      return next(new ErrorHandler("Please login to access this route", 401));

    socket.user = user;

    return next();
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Please login to access this route", 401));
  }
};
