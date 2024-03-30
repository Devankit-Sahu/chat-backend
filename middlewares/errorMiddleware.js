import multer from "multer";

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";

  // duplicate username error
  if (err.code === 11000) {
    console.log(err);
    err.message = `The ${Object.keys(err.keyValue)[0]} ${
      err.keyValue[Object.keys(err.keyValue)[0]]
    } already in use`;
    err.statusCode = 400;
  }

  // invalid id
  if (err.name === "CastError") {
    err.message = `Invalid value ${err.value._id} for field ${err.path}`;
    err.statusCode = 400;
  }

  // validation error
  if (err.name === "ValidationError") {
    const msg = Object.values(err.errors).map((msg) => msg.message);
    err.message = msg;
    err.statusCode = 400;
  }

  //multer error
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_UNEXPECTED_FILE")
      err.message = "files limit exceed";
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default errorMiddleware;
