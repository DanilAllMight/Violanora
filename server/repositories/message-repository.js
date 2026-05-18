const { Message } = require("../models/Message");
const logger = require("../utils/logger");
const MongoBaseRepository = require("./base/mongo.base.repository");

class MessageRepository extends MongoBaseRepository {
  constructor() {
    super(Message);
  }

  async markMessagesAsRead(dialogId, partnerId) {
    logger.debug("Отмечаем сообщение как прочитанное");
    const data = await this.updateMany(
      {
        dialogId: dialogId,
        senderId: partnerId,
        status: "sent",
      },
      { $set: { status: "read" } },
    );
    return data;
  }

  async getChatHistory(dialogId, limit = 20) {
    logger.debug("Получаем историю разговора");
    return await this.findMany(
      { dialogId },
      { limit, sort: { createdAt: -1 } },
    );
  }
}

module.exports = new MessageRepository();
