import { useUserStore } from "@/entities/User/model/store/useUserStore";
import { LogOut } from "lucide-react";

export const LogoutButton = () => {
  const logout = () => {
    useUserStore.getState().logout();
  };

  return (
    <button
      type="button"
      title="Выйти из аккаунта"
      aria-label="Выйти из аккаунта"
      onClick={logout}
    >
      <LogOut size={20}></LogOut>
    </button>
  );
};
