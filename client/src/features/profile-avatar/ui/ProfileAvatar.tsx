import DEFAULT_AVATAR from "@/shared/assets/default-avatar.png";
import React, { useRef } from "react";

interface Props {
  src?: string | null;
  isMine: boolean;
  onFileSelect: (file: File) => void;
  onView: () => void;
}

export const ProfileAvatar = ({ src, isMine, onFileSelect, onView }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarUrl = src || DEFAULT_AVATAR;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className="group relative h-32 w-32 overflow-hidden rounded-full border-2 border-slate-200 shadow-sm transition-all hover:border-blue-400">
      <picture className="h-full w-full">
        {src && <source srcSet={src} type="image/webp" />}
        <img
          src={avatarUrl}
          alt="Avatar"
          className="h-full w-full object-cover"
        />
      </picture>

      {isMine && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            onClick={onView}
            className="rounded bg-white/20 px-3 py-1.5 text-[10px] font-bold tracking-wider text-white uppercase backdrop-blur-md hover:bg-white/30"
          >
            Просмотр
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded bg-blue-600 px-3 py-1.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-lg hover:bg-blue-500"
          >
            Изменить
          </button>
        </div>
      )}

      <input
        title="Выбор файла"
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
};
