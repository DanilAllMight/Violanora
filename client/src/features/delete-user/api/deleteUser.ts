import { $api } from "@/shared/api";
import { toast } from "sonner";

interface DeleteUserProps {
  userId: number;
}

export const deleteUser = async (data: DeleteUserProps) => {
  try {
    const response = await $api.post("/api/user/delete", data);
    if (response && response.data) {
      toast.success("Пользователь успешно удалён");
    }
  } catch (error) {
    toast.error("Не удалось удалить пользователя");
  }
};
