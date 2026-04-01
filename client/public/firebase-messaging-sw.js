/*self.addEventListener("install", (event) => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
// Используем только эти ссылки для загрузки библиотек
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyAYcJ3GCAEBqG2bfG1-e4-NiO7z5LvdEQg",
  authDomain: "real-time-chat-7e556.firebaseapp.com",
  projectId: "real-time-chat-7e556",
  storageBucket: "real-time-chat-7e556.firebasestorage.app",
  messagingSenderId: "33062552109",
  appId: "1:33062552109:web:a99e7918472fe4a6a26ea4",
  measurementId: "G-JNFDG60JYP",
};

// Инициализация
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Обработка фоновых уведомлений
messaging.onBackgroundMessage((payload) => {
  console.log("[sw.js] Фоновое сообщение:", payload);
  const notificationTitle = payload.notification.title || "Новое сообщение";
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/favicon.ico",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});*/
