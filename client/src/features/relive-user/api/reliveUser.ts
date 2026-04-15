import { $api } from "@/shared/api";
import { toast } from "sonner";

interface ReliveUserProps {
  userId: number;
}

export const reliveUser = async (data: ReliveUserProps) => {
  try {
    const response = await $api.post("/api/user/relive", data);
    if (response && response.data) {
      toast.success("Пользователь успешно восстановлен!");
    }
  } catch (error) {
    toast.error("Не удалось восстановить пользователя!");
    throw error;
  }
};
