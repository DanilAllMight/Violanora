const GetMessagesRequestDto = require("../dtos/message/getMessageRequestDto.request.dto");
const { Dialog } = require("../models/Dialog");
const { Message } = require("../models/Message");
const messageService = require("../services/message-service");
const catchAsync = require("../utils/catchAsync");
const logger = require("../utils/logger");
const { findSocketByUserId } = require("../services/webSocket");
const { getSingleConversation } = require("./conversation-controller");
const AppError = require("../utils/appError");
const errorMessages = require("../constants/errorMessages");
const socketMessages = require("../constants/socketMessages");
require("dotenv").config();

class MessageController {
  async getMessages(req, res, next) {
    const requestDto = new GetMessagesRequestDto(req.params, req.query);

    logger.info(requestDto, "Пользователь запросил список сообщений");

    const { messages, dialog_id } = await messageService.getMessages(
      requestDto.senderId,
      requestDto.receiverId,
      requestDto.before,
      requestDto.limit,
    );

    const partnerSocket = findSocketByUserId(requestDto.receiverId);
    if (partnerSocket) {
      partnerSocket.send(
        JSON.stringify({
          type: "PARTNER_READ_MESSAGES",
          senderId: requestDto.senderId,
          dialogId: dialog_id,
        }),
      );
    }

    logger.debug(messages, "Возвращаем пользователю список сообщений");

    return res.json(messages);
  }

  async uploadChatMedia(req, res, next) {
    logger.debug("Загружаем медиа для сообщения");

    if (!req.files || req.files.length === 0) {
      throw new AppError(errorMessages.FILES_NOT_CHANGES, 404);
    }

    logger.debug("Загружаем медиа для сообщения через storageService");

    const uploadedUrls = await messageService.uploadChatMedia(req.files);

    logger.debug("Медиа файлы успешно загружены в Timeweb S3");

    return res.json({ urls: uploadedUrls });
  }

  async deleteMessage(req, res, next) {
    logger.info("Пользователь удаляет сообщение");
  }

  async forwardMessage(req, res, next) {
    logger.info("Пользователь отвечает на сообщение");
  }

  async replyMessage(req, res, next) {
    logger.info("Пользователь пересылает сообщение");
  }

  async editMessage(req, res, next) {
    logger.info("Пользователь редактирует сообщение");

    const { data } = req.body;

    const userId = req.user.id;
    const targetId = data.targetId;

    const response = await messageService.editMessage(data, userId);

    const mySocket = findSocketByUserId(userId);
    if (mySocket) {
      mySocket.send(
        JSON.stringify({
          type: socketMessages.SERVER_UPDATED_MESSAGE,
          data: response,
        }),
      );
    }

    const partnerSocket = findSocketByUserId(targetId);
    if (partnerSocket) {
      partnerSocket.send(
        JSON.stringify({
          type: socketMessages.SERVER_UPDATED_MESSAGE,
          data: response,
        }),
      );
    }

    return res.json(response);
  }
}

module.exports = new MessageController();
