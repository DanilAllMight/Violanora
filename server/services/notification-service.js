const webpush = require("../config/web-push-config");
const { PushSubscription } = require("../models/models");
const logger = require("../utils/logger");

const sendNotificationToUser = async (userId, title, body, url = "/") => {
  try {
    logger.debug("Начало отправки уведомления");
    const userSub = await PushSubscription.findOne({ where: { userId } });

    if (!userSub) {
      logger.debug("Пользователя нет в базе уведомлений");
      return;
    }

    const payload = JSON.stringify({ title, body, url });

    await webpush.sendNotification(userSub.subscription, payload);
    logger.debug(payload, "Уведомление отправлено");
  } catch (error) {
    logger.error(error, "Ошибка отправки уведомления");
    if (error.statusCode === 410) {
      await PushSubscription.destroy({ where: { userId } });
    }
  }
};

module.exports = { sendNotificationToUser };
