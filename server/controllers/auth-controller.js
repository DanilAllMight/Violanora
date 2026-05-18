const authService = require("../services/auth-service");
const logger = require("../utils/logger");
const LoginRequestDto = require("../dtos/auth/login.request.dto");
const LoginResponseDto = require("../dtos/auth/login.response.dto");
const RegistrationRequestDto = require("../dtos/auth/registration.request.dto");
const RegistrationResponseDto = require("../dtos/auth/registration.response.dto");
const RefreshResponseDto = require("../dtos/auth/refresh.response.dto");
const CheckResponseDto = require("../dtos/auth/check.response.dto");
const CheckRequestDto = require("../dtos/auth/check.request.dto");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const errorMsg = require("../constants/errorMessages");

class AuthController {
  async registration(req, res, next) {
    const registrationReqDto = new RegistrationRequestDto(req.body);
    logger.info(registrationReqDto, "Пользователь регистрируется с данными");

    const userAgent = req.headers["user-agent"];
    const ip = req.ip;

    const userData = await authService.createUser(
      registrationReqDto.email,
      registrationReqDto.password,
      registrationReqDto.username,
      userAgent,
      ip,
    );

    logger.debug(userData, "Создали пользователя");

    const user = new RegistrationResponseDto(userData);

    res.cookie("refreshToken", userData.refresh_token, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    logger.debug(user, "Отправили cookie и созданного пользователя");

    return res.json(user);
  }

  async login(req, res, next) {
    const loginReqDto = new LoginRequestDto(req.body);
    logger.info("Пользователь авторизируется с данными");
    logger.debug(
      { loginReqDto: loginReqDto, req: req.body },
      "Данные пользователя",
    );

    const userAgent = req.headers["user-agent"];
    const ip = req.ip;

    const userData = await authService.login(
      loginReqDto.email,
      loginReqDto.password,
      userAgent,
      ip,
    );

    logger.debug(userData, "Получили данные пользователя");

    const user = new LoginResponseDto(userData);

    res.cookie("refreshToken", userData.refresh_token, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    logger.debug(user, "Отправили cookie и данные пользователя");

    return res.json(user);
  }

  async refresh(req, res, next) {
    const { refreshToken } = req.cookies;
    logger.info(refreshToken, "Пользователь обновляет токен доступа");

    if (!refreshToken) {
      throw new AppError(errorMsg.TOKEN_NOT_COOKIES, 401);
    }

    const userData = await authService.refresh(refreshToken);

    logger.debug(userData, "Получили данные пользователя");

    const user = new RefreshResponseDto(userData);

    res.cookie("refreshToken", userData.refresh_token, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    logger.debug(userData, "Отправили cookie и данные пользователя");

    return res.json(userData);
  }

  async logout(req, res, next) {
    const { refreshToken } = req.cookies;
    logger.info(refreshToken, "Пользователь выходит из аккаунта");

    if (!refreshToken) {
      throw new AppError(errorMsg.TOKEN_NOT_COOKIES, 401);
    }

    await authService.logout(refreshToken);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });

    logger.debug("Отправили cookie и сообщение о выходе");

    return res.status(200).json({ message: "Вы успешно вышли из системы" });
  }
  async check(req, res, next) {
    const checkRequestDto = new CheckRequestDto(req.user);
    logger.info(checkRequestDto, "Пользователь проверяет свой токен");

    const userData = await authService.check(checkRequestDto);

    logger.debug(userData, "Получили данные пользователя");

    const user = new CheckResponseDto(userData);

    logger.debug(user, "Отправили данные пользователя");

    return res.json(userData);
  }
}

module.exports = new AuthController();
