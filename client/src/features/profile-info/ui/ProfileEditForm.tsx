import { updateProfileData } from "../api/updateProfileData";
import { profileSchema, type ProfileFormData } from "../model/types";
import { useUserStore } from "@/entities/User/model/store";
//import { useUserProfileStore } from "@/entities/User/model/store/useUserProfileStore";
import { Button, Input } from "@/shared/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface ProfileEditFormProps {
  isMine: boolean;
  setIsEdit: (isEdit: boolean) => void;
}

export const ProfileEditForm = ({
  isMine,
  setIsEdit,
}: ProfileEditFormProps) => {
  const myId = useUserStore((state) => state.authData?.id);
  const username = useUserStore((state) => state.authData?.username);

  const [usrname, setUsrname] = useState(username);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      if (!myId) return;
      const _data = {
        userId: myId,
        data: data,
      };
      const resp = await updateProfileData(_data);
      if (isMine && resp) {
        //useUserProfileStore.getState().setUserData();
      }
      setIsEdit(false);
    } catch (error) {}
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full justify-center"
    >
      <div className="flex w-full max-w-[600px] flex-col items-center gap-3 p-6 text-center">
        <h3 className="text-app-text pb-3 font-bold">
          Изменение данных пользователя
        </h3>
        <Input
          {...register("username")}
          error={errors.username?.message}
          placeholder="Имя пользователя / Username"
          value={usrname}
          onChange={(e) => setUsrname(e.target.value)}
        />
        <div>
          <Button type="submit">Изменить данные</Button>
        </div>
      </div>
    </form>
  );
};
