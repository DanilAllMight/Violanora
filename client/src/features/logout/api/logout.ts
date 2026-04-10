import { $api } from "@/shared/api";

export const logout = async () => {
  try {
    console.log("LOGOUT");
    // Делаем запрос на сервер, чтобы он удалил сессию в БД и очистил куки
    await $api.post("/api/user/logout");
  } finally {
    // В любом случае очищаем локальные данные
    localStorage.removeItem("access_token");
    // Если используешь стейт-менеджер (Zustand/Redux), сбрось стейт юзера здесь
    //window.location.href = "/login";
  }
};
