import { X } from "lucide-react";

interface SelectedFilesPreviewProps {
  files: File[];
  onRemove: (index: number) => void;
}

export const SelectedFilesPreview = ({
  files,
  onRemove,
}: SelectedFilesPreviewProps) => {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 border-t border-slate-200 bg-slate-50 p-2">
      {files.map((file, index) => {
        const previewUrl = URL.createObjectURL(file);

        return (
          <div key={index} className="group relative h-20 w-20">
            <img
              src={previewUrl}
              alt="preview"
              className="h-full w-full rounded-md border border-slate-300 object-cover"
            />
            <button
              aria-label="Удалить выбранную медиа"
              onClick={() => onRemove(index)}
              className="absolute -top-1 -right-1 rounded-full bg-red-500 p-0.5 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
