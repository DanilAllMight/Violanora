import { useUserStore } from "@/entities/User/model/store";
import logger from "@/utils/logger";
import axios from "axios";
import { type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

export const $api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/",
  withCredentials: true,
});

// Тип для элементов очереди
interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

$api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

$api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _isRetry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._isRetry
    ) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return $api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._isRetry = true;
      isRefreshing = true;
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/user/refresh`,
          {},
          {
            withCredentials: true,
          },
        );

        console.log("ЗАПРОС ОТПРАВЛЕН И ПРИНЯТ ", response);

        const newToken = response.data.user.access_token;
        localStorage.setItem("access_token", newToken);
        useUserStore.getState().setAuthData(response.data.user);

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return $api.request(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

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
