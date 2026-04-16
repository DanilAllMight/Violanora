import type { Message } from "../model/types/Message";
import { MessageAttachments } from "./MessageAttachments";
import { Check, CheckCheck, Clock } from "lucide-react";

// импортируй созданный ранее компонент

interface MessageCardProps {
  msg: Message;
  isMe: boolean;
  username: string | null;
}

export const MessageCard = ({ msg, isMe, username }: MessageCardProps) => {
  const hasAttachments = msg.attachments && msg.attachments.length > 0;

  return (
    <div
      className={`max-w-[80%] overflow-hidden rounded-2xl border shadow-sm md:max-w-[70%] ${
        isMe
          ? "bg-app-accent ml-auto rounded-tr-none border-blue-500 text-white"
          : "mr-auto rounded-tl-none border-gray-100 bg-white text-gray-800"
      }`}
    >
      {/* Сетка изображений */}
      {hasAttachments && (
        <div className="p-1">
          {" "}
          {/* Небольшой отступ для картинок */}
          <MessageAttachments attachments={msg.attachments} />
        </div>
      )}

      {/* Текстовый контент */}
      <div className="px-3 pt-1 pb-2">
        <div
          className={`mb-1 text-[10px] font-bold tracking-wider uppercase opacity-70`}
        >
          {isMe ? "Вы" : username}
        </div>

        {msg.text && (
          <span className="block text-sm leading-relaxed break-words">
            {msg.text}
          </span>
        )}

        <div
          className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
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
              {msg.status === "sending" && (
                <Clock size={12} className="animate-pulse" />
              )}
              {msg.status === "sent" && <Check size={12} />}
              {msg.status === "read" && (
                <CheckCheck
                  size={12}
                  className={isMe ? "text-white" : "text-blue-500"}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
