import { useConversationStore } from "../model/store/useConversationStore";
import type { ConversationCardProps } from "../model/types/ConversationCard";
import { useOnlineStore } from "@/entities/User/model/store/useOnlineStore";
import { useUserStore } from "@/entities/User/model/store/useUserStore";
import { UserAvatar } from "@/entities/User/ui/UserAvatar/UserAvatar";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const ConversationCard = ({ conversation }: ConversationCardProps) => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.authData);

  const liveUnread = useConversationStore(
    (state) => state.unreadCounts[String(conversation._id)] || 0,
  );

  const partner =
    conversation.participants.find((p) => Number(p.id) !== Number(user?.id)) ||
    conversation.participants[0];

  const isTyping = useConversationStore((state) =>
    state.typingUsers.has(String(partner.id)),
  );

  const isOnline = useOnlineStore((state) =>
    partner ? state.onlineIds.has(Number(partner.id)) : false,
  );

  const dbUnread = conversation.unreadCount[user?.id || 0] || 0;
  const totalUnread = dbUnread + liveUnread;

  const liveLastMsg = useConversationStore(
    (state) => state.lastMessages[String(conversation._id)],
  );
  const textToDisplay = liveLastMsg || conversation.lastMessage.text;

  const isMine = conversation.lastMessage.senderId == user?.id;

  //console.log("CONVERSATION ", conversation, "partner ", partner);
  //console.log("Partn Id", partner.id, "My id ", user?.id, "is Mine ", isMine);

  console.log("Диалог обновлён");

  const handleClick = () => {
    if (partner) {
      useConversationStore.getState().setPartnerUsername(partner.username);
      useConversationStore
        .getState()
        .setActiveDialog(conversation._id, partner.username);
      console.log(
        "ACTIVEDIALOID CARD ",
        useConversationStore.getState().activeDialogId,
      );
      console.log("CONV_AVATAR ", partner.avatar_url);
      useConversationStore.getState().setDialogAvatar(partner.avatar_url);
      console.log("CONV_ID ", conversation._id);
      useConversationStore
        .getState()
        .setActiveDialog(conversation._id, partner.username);
      useConversationStore.getState().clearUnread(conversation._id);
      navigate(`/chat/${partner.id}/${partner.username}`);
    } else {
      toast.error("Для отправки сообщений, нужно авторизироваться!");
    }
  };

  useEffect(() => {}, [isMine]);

  return (
    <li onClick={handleClick} className="">
      <article className="bg-app-card grid h-22 cursor-pointer grid-cols-[auto_1fr_auto] items-center overflow-hidden rounded-2xl border border-gray-50/50 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="relative mr-2 flex h-14 w-14 items-center">
          <UserAvatar avatar_url={partner.avatar_url}></UserAvatar>
          {isOnline ? (
            <div className="absolute right-0 bottom-0 h-3 w-3 rounded-xl bg-green-600"></div>
          ) : (
            <div></div>
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
            <span className="truncate text-gray-500">{textToDisplay}</span>
          </div>
        </div>
        <div>
          {totalUnread ? (
            <div className="bg-app-accent flex h-6 w-6 rounded-full">
              <div className="flex w-full items-center justify-center">
                {totalUnread}
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      </article>
    </li>
  );
};
