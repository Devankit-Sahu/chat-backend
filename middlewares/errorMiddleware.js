const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";

  // duplicate username error
  if (err.code === 11000) {
    err.message = `The username ${err.keyValue.username} already in use !!`;
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
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default errorMiddleware;
