import { uploadAvatar } from "@/entities/User/api/uploadAvatar";
import { useUserStore } from "@/entities/User/model/store/useUserStore";
import { ProfileAvatar } from "@/features/profile-avatar/ui/ProfileAvatar/ProfileAvatar";
import { useState } from "react";
import { toast } from "sonner";

export const ProfileCard = () => {
  const [isUploading, setIsUploading] = useState(false);

  // НАДО ОТПИСАТЬСЯ ОТ ТАКОГО ОБЪЁМА _ МНОГО ПЕРЕРЕНДЕРОВ БУДЕТ
  const user = useUserStore((state) => state.authData);
  const setAvatar = useUserStore((state) => state.setAvatar);

  const handleFileSelect = async (file: File) => {
    try {
      setIsUploading(true);
      if (user?.id) {
        const data = await uploadAvatar(user?.id, file);

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
    if (user?.avatar_url) window.open(user?.avatar_url, "_blank");
  };

  return (
    <div className="bg-app-bg flex items-center gap-6 rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className={isUploading ? "pointer-events-none opacity-50" : ""}>
        <ProfileAvatar
          src={user?.avatar_url}
          onFileSelect={handleFileSelect}
          onView={handleView}
        />
      </div>

      <div className="flex flex-col">
        <h2 className="text-app-text text-xl font-bold">{user?.username}</h2>
        <span className="text-app-text text-sm">
          {isUploading ? "Обновление аватара..." : user?.email}
        </span>
      </div>
    </div>
  );
};
