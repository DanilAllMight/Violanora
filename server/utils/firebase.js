/*const admin = require("firebase-admin");
const path = require("path");
require("dotenv").config();

// Подгружаем путь из переменных окружения
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
  console.error("❌ Ошибка: FIREBASE_SERVICE_ACCOUNT_PATH не задан в .env");
}

try {
  // Резолвим абсолютный путь к файлу
  const serviceAccount = require(
    path.resolve(process.cwd(), serviceAccountPath),
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });

  console.log("✅ Firebase Admin успешно инициализирован");
} catch (error) {
  console.error("❌ Ошибка инициализации Firebase Admin:", error);
}

/**
 * Отправка Push-уведомления
 * @param {string} token - FCM токен получателя из БД
 * @param {string} title - Заголовок (например, имя отправителя)
 * @param {string} body - Текст сообщения
 * @param {object} data - Дополнительные данные (например, chatId)
 
const sendPushNotification = async (token, title, body, data = {}) => {
  if (!token) return;

  const message = {
    notification: {
      title,
      body,
    },
    // Важно: данные в data должны быть строками
    data: data,
    token: token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("🚀 Уведомление отправлено успешно:", response);
    return response;
  } catch (error) {
    // Если токен невалидный (юзер разлогинился или сбросил кэш),
    // тут можно добавить логику удаления токена из БД
    console.error("❌ Ошибка при отправке уведомления:", error);
  }
};

module.exports = { sendPushNotification };*/
