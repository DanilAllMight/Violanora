import logger from "@/utils/logger";
import axios from "axios";
import { toast } from "sonner";

export const $api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/",
  withCredentials: true,
});

$api.interceptors.request.use((config) => {
  // Достаем токен из localStorage (или где ты его хранишь)
  const token = localStorage.getItem("access_token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

$api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // Добавили async для работы с await
    const originalRequest = error.config;

    // --- ЛОГИКА REFRESH TOKEN (НОВОЕ) ---
    // Если ошибка 401 и мы еще не пытались повторить этот запрос
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._isRetry
    ) {
      originalRequest._isRetry = true;
      try {
        // Делаем запрос на обновление. Используем базовый axios, чтобы не зациклиться.
        // Замени URL на свой, если он отличается
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/refresh`,
          {
            withCredentials: true,
          },
        );

        // Сохраняем новый токен из твоего формата данных
        const newToken = response.data.user.access_token;
        localStorage.setItem("access_token", newToken);

        // Повторяем оригинальный запрос
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return $api.request(originalRequest);
      } catch (refreshError) {
        // Если даже refresh не удался — просто идем дальше к твоему коду ошибок
        logger.error("Не удалось обновить токен сессии");
      }
    }
    // --- КОНЕЦ ЛОГИКИ REFRESH ---

    // Твой оригинальный код (БЕЗ ИЗМЕНЕНИЙ)
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
