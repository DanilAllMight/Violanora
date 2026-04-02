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
        console.log("Обновляем данные и перемещаем диалог вверх");

        // Создаем НОВЫЙ объект: берем всё из старого и ПЕРЕЗАПИСЫВАЕМ новыми данными из сокета
        // Это обновит и текст сообщения, и senderId (для корректного isMine)
        const updatedConversation = {
          ...existing,
          ...conversation,
        };

        // Убираем старую копию из списка по _id
        const otherConversations = state.conversations.filter(
          (c) => c._id !== conversation._id,
        );

        // Возвращаем НОВЫЙ массив с ОБНОВЛЕННЫМ объектом в начале
        return { conversations: [updatedConversation, ...otherConversations] };
      }

      console.log("Добавляем абсолютно новый диалог в начало");
      return { conversations: [conversation, ...state.conversations] };
    });
  },
}));
