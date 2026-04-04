import { useOnlineStore } from "../../model/store/useOnlineStore";
import { useUserStore } from "../../model/store/useUserStore";
import type { UserCardProps } from "../../model/types/userCard";
import { UserAvatar } from "../UserAvatar/UserAvatar";
import { useConversationStore } from "@/entities/Conversation/model/store/useConversationStore";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const UserCard = ({ user }: UserCardProps) => {
  const navigate = useNavigate();
  const myId = useUserStore.getState().authData?.id;
  const isOnline = useOnlineStore((state) => state.onlineIds.has(user.id));

  console.log("online time: ", user.online_time);

  const handleClick = () => {
    if (myId) {
      useConversationStore.getState().setPartnerUsername(user.username);
      useConversationStore.getState().setDialogAvatar(user.avatar_url);
      navigate(`/chat/${user.id}/${user.username}`);
    } else {
      toast.error("Для отправки сообщений, нужно авторизироваться!");
    }
  };

  return (
    <li>
      <article className="bg-app-card grid grid-cols-[auto_1fr_auto] items-center rounded-2xl border border-gray-50/50 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="relative mr-2 flex h-14 w-14 items-center">
          <UserAvatar avatar_url={user.avatar_url}></UserAvatar>
          {isOnline ? (
            <div className="absolute right-0 bottom-0 h-3 w-3 rounded-xl bg-green-600"></div>
          ) : (
            <div></div>
          )}
        </div>
        <div>
          <h2 className="text-app-text self-start">{user.username}</h2>
          {!isOnline && user.online_time && (
            <span>
              Был в сети в{" "}
              {new Date(user.online_time).toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        <button
          type="button"
          title="Перейти в диалог"
          aria-label="Переход в диалог"
          className="bg-app-icon rounded-xl border border-gray-100 p-2"
          onClick={handleClick}
        >
          <MessageSquare className="cursor-pointer" size={17} />
        </button>
      </article>
    </li>
  );
};
