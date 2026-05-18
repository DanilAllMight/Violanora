const WebSocket = require("ws");
const {
  getSingleConversation,
} = require("../controllers/conversation-controller.js");
const createHandlers = require("../utils/socketHandlers.js");
const logger = require("../utils/logger.js");
const { User } = require("../models/models.js");
let clientsMap = new Map();
const socketMsg = require("../constants/socketMessages.js");
const userRepository = require("../repositories/user-repository.js");

const updateOnlineTime = async (userId) => {
  logger.debug(userId, "Идентификатор пользователя");
  const fnd = await userRepository.findById(userId);
  const data_updated = { online_time: new Date() };
  const user = await userRepository.update(userId, data_updated);
};

const findSocketByUserId = (userId) => {
  return clientsMap.get(String(userId));
};

function setupWebSocket(server) {
  logger.debug("WebSocketServer запущен");
  const wss = new WebSocket.Server({ server });

  const clients = new Map(); // Это карта (модель данных) описывающая пользователей подключённых к сессии в форме userId:id
  clientsMap = clients;
  const onlineUsers = new Set(); // Это словарь всех пользователей, что находятся в сети
  // Эта карта необходимая для того, чтобы отслеживать в скольких вкладках пользователь открыл свой аккаунт,
  // чтобы не было проблем с логикой работы "в сети"
  const userSocketsCount = new Map();
  const offlineTimers = new Map(); // [userId]: timeoutId

  // Метод для рассылания сообщения (события) всем пользователям, находящимся в сессии
  function broadcast(data) {
    logger.debug(data, "Начало рассылки сообщений всем пользователям");
    const message = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        logger.debug("Отправляем сообщение");
        client.send(message);
      }
    });
  }

  const handlers = createHandlers(clients, onlineUsers, getSingleConversation);

  wss.on("connection", function connection(ws, req) {
    // Получаем URL пользователя, чтобы добавить его в список и потом иметь возможность отправить ответ
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const userId = url.searchParams.get("userId");

    logger.info(userId, "Пользователь подсоединился к WebSocket");

    if (userId) {
      const sUserId = String(userId);

      // Увеличиваем счетчик открытых окон
      const count = (userSocketsCount.get(sUserId) || 0) + 1;
      userSocketsCount.set(sUserId, count);
      // Добавляем нового пользователя в список подключённых к сессии
      clients.set(sUserId, ws);

      // Если произошла перезагрузка страницы и был повешен offline таймер, то его необходимо снять
      if (offlineTimers.has(sUserId)) {
        clearTimeout(offlineTimers.get(sUserId));
        offlineTimers.delete(sUserId);
        logger.debug("Пользователь обновил страницу");
      }

      // Если пользователя нет в словаре тех, кто в сети, это его нужно туда добавить и оповестить об этом всех
      if (!onlineUsers.has(sUserId)) {
        onlineUsers.add(sUserId);
        broadcast({
          type: socketMsg.SERVER_USER_ONLINE,
          userId: Number(sUserId),
        });
        logger.debug("Пользователь вошёл в сеть");
      }

      // Отправляем клиенту ответ в виде списка всех пользователей в сети
      ws.send(
        JSON.stringify({
          type: socketMsg.SERVER_ONLINE_LIST,
          userIds: Array.from(onlineUsers).map(Number),
        }),
      );
    }

    ws.on("message", async function incoming(rawData) {
      try {
        logger.debug("Начало обработки сообщения webSocket");
        const data = JSON.parse(rawData);
        const { type } = data;

        logger.info(type, "Пользователь отправил сообщение");

        switch (type) {
          case socketMsg.CLIENT_PING_PONG:
            handlers.handlePingPong(ws);
            break;
          case socketMsg.CLIENT_TYPING_START:
          case socketMsg.CLIENT_TYPING_STOP:
            handlers.handleTyping(userId, data);
            break;
          case socketMsg.CLIENT_MARK_AS_READ:
            await handlers.handleMarkAsRead(userId, data, ws);
            break;
          case socketMsg.CLIENT_MESSAGE:
            await handlers.handleMessage(ws, userId, data);
            break;

          case socketMsg.CLIENT_OFFER:
          case socketMsg.CLIENT_ANSWER:
          case socketMsg.CLIENT_HANGUP:
          case socketMsg.CLIENT_ICE_CANDIDATE:
            handlers.handleVideoCall(clients, data, userId);
            break;
        }
      } catch (e) {
        logger.error(e, "Ошибка обработки сообщения");
      }
    });

    // Действия в случае закрытия (обрыва) соединения
    ws.on("close", () => {
      if (userId) {
        const sUserId = String(userId);

        // Уменьшаем счетчик вкладок
        const count = (userSocketsCount.get(sUserId) || 1) - 1;
        userSocketsCount.set(sUserId, count);

        // Если это была ПОСЛЕДНЯЯ закрытая вкладка
        if (count <= 0) {
          // Если это была случайная перезагрузка, то назначается таймер, чтобы избежать мерцания
          const timerId = setTimeout(() => {
            // Проверяем через 5 секунд: вернулся ли пользователь (если нет)
            if ((userSocketsCount.get(sUserId) || 0) <= 0) {
              onlineUsers.delete(sUserId);
              userSocketsCount.delete(sUserId);
              clients.delete(sUserId);
              updateOnlineTime(userId);
              broadcast({
                type: socketMsg.SERVER_USER_OFFLINE,
                userId: Number(sUserId),
              });
              logger.debug(sUserId, "Пользователь покинул сеть");
            }
            // Если вернулся
            offlineTimers.delete(sUserId);
          }, 5000); // 5 секунд задержки

          offlineTimers.set(sUserId, timerId);
        } else {
          logger.debug(
            { sUserId, count },
            "Пользователь закрыл вкладку и у него осталось",
          );
        }
      }
    });
  });

  return wss;
}

module.exports = { setupWebSocket, findSocketByUserId };
