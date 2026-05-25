import { useMessageEditStore } from "@/entities/Message/model/store";
import { AttachMediaButton } from "@/features/attach-media";
import { SelectedFilesPreview } from "@/features/attach-media";
import { Send, X, Check } from "lucide-react";

interface ChatFooterProps {
  isTyping: boolean;
  username: string | null;
  inputValue: string;
  handleInputChange: (value: string) => void;
  handleSend: () => void;

  handleUpdate: () => void;

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
  handleUpdate,
  isSending,
}: ChatFooterProps) => {
  const isEdit = useMessageEditStore((state) => state.isEdit);
  const editingText = useMessageEditStore((state) => state.editingText);
  const editingMessage = useMessageEditStore((state) => state.editingMessage);

  const hasAttachments =
    editingMessage?.attachments && editingMessage.attachments.length > 0;

  const setIsEdit = useMessageEditStore((state) => state.setIsEdit);
  const setEditingText = useMessageEditStore((state) => state.setEditingText);

  const removeEditingAttachment = useMessageEditStore(
    (state) => state.removeEditingAttachment,
  );

  return (
    <>
      {!isEdit ? (
        <div className="flex w-full flex-col items-center px-4 pb-4 md:px-0">
          <div className="h-5 w-full max-w-[400px] px-2 text-left">
            {isTyping && (
              <span className="animate-pulse text-xs text-gray-500 italic">
                {username} печатает...
              </span>
            )}
          </div>

          <div className="bg-app-bg text-app-text mt-2 flex w-full max-w-[400px] flex-col overflow-hidden rounded-xl border border-gray-100 shadow-sm">
            <SelectedFilesPreview files={files} onRemove={onRemoveFile} />

            <div className="text-app-text flex items-center gap-2 p-2">
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
                onKeyDown={(e) =>
                  e.key === "Enter" && !isSending && handleSend()
                }
                className="w-full bg-transparent p-1.5 text-sm outline-none disabled:placeholder-gray-400"
              />

              <button
                aria-label="Send message"
                type="button"
                className="flex items-center justify-center rounded-xl bg-gray-50 p-2 transition-colors hover:bg-gray-100 disabled:opacity-50"
                onClick={handleSend}
                disabled={
                  isSending || (!inputValue.trim() && files.length === 0)
                }
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
      ) : (
        <div className="flex w-full flex-col items-center px-4 pb-4 md:px-0">
          <div className="flex h-5 w-full max-w-[400px] items-center justify-between px-2 text-left">
            <span className="text-xs font-medium tracking-wider text-blue-500 uppercase">
              Редактирование сообщения
            </span>
            <button
              type="button"
              aria-label="Cancel editing"
              onClick={() => setIsEdit(false)}
              className="rounded-full p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>

          {hasAttachments && (
            <div className="flex w-full max-w-[400px] flex-wrap gap-3 bg-transparent p-3">
              {editingMessage.attachments.map((file, index) => (
                <div
                  key={file.url || index}
                  className="relative h-16 w-16 flex-shrink-0 rounded-xl border border-gray-100 shadow-sm"
                >
                  <img
                    src={file.url}
                    alt="attachment"
                    className="h-full w-full rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeEditingAttachment(index)}
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-transform hover:scale-105 active:scale-95"
                    aria-label="Remove image"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-app-bg text-app-text mt-2 flex w-full max-w-[400px] flex-col overflow-hidden rounded-xl border border-gray-100 shadow-sm">
            <SelectedFilesPreview files={files} onRemove={onRemoveFile} />

            <div className="text-app-text flex items-center gap-2 p-2">
              <AttachMediaButton
                onFilesSelected={onFilesSelected}
                disabled={isSending}
              />
              <input
                value={editingText || ""}
                onChange={(e) => setEditingText(e.target.value)}
                disabled={isSending}
                placeholder={
                  isSending ? "Сохранение..." : "Измените сообщение..."
                }
                onKeyDown={(e) =>
                  e.key === "Enter" && !isSending && handleUpdate()
                }
                className="w-full bg-transparent p-1.5 text-sm outline-none disabled:placeholder-gray-400"
              />

              <button
                aria-label="Save changes"
                type="button"
                className="flex items-center justify-center rounded-xl bg-blue-50 p-2 transition-colors hover:bg-blue-100 disabled:opacity-50"
                onClick={handleUpdate}
                disabled={
                  isSending ||
                  (!editingText.trim() &&
                    files.length === 0 &&
                    editingMessage?.attachments.length === 0)
                }
              >
                {isSending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                ) : (
                  <Check size={20} className="text-blue-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
