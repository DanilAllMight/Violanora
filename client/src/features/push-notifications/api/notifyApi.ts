// features/push-notifications/api/notifyApi.ts
import { $api } from "@/shared/api/api";
import { messaging, VAPID_KEY } from "@/shared/api/firebase/config";
import { getToken, onMessage, type MessagePayload } from "firebase/messaging";

export const initNotifications = async (userId: number | string) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    // 1. Регистрируем воркер
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      {
        scope: "/",
      },
    );
    await navigator.serviceWorker.ready;

    // --- СЕКРЕТНЫЙ ПИНОК ДЛЯ ОПЕРЫ ---
    // Удаляем старую нативную подписку браузера, если она зависла
    const oldSubscription = await registration.pushManager.getSubscription();
    if (oldSubscription) {
      await oldSubscription.unsubscribe();
      console.log("🧹 [FCM] Старая подписка в Опере принудительно удалена");
    }
    // ---------------------------------

    console.log("🔍 [FCM] Запрашиваю токен...");

    // 2. Получаем токен, передавая регистрацию
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("✅ [FCM] ТОКЕН ПОЛУЧЕН:", token);
      await $api.post("/api/user/fcm-token", { userId, token });
    }
  } catch (error) {
    console.error("🔥 [FCM] Ошибка в Опере:", error);
  }
};

export const onMessageListener = () =>
  new Promise<MessagePayload>((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
