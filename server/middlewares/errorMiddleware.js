const logger = require("../utils/logger");

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  logger.error({ err }, "Ошибка errorMiddleware");
  logger.error(err);

  res.status(statusCode).json({
    status: "error",
    message: err.message || "Внутренняя ошибка сервера",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
