import { fetchConversation } from "../../api/fetchConversation";
import { create } from "zustand";

interface ConversationStoreState {
  activeDialogId: string | null;
  partner_username: string | null;
  partner_avatar: string | null;
  unreadCounts: Record<string, number>;
  lastMessages: Record<string, string>;
  typingUsers: Set<string>;

  setTyping: (userId: string, isTyping: boolean) => void;
  setDialogAvatar: (avatar: string | null) => void;
  setActiveDialog: (id: string, username: string) => void;
  resetActiveDialog: () => void;
  setUnreadCount: (dialogId: string, count: number) => void;
  incrementUnread: (dialogId: string) => void;
  clearUnread: (dialogId: string) => void;
  setPartnerUsername: (username: string) => void;
  setLastMessage: (dialogId: string, text: string) => void;
  getConversation: (userId: number, partnerId: number) => void;
}

export const useConversationStore = create<ConversationStoreState>((set) => ({
  activeDialogId: null,
  unreadCounts: {},
  lastMessages: {},
  typingUsers: new Set(),
  partner_username: "",
  partner_avatar: null,

  setPartnerUsername: (username: string) => {
    set({
      partner_username: username,
    });
  },

  setDialogAvatar: (avatar: string | null) => {
    set({
      partner_avatar: avatar,
    });
  },

  setActiveDialog: (id: string, username: string) => {
    //console.log(`[ChatStore] Setting active dialog: ${id}`);
    set({ activeDialogId: id, partner_username: username });
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [id]: 0 },
    }));
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

  setUnreadCount: (dialogId, count) => {
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [String(dialogId)]: count },
    }));
  },

  incrementUnread: (dialogId) => {
    const id = String(dialogId);
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [id]: (state.unreadCounts[id] || 0) + 1,
      },
    }));
  },

  clearUnread: (dialogId) => {
    const id = String(dialogId);
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [id]: 0 },
    }));
  },

  getConversation: async (userId: number, partnerId: number) => {
    try {
      const response = await fetchConversation({
        userId: userId,
        partnerId: partnerId,
      });
      if (response && response.data) {
        const partner = response.data.participants.find(
          (p) => p.id === partnerId,
        );
        set({
          partner_avatar: partner?.avatar_url,
          partner_username: partner?.username,
          activeDialogId: response.data._id,
        });
        console.log("FETCH DIALOG ID ", response.data._id);
      }
    } catch (e) {}
  },

  // Обновляем текст сообщения в сторе
  setLastMessage: (dialogId, text) => {
    const id = String(dialogId);
    //console.log(`[ChatStore] New last message for ${id}: ${text}`);
    set((state) => ({
      lastMessages: {
        ...state.lastMessages,
        [id]: text,
      },
    }));
  },
}));
