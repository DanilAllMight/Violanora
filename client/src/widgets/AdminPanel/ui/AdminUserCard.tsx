import { formatOnlineTime } from "@/entities/User/lib/formatOnlineTime";
import { useOnlineStore } from "@/entities/User/model/store";
import type { User } from "@/entities/User/model/types";
import { UserAvatar } from "@/entities/User/ui";
import { DeleteUserButton } from "@/features/delete-user";
import { ReliveUserButton } from "@/features/relive-user";

interface AdminUserCardProps {
  user: User;
  handleDelete: () => void;
  handleRelive: () => void;
}

export const AdminUserCard = ({
  user,
  handleDelete,
  handleRelive,
}: AdminUserCardProps) => {
  const isOnline = useOnlineStore((state) => state.onlineIds.has(user.id));

  console.log("online time: ", user.online_time);

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
          {isOnline && <span className="text-xs text-green-400">В сети</span>}
          {!isOnline && user.online_time && (
            <span className="text-xs text-gray-400">
              Был(а) в сети {formatOnlineTime(user.online_time)}
            </span>
          )}
        </div>

        {!user.deletedAt && (
          <DeleteUserButton
            userId={user.id}
            handleDelete={handleDelete}
          ></DeleteUserButton>
        )}

        {user.deletedAt && (
          <ReliveUserButton
            userId={user.id}
            handleRelive={handleRelive}
          ></ReliveUserButton>
        )}
      </article>
    </li>
  );
};
