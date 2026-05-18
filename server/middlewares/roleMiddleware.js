const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync"); // если хочешь оставить внутри
const logger = require("../utils/logger");
const errorMsg = require("../constants/errorMessages");

module.exports = function (roles) {
  return catchAsync(async (req, res, next) => {
    logger.info(req.user, "Role Middleware начало работы");

    if (!req.user) {
      throw new AppError(errorMsg.NOT_AUTHORIZED, 401);
    }

    const role = req.role;

    if (!roles.includes(role)) {
      throw new AppError(errorMsg.USER_NOT_ACCESS, 403);
    }

    logger.info("Пользователю разрешён доступ");
    next();
  });
};
