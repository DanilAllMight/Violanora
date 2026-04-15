import DEFAULT_AVATAR from "@/shared/assets/default-avatar.png";

interface UserAvatarProps {
  avatar_url: string | null;
}

export const UserAvatar = ({ avatar_url }: UserAvatarProps) => {
  return (
    <div className="flex h-14 w-14 items-center pr-2">
      <picture className="overflow-hidden rounded-full border border-slate-200">
        {/* Если есть src (WebP из Supabase), подставляем его в source */}
        {avatar_url && <source srcSet={avatar_url} type="image/webp" />}
        <img
          loading="lazy"
          src={avatar_url || DEFAULT_AVATAR}
          alt={DEFAULT_AVATAR}
          className="h-full w-full object-cover"
        />
      </picture>
    </div>
  );
};
