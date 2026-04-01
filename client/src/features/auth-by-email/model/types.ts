// src/features/auth-by-username/model/types.ts
import type { UserAuth } from "@/entities/User/model/types/user";
import * as z from "zod";

// 1. Создаем схему валидации (Zod)
export const loginSchema = z.object({
  email: z.string().min(3, "Минимум 3 символа"),
  password: z.string().min(6, "Минимум 6 символов"),
});

// 2. Генерируем TS-тип прямо из схемы (автоматически)
export type LoginFormData = z.infer<typeof loginSchema>;

// 3. (Опционально) Тип ответа от сервера
export interface LoginResponse {
  user: UserAuth;
}
