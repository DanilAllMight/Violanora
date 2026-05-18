import { fetchUsersForAdmin } from "../../api";
import { fetchUsers } from "../../api/fetchUsers";
import { type User } from "../types/userList";
import { create } from "zustand";

interface UsersListSchema {
  users: User[];
  isLoading: boolean;
  error?: string;
  getUsers: () => Promise<void>;
  getUsersForAdmin: () => Promise<void>;
}

export const useUsersListStore = create<UsersListSchema>((set) => ({
  users: [],
  isLoading: false,
  getUsers: async () => {
    set({ isLoading: true });
    try {
      const response = await fetchUsers();
      if (response && response.data) {
        set({ users: response.data.users, isLoading: false, error: undefined });
      } else {
        set({ users: [], isLoading: false });
      }
    } catch (e) {
      set({ error: "Ошибка сервера. Мы уже работаем!", isLoading: false });
    }
  },
  getUsersForAdmin: async () => {
    set({ isLoading: true });
    try {
      const response = await fetchUsersForAdmin();
      if (response && response.data) {
        set({ users: response.data.users, isLoading: false, error: undefined });
      } else {
        set({ users: [], isLoading: false });
      }
    } catch (e) {
      set({ error: "Ошибка сервера. Мы уже работаем!", isLoading: false });
    }
  },
}));
