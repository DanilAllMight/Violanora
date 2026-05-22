import { fetchUnreadCount } from "../../api/fetchUnreadCount";
import { create } from "zustand";

interface ConversationUnreadState {
  unreadCount: number;
  unreadConversationIds: string[];
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  clearUnread: () => void;
  fetchUnreadCount: () => Promise<void>;

  addUnreadConversation: (id: string) => void;
  removeUnreadConversation: (id: string) => void;
}

export const useConversationUnreadStore = create<ConversationUnreadState>(
  (set) => ({
    unreadCount: 0,
    unreadConversationIds: [],
    setUnreadCount: (count) => set({ unreadCount: count }),

    incrementUnread: () =>
      set((state) => ({ unreadCount: state.unreadCount + 1 })),

    clearUnread: () => set({ unreadCount: 0 }),

    fetchUnreadCount: async () => {
      try {
        const data = await fetchUnreadCount();
        if (data) {
          set({ unreadCount: data.length });
          set({ unreadConversationIds: data });
        }
      } catch (error) {}
    },
    addUnreadConversation: (id) =>
      set((state) => {
        const alreadyExists = state.unreadConversationIds.includes(id);

        if (alreadyExists) {
          return { unreadCount: state.unreadCount + 1 };
        }

        return {
          unreadConversationIds: [...state.unreadConversationIds, id],
          unreadCount: state.unreadCount + 1,
        };
      }),

    removeUnreadConversation: (id) =>
      set((state) => {
        // Проверяем, был ли этот ID вообще в списке
        const exists = state.unreadConversationIds.includes(id);

        return {
          unreadConversationIds: state.unreadConversationIds.filter(
            (item) => item !== id,
          ),

          unreadCount: exists
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        };
      }),
  }),
);
