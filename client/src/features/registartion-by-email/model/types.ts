import type { UserAuth } from "@/entities/User/model/types/user";
import * as z from "zod";

// 1. Создаем схему валидации (Zod)
export const registrationSchema = z
  .object({
    email: z
      .string()
      .email("Некорректный формат email")
      .min(12, "Слишком короткий emaii"),
    password: z
      .string()
      .min(6, "Минимум 6 символов")
      .regex(
        /^[^<>/\\ ]*$/,
        "Пароль не должен содержать пробелы и символы < > / \\",
      ),
    repeatPassword: z.string().min(6, "Минимум 6 символов"),
    username: z.string().min(6, "Минимум 6 символов"),
  })

  .refine((data) => data.password === data.repeatPassword, {
    message: "Пароли не совпадают",
    path: ["repeatPassword"], // Ошибка привяжется именно к этому полю
  });

// 2. Генерируем TS-тип прямо из схемы (автоматически)
export type RegistrationFormData = z.infer<typeof registrationSchema>;

// 3. (Опционально) Тип ответа от сервера
export interface RegistrationResponse {
  user: UserAuth;
}
