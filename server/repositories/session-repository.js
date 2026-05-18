const { Session } = require("../models/models");
const logger = require("../utils/logger");
const BaseRepository = require("./base/postgres.base.repository");

class SessionRepository extends BaseRepository {
  constructor() {
    super(Session);
  }

  async findByToken(refreshToken) {
    logger.debug("Ищем сессию по токену");
    return await this.findOne({ where: { refreshToken } });
  }

  async deleteByToken(refreshToken) {
    logger.debug("Удаляем сессию по токену");
    return await this.delete({ where: { refreshToken } });
  }

  async deleteAllByUserId(userId) {
    logger.debug("Удаляем все сессии по id");
    return await this.delete({ where: { userId } });
  }

  async deleteSession(userId, deviceInfo, ipAddress) {
    logger.debug(
      { userId: userId, deviceInfo: deviceInfo, ipAddress: ipAddress },
      "Удаляем сессии",
    );
    return await this.delete({
      where: {
        userId: userId,
        deviceInfo: deviceInfo,
        ipAddress: ipAddress,
      },
    });
  }
}

module.exports = new SessionRepository();
