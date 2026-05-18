const { where } = require("sequelize");
const { User, Session } = require("../models/models");
const tokenService = require("./token-service");
const bcrypt = require("bcrypt");
const userRepository = require("../repositories/user-repository");
const sessionRepository = require("../repositories/session-repository");
const AppError = require("../utils/appError");
const ERR = require("../constants/errorMessages");
const logger = require("../utils/logger");

class AuthService {
  async createUser(email, password, username, userAgent, ip) {
    logger.debug("Начало создания пользователя");
    const candidate = await userRepository.findByEmail(email);
    if (candidate) {
      throw new AppError(ERR.USER_EMAIL_EXISTS, 400);
    }
    logger.debug(
      "Auth Service :: CreateUser - Пользователя с таким email нет ",
    );

    const candidateName = await userRepository.findByUsername(username);
    if (candidateName) {
      throw new AppError(ERR.USER_NAME_EXISTS, 400);
    }

    logger.debug(
      "Auth Service :: CreateUser - Пользователя с таким именем нет",
    );

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.create({
      email,
      hashpassword: hashPassword,
      username,
    });

    const tokens = tokenService.generateTokens({
      id: user.id,
      email: user.email,
    });
    await tokenService.saveSession(user.id, tokens.refreshToken, userAgent, ip);

    const response = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };

    logger.debug(response, "Возвращаем пользователя");

    return response;
  }

  async login(email, password, userAgent, ip) {
    logger.debug({ email: email }, "Начало авторизации");
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(ERR.USER_NOT_EXISTS, 400);
    }

    logger.debug("Пользователь существует");

    const isPassEquals = await bcrypt.compare(password, user.hashpassword);
    if (!isPassEquals) {
      throw new AppError(ERR.PASSWORD_EQUILS, 400);
    }

    logger.debug("Пароли совпадают");

    await tokenService.deleteSession(user.id, userAgent, ip);

    const tokens = tokenService.generateTokens({
      id: user.id,
      email: user.email,
    });
    await tokenService.saveSession(user.id, tokens.refreshToken, userAgent, ip);

    const response = {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar_url: user.avatar_url,
      role: user.role,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };

    logger.debug(response, "Возвращаем пользователя");

    return response;
  }

  async refresh(refreshToken) {
    logger.debug("Начало обновления токенов");
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await sessionRepository.findByToken(refreshToken);

    if (!userData || !tokenFromDb) {
      throw new AppError(ERR.SESSION_NOT_VALIDATED, 403);
    }

    logger.debug("Сессия существует");

    const user = await userRepository.findById(userData.id);

    if (!user) {
      throw new AppError(ERR.USER_NOT_EXISTS, 403);
    }

    logger.debug("Пользователь существует");

    const tokens = tokenService.generateTokens({
      id: user.id,
      email: user.email,
    });

    await sessionRepository.update(tokenFromDb.id, {
      refreshToken: tokens.refreshToken,
    });

    const response = {
      id: user.id,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
    };

    logger.debug(response, "Возвращаем пользователя");

    return response;
  }

  async logout(refreshToken) {
    logger.debug("Выход из системы");
    if (refreshToken) {
      await sessionRepository.deleteByToken(refreshToken);
    }
  }

  async check(checkRequestDto) {
    logger.debug("Начало проверки авторизации по токенам");
    const user = await userRepository.findById(checkRequestDto.id);
    const response = {
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    };
    logger.debug(response, "Возвращаем пользователя");
    return response;
  }
}

module.exports = new AuthService();
