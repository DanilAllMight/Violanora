import { type UserAuth, type UserSchema } from "../types/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserActions {
  setAuthData: (user: UserAuth) => void;
  logout: () => void;
  setAvatar: (url: string) => void;
}

export const useUserStore = create<UserSchema & UserActions>()(
  persist(
    (set) => ({
      _inited: false,
      authData: undefined,
      setAuthData: (user) => set({ authData: user, _inited: true }),
      logout: () => {
        set({ authData: undefined });
        localStorage.removeItem("token"); // если хранишь токен отдельно
      },
      setAvatar: (url: string) =>
        set((state) => {
          if (!state.authData) return state; // Если данных нет, ничего не меняем

          return {
            authData: {
              ...state.authData,
              avatar_url: url,
            },
          };
        }),
    }),
    {
      name: "user-storage", // автоматически сохранит в LocalStorage
      partialize: (state) => ({ authData: state.authData }), // сохраняем только данные юзера
    },
  ),
);
