import type { MessageUpdateRequest } from "../model/types";
import { $api } from "@/shared/api";

export const updateMessage = async ({ data }: MessageUpdateRequest) => {
  try {
    const response = await $api.post("/api/chat/edit", { data });
    if (response && response.data) {
    }
  } catch (error) {}
};
