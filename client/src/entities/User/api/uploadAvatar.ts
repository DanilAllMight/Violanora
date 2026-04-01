import { $api } from "@/shared/api";

const baseUrl = import.meta.env.VITE_API_URL;

export const uploadAvatar = async (userId: number, file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);
  formData.append("userId", String(userId));

  try {
    const response = await $api.post(
      `${baseUrl}/api/user/upload-avatar`,
      formData,
    );

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || "Ошибка при загрузке файла";
    throw new Error(message);
  }
};
