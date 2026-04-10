const { Dialog } = require("../models/Dialog");
const { User } = require("../models/models");

class ConversationController {
  async getConversations(req, res) {
    try {
      const { userId } = req.params;

      const sUserId = String(userId);
      console.log("sUserId ", sUserId, "ПОЛУЧАЕМ СПИСОК ДИАЛОГОВ");
      // 1. Берем диалоги из Монги
      const dialogs = await Dialog.find({ participants: { $in: [sUserId] } })
        .sort({ updatedAt: -1 })
        .lean(); // .lean() сделает их обычными объектами JS

      // 2. Собираем все ID участников (кроме текущего юзера, чтобы меньше искать)
      const allParticipantIds = new Set();
      dialogs.forEach((d) =>
        d.participants.forEach((id) => allParticipantIds.add(id)),
      );

      // 3. Запрос в Postgres (через Sequelize/Prisma или чистый SQL)
      const usersInfo = await User.findAll({
        where: { id: Array.from(allParticipantIds) },
        attributes: ["id", "username", "avatar_url"],
      });

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

      //console.log("DIALOG STATUS ", enrichedDialogs[0].lastMessage);

      res.json(enrichedDialogs);
    } catch (e) {
      console.error(e);
      res.status(500).send("Ошибка сервера");
    }
  }

  async getSingleConversation(userId, partnerId) {
    try {
      const sUserId = String(userId);
      const sPartnerId = String(partnerId);

      console.log("ПОЛУЧЕНИЕ ОДНОГО РАЗГОВОРА");

      // 1. Ищем конкретный диалог в MongoDB
      // Используем $all, чтобы найти документ, где есть оба участника
      const dialog = await Dialog.findOne({
        participants: { $all: [sUserId, sPartnerId] },
      }).lean();

      // Если диалога нет, возвращаем null (чтобы потом отправить NEW_CONVERSATION)
      if (!dialog) return null;

      // 2. Получаем данные пользователей из Postgres
      const usersInfo = await User.findAll({
        where: {
          id: [sUserId, sPartnerId],
        },
        attributes: ["id", "username", "avatar_url"],
      });

      // Создаем карту пользователей для быстрого доступа
      const usersMap = {};
      usersInfo.forEach((u) => {
        usersMap[String(u.id)] = u;
      });

      // 3. Обогащаем диалог данными участников
      const enrichedDialog = {
        ...dialog,
        participants: dialog.participants.map(
          (id) => usersMap[String(id)] || { id, username: "Unknown" },
        ),
      };

      return enrichedDialog;
    } catch (e) {
      console.error("Ошибка при получении одного диалога:", e);
      throw e; // Пробрасываем ошибку выше для обработки в контроллере
    }
  }

  async getConversation(req, res) {
    try {
      const { userId, partnerId } = req.params;
      const sUserId = String(userId);
      const sPartnerId = String(partnerId);

      console.log("ПОЛУЧЕНИЕ ОДНОГО РАЗГОВОРА API");

      // 1. Ищем диалог в MongoDB
      const dialog = await Dialog.findOne({
        participants: { $all: [sUserId, sPartnerId] },
      }).lean();

      // 2. Получаем данные участников из Postgres (нужны даже если диалога нет)
      const usersInfo = await User.findAll({
        where: { id: [sUserId, sPartnerId] },
        attributes: ["id", "username", "avatar_url"],
      });

      const usersMap = {};
      usersInfo.forEach((u) => {
        usersMap[String(u.id)] = u;
      });

      // 3. Если диалога в базе еще нет (первое сообщение)
      if (!dialog) {
        // Возвращаем "скелет" диалога, чтобы клиент мог отрисовать Header (имя, фото)
        return res.json({
          _id: null,
          participants: [sUserId, sPartnerId].map(
            (id) => usersMap[String(id)] || { id, username: "Unknown" },
          ),
          lastMessage: null,
        });
      }

      // 4. Если диалог есть — обогащаем его и отправляем
      const enrichedDialog = {
        ...dialog,
        participants: dialog.participants.map(
          (id) => usersMap[String(id)] || { id, username: "Unknown" },
        ),
      };

      return res.json(enrichedDialog);
    } catch (e) {
      console.error("Ошибка API:", e);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  }
}

module.exports = new ConversationController();
