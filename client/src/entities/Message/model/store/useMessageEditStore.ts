import type { Message } from "../types";
import { create } from "zustand";

interface MessageEditState {
  isEdit: boolean;
  editingMessage: Message | null;
  editingText: string;

  setIsEdit: (value: boolean) => void;
  setEditingText: (value: string) => void;

  setEditingMessage: (message: Message | null) => void;

  removeEditingAttachment: (index: number) => void;
}

export const useMessageEditStore = create<MessageEditState>((set) => ({
  isEdit: false,
  editingMessage: null,
  editingText: "",

  setIsEdit: (value) => set({ isEdit: value }),
  setEditingText: (value) =>
    set((state) => ({
      ...state,
      editingText: value,
      editingMessage: state.editingMessage
        ? { ...state.editingMessage, text: value }
        : null,
    })),
  setEditingMessage: (message) => set({ editingMessage: message }),
  removeEditingAttachment: (index: number) =>
    set((state) => ({
      editingMessage: state.editingMessage
        ? {
            ...state.editingMessage,
            attachments: state.editingMessage.attachments.filter(
              (_, i) => i !== index,
            ),
          }
        : null,
    })),
}));
