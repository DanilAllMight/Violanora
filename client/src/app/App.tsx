import { AppRouter } from "@/app/providers/router/ui/AppRouter";
import { useOnlineListener } from "@/entities/User/api/useOnlineListener";
import { useUserStore } from "@/entities/User/model/store/useUserStore";
import { usePushSubscription } from "@/features/subscribe-to-notifications";
import { PushBanner } from "@/features/subscribe-to-notifications/ui/PushBanner/PushBanner";
import { $api } from "@/shared/api";
import { PageLoader } from "@/shared/ui";
import { NavBar } from "@/widgets/NavBar";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast, Toaster } from "sonner";

function App() {
  const authData = useUserStore((state) => state.authData);
  const isAuth = !!authData?.id;

  const location = useLocation();

  const [isInited, setIsInited] = useState(false);
  const { subscribe } = usePushSubscription();

  useOnlineListener(authData?.id);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "PUSH_RECEIVED") {
          const { title, body, url } = event.data.payload;

          console.log("URL ", url);

          if (location.pathname === url) {
            console.log("Уведомление подавлено: пользователь уже в этом чате");
            return;
          }

          toast.info(title, {
            description: body,
            duration: 2000,
          });
        }
      };

      navigator.serviceWorker.addEventListener("message", handleMessage);
      return () =>
        navigator.serviceWorker.removeEventListener("message", handleMessage);
    }
  }, [location.pathname]);

  useEffect(() => {
    console.log("USE EFFECT APP TSX");
    const check = async () => {
      if (isAuth) {
        try {
          await $api.post(`${import.meta.env.VITE_API_URL}/api/user/check`);
        } catch (error) {}
      }
      setIsInited(true);
    };

    const syncSubscription = async () => {
      let permission = Notification.permission;

      // Если еще не спрашивали — спрашиваем
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }

      console.log("CURRENT PERMISSION:", permission);
      if (isAuth && Notification.permission === "granted") {
        console.log("START SUBSCRIBE");
        await subscribe();
      }
    };

    syncSubscription();
    check();
  }, [isAuth, subscribe]); // Добавили зависимости для надежности

  if (!isInited) {
    return <PageLoader />;
  }

  return (
    <div className="bg-app-bg flex h-full w-full flex-col font-sans">
      {/* 
          ВАЖНО: Добавили задержку появления и убрали стандартные стили для custom 
      */}
      <Toaster
        position="top-right"
        visibleToasts={5}
        gap={12}
        richColors
        closeButton
      />
      <NavBar />
      <main className="flex h-full w-full flex-grow flex-col overflow-auto">
        <AppRouter />
        <PushBanner isAuth={isAuth} />
      </main>
    </div>
  );
}

export default App;
