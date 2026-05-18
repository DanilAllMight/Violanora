import { $api } from "@/shared/api";

export const sendSubscriptionToServer = async (
  subscription: PushSubscription,
) => {
  const response = await $api.post("/api/subscribe/", subscription);

  return response.status >= 200 && response.status < 300;
};
