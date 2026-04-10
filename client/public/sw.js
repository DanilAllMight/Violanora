// public/sw.js
self.addEventListener("push", (event) => {
  const data = event.data
    ? event.data.json()
    : { title: "Новое сообщение", body: "Зайдите в чат" };

  const options = {
    body: data.body,
    icon: "/logo192.png", // Путь к иконке в папке public
    badge: "/badge.png", // Маленькая иконка для статус-бара (Android)
    data: {
      url: data.url || "/", // Ссылка, которую передал бэкенд
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Клик по уведомлению
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    // Открываем URL из данных или главную
    clients.openWindow(event.notification.data.url),
  );
});
