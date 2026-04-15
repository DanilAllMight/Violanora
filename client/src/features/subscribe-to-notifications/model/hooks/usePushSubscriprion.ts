/*import { sendSubscriptionToServer } from "../../api/subscribeApi";
import { urlBase64ToUint8Array } from "../lib/urlBase64ToUint8Array";
import logger from "@/utils/logger";
import { useEffect } from "react";

export const usePushSubscription = (isAuth: boolean) => {
  useEffect(() => {
    console.log("USEPUSH ", isAuth);
    if (!isAuth) return;

    if (Notification.permission === "denied") {
      console.warn("Пользователь заблокировал уведомления");
      return;
    }

    const subscribe = async () => {
      if ("serviceWorker" in navigator) {
        console.log("SUBSCRIBE");
        const registration = await navigator.serviceWorker.ready;

        let subscription = await registration.pushManager.getSubscription();
        console.log("SUBSCRIBE1");
        if (!subscription) {
          try {
            console.log("SUBSCRIBE2");
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(
                import.meta.env.VITE_VAPID_PUBLIC_KEY!,
              ) as any,
            });
          } catch (error) {
            logger.error(error);
            console.log(error);
            throw error;
          }

          console.log("SUBSCRIBE3");
        }
        console.log("ВЫЗОВ AWAIT");
        await sendSubscriptionToServer(subscription);
      }
    };

    subscribe().catch(console.error);
  }, [isAuth]);
};
*/
import { sendSubscriptionToServer } from "../../api/subscribeApi";
import { urlBase64ToUint8Array } from "../lib/urlBase64ToUint8Array";
import logger from "@/utils/logger";

export const usePushSubscription = () => {
  // Убираем useEffect, теперь это просто функция, которую вызывает кнопка
  const subscribe = async () => {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Worker не поддерживается");
      return false;
    }

    try {
      console.log("Начинаем процесс подписки...");
      const registration = await navigator.serviceWorker.ready;

      // 1. Проверяем текущую подписку
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        console.log("Создаем новую подписку (SUBSCRIBE2)");
        // В Опере этот вызов сработает только внутри onClick!
        console.log(
          "Converted Key:",
          urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY!) as any,
        );
        try {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              import.meta.env.VITE_VAPID_PUBLIC_KEY!,
            ) as any,
          });
          console.log("ПОДПИСКА ПОЛУЧЕНА:", subscription);
          await sendSubscriptionToServer(subscription);
        } catch (e: any) {
          console.error("КРИТИЧЕСКАЯ ОШИБКА OPERA:", e.name, e.message);
        }
      }

      console.log("Отправляем подписку на сервер...");
      //await sendSubscriptionToServer(subscription);
      return true; // Возвращаем успех для закрытия баннера
    } catch (error) {
      logger.error(error);
      console.error("Ошибка при подписке:", error);
      return false;
    }
  };

  // Возвращаем функцию наружу
  return { subscribe };
};
