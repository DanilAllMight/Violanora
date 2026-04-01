import type { MessagesRequest } from "../model/types/MessagesRequest";
import { $api } from "@/shared/api";

export const fetchMessages = async ({
  senderId,
  receiverId,
  before,
  limit = 20,
}: MessagesRequest) => {
  const response = await $api.get(
    `api/chat/messages/${senderId}/${receiverId}`,
    {
      params: {
        before,
        limit,
      },
    },
  );
  return response.data;
};
