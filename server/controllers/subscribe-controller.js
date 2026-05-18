const { PushSubscription } = require("../models/models");
const catchAsync = require("../utils/catchAsync");
const logger = require("../utils/logger");

class SubscribeController {
  subscribeUser = catchAsync(async (req, res, next) => {
    const subscription = req.body;
    const userId = req.user.id;

    logger.info(subscription, "Пользователь хочет создать подписку");

    await PushSubscription.upsert({
      userId: userId,
      subscription: subscription,
    });

    logger.debug("Возвращаем пользователю ответ о подписке");

    res.status(201).json({ message: "Подписка сохранена через Sequelize" });
  });
}

module.exports = new SubscribeController();
