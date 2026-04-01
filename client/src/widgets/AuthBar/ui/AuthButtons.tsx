import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Menu } from "lucide-react";
import { NavLink } from "react-router-dom";

export const AuthButtons = () => {
  return (
    <nav>
      <div className="md:hidden">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="rounded-xl border border-gray-100 bg-white p-2 shadow-sm"
              aria-label="Открыть меню авторизации"
            >
              <Menu size={24} className="text-app-btn hover:text-gray-600" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="flex min-w-[200px] flex-col gap-1 rounded-2xl bg-white p-2 shadow-xl"
              sideOffset={5}
            >
              <DropdownMenu.Item asChild>
                <NavLink
                  to="/login"
                  className="block cursor-pointer rounded-xl p-3 font-medium text-blue-600 transition-colors outline-none hover:bg-blue-50"
                >
                  Войти
                </NavLink>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <NavLink
                  to="/registration"
                  className="block cursor-pointer rounded-xl p-3 font-medium text-blue-600 transition-colors outline-none hover:bg-blue-50"
                >
                  Регистрация
                </NavLink>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <div className="hidden items-center gap-4 text-black md:flex">
        <NavLink title="Авторизация" className="text-app-text" to="/login">
          Войти
        </NavLink>
        <NavLink
          title="Регистрация"
          className="text-app-text"
          to="/registration"
        >
          Регистрация
        </NavLink>
      </div>
    </nav>
  );
};
