const { Dialog } = require("../models/Dialog");
const { Message } = require("../models/Message");
const { findSocketByUserId } = require("../webSocket");

class ChatController {
  async getMessages(req, res) {
    try {
      const { senderId, receiverId } = req.params;
      // Получаем из query-параметров (например, ?before=2023-10-01...&limit=20)
      const { before, limit = 20 } = req.query;

      const matchKey = [senderId, receiverId].sort().join("_");
      const dialog = await Dialog.findOne({ matchKey });

      if (!dialog) return res.json([]);

      // Формируем фильтр
      const query = { dialogId: dialog._id };

      // Если передан 'before' (дата или ID), ищем сообщения СТАРШЕ этого значения
      if (before) {
        query.createdAt = { $lt: new Date(before) };
      }

      await Message.updateMany(
        {
          dialogId: dialog._id,
          senderId: receiverId, // сообщения от партнера
          status: "sent", // которые еще не прочитаны
        },
        { $set: { status: "read" } },
      );

      const messages = await Message.find(query)
        .sort({ createdAt: -1 }) // Сначала берем самые свежие для этой порции
        .limit(parseInt(limit));

      // Возвращаем в правильном хронологическом порядке для фронтенда
      const result = messages.reverse();

      // Обнуляем счетчик только при первой загрузке (когда нет 'before')
      if (!before) {
        await Dialog.findByIdAndUpdate(dialog._id, {
          $set: { [`unreadCount.${senderId}`]: 0 },
        });
      }

      // 2. Оповещаем партнера через сокет (если он онлайн)
      const partnerSocket = findSocketByUserId(receiverId);
      if (partnerSocket) {
        partnerSocket.send(
          JSON.stringify({
            type: "PARTNER_READ_MESSAGES",
            senderId: senderId, // ID того, кто прочитал сообщения
          }),
        );
      }

      res.json(result);
    } catch (error) {
      console.error("Ошибка при получении сообщений:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async searchByMessages(req, res) {
    try {
      const { userId, query } = req.query;
      if (!query) return res.json([]);

      // 1. Ищем сообщения, где есть этот текст и где участвует юзер
      const messages = await Message.find({
        $text: { $search: query }, // Текстовый поиск (быстрее)
        $or: [{ senderId: userId }, { receiverId: userId }],
      })
        .select("dialogId")
        .lean();

      // 2. Достаем уникальные ID диалогов
      const dialogIds = [...new Set(messages.map((m) => m.dialogId))];

      // 3. Находим сами диалоги и обогащаем их данными (имена, аватарки)
      const dialogs = await Dialog.find({
        _id: { $in: dialogIds },
      })
        .sort({ updatedAt: -1 })
        .lean();

      // Обогащаем данными из Postgres (ваш существующий метод)
      const enriched = await this.enrichWithPostgresData(dialogs);

      res.json(enriched);
    } catch (e) {
      console.error(e);
      res.status(500).send("Ошибка поиска по сообщениям");
    }
  }
}

module.exports = new ChatController();
