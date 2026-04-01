import { loginByEmail } from "../../api/login";
import { loginSchema, type LoginFormData } from "../../model/types";
import { Button } from "@/shared/ui/button/button";
import { Input } from "@/shared/ui/input/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export const LoginForm = () => {
  const [isPassportVisible, setPassportVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await loginByEmail(data);
      console.log(result);
      navigate("/");
    } catch (error) {}
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full justify-center"
    >
      <div className="flex w-full max-w-[600px] flex-col items-center gap-3 p-6">
        <h3 className="text-app-text pb-3 text-xl font-bold">Авторизация</h3>
        <Input
          {...register("email")}
          error={errors.email?.message}
          placeholder="Email / Логин"
        />
        <Input
          {...register("password")}
          type={isPassportVisible ? "text" : "password"}
          error={errors.password?.message}
          placeholder="Пароль"
          isIconVisible={isPassportVisible}
          onIconClick={() => setPassportVisible(!isPassportVisible)}
          showIcon={true}
        />
        <div>
          <Button type="submit">Войти</Button>
        </div>
      </div>
    </form>
  );
};
