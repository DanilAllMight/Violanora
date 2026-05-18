self.addEventListener("push", (event) => {
  let data = { title: "Новое сообщение", body: "Зайдите в чат" };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "Тестовое уведомление", body: event.data.text() };
    }
  }

  const promiseChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((clientList) => {
      clientList.forEach((client) => {
        client.postMessage({
          type: "PUSH_RECEIVED",
          payload: data,
        });
      });
      а;
      const hasVisibleClient = clientList.some(
        (client) => client.visibilityState === "visible",
      );

      if (hasVisibleClient) {
        return;
      }

      const options = {
        body: data.body,
        icon: "/logo192.png",
        badge: "/badge.png",
        image: data.image || null,
        tag: "new-message-" + Date.now(),
        renotify: true,
        data: { url: data.url || "/" },
      };

      return self.registration.showNotification(data.title, options);
    });

  event.waitUntil(promiseChain);
});

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
      let matchingClient = null;
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen) {
          matchingClient = client;
          break;
        }
      }

      if (matchingClient) {
        return matchingClient.focus();
      } else {
        return clients.openWindow(urlToOpen);
      }
    });

  event.waitUntil(promiseChain);
});
