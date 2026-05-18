import type { UserData } from "@/entities/User/model/types/user";
import * as z from "zod";

export const profileSchema = z.object({
  username: z.string().min(6, "Минимум 6 символов"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export interface ProfileResponse {
  user: UserData;
}
