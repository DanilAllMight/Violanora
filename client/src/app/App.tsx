import { AppRouter } from "@/app/providers/router/ui/AppRouter";
import { useConversationStore } from "@/entities/Conversation/model/store/useConversationStore";
import { useOnlineListener } from "@/entities/User/api/useOnlineListener";
import { useUserStore } from "@/entities/User/model/store/useUserStore";
/*import {
  initNotifications,
  onMessageListener,
} from "@/features/push-notifications/api/notifyApi";*/
import { NavBar } from "@/widgets/NavBar";
import { useEffect } from "react";
import { Toaster } from "sonner";

// Импортируем сам объект toast

function App() {
  const authData = useUserStore((state) => state.authData);
  const activeDialogId = useConversationStore((state) => state.activeDialogId);

  // Твой слушатель онлайна
  useOnlineListener(authData?.id);

  useEffect(() => {
    // 1. Инициализируем пуши только если юзер авторизован
    if (authData?.id) {
      //initNotifications(authData.id);
      // 2. Слушаем пуши, которые приходят, пока вкладка ОТКРЫТА
      // Мы используем рекурсивный вызов, чтобы слушать постоянно
      /*const listen = () => {
        onMessageListener()
          .then((payload) => {
            const incomingChatId = payload.data?.dialogId;

            console.log("IDIDID ", incomingChatId, " ", activeDialogId);

            const isNotSameChat = incomingChatId !== activeDialogId;
            const isNotOnMessagesPage = !location.pathname.includes("/chat");
            // Красиво выводим через Sonner

            if (isNotSameChat || isNotOnMessagesPage) {
              toast.message(payload.notification?.title || "Новое сообщение", {
                description: payload.notification?.body,
                action: {
                  label: "Посмотреть",
                  onClick: () => console.log("Переход в чат..."),
                },
              });
            }
            // Запускаем слушатель снова для следующего сообщения
            listen();
          })
          .catch((err) => console.error("FCM Listener error:", err));
      };

      listen();*/
    }
  }, [authData?.id, activeDialogId]);

  return (
    <div className="w-full bg-app-bg flex h-full flex-col">
      <Toaster richColors position="top-right" closeButton expand={false} />
      <NavBar />
      <main className="flex h-full w-full flex-grow flex-col overflow-auto">
        <AppRouter />
      </main>
    </div>
  );
}

export default App;
