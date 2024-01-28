import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorhandler.js";
import User from "../models/userModel.js";

export const verifiedRoute = async (req, res, next) => {
  const jwtToken = req.cookies.jwtToken || req.headers.cookie.split("=")[1];
  await jwt.verify(jwtToken, process.env.JWT_SECRET, async (err, decode) => {
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
      const user = await User.findById({
        _id: decode._id,
        "tokens:token": jwtToken,
      });
      req.user = user;
      next();
    }
  });
};
