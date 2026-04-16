import { supabase } from "@/shared/api/supabase/client";

export const uploadChatMedia = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(async (file) => {
    // Генерируем уникальное имя файла: userId + timestamp + random
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const filePath = `messages/${fileName}`;

    // 1. Загружаем файл в бакет 'chat-media'
    const { error: uploadError } = await supabase.storage
      .from("chat-media")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Ошибка загрузки файла:", uploadError.message);
      throw uploadError;
    }

    // 2. Получаем публичную ссылку
    const {
      data: { publicUrl },
    } = supabase.storage.from("chat-media").getPublicUrl(filePath);

    return publicUrl;
  });

  // Ждем завершения всех загрузок
  return Promise.all(uploadPromises);
};
