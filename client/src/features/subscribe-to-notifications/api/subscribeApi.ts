import { $api } from "@/shared/api";

export const sendSubscriptionToServer = async (
  subscription: PushSubscription,
) => {
  console.log("МЫ ТУТ");
  // 1. Убираем ручной JSON.stringify, передаем объект как есть
  // 2. В Axios статус проверяется через response.status
  const response = await $api.post("/api/subscribe/", subscription);

  // Axios считает успешными статусы 2xx
  return response.status >= 200 && response.status < 300;
};
