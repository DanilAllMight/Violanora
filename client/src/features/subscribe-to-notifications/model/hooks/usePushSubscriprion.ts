import { sendSubscriptionToServer } from "../../api/subscribeApi";
import { urlBase64ToUint8Array } from "../lib/urlBase64ToUint8Array";
import logger from "@/utils/logger";
import { useEffect } from "react";

export const usePushSubscription = (isAuth: boolean) => {
  useEffect(() => {
    console.log("USEPUSH ", isAuth);
    if (!isAuth) return;

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
