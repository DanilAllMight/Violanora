// public/sw.js
// public/sw.js
// public/sw.js
self.addEventListener("push", (event) => {
  console.log("SW: [Push Event] Сигнал получен");

  let data = { title: "Новое сообщение", body: "Зайдите в чат" };

  if (event.data) {
    try {
      data = event.data.json();
      console.log("SW: [Data] JSON распарсен:", data);
    } catch (e) {
      data = { title: "Тестовое уведомление", body: event.data.text() };
      console.log("SW: [Data] Получен текст:", data.body);
    }
  }

  const promiseChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true, // ВАЖНО: видим все вкладки, даже "холодные"
    })
    .then((clientList) => {
      console.log(`SW: [Clients] Найдено вкладок: ${clientList.length}`);

      // 1. Всегда шлем сообщение во все вкладки (для теста)
      clientList.forEach((client) => {
        console.log(`SW: [Message] Отправка в клиент ID: ${client.id}`);
        client.postMessage({
          type: "PUSH_RECEIVED",
          payload: data,
        });
      });

      // 2. Решаем, показывать ли системный баннер
      // Проверяем, есть ли хоть одна видимая вкладка
      const hasVisibleClient = clientList.some(
        (client) => client.visibilityState === "visible",
      );

      if (hasVisibleClient) {
        console.log(
          "SW: [Status] Вкладка активна, системный пуш подавлен (ждем тост в React)",
        );
        return;
      }

      console.log("SW: [Status] Видимых вкладок нет, показываем системный пуш");
      const options = {
        body: data.body,
        icon: "/logo192.png",
        badge: "/badge.png",
        image: data.image || null,
        tag: "new-message-" + Date.now(), // Уникальный тег, чтобы не группировались в тишину
        renotify: true,
        data: { url: data.url || "/" },
      };

      return self.registration.showNotification(data.title, options);
    });

  event.waitUntil(promiseChain);
});

// Клик по уведомлению
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = new URL(event.notification.data.url, self.location.origin)
    .href;

  const promiseChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      // Проверяем, есть ли уже открытая вкладка с нашим сайтом
      let matchingClient = null;
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen) {
          matchingClient = client;
          break;
        }
      }

      if (matchingClient) {
        return matchingClient.focus(); // Просто переключаем фокус на неё
      } else {
        return clients.openWindow(urlToOpen); // Если нет — открываем новую
      }
    });

  event.waitUntil(promiseChain);
});
