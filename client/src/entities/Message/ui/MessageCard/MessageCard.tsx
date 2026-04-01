import type { Message } from "../../model/types/Message";
import { Check, CheckCheck, Clock } from "lucide-react";

interface MessageCardProps {
  msg: Message;
  isMe: boolean;
  username: string | null;
}

export const MessageCard = ({ msg, isMe, username }: MessageCardProps) => {
  return (
    <div
      className={`max-w-[70%] rounded-2xl border p-3 shadow-sm ${
        isMe
          ? "bg-app-accent rounded-tr-none border-blue-500 text-white"
          : "rounded-tl-none border-gray-100 bg-white text-gray-800"
      }`}
    >
      <div className={`mb-1 text-xs font-bold opacity-70`}>
        {isMe ? "Вы" : username}
      </div>

      <span className="leading-relaxed break-words block">{msg.text}</span>

      <div
        className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
          isMe ? "text-blue-100" : "text-gray-400"
        }`}
      >
        <span>
          {new Date(msg.createdAt).toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>

        {isMe && (
          <div className="flex items-center">
            {msg.status === "sending" && <Clock size={14} />}
            {msg.status === "sent" && <Check size={14} />}
            {msg.status === "read" && (
              <CheckCheck
                size={14}
                className={isMe ? "text-white" : "text-blue-500"}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
