import { usePushSubscription } from "../model/hooks/usePushSubscriprion";
import * as AccessibleIcon from "@radix-ui/react-accessible-icon";
import { BellIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useState, useEffect } from "react";

interface PushBannerProps {
  isAuth: boolean;
}

const BANNER_STORAGE_KEY = "push_banner_dismissed";

export const PushBanner = ({ isAuth }: PushBannerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const { subscribe } = usePushSubscription();

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const checkVisibility = () => {
      const isDismissed = localStorage.getItem(BANNER_STORAGE_KEY);
      const isDefaultPermission = Notification.permission === "default";

      if (isAuth && isDefaultPermission && !isDismissed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const timer = setTimeout(checkVisibility, 1000);

    return () => clearTimeout(timer);
  }, [isAuth]);

  const handleSubscribe = async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        await subscribe();
        setIsVisible(false);
      } else if (permission === "denied") {
        setIsVisible(false);
      }
    } catch (error) {}
  };

  const handleDismiss = () => {
    localStorage.setItem(BANNER_STORAGE_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-xl duration-300">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
            <BellIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Включить уведомления?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Вы будете получать сообщения, даже когда вкладка закрыта.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSubscribe}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white transition-colors hover:bg-blue-700 active:scale-95"
          >
            Включить
          </button>

          <button
            aria-label="Закрыть баннер"
            onClick={handleDismiss}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          >
            <AccessibleIcon.Root label="Закрыть">
              <Cross2Icon className="h-4 w-4" />
            </AccessibleIcon.Root>
          </button>
        </div>
      </div>
    </div>
  );
};
