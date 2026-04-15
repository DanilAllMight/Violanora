const webpush = require("../config/web-push-config");
const { PushSubscription } = require("../models/models");

const sendNotificationToUser = async (userId, title, body, url = "/") => {
  try {
    // Ищем запись в базе
    console.log("1");

    const userSub = await PushSubscription.findOne({ where: { userId } });

    console.log("2");

    if (!userSub) return;

    console.log("3");

    const payload = JSON.stringify({ title, body, url });

    console.log("4");

    await webpush.sendNotification(userSub.subscription, payload);

    console.log("ОТПРАВИЛИ УВЕДОМЛЕНИЕ");
  } catch (error) {
    console.log(error);
    if (error.statusCode === 410) {
      // Удаляем невалидную подписку
      await PushSubscription.destroy({ where: { userId } });
    }
  }
};

module.exports = { sendNotificationToUser };
