import type { Message } from "../model/types/Message";
import { MessageAttachments } from "./MessageAttachments";
import { MessageOptionsMenu } from "@/widgets/MessageOptionsMenu";
import { Check, CheckCheck, Clock, MoreHorizontal } from "lucide-react";

interface MessageCardProps {
  msg: Message;
  isMe: boolean;
  username: string | null;
}

export const MessageCard = ({ msg, isMe, username }: MessageCardProps) => {
  const hasAttachments = msg.attachments && msg.attachments.length > 0;

  const handleReply = () => {
    console.log("Ответ на сообщение:", msg._id);
  };

  const handleDelete = () => {
    console.log("Удаление сообщения:", msg._id);
  };

  const handleCopy = () => {
    console.log("Удаление сообщения:", msg._id);
  };

  const handleEdit = () => {
    console.log("Удаление сообщения:", msg._id);
  };

  const handleForward = () => {
    console.log("Удаление сообщения:", msg._id);
  };

  return (
    <div
      className={`group flex w-full items-center gap-2 ${isMe ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`relative max-w-[80%] overflow-hidden rounded-2xl border shadow-sm md:max-w-[70%] ${
          isMe
            ? "bg-app-accent rounded-tr-none border-blue-500 text-white"
            : "rounded-tl-none border-gray-100 bg-white text-gray-800"
        }`}
      >
        {hasAttachments && (
          <div className="p-1">
            {" "}
            <MessageAttachments attachments={msg.attachments} />
          </div>
        )}

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
      <div
        className={`text-app-text self-start opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 ${
          isMe ? "order-first" : "order-last"
        }`}
      >
        <MessageOptionsMenu
          align={isMe ? "end" : "start"}
          onCopy={handleCopy}
          onEdit={handleEdit}
          onForward={handleForward}
          onReply={handleReply}
          onDelete={handleDelete}
        >
          <button
            title="Расширенные возможности"
            className="bg-app-nav hover:bg-app-bg flex h-7 w-7 items-center justify-center rounded-full transition-colors outline-none"
          >
            <MoreHorizontal size={16} />
          </button>
        </MessageOptionsMenu>
      </div>
    </div>
  );
};
