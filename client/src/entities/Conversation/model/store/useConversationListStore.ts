import { fetchConversations } from "../../api/fetchConversations";
import type { Conversation } from "../types/Conversation";
import { create } from "zustand";

interface ConversationState {
  conversations: Conversation[];
  isLoading: boolean;
  error?: string;
  getConversations: (userId: number) => Promise<void>;
  incrementUnread: (dialogId: string, userId: string) => void;

  // Универсальный метод для обновления ПОЛЕЙ и поднятия ВВЕРХ
  updateConversation: (id: string, update: Partial<Conversation>) => void;

  // Для добавления нового чата (которого еще нет в списке)
  addConversation: (conversation: Conversation) => void;
}

export const useConversationListStore = create<ConversationState>((set) => ({
  conversations: [],
  isLoading: false,

  incrementUnread: (dialogId, userId) => {
    set((state) => {
      const list = [...state.conversations];
      const index = list.findIndex((c) => c._id === dialogId);
      if (index === -1) return state;

      console.log("INCREMENT");

      const existing = list[index];
      const currentCount = existing.unreadCount?.[userId] || 0;

      const updatedChat = {
        ...existing,
        unreadCount: {
          ...existing.unreadCount,
          [userId]: currentCount + 1,
        },
      };

      list.splice(index, 1);

      console.log("UPDATED CHAT ", updatedChat);
      return { conversations: [updatedChat, ...list] };
    });
  },

  getConversations: async (userId: number) => {
    set({ isLoading: true });
    try {
      const response = await fetchConversations({ userId });
      if (response?.data) {
        set({ conversations: response.data, isLoading: false });
      }
    } catch (e) {
      set({ error: "Не удалось загрузить чаты", isLoading: false });
    }
  },

  updateConversation: (id, update) => {
    set((state) => {
      // 1. Создаем новый массив, где нужный чат обновлен, а остальные остались прежними
      const updatedConversations = state.conversations.map((c) => {
        if (String(c._id) === String(id)) {
          // Создаем абсолютно новый объект чата
          return {
            ...c,
            ...update,
            lastMessage: update.lastMessage
              ? { ...c.lastMessage, ...update.lastMessage }
              : c.lastMessage,
            unreadCount: update.unreadCount
              ? { ...c.unreadCount, ...update.unreadCount }
              : c.unreadCount,
          };
        }
        return c;
      });

      // 2. Если нужно поднять обновленный чат вверх списка:
      const chatIndex = updatedConversations.findIndex(
        (c) => String(c._id) === String(id),
      );
      if (chatIndex === -1) return state;

      const result = [...updatedConversations];
      const [movedChat] = result.splice(chatIndex, 1);

      return { conversations: [movedChat, ...result] };
    });
  },

  addConversation: (conversation) => {
    set((state) => {
      const exists = state.conversations.some(
        (c) => c._id === conversation._id,
      );
      if (exists) return state; // Чтобы не дублировать
      return { conversations: [conversation, ...state.conversations] };
    });
  },
}));
