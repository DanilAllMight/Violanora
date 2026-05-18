const GetConversationsResponseDto = require("../dtos/conversation/getConversations.response.dto");
const GetConversationResponseDto = require("../dtos/conversation/getConversations.response.dto");
const { Dialog } = require("../models/Dialog");
const { User } = require("../models/models");
const conversationService = require("../services/conversation-service");
const catchAsync = require("../utils/catchAsync");
const logger = require("../utils/logger");

class ConversationController {
  async getConversations(req, res, next) {
    const userId = req.user.id;
    logger.info(userId, "Пользователь запросил список разговоров");

    const conversations = await conversationService.getConversations(userId);

    const response = conversations.map(
      (conv) => new GetConversationResponseDto(conv),
    );

    logger.debug(response, "Возвращаем список разговоров пользователю");

    return res.json(response);
  }

  async getConversation(req, res, next) {
    const { userId, partnerId } = req.params;

    logger.info(userId, "Пользователь запросил информацию о разговоре");

    const conversation = await conversationService.getConversation(
      userId,
      partnerId,
    );

    const response = new GetConversationsResponseDto(conversation);

    logger.debug(response, "Возвращаем пользователю информацию о разговоре");

    return res.json(response);
  }
}

module.exports = new ConversationController();
