import { UserAvatar } from "@/entities/User/ui/UserAvatar/UserAvatar";
import { ArrowLeft } from "lucide-react";
import { NavLink } from "react-router-dom";

interface ChatHeaderProps {
  username: string | null;
  partner_avatar: string | null;
}

export const ChatHeader = ({ username, partner_avatar }: ChatHeaderProps) => {
  return (
    <div className="flex w-full items-center justify-center border-b border-gray-50">
      <div className="relative flex w-full max-w-[700px] items-center justify-center">
        <NavLink to="/message" className="absolute left-10">
          <div className="bg-app-nav rounded-full p-3 transition-colors hover:bg-gray-200">
            <ArrowLeft size={20} />
          </div>
        </NavLink>
        <NavLink
          className="relative flex h-16 items-center justify-center gap-2"
          to="/home"
        >
          <UserAvatar avatar_url={partner_avatar} />
          <h1 className="text-app-text text-xl font-bold">{username}</h1>
        </NavLink>
      </div>
    </div>
  );
};
