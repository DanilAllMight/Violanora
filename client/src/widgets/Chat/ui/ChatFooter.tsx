import { Send } from "lucide-react";

interface ChatFooterProps {
  isTyping: boolean;
  username: string | null;
  inputValue: string;
  handleInputChange: (value: string) => void;
  handleSend: () => void;
}

export const ChatFooter = ({
  isTyping,
  username,
  inputValue,
  handleInputChange,
  handleSend,
}: ChatFooterProps) => {
  return (
    <div className="flex w-full flex-col items-center px-4 pb-4 md:px-0">
      <div className="h-5 w-full max-w-[400px] text-left px-2">
        {isTyping && (
          <span className="text-xs text-gray-500 animate-pulse italic">
            {username} печатает...
          </span>
        )}
      </div>

      <div className="mt-2 flex w-full max-w-[400px] items-center gap-3 rounded-xl border border-gray-100 bg-white p-2 shadow-sm">
        <input
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Введите сообщение..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="w-full rounded-xl p-1.5 outline-none text-sm"
        />
        <button
          aria-label="1"
          type="button"
          className="rounded-xl bg-gray-50 p-2 hover:bg-gray-100 transition-colors"
          onClick={handleSend}
        >
          <Send size={20} className="text-blue-500" />
        </button>
      </div>
    </div>
  );
};
