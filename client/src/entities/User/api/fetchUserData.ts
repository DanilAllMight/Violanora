import type { User } from "../model/types";
import { $api } from "@/shared/api";

interface UserDataProps {
  userId: number;
}

export const fetchUserData = async ({ userId }: UserDataProps) => {
  try {
    const response = await $api.get<User>(`/api/user/userData/${userId}`);

    if (response && response.data) {
      console.log("dataInfo ", response);
      return response.data;
    } else {
    }
  } catch (error) {}
};
