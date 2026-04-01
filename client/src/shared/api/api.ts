import logger from "@/utils/logger";
import axios from "axios";
import { toast } from "sonner";

export const $api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

$api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (!error.response) {
      const networkError = "Сервер недоступен. Работы уже ведутся!";

      logger.error(
        { message: error.message },
        "Ошибка сети (ERR_CONNECTION_REFUSED)",
      );
      toast.error(networkError);

      return Promise.reject(error);
    }

    const status = error.response?.status;
    const data = error.response?.data;

    const messages: Record<number, string> = {
      400: data?.message || "Ошибка в данных",
      404: data?.message || "Ошибка в данных",
      401: data?.message || "Не авторизован",
      409: data?.message || "Пользователь уже существует",
      500: data?.message || "Ошибка сервера",
    };

    if (error.response) {
      logger.error(
        {
          status: error.response.status,
          data: error.response.data,
          url: error.config?.url,
        },
        "Ошибка сервера",
      );
    } else if (error.request) {
      logger.error({ request: error.request }, "Сервер не ответил");
    } else {
      logger.error({ message: error.message }, "Ошибка настройки запроса");
    }

    toast.error(messages[status] || "Что-то пошло не так");
    return Promise.reject(error);
  },
);
