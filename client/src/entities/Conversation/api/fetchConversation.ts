import { useConversationStore } from "../model/store/useConversationStore";
import type {
  ConversationRequest,
  ConversationResponse,
} from "../model/types/Conversation";
import { $api } from "@/shared/api";

export const fetchConversation = async ({
  userId,
  partnerId,
}: ConversationRequest) => {
  try {
    const response = await $api.get<ConversationResponse>(
      `api/conversation/conversation/${userId}/${partnerId}`,
    );
    //console.log("fetchCONV ", response?.data);

    if (response && response.data) {
      const partner = response.data.participants.find((p) => p.id !== userId);
      if (partner) {
        const username = partner.username;
        const avatar_url = partner.avatar_url;
        useConversationStore.getState().setActiveDialog(
          response.data._id,
          username,
          avatar_url, // Передаем аватар третьим аргументом
        );
      }
    }

    return response;
  } catch (err) {
    throw err;
  }
};
