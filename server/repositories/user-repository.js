const BaseRepository = require("./base/postgres.base.repository");
const { User } = require("../models/models");
const logger = require("../utils/logger");

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    logger.debug("Ищем пользователя по email");
    return await this.findOne({ where: { email } });
  }

  async findByUsername(username) {
    logger.debug("Ищем пользователя по email");
    return await this.findOne({ where: { username } });
  }

  async getAllPublicData() {
    logger.debug("Ищем всех пользователей и считаем");
    return await this.findAndCountAll({
      attributes: [
        "id",
        "email",
        "username",
        "avatar_url",
        "online_time",
        "role",
      ],
    });
  }

  async getAllForAdmin(isAdmin) {
    logger.debug("Получаем список пользователей для администратора");
    return await this.findAndCountAll({
      attributes: [
        "id",
        "email",
        "username",
        "avatar_url",
        "online_time",
        "role",
        "deletedAt",
      ],
      paranoid: !isAdmin,
    });
  }

  async findUsersForConversation(userId, partnerId) {
    logger.debug("Ищем пользователей для разговора");
    return await this.findAll({
      where: { id: [userId, partnerId] },
      attributes: ["id", "username", "avatar_url"],
    });
  }

  async findUsersForConversationWitnParticipants(allParticipantIds) {
    logger.debug("Ищем пользователей для разговора с участниками");
    return await this.findAll({
      where: { id: Array.from(allParticipantIds) },
      attributes: ["id", "username", "avatar_url"],
    });
  }
}

module.exports = new UserRepository();
