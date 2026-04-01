const WebSocket = require("ws");
const { Dialog } = require("./models/Dialog");
const { Message } = require("./models/Message");
const {
  getSingleConversation,
} = require("./controllers/conversation-controller");
const createHandlers = require("./utils/socketHandlers.js");
const logger = require("./utils/logger.js");
let clientsMap = new Map();

function setupWebSocket(server) {
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
    const message = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  const handlers = createHandlers(clients, onlineUsers, getSingleConversation);

  wss.on("connection", function connection(ws, req) {
    // Получаем URL пользователя, чтобы добавить его в список и потом иметь возможность отправить ответ
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const userId = url.searchParams.get("userId");

    console.log("CONNECTED ", userId);

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
        console.log(
          `♻️ Юзер ${sUserId} обновил страницу. Статус не прерывался.`,
        );
      }

      // Если пользователя нет в словаре тех, кто в сети, это его нужно туда добавить и оповестить об этом всех
      if (!onlineUsers.has(sUserId)) {
        onlineUsers.add(sUserId);
        broadcast({ type: "USER_ONLINE", userId: Number(sUserId) });
        console.log(`✅ Пользователь ${sUserId} вошел в сеть`);
      }

      // Отправляем клиенту ответ в виде списка всех пользователей в сети
      ws.send(
        JSON.stringify({
          type: "INITIAL_ONLINE_LIST",
          userIds: Array.from(onlineUsers).map(Number),
        }),
      );
    }

    ws.on("message", async function incoming(rawData) {
      try {
        const data = JSON.parse(rawData);
        const { type } = data;

        logger.info("TYPE=", type);

        switch (type) {
          case "TYPING_START":
          case "TYPING_STOP":
            handlers.handleTyping(userId, data);
            break;
          case "MARK_AS_READ":
            await handlers.handleMarkAsRead(userId, data, ws);
            break;
          case "MESSAGE":
            await handlers.handleMessage(ws, userId, data);
            break;
        }
      } catch (e) {
        console.error("❌ Ошибка WS:", e);
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
              broadcast({ type: "USER_OFFLINE", userId: Number(sUserId) });
              console.log(`❌ Юзер ${sUserId} покинул сеть (таймер истек)`);
            }
            // Если вернулся
            offlineTimers.delete(sUserId);
          }, 5000); // 5 секунд задержки

          offlineTimers.set(sUserId, timerId);
        } else {
          console.log(
            `ℹ️ У юзера ${sUserId} закрыта вкладка (осталось: ${count})`,
          );
        }
      }
    });
  });

  return wss;
}

const findSocketByUserId = (userId) => {
  return clientsMap.get(String(userId));
};

module.exports = { setupWebSocket, findSocketByUserId };
