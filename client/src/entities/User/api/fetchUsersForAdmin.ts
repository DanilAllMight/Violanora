import type { UserListResponse } from "../model/types/userList";
import { $api } from "@/shared/api";
import logger from "@/utils/logger";

const baseUrl = import.meta.env.VITE_API_URL;

export const fetchUsersForAdmin = async () => {
  try {
    const response = await $api.get<UserListResponse>(
      `${baseUrl}/api/user/users/admin`,
    );
    logger.info(
      { count: response.data },
      "Данные пользователей успешно получено!",
    );
    return response;
  } catch (error) {}
};
