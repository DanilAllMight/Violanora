import { uploadAvatar } from "@/entities/User/api/uploadAvatar";
import { useUserStore } from "@/entities/User/model/store/useUserStore";
import { ProfileAvatar } from "@/features/profile-avatar/ui/ProfileAvatar/ProfileAvatar";
import { ProfileEditForm } from "@/features/profile-info";
import { Pencil, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const ProfileCard = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // НАДО ОТПИСАТЬСЯ ОТ ТАКОГО ОБЪЁМА _ МНОГО ПЕРЕРЕНДЕРОВ БУДЕТ

  const myId = useUserStore((state) => state.authData?.id);
  const username = useUserStore((state) => state.authData?.username);
  const avatar_url = useUserStore((state) => state.authData?.avatar_url);
  const email = useUserStore((state) => state.authData?.email);
  const setAvatar = useUserStore((state) => state.setAvatar);

  const handleFileSelect = async (file: File) => {
    try {
      setIsUploading(true);
      if (myId) {
        const data = await uploadAvatar(myId, file);

        setAvatar(data.url);
        console.log("Файл успешно сохранен в БД:", data.url);
      }
    } catch (error) {
      console.error("Загрузка не удалась:", error);

      toast.error("Не удалось сохранить аватар на сервере");
    } finally {
      setIsUploading(false);
    }
  };

  const handleView = () => {
    if (avatar_url) window.open(avatar_url, "_blank");
  };

  console.log("Начинаем отображений 1");

  return (
    <div className="bg-app-bg flex w-full items-center gap-6 rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="w-full items-center justify-start gap-4 md:flex md:h-full">
        <div className={isUploading ? "pointer-events-none opacity-50" : ""}>
          <ProfileAvatar
            src={avatar_url}
            onFileSelect={handleFileSelect}
            onView={handleView}
          />
        </div>

        <div className="mt-3 flex h-full w-full items-center justify-between md:mt-0">
          {isEdit ? (
            <ProfileEditForm setIsEdit={setIsEdit}></ProfileEditForm>
          ) : (
            <div className="flex flex-col">
              <h2 className="text-app-text text-xl font-bold">{username}</h2>
              <span className="text-app-text text-sm">
                {isUploading ? "Обновление аватара..." : email}
              </span>
            </div>
          )}
          <div className="self-start">
            <button
              aria-label="Изменить данные"
              type="button"
              className="p-2"
              onClick={() => setIsEdit(!isEdit)}
            >
              {isEdit ? <X></X> : <Pencil></Pencil>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
