import { AttachMediaButton } from "@/features/attach-media";
import { SelectedFilesPreview } from "@/features/attach-media";
import { Send } from "lucide-react";

interface ChatFooterProps {
  isTyping: boolean;
  username: string | null;
  inputValue: string;
  handleInputChange: (value: string) => void;
  handleSend: () => void;

  files: File[];
  onFilesSelected: (files: File[]) => void;
  onRemoveFile: (index: number) => void;

  isSending: boolean;
}

export const ChatFooter = ({
  isTyping,
  username,
  inputValue,
  handleInputChange,
  handleSend,
  files,
  onFilesSelected,
  onRemoveFile,
  isSending,
}: ChatFooterProps) => {
  return (
    <div className="flex w-full flex-col items-center px-4 pb-4 md:px-0">
      <div className="h-5 w-full max-w-[400px] px-2 text-left">
        {isTyping && (
          <span className="animate-pulse text-xs text-gray-500 italic">
            {username} печатает...
          </span>
        )}
      </div>

      <div className="mt-2 flex w-full max-w-[400px] flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <SelectedFilesPreview files={files} onRemove={onRemoveFile} />

        <div className="flex items-center gap-2 p-2">
          <AttachMediaButton
            onFilesSelected={onFilesSelected}
            disabled={isSending}
          />

          <input
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={isSending}
            placeholder={
              isSending ? "Загрузка медиа..." : "Введите сообщение..."
            }
            onKeyDown={(e) => e.key === "Enter" && !isSending && handleSend()}
            className="w-full bg-transparent p-1.5 text-sm outline-none disabled:placeholder-gray-400"
          />

          <button
            aria-label="Send message"
            type="button"
            className="flex items-center justify-center rounded-xl bg-gray-50 p-2 transition-colors hover:bg-gray-100 disabled:opacity-50"
            onClick={handleSend}
            disabled={isSending || (!inputValue.trim() && files.length === 0)}
          >
            {isSending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            ) : (
              <Send size={20} className="text-blue-500" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
