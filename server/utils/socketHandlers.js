const { Dialog } = require("../models/Dialog");
const { Message } = require("../models/Message");
const { User } = require("../models/models");
const { sendNotificationToUser } = require("../services/notification-service");
const logger = require("./logger");
const WebSocket = require("ws");

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
      logger.info(`handleTyping, TYPE=${type}`);
      send(to, { type, senderId: userId, dialogId });
    },

    handleMarkAsRead: async (userId, data, ws) => {
      const dialog = await Dialog.findByIdAndUpdate(data.dialogId, {
        $set: { [`unreadCount.${userId}`]: 0 },
      });
      const partner = dialog.participants.find(
        (p) => String(p) !== String(userId),
      );
      console.log(
        "PARTNER USERID",
        partner,
        " ",
        userId,
        " ",
        dialog.participants,
      );

      await Message.updateMany(
        {
          dialogId: data.dialogId,
          senderId: partner, // сообщения от партнера
          status: "sent", // которые еще не прочитаны
        },
        { $set: { status: "read" } },
      );
      await Dialog.findByIdAndUpdate(data.dialogId, {
        $set: { "lastMessage.status": "read" },
      });

      logger.info("В том же чате");
      console.log("PARTNER_READ_MESSAGES ", String(partner));
      send(String(partner), {
        type: "PARTNER_READ_MESSAGES",
        senderId: userId,
        dialogId: data.dialogId,
      });
      if (ws.readyState === WebSocket.OPEN) {
        console.log("PARTNER_READ_MESSAGES  2 ");
        ws.send(
          JSON.stringify({
            type: "PARTNER_READ_MESSAGES",
            senderId: userId,
            dialogId: data.dialogId,
          }),
        );
      }
    },

    handleMessage: async (ws, userId, data) => {
      try {
        const { to, text, tempId, attachments } = data;
        console.log("СООБЩЕНИЕ ПОЛУЧЕНО");
        if (
          !to ||
          !tempId ||
          (!text && (!attachments || attachments.length === 0))
        ) {
          return;
        }

        console.log("ПРОДОЛЖЕНО ", tempId);

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

        const dialog = await Dialog.findOneAndUpdate(
          { matchKey },
          dialogUpdate,
          { upsert: true, new: true },
        );

        const newMessage = await Message.create({
          dialogId: dialog._id,
          senderId: sUserId,
          text: text || "",
          attachments: attachments || [],
          receiverId: sTo,
        });

        console.log(`📩 Сообщение сохранено в диалог ${dialog._id} ${text}`);

        const user = await User.findByPk(sTo);
        const sender = await User.findByPk(sUserId);
        //console.log("FCM TOKEN USER ", user);

        send(sTo, {
          type: "NEW_MESSAGE",
          dialogId: dialog._id,
          senderId: sUserId,
          receiverId: sTo,
          text: text,
          attachments: newMessage.attachments,
          createdAt: newMessage.createdAt,
        });

        console.log("СТАРТ ОТПРАВКИ УВЕДОМЛЕНИЯ");

        const toUsr = await User.findByPk(to);
        const usr = await User.findByPk(userId);

        await sendNotificationToUser(
          sTo,
          "Новое сообщение",
          `${usr.username}: ${text}`,
          `/chat/${userId}/${usr.username}`, // ссылка куда перейдет юзер при клике
        );

        if (ws.readyState === WebSocket.OPEN) {
          console.log("SENT_CONFIRMED");
          ws.send(
            JSON.stringify({
              type: "SENT_CONFIRMED",
              messageId: newMessage._id,
              tempId: tempId,
              hh: "1",
            }),
          );
        }
      } catch (e) {
        console.error("❌ Ошибка в handleMessage:", e);
      }
    },
  };
}

module.exports = createHandlers;
