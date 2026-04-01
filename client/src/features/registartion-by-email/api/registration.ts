import {
  type RegistrationResponse,
  type RegistrationFormData,
} from "../model/types";
import { useUserStore } from "@/entities/User/model/store/useUserStore";
import { $api } from "@/shared/api";
import { toast } from "sonner";

export const registrationByEmail = async (data: RegistrationFormData) => {
  try {
    const response = await $api.post<RegistrationResponse>(
      "/api/user/registration",
      data,
    );

    const { user } = response.data;

    useUserStore.getState().setAuthData(user);
    localStorage.setItem("token", user.token);
    localStorage.setItem("email", user.email);
    localStorage.setItem("username", user.username);

    toast.success("Регистрация успешна!");

    return response.data;
  } catch (error) {
    throw error;
  }
};
