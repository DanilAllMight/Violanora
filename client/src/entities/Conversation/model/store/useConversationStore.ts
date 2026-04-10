import { fetchConversation } from "../../api/fetchConversation";
import { create } from "zustand";

interface ConversationStoreState {
  activeDialogId: string | null;
  partner: {
    username: string | null;
    avatar: string | null;
  };
  typingUsers: Set<string>;

  setTyping: (userId: string, isTyping: boolean) => void;
  setActiveDialog: (
    id: string,
    username: string,
    avatar: string | null,
  ) => void;
  resetActiveDialog: () => void;
  getConversation: (userId: number, partnerId: number) => void;
}

export const useConversationStore = create<ConversationStoreState>(
  (set, get) => ({
    activeDialogId: null,
    typingUsers: new Set(),
    partner: {
      username: "",
      avatar: null,
    },

    setActiveDialog: (id, username, avatar) => {
      set({
        activeDialogId: id,
        partner: { username, avatar },
      });

      // ВАЖНО: Обнуляем счетчик в списке чатов (в другом сторе)
      // Предположим, у тебя в AuthStore лежит текущий userId
      // useConversationListStore.getState().updateConversation(id, { unreadCount: { [myId]: 0 } });
    },

    setTyping: (userId, isTyping) => {
      //console.log(`TYPING ${isTyping}`);

      set((state) => {
        // В Zustand нельзя мутировать стейт напрямую, поэтому создаем новый Set
        const newSet = new Set(state.typingUsers);
        if (isTyping) {
          newSet.add(String(userId));
        } else {
          newSet.delete(String(userId));
        }
        return { typingUsers: newSet };
      });
    },

    resetActiveDialog: () => {
      //console.log(`[ChatStore] Resetting active dialog`);
      set({ activeDialogId: null });
    },

    getConversation: async (userId, partnerId) => {
      try {
        const response = await fetchConversation({ userId, partnerId });
        if (response?.data) {
          const partnerData = response.data.participants.find(
            (p: any) => p.id === partnerId,
          );

          // Используем метод этого же стора для консистентности
          get().setActiveDialog(
            response.data._id,
            partnerData?.username || "",
            partnerData?.avatar_url || null,
          );
        }
      } catch (e) {
        console.error("Ошибка загрузки диалога", e);
      }
    },

    // Обновляем текст сообщения в сторе
  }),
);
