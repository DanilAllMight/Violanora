import type { ConversationRequest } from "../model/types/Conversation";
import type { ConversationListResponse } from "../model/types/ConversationList";
import { $api } from "@/shared/api";

export const fetchConversations = ({ userId }: ConversationRequest) => {
  try {
    const response = $api.get<ConversationListResponse>(
      `api/conversation/conversations/${userId}`,
    );
    return response;
  } catch (err) {}
};
