import { AppRouter } from "@/app/providers/router/ui/AppRouter";
import { useOnlineListener } from "@/entities/User/api/useOnlineListener";
import { useUserStore } from "@/entities/User/model/store/useUserStore";
import { usePushSubscription } from "@/features/subscribe-to-notifications";
import { NavBar } from "@/widgets/NavBar";
import { Toaster } from "sonner";

// Импортируем сам объект toast

function App() {
  const authData = useUserStore((state) => state.authData);
  const isAuth = !!authData?.id;

  // Твой слушатель онлайна
  useOnlineListener(authData?.id);

  usePushSubscription(isAuth);

  return (
    <div className="bg-app-bg flex h-full w-full flex-col">
      <Toaster richColors position="top-right" closeButton expand={false} />
      <NavBar />
      <main className="flex h-full w-full flex-grow flex-col overflow-auto">
        <AppRouter />
      </main>
    </div>
  );
}

export default App;
