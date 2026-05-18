import { type UserAuth, type UserData, type UserSchema } from "../types/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserActions {
  setAuthData: (user: UserAuth) => void;
  logout: () => void;
  setAvatar: (url: string) => void;
  setUserData: (user: UserData) => void;
}

export const useUserStore = create<UserSchema & UserActions>()(
  persist(
    (set) => ({
      _inited: false,
      authData: undefined,
      setAuthData: (user) => set({ authData: user, _inited: true }),
      setUserData: (user: UserData) =>
        set((state) => {
          if (!state.authData) return state;
          return {
            authData: {
              ...state.authData,
              username: user.username,
            },
          };
        }),
      logout: () => {
        set({ authData: undefined });
        localStorage.removeItem("token");
      },
      setAvatar: (url: string) =>
        set((state) => {
          if (!state.authData) return state;

          return {
            authData: {
              ...state.authData,
              avatar_url: url,
            },
          };
        }),
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ authData: state.authData }),
    },
  ),
);
