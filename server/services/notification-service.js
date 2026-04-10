const webpush = require("../config/web-push-config");
const { PushSubscription } = require("../models/models");

const sendNotificationToUser = async (userId, title, body, url = "/") => {
  try {
    // Ищем запись в базе
    const userSub = await PushSubscription.findOne({ where: { userId } });

    if (!userSub) return;

    const payload = JSON.stringify({ title, body, url });

    await webpush.sendNotification(userSub.subscription, payload);
  } catch (error) {
    if (error.statusCode === 410) {
      // Удаляем невалидную подписку
      await PushSubscription.destroy({ where: { userId } });
    }
  }
};

module.exports = { sendNotificationToUser };
