const errorMessages = require("../constants/errorMessages");
const { Dialog } = require("../models/Dialog");
const { User } = require("../models/models");
const dialogRepository = require("../repositories/dialog-repository");
const userRepository = require("../repositories/user-repository");
const AppError = require("../utils/appError");
const logger = require("../utils/logger");

class ConversationService {
  async getConversations(userId) {
    logger.debug("Начало получения диалогов");
    const sUserId = String(userId);
    const dialogs = await dialogRepository.findByParticipant(sUserId);

    logger.debug("Список диалогов найден");

    const allParticipantIds = new Set();
    dialogs.forEach((d) =>
      d.participants.forEach((id) => allParticipantIds.add(id)),
    );

    const usersInfo =
      await userRepository.findUsersForConversationWitnParticipants(
        allParticipantIds,
      );

    const usersMap = {};
    usersInfo.forEach((u) => {
      usersMap[String(u.id)] = u;
    });

    const enrichedDialogs = dialogs.map((d) => ({
      ...d,
      participants: d.participants.map(
        (id) => usersMap[String(id)] || { id, username: "Unknown" },
      ),
    }));

    logger.debug(enrichedDialogs, "Возращаем разговоры");

    return enrichedDialogs;
  }

  async getConversation(userId, partnerId) {
    logger.debug(userId, "Начало получения информации о разговоре");
    const sUserId = String(userId);
    const sPartnerId = String(partnerId);

    const dialog = await dialogRepository.findByParticipants(
      sUserId,
      sPartnerId,
    );

    const usersInfo = await userRepository.findUsersForConversation(
      userId,
      partnerId,
    );

    const usersMap = {};
    usersInfo.forEach((u) => {
      usersMap[String(u.id)] = u;
    });

    if (!dialog) {
      logger.debug("Разговора нет");
      return {
        _id: null,
        participants: [sUserId, sPartnerId].map(
          (id) =>
            usersMap[String(id)] || {
              id,
              username: "Unknown",
              avatar_url: null,
            },
        ),
        lastMessage: null,
        unreadCount: {},
      };
    }

    const enrichedDialog = {
      ...dialog,
      participants: dialog.participants.map(
        (id) => usersMap[String(id)] || { id, username: "Unknown" },
      ),
    };

    logger.debug(enrichedDialog, "Возращаем разговоры");

    return enrichedDialog;
  }

  async getSingleConversation(userId, partnerId) {
    logger.debug(userId, "Начало получения одиночного диалога");
    const sUserId = String(userId);
    const sPartnerId = String(partnerId);

    const dialog = await dialogRepository.findByParticipants(
      sUserId,
      sPartnerId,
    );

    if (!dialog) {
      logger.debug("Разговора нет");
      throw new AppError(errorMessages.DIALOG_NOT_EXIST, 403);
    }

    const usersInfo = await userRepository.findUsersForConversation(
      sUserId,
      sPartnerId,
    );
    const usersMap = {};
    usersInfo.forEach((u) => {
      usersMap[String(u.id)] = u;
    });

    const enrichedDialog = {
      ...dialog,
      participants: dialog.participants.map(
        (id) => usersMap[String(id)] || { id, username: "Unknown" },
      ),
    };

    logger.debug(enrichedDialog, "Возващаем диалоги");

    return enrichedDialog;
  }

  async getUnreadConversations(userId) {
    logger.debug(userId, "Начало получения списка непрочитанных диалогов");

    const sUserId = String(userId);

    const dialogs = await dialogRepository.findUnreadConversations(userId);

    const unreadDialogIds = dialogs.map((d) => d._id.toString());

    logger.debug(unreadDialogIds, "Получен список диалогов");

    return unreadDialogIds;
  }
}

module.exports = new ConversationService();
