import { sendSubscriptionToServer } from "../../api/subscribeApi";
import { urlBase64ToUint8Array } from "../lib/urlBase64ToUint8Array";

export const usePushSubscription = () => {
  const subscribe = async () => {
    if (!("serviceWorker" in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        try {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              import.meta.env.VITE_VAPID_PUBLIC_KEY!,
            ) as any,
          });
          await sendSubscriptionToServer(subscription);
        } catch (e: any) {}
      }

      //await sendSubscriptionToServer(subscription);
      return true;
    } catch (error) {
      return false;
    }
  };

  return { subscribe };
};
