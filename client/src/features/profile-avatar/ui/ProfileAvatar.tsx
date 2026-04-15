// Импортируем твой ассет
import DEFAULT_AVATAR from "@/shared/assets/default-avatar.png";
import React, { useRef } from "react";

interface Props {
  src?: string | null;
  onFileSelect: (file: File) => void;
  onView: () => void;
}

export const ProfileAvatar = ({ src, onFileSelect, onView }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Если src пришел (ссылка из БД или Local URL), берем его, иначе — ассет
  const avatarUrl = src || DEFAULT_AVATAR;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className="group relative w-32 h-32 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm hover:border-blue-400 transition-all">
      <picture className="w-full h-full">
        {/* Если есть src (WebP из Supabase), подставляем его в source */}
        {src && <source srcSet={src} type="image/webp" />}
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      </picture>

      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={onView}
          className="text-[10px] uppercase tracking-wider font-bold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded backdrop-blur-md"
        >
          Просмотр
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-[10px] uppercase tracking-wider font-bold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded shadow-lg"
        >
          Изменить
        </button>
      </div>

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
