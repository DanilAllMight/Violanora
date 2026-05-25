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

  async updateMessageContent({
    messageId,
    editingText,
    editingAttachments,
    attachmentsUrls,
  }) {
    logger.debug(`Редактирование содержимого сообщения с ID: ${messageId}`);

    const oldAttachments = Array.isArray(editingAttachments)
      ? editingAttachments
      : [];
    const newAttachments = Array.isArray(attachmentsUrls)
      ? attachmentsUrls
      : [];

    const updatedAttachments = [
      ...oldAttachments.map((file) => ({
        url: file.url,
        type: file.type || "image",
      })),
      ...newAttachments.map((file) => ({
        url: file.url,
        type: file.type || "image",
      })),
    ];

    const updateData = {
      $set: {
        text: editingText || "",
        attachments: updatedAttachments,
      },
    };

    return await this.findByIdAndUpdate(messageId, {
      $set: {
        text: editingText || "",
        attachments: updatedAttachments,
      },
    });
  }
}

module.exports = new MessageRepository();
