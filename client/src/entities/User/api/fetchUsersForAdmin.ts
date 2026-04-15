import type { UserListResponse } from "../model/types/userList";
import { $api } from "@/shared/api";
import logger from "@/utils/logger";
import { AxiosError } from "axios";

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
  } catch (error) {
    const err = error as AxiosError;

    if (err.response) {
      logger.error(
        {
          status: err.response.data,
          data: err.response.data,
          url: err.config?.url,
        },
        "Ошибка сервера при получении пользователей",
      );
      throw err;
    } else if (err.request) {
      logger.error(
        {
          request: err.request,
        },
        "Сервер не ответил на запрос пользователей",
      );
      throw err;
    } else {
      logger.error(
        {
          message: err.message,
        },
        "Ошибка при создании запроса fetchUsers",
      );
      throw err;
    }
  }
};
