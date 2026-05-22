import type { ConversationResponse } from "../model/types/ConversationUnreadCount";
import { $api } from "@/shared/api";

export const fetchUnreadCount = async () => {
  try {
    const response = await $api.get<ConversationResponse>(
      "/api/conversation/unreadConversations",
    );
    if (response && response.data) {
      return response.data;
    }
  } catch (error) {}
};
