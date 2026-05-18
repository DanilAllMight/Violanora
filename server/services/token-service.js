const jwt = require("jsonwebtoken");
const { Session } = require("../models/models");
const logger = require("../utils/logger");
const sessionRepository = require("../repositories/session-repository");

class TokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "14d",
    });
    logger.debug("Создаём токены");
    return { accessToken, refreshToken };
  }

  async saveSession(userId, refreshToken, deviceInfo, ipAddress) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    logger.debug("Сохраняем токены");

    const create_data = {
      userId,
      refreshToken,
      deviceInfo,
      ipAddress,
      expiresAt,
    };

    return await sessionRepository.create(create_data);
  }

  async deleteSession(userId, deviceInfo, ipAddress) {
    logger.debug("Удаляем токены");
    return await sessionRepository.deleteSession(userId, deviceInfo, ipAddress);
  }

  async removeSession(refreshToken) {
    logger.debug("Удаляем сессию");
    return await sessionRepository.deleteByToken(refreshToken);
  }

  validateAccessToken(token) {
    logger.debug("Проверяем access токен");
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (e) {
      return null;
    }
  }

  validateRefreshToken(token) {
    logger.debug("Проверяем refresh токен");
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (e) {
      return null;
    }
  }
}

module.exports = new TokenService();
