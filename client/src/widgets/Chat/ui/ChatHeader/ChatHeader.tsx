import { UserAvatar } from "@/entities/User/ui/UserAvatar/UserAvatar";
import { ArrowLeft, PhoneCall } from "lucide-react";
import { NavLink } from "react-router-dom";

interface ChatHeaderProps {
  username: string | null;
  partner_avatar: string | null;
}

export const ChatHeader = ({ username, partner_avatar }: ChatHeaderProps) => {
  return (
    <div className="flex w-full items-center justify-center border-b border-gray-50">
      <div className="grid w-full max-w-[700px] grid-cols-[auto_1fr_auto] items-center justify-center px-4">
        <NavLink to="/message" className="">
          <div className="bg-app-nav rounded-full p-3 transition-colors hover:bg-gray-200">
            <ArrowLeft size={20} />
          </div>
        </NavLink>
        <NavLink
          className="flex h-16 max-w-full items-center justify-center gap-2 overflow-hidden"
          to="/home"
        >
          <UserAvatar avatar_url={partner_avatar} />
          <h1 className="text-app-text truncate text-xl font-bold">
            {username}
          </h1>
        </NavLink>
        <button
          className="rounded-full p-3 transition-colors hover:bg-gray-100"
          aria-label="позвонить"
        >
          <PhoneCall size={20} className="text-blue-500" />
        </button>
      </div>
    </div>
  );
};
