import type { UserListResponse } from "../model/types/userList";
import { $api } from "@/shared/api";

const baseUrl = import.meta.env.VITE_API_URL;

export const fetchUsers = async () => {
  try {
    const response = await $api.get<UserListResponse>(
      `${baseUrl}/api/user/users`,
    );
    return response;
  } catch (error) {}
};
