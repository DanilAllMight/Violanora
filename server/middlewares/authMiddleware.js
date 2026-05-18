const tokenService = require("../services/token-service");
const AppError = require("../utils/appError");
const logger = require("../utils/logger");
const errorMsg = require("../constants/errorMessages");
const userRepository = require("../repositories/user-repository");

const getUserRole = async (userData) => {
  const userId = userData.id;
  const user = await userRepository.findById(userId);
  return user ? user.role : "USER";
};

module.exports = async function (req, res, next) {
  try {
    logger.info("Начало работы AuthMiddleware");
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return next(new AppError(errorMsg.NOT_AUTHORIZED, 401));
    }

    const accessToken = authorizationHeader.split(" ")[1];
    if (!accessToken) {
      return next(new AppError(errorMsg.NOT_AUTHORIZED, 401));
    }

    const userData = tokenService.validateAccessToken(accessToken);
    if (!userData) {
      return next(new AppError(errorMsg.TOKEN_NOT_VALIDATE, 401));
    }

    const role = await getUserRole(userData);
    req.role = role;
    req.user = userData;

    logger.info({ role, userData }, "Пользователь авторизован");
    next();
  } catch (error) {
    next(error);
  }
};
