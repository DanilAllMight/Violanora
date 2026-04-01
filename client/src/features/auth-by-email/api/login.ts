import { type LoginFormData, type LoginResponse } from "../model/types";
import { useUserStore } from "@/entities/User/model/store/useUserStore";
import { $api } from "@/shared/api/api";
import { toast } from "sonner";

export const loginByEmail = async (data: LoginFormData) => {
  try {
    const response = await $api.post<LoginResponse>("/api/user/login", data);

    //logger.info({ count: response.data }, "Авторизация прошла успешно!!");

    const { user } = response.data;

    useUserStore.getState().setAuthData(user);

    localStorage.setItem("token", user.token);
    localStorage.setItem("email", user.email);
    localStorage.setItem("username", user.username);

    toast.success("Авторизация успешна!");

    return response.data;
  } catch (error) {
    throw error;
  }
};
