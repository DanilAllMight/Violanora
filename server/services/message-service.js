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
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");

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

  async deleteMessage() {
    logger.debug("Начало удаления сообщения");
  }

  async editMessage(data, userId) {
    logger.debug("Начало редактирования сообщения");

    const messageId = data.messageId;
    const editingText = data.editingText;
    const editingAttachments = data.editingAttachments;
    const attachmentsUrls = data.attachmentsUrls;
    const createdAt = data.createdAt;
    const targetId = data.targetId;

    const updatedMessage = await messageRepository.updateMessageContent({
      messageId,
      editingText,
      editingAttachments,
      attachmentsUrls,
    });

    const dialog = await this.updateLastMessage(
      editingText,
      editingAttachments,
      attachmentsUrls,
      createdAt,
      targetId,
      userId,
    );

    const updatedMessageWithDialog = updatedMessage.toObject();

    updatedMessageWithDialog.dialogId = dialog.id;

    logger.debug(
      { updatedMessage: updatedMessageWithDialog },
      "Сообщения обновлены",
    );

    console.log("VALUE ", updatedMessageWithDialog);

    /*if (updatedMessageWithDialog.text == "") {
      updatedMessageWithDialog.text = "📷 Фотография";
    }*/

    return updatedMessageWithDialog;
  }

  async updateLastMessage(
    editingText,
    editingAttachments,
    attachmentsUrls,
    createdAt,
    targetId,
    userId,
  ) {
    const dialog = await dialogRepository.findByParticipants(userId, targetId);

    const matchKey = [userId, targetId].sort().join("_");

    const lastMessageText =
      editingText ||
      (editingAttachments?.length > 0 || attachmentsUrls?.length > 0
        ? "📷 Фотография"
        : "");

    console.log(
      "BOOL ",
      editingAttachments?.length > 0 || attachmentsUrls?.length > 0,
      " ",
      lastMessageText,
    );

    const dialogUpdate = {
      $set: {
        "lastMessage.text": lastMessageText,
        "lastMessage.senderId": userId,
        "lastMessage.status": "read",
      },
    };

    const res = await dialogRepository.updateDialog(matchKey, dialogUpdate);
    return res;
  }

  async replyMessage() {
    logger.debug("Начало пересылания сообщения");
  }

  async forwardMessage() {
    logger.debug("Начало ответа на сообщение");
  }

  async deleteChatMedia(urls) {
    if (!urls || urls.length === 0) return;

    const deletePromises = urls.map(async (url) => {
      try {
        const cdnUrlWithSlash = process.env.CDN_URL.endsWith("/")
          ? process.env.CDN_URL
          : `${process.env.CDN_URL}/`;
        const fileKey = url.replace(cdnUrlWithSlash, "");

        const params = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: fileKey,
        };

        await s3Client.send(new DeleteObjectCommand(params));
        logger.debug(`Файл успешно удален из S3: ${fileKey}`);
      } catch (error) {
        logger.error(`Не удалось удалить файл из S3 (${url}):`, error);
      }
    });

    await Promise.all(deletePromises);
  }
}

module.exports = new MessageService();
