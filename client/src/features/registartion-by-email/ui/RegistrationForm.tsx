import { registrationByEmail } from "../api/registration";
import { registrationSchema, type RegistrationFormData } from "../model/types";
import { Button } from "@/shared/ui/Button/button";
import { Input } from "@/shared/ui/Input/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export const RegistrationForm = () => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const navigate = useNavigate();

  const onSubmit = async (data: RegistrationFormData) => {
    const result = await registrationByEmail(data);
    navigate("/");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col items-center"
    >
      <div className="mt-6 flex w-full max-w-[600px] flex-col items-center rounded-xl">
        <h3 className="text-app-text pt-3 text-xl font-bold">Регистрация</h3>
        <div className="flex w-full flex-col items-center gap-3 p-6">
          <Input
            {...register("email")}
            error={errors.email?.message}
            placeholder="Email / Логин"
          />
          <Input
            {...register("username")}
            error={errors.username?.message}
            placeholder="Username / Имя пользователя"
          />
          <Input
            {...register("password")}
            type={isPasswordVisible ? "text" : "password"}
            error={errors.password?.message}
            showIcon={true}
            placeholder="Пароль"
            onIconClick={() => setPasswordVisible(!isPasswordVisible)}
            isIconVisible={isPasswordVisible}
          />
          <Input
            {...register("repeatPassword")}
            type={isPasswordVisible ? "text" : "password"}
            error={errors.repeatPassword?.message}
            placeholder="Повтор пароля"
            showIcon={true}
            onIconClick={() => setPasswordVisible(!isPasswordVisible)}
            isIconVisible={isPasswordVisible}
          />
          <Button type="submit">Создать аккаунт</Button>
        </div>
      </div>
    </form>
  );
};
