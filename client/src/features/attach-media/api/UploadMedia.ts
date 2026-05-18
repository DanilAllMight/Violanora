import { $api } from "@/shared/api";

export const uploadChatMedia = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("chatFiles", file);
  });

  try {
    const response = await $api.post<{ urls: string[] }>(
      "/api/chat/upload-chat-media",
      formData,
    );

    return response.data.urls;
  } catch (error) {
    console.error("Ошибка метода uploadChatMedia:", error);
    throw error;
  }
};

/*export const uploadChatMedia = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(async (file) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const filePath = `messages/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("chat-media")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("chat-media").getPublicUrl(filePath);

    return publicUrl;
  });

  return Promise.all(uploadPromises);
};*/
