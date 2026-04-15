const jwt = require("jsonwebtoken");
const { Session } = require("../models/models"); // путь к твоим моделям

class TokenService {
  // Генерируем пару токенов
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "14d",
    });
    return { accessToken, refreshToken };
  }

  // Сохраняем сессию в БД
  async saveSession(userId, refreshToken, deviceInfo, ipAddress) {
    // Вычисляем срок жизни сессии (30 дней)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Создаем запись в твоей новой таблице
    return await Session.create({
      userId,
      refreshToken,
      deviceInfo,
      ipAddress,
      expiresAt,
    });
  }

  async deleteSession(userId, deviceInfo, ipAddress) {
    return await Session.destroy({
      where: {
        userId: userId,
        deviceInfo: deviceInfo,
        ipAddress: ipAddress,
      },
    });
  }
  // Удаление сессии (для логаута)
  async removeSession(refreshToken) {
    return await Session.destroy({ where: { refreshToken } });
  }

  validateAccessToken(token) {
    try {
      // Проверяем подпись и срок годности
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (e) {
      return null; // Токен просрочен или подделан
    }
  }

  validateRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (e) {
      return null;
    }
  }
}

module.exports = new TokenService();
