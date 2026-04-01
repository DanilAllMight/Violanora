import { fetchConversations } from "../../api/fetchConversations";
import type { Conversation } from "../types/Conversation";
import { create } from "zustand";

interface ConversationState {
  conversations: Conversation[]; // Здесь всегда массив объектов типа User
  isLoading: boolean;
  error?: string;
  getConversations: (userId: number) => Promise<void>;
  setConversation: (conversation: Conversation) => void;
}

export const useConversationListStore = create<ConversationState>((set) => ({
  conversations: [],
  isLoading: false,
  getConversations: async (userId: number) => {
    set({ isLoading: true });
    try {
      const response = await fetchConversations({ userId });
      if (response && response.data) {
        set({ conversations: response.data, isLoading: false });
      }
    } catch (e) {
      set({ error: "Не удалось загрузить список чатов", isLoading: false });
    }
  },
  setConversation: (conversation: Conversation) => {
    set((state) => {
      // 1. Ищем существующий диалог в текущем стейте
      const existing = state.conversations.find(
        (c) => c._id === conversation._id,
      );

      if (existing) {
        console.log("Перемещаем существующий диалог вверх");
        // Убираем старый объект из списка
        const otherConversations = state.conversations.filter(
          (c) => c._id !== conversation._id,
        );
        // Возвращаем его в начало БЕЗ обновления данных (используем 'existing')
        return { conversations: [existing, ...otherConversations] };
      }

      console.log("Добавляем новый диалог в начало");
      // Если его нет совсем — добавляем новый объект из сокета
      return { conversations: [conversation, ...state.conversations] };
    });
  },
}));
