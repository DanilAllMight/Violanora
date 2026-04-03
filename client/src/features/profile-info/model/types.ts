import type { UserData } from "@/entities/User/model/types/user";
import * as z from "zod";

// 1. Создаем схему валидации (Zod)
export const profileSchema = z.object({
  username: z.string().min(6, "Минимум 6 символов"),
});

// 2. Генерируем TS-тип прямо из схемы (автоматически)
export type ProfileFormData = z.infer<typeof profileSchema>;

export interface ProfileResponse {
  user: UserData;
}
