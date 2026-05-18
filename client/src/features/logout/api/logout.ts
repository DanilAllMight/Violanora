import { $api } from "@/shared/api";

export const logout = async () => {
  try {
    await $api.post("/api/auth/logout");
  } finally {
    localStorage.removeItem("access_token");
  }
};
