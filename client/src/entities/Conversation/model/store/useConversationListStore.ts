import { fetchConversations } from "../../api/fetchConversations";
import type { Conversation } from "../types/Conversation";
import { create } from "zustand";

interface ConversationState {
  conversations: Conversation[];
  isLoading: boolean;
  error?: string;
  getConversations: (userId: number) => Promise<void>;
  incrementUnread: (dialogId: string, userId: string) => void;

  updateConversation: (id: string, update: Partial<Conversation>) => void;

  addConversation: (conversation: Conversation) => void;
}

export const useConversationListStore = create<ConversationState>((set) => ({
  conversations: [],
  isLoading: false,

  incrementUnread: (dialogId, userId) => {
    set((state) => {
      const list = [...state.conversations];
      const index = list.findIndex((c) => c.id === dialogId);
      if (index === -1) return state;

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
      const updatedConversations = state.conversations.map((c) => {
        if (String(c.id) === String(id)) {
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

      const chatIndex = updatedConversations.findIndex(
        (c) => String(c.id) === String(id),
      );
      if (chatIndex === -1) return state;

      const result = [...updatedConversations];
      const [movedChat] = result.splice(chatIndex, 1);

      return { conversations: [movedChat, ...result] };
    });
  },

  addConversation: (conversation) => {
    set((state) => {
      const exists = state.conversations.some((c) => c.id === conversation.id);
      if (exists) return state;
      return { conversations: [conversation, ...state.conversations] };
    });
  },
}));
