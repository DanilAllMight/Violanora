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
    },

    setTyping: (userId, isTyping) => {
      set((state) => {
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
      set({ activeDialogId: null });
    },

    getConversation: async (userId, partnerId) => {
      try {
        const response = await fetchConversation({ userId, partnerId });
        if (response?.data) {
          const partnerData = response.data.participants.find(
            (p: any) => p.id === partnerId,
          );

          get().setActiveDialog(
            response.data.id,
            partnerData?.username || "",
            partnerData?.avatar_url || null,
          );
        }
      } catch (e) {}
    },
  }),
);
