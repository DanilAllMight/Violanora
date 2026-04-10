import { useConversationListStore } from "../model/store";
import { useConversationStore } from "../model/store/useConversationStore";
import type { ConversationCardProps } from "../model/types/ConversationCard";
import { useOnlineStore } from "@/entities/User/model/store/useOnlineStore";
import { useUserStore } from "@/entities/User/model/store/useUserStore";
import { UserAvatar } from "@/entities/User/ui/UserAvatar/UserAvatar";
import { Check, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Если используешь Lucide, если нет — заменим на символы

export const ConversationCard = ({ conversation }: ConversationCardProps) => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.authData);
  const myId = user?.id;

  // Достаем актуальные данные диалога из стора списка
  const currentChat = useConversationListStore((state) =>
    state.conversations.find((c) => c._id === conversation._id),
  );

  if (!myId) return null;

  const partner =
    conversation.participants.find((p) => Number(p.id) !== Number(user?.id)) ||
    conversation.participants[0];

  const isTyping = useConversationStore((state) =>
    state.typingUsers.has(String(partner.id)),
  );

  const isOnline = useOnlineStore((state) =>
    partner ? state.onlineIds.has(Number(partner.id)) : false,
  );

  // Используем данные из стора (currentChat), а если их нет — из пропса
  const totalUnread =
    currentChat?.unreadCount?.[myId] ?? conversation.unreadCount[myId] ?? 0;
  const lastMsg = currentChat?.lastMessage ?? conversation.lastMessage;
  const isMine = String(lastMsg.senderId) === String(myId);

  console.log("Conversation ", conversation);
  console.log("STATUS MSG ", lastMsg.status);

  const handleClick = () => {
    if (partner) {
      const dialogId = conversation._id;
      useConversationStore
        .getState()
        .setActiveDialog(dialogId, partner.username, partner.avatar_url);
      useConversationListStore.getState().updateConversation(dialogId, {
        unreadCount: { [myId]: 0 },
      });
      navigate(`/chat/${partner.id}/${partner.username}`);
    } else {
      toast.error("Для отправки сообщений, нужно авторизироваться!");
    }
  };

  return (
    <li onClick={handleClick} className="list-none">
      <article className="bg-app-card grid h-22 cursor-pointer grid-cols-[auto_1fr_auto] items-center overflow-hidden rounded-2xl border border-gray-50/50 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="relative mr-2 flex h-14 w-14 items-center">
          <UserAvatar avatar_url={partner.avatar_url} />
          {isOnline && (
            <div className="absolute right-0 bottom-0 h-3 w-3 rounded-xl border-2 border-white bg-green-600"></div>
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex gap-1">
            <h2 className="text-app-text">{partner?.username}</h2>
          </div>
          <div>
            {isTyping ? (
              <span className="animate-pulse text-xs text-green-500">
                печатает...
              </span>
            ) : (
              <span className="truncate text-xs text-gray-500"></span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isMine ? (
              <span className="text-app-text shrink-0">Вы: </span>
            ) : (
              <span className="text-app-text shrink-0 truncate">
                {partner?.username}:{" "}
              </span>
            )}
            <span className="truncate text-gray-500">{lastMsg.text}</span>
          </div>
        </div>

        {/* Правая колонка: только счетчик или статус (центрирование за счет сетки grid) */}
        <div>
          {totalUnread ? (
            <div className="bg-app-accent flex h-6 w-6 rounded-full">
              <div className="flex w-full items-center justify-center text-xs text-white">
                {totalUnread}
              </div>
            </div>
          ) : (
            isMine && (
              <div className="flex w-full items-center justify-center">
                <span
                  className={
                    lastMsg.status === "read"
                      ? "text-blue-500"
                      : "text-gray-400"
                  }
                >
                  {lastMsg.status === "read" ? (
                    <CheckCheck size={18} strokeWidth={3} />
                  ) : (
                    <Check size={18} strokeWidth={3} />
                  )}
                </span>
              </div>
            )
          )}
        </div>
      </article>
    </li>
  );
};
