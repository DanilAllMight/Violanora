import { useUserStore } from "@/entities/User/model/store/useUserStore";
import { UserAvatar } from "@/entities/User/ui/UserAvatar/UserAvatar";
import { AuthButtons } from "@/widgets/AuthBar";
import { OptionBar } from "@/widgets/OptionBar";
import { NavLink } from "react-router-dom";

export const NavBar = () => {
  const authData = useUserStore((state) => state.authData);

  return (
    <nav className="bg-app-nav text-app-text sticky top-0 z-50 flex h-16 w-full rounded-b-2xl px-8 font-bold">
      <ul className="flex w-full items-center justify-between">
        <li>
          <NavLink title="Ссылка на главную" to="/" className="p-3">
            Главная
          </NavLink>
        </li>
        <li>
          {!authData ? (
            <AuthButtons />
          ) : (
            <div className="flex items-center gap-5">
              <NavLink className="flex items-center" to={"/profile"}>
                <div className="flex h-14 w-14 items-center pr-2">
                  <UserAvatar avatar_url={authData.avatar_url} />
                </div>
                <div className="hidden sm:block">{authData.username}</div>
              </NavLink>

              <OptionBar />
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
};
