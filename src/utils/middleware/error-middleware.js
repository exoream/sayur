const { ZodError } = require("zod");
const { ResponseError } = require("../response/response");

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      status: false,
      message: error.errors[0].message,
    });
  } else if (error instanceof ResponseError) {
    return res.status(error.status).json({
      status: false,
      message: error.message,
    });
  } else {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

module.exports = errorMiddleware;
