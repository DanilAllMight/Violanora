import { uploadAvatar } from "@/entities/User/api/uploadAvatar";
import { useUserProfileStore } from "@/entities/User/model/store/useUserProfileStore";
import { useUserStore } from "@/entities/User/model/store/useUserStore";
import { ProfileAvatar } from "@/features/profile-avatar/ui/ProfileAvatar";
import { ProfileEditForm } from "@/features/profile-info";
import { Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProfileCardProps {
  userId: number;
}

export const ProfileCard = ({ userId }: ProfileCardProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const myId = useUserStore((state) => state.authData?.id);
  const avatar_url = useUserStore((state) => state.authData?.avatar_url);
  const email = useUserStore((state) => state.authData?.email);
  const setAvatar = useUserStore((state) => state.setAvatar);

  const user = useUserProfileStore((state) => state.user);

  const isMine = myId == userId;

  useEffect(() => {
    useUserProfileStore.getState().fetchUserData(userId);
  }, [userId]);

  const handleFileSelect = async (file: File) => {
    try {
      setIsUploading(true);
      if (myId) {
        const data = await uploadAvatar(myId, file);

        setAvatar(data.url);
      }
    } catch (error) {
      toast.error("Не удалось сохранить аватар на сервере");
    } finally {
      setIsUploading(false);
    }
  };

  const handleView = () => {
    if (avatar_url) window.open(avatar_url, "_blank");
  };

  return (
    <div className="bg-app-bg flex w-full items-center gap-6 rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="w-full items-center justify-start gap-4 md:flex md:h-full">
        <div className={isUploading ? "pointer-events-none opacity-50" : ""}>
          <ProfileAvatar
            src={user?.avatar_url}
            isMine={isMine}
            onFileSelect={handleFileSelect}
            onView={handleView}
          />
        </div>

        <div className="mt-3 flex h-full w-full items-center justify-between md:mt-0">
          {isEdit ? (
            <ProfileEditForm
              setIsEdit={setIsEdit}
              isMine={isMine}
            ></ProfileEditForm>
          ) : (
            <div className="flex flex-col">
              <h2 className="text-app-text text-xl font-bold">
                {user?.username}
              </h2>
              {isMine && (
                <span className="text-app-text text-sm">
                  {isUploading ? "Обновление аватара..." : email}
                </span>
              )}
            </div>
          )}

          {isMine && (
            <div className="text-app-text self-start">
              <button
                aria-label="Изменить данные"
                type="button"
                className="p-2"
                onClick={() => setIsEdit(!isEdit)}
              >
                {isEdit ? <X></X> : <Pencil></Pencil>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
