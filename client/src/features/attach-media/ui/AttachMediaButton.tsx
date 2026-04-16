import * as AccessibleIcon from "@radix-ui/react-accessible-icon";
import { Paperclip } from "lucide-react";
import { useRef } from "react";
import type { ChangeEvent } from "react";

interface AttachMediaButtonProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export const AttachMediaButton = ({
  onFilesSelected,
  maxFiles = 10,
  disabled,
}: AttachMediaButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      if (selectedFiles.length > maxFiles) {
        alert(`Максимум ${maxFiles} изображений`);
        return;
      }

      onFilesSelected(selectedFiles);
      e.target.value = "";
    }
  };

  return (
    <div className="flex items-center justify-center">
      <button
        aria-label="Выбрать файлы"
        type="button"
        disabled={disabled}
        onClick={handleIconClick}
        className="rounded-full p-2 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <AccessibleIcon.Root label="Прикрепить изображения">
          <Paperclip className="h-6 w-6" />
        </AccessibleIcon.Root>
      </button>

      <input
        title="Выбор медиа файла"
        type="file"
        multiple
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
