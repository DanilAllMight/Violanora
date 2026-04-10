const { PushSubscription } = require("../models/models");
const logger = require("../utils/logger");

class SubscribeController {
  async subscribeUser(req, res) {
    try {
      const subscription = req.body;
      const userId = req.user.id; // или req.body.userId для теста

      logger.debug("Subscribe, ", userId, subscription);

      // Sequelize метод для "создай или обнови"
      await PushSubscription.upsert({
        userId: userId,
        subscription: subscription,
      });

      res.status(201).json({ message: "Подписка сохранена через Sequelize" });
    } catch (error) {
      console.error("Ошибка Sequelize:", error);
      res.status(500).json({ error: "Ошибка БД" });
    }
  }
}

module.exports = new SubscribeController();
