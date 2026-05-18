import type { UserAuth } from "@/entities/User/model/types/user";
import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().min(3, "Минимум 3 символа"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export interface LoginResponse {
  user: UserAuth;
}
