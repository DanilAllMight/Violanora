import { fetchUserData } from "../../api/fetchUserData";
import type { UserData } from "../types";
import { create } from "zustand";

interface UserProfileStore {
  user: UserData | null;

  isLoading: boolean;
  error: string | null;

  setUserData: (userD: UserData) => void;
  fetchUserData: (value: number) => void;
}

export const useUserProfileStore = create<UserProfileStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  setUserData: (userD) => set({ user: userD }),
  fetchUserData: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchUserData({ userId });
      set({ user: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
