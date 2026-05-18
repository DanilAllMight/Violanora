const { Dialog } = require("../models/Dialog");
const logger = require("../utils/logger");
const MongoBaseRepository = require("./base/mongo.base.repository");

class DialogRepository extends MongoBaseRepository {
  constructor() {
    super(Dialog);
  }

  async clearUnreadcount(userId, dialogId) {
    logger.debug("Очищаем непрочитанные сообщения");
    const data = await this.findByIdAndUpdate(
      dialogId,
      {
        $set: { [`unreadCount.${userId}`]: 0 },
      },
      { new: true },
    );
    return data;
  }

  async updateLastMessage(dialogId) {
    logger.debug("Обновляем последнее сообщение");
    const data = await this.findByIdAndUpdate(dialogId, {
      $set: { "lastMessage.status": "read" },
    });
    return data;
  }

  async updateDialog(matchKey, dialogUpdate) {
    logger.debug("Обновляем разговор");
    const data = await this.findOneAndUpdate({ matchKey }, dialogUpdate);
    return data;
  }

  async findByParticipants(userId, partnerId) {
    logger.debug("Поиск по участникам");
    return await this.findOne({
      participants: { $all: [userId, partnerId] },
    });
  }

  async findByParticipant(userId) {
    logger.debug("Поиск по участнику");
    return await this.find({
      participants: { $in: [userId] },
    });
  }
}

module.exports = new DialogRepository();
