import { useUserStore } from "@/entities/User/model/store";
import type { UserData } from "@/entities/User/model/types/user";
import { $api } from "@/shared/api";

interface UpdateProfileDataProps {
  userId: number;
  data: UserData;
}

export const updateProfileData = async (data: UpdateProfileDataProps) => {
  try {
    const response = await $api.post<UserData>("/api/user/update", data);
    if (response && response.data) {
      useUserStore.getState().setUserData(response.data);
      return response.data;
    }
  } catch (error) {
    throw error;
  }
};
