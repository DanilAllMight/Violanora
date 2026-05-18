const { Dialog } = require("../models/Dialog");
const { Message } = require("../models/Message");
const dialogRepository = require("../repositories/dialog-repository");
const messageRepository = require("../repositories/message-repository");
const AppError = require("../utils/appError");
const errorMsg = require("../constants/errorMessages");
const logger = require("../utils/logger");
const path = require("path");
const { s3Client } = require("../utils/s3");
require("dotenv").config();
const { PutObjectCommand } = require("@aws-sdk/client-s3");

class MessageService {
  async getMessages(senderId, receiverId, before, limit) {
    logger.debug("Начало получения сообщений");
    const matchKey = [senderId, receiverId].sort().join("_");
    const dialog = await dialogRepository.findOne({ matchKey });

    if (!dialog) {
      logger.debug("Разговора нет");
      throw new AppError(errorMsg.DIALOG_NOT_EXIST, 403);
    }

    const query = { dialogId: dialog._id };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const dialogId = dialog._id;

    await messageRepository.markMessagesAsRead(dialogId, receiverId);

    const messages = await messageRepository.getChatHistory(dialogId);

    const result = messages.reverse();

    if (!before) {
      logger.debug({ dialogId: dialogId, senderId: senderId });
      await dialogRepository.clearUnreadcount(senderId, dialogId);
    }

    if (
      dialog.lastMessage &&
      dialog.lastMessage.senderId.toString() === receiverId
    ) {
      await dialogRepository.updateLastMessage(dialogId);
    }

    const response = { messages: result, dialog_id: dialog._id };

    logger.debug(response, "Возращаем сообщения");

    return response;
  }

  async uploadChatMedia(files) {
    const uploadPromises = files.map(async (file) => {
      const fileExt = path.extname(file.originalname);
      const fileName = `messages/${Math.random().toString(36).substring(2, 7)}-${Date.now()}${fileExt}`;

      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      await s3Client.send(new PutObjectCommand(params));

      return `${process.env.CDN_URL}/${fileName}`;
    });

    return Promise.all(uploadPromises);
  }

  async deleteMessage() {}
}

module.exports = new MessageService();
