const { Dialog } = require("../models/Dialog");
const { Message } = require("../models/Message");
const { User } = require("../models/models");
const dialogRepository = require("../repositories/dialog-repository");
const messageRepository = require("../repositories/message-repository");
const userRepository = require("../repositories/user-repository");
const { sendNotificationToUser } = require("../services/notification-service");
const logger = require("./logger");
const WebSocket = require("ws");
const socketMsg = require("../constants/socketMessages.js");

function createHandlers(clients, onlineUsers, getSingleConversation) {
  const send = (to, data) => {
    const socket = clients.get(String(to));
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    }
  };

  return {
    handleTyping: (userId, data) => {
      const { to, type, dialogId } = data;
      logger.debug("Отправляем сообщение о печатании");
      send(to, { type, senderId: userId, dialogId });
    },

    handlePingPong: async (ws) => {
      logger.debug("Отправляем сообщение для проверки онлайна");
      ws.send(
        JSON.stringify({
          type: socketMsg.SERVER_PING_PONG,
        }),
      );
    },

    handleVideoCall: async (clients, data, userId) => {
      const targetClient = clients.get(String(data.to));

      if (targetClient && targetClient.readyState === WebSocket.OPEN) {
        targetClient.send(
          JSON.stringify({
            type: data.type,
            payload: data.payload,
            from: userId,
          }),
        );
        logger.debug(
          { type: data.type, userId, to: data.to },
          "Сообщение отправлено",
        );
      } else {
        logger.debug(data.to, "Пользователь не в сети");
      }
    },

    handleMarkAsRead: async (userId, data, ws) => {
      logger.debug("MARK AS READ");
      const dialogId = data.dialogId;
      logger.debug({ dialogId: dialogId });
      const dialog = await dialogRepository.clearUnreadcount(userId, dialogId);
      const partner = dialog.participants.find(
        (p) => String(p) !== String(userId),
      );

      logger.debug(
        { partner, userId, participants: dialog.participants },
        "Пользователь прочитал сообщение сразу",
      );

      await messageRepository.markMessagesAsRead(dialogId, partner);
      await dialogRepository.updateLastMessage(dialogId);

      logger.debug(partner, "Отправляем сообщение партнёру");
      send(String(partner), {
        type: socketMsg.SERVER_PARTNER_READ_MESSAGE,
        senderId: userId,
        dialogId: data.dialogId,
      });
      if (ws.readyState === WebSocket.OPEN) {
        logger.debug(partner, "Отправляем сообщение отправителю");
        ws.send(
          JSON.stringify({
            type: socketMsg.SERVER_PARTNER_READ_MESSAGE,
            senderId: userId,
            dialogId: data.dialogId,
          }),
        );
      }
    },

    handleMessage: async (ws, userId, data) => {
      try {
        const { to, text, tempId, attachments } = data;
        logger.debug(
          { to, text, tempId, attachments },
          "Начало обработки сообщения",
        );
        if (
          !to ||
          !tempId ||
          (!text && (!attachments || attachments.length === 0))
        ) {
          return;
        }

        logger.debug("Проверка пройдена");

        const sTo = String(to);
        const sUserId = String(userId);
        const isSelf = sUserId === sTo;
        const matchKey = [sUserId, sTo].sort().join("_");

        const lastMessageText =
          text || (attachments?.length > 0 ? "📷 Фотография" : "");

        const dialogUpdate = {
          $setOnInsert: { participants: [sUserId, sTo] },
          $set: {
            "lastMessage.text": lastMessageText,
            "lastMessage.senderId": sUserId,
            "lastMessage.status": "sent",
          },
        };

        if (!isSelf) {
          dialogUpdate.$inc = { [`unreadCount.${sTo}`]: 1 };
        }

        const dialog = await dialogRepository.updateDialog(
          matchKey,
          dialogUpdate,
        );

        const create_data = {
          dialogId: dialog._id,
          senderId: sUserId,
          text: text || "",
          attachments: attachments || [],
          receiverId: sTo,
        };

        const newMessage = await messageRepository.create(create_data);

        logger.debug(newMessage, "Сообщение сохранено");

        const user = await userRepository.findById(sTo);
        const sender = await userRepository.findById(sUserId);

        logger.debug(
          {
            type: socketMsg.SERVER_NEW_MESSAGE,
            dialogId: dialog._id,
            senderId: sUserId,
            receiverId: sTo,
            text: text,
            attachments: newMessage.attachments,
            createdAt: newMessage.createdAt,
          },
          "Отправляем сообщение",
        );

        if (ws.readyState === WebSocket.OPEN) {
          logger.debug("Подтверждаем отправку сообщения");
          ws.send(
            JSON.stringify({
              type: socketMsg.SERVER_SENT_CONFIRMED,
              messageId: newMessage._id,
              tempId: tempId,
              hh: "1",
            }),
          );
        }

        send(sTo, {
          type: socketMsg.SERVER_NEW_MESSAGE,
          dialogId: dialog._id,
          senderId: sUserId,
          receiverId: sTo,
          text: text,
          attachments: newMessage.attachments,
          createdAt: newMessage.createdAt,
        });

        logger.debug("Отправляем уведомление");

        const toUsr = await userRepository.findById(to);
        const usr = await userRepository.findById(userId);

        await sendNotificationToUser(
          sTo,
          "Новое сообщение",
          `${usr.username}: ${text}`,
          `/chat/${userId}/${usr.username}`, // ссылка куда перейдет юзер при клике
        );
      } catch (e) {
        logger.error(e, "Ошибка обработки сообщения");
      }
    },
  };
}

module.exports = createHandlers;
