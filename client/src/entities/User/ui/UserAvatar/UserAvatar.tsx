import DEFAULT_AVATAR from "@/shared/assets/default-avatar.png";

interface UserAvatarProps {
  avatar_url: string | null;
}

export const UserAvatar = ({ avatar_url }: UserAvatarProps) => {
  return (
    <div className="h-14 w-14 pr-2 flex items-center ">
      <picture className="rounded-full  overflow-hidden border border-slate-200">
        {/* Если есть src (WebP из Supabase), подставляем его в source */}
        {avatar_url && <source srcSet={avatar_url} type="image/webp" />}
        <img
          src={avatar_url || DEFAULT_AVATAR}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      </picture>
    </div>
  );
};
