import { useThemeStore } from "@/entities/Theme/model/store/useThemeStore";
import { useUserStore } from "@/entities/User/model/store/useUserStore";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Menu, LogOut, Sun, Moon, Palette, ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";

export const OptionBar = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const setAccent = useThemeStore((state) => state.setAccent);

  const logout = () => {
    useUserStore.getState().logout();
  };

  const colors = [
    { name: "Сиреневый", value: "#a855f7" },
    { name: "Синий", value: "#3b82f6" },
    { name: "Зеленый", value: "#22c55e" },
    { name: "Красный", value: "#ef4444" },
  ];

  return (
    <nav>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label="Меню цветов"
            className="bg-app-card border-app-icon rounded-xl border p-2 outline-none"
          >
            <Menu size={24} className="text-app-text" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content className="bg-app-card border-app-icon z-50 min-w-[200px] rounded-2xl border p-2 shadow-xl">
            <DropdownMenu.Item
              onSelect={(e) => e.preventDefault()} // Чтобы меню не закрылось
              onClick={toggleTheme} // Клик по всему пункту переключает тему
              className="hover:bg-app-nav text-app-text flex cursor-pointer items-center justify-between rounded-xl p-3 transition-colors outline-none"
            >
              <div className="flex items-center gap-2 font-medium">
                {isDark ? <Moon size={18} /> : <Sun size={18} />}
                <span className="mr-1">
                  {isDark ? "Тёмная тема" : "Светлая тема"}
                </span>
              </div>

              <div
                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${isDark ? "bg-app-accent" : "bg-gray-200"}`}
              >
                <div
                  className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    isDark ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </DropdownMenu.Item>

            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger className="hover:bg-app-nav focus:bg-app-nav text-app-text flex cursor-pointer items-center justify-between gap-2 rounded-xl p-3 transition-colors outline-none">
                <div className="flex items-center gap-2">
                  <Palette size={18} />
                  <span>Цвет акцента</span>
                </div>
                <ChevronRight size={14} className="opacity-50" />
              </DropdownMenu.SubTrigger>

              <DropdownMenu.Portal>
                <DropdownMenu.SubContent
                  className="bg-app-card border-app-icon ml-1 flex min-w-[150px] cursor-pointer flex-col rounded-2xl border px-2 py-2 shadow-2xl"
                  sideOffset={2}
                >
                  {colors.map((color) => (
                    <DropdownMenu.Item
                      key={color.value}
                      onSelect={() => setAccent(color.value)} // Теперь цвет сохранится навсегда
                      className="focus:bg-app-nav flex items-center gap-2 rounded-xl px-3 py-3 outline-none"
                    >
                      <div
                        style={{ backgroundColor: color.value }}
                        className="h-4 w-4 rounded"
                      />
                      <span className="text-app-text">{color.name}</span>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.SubContent>
              </DropdownMenu.Portal>
            </DropdownMenu.Sub>

            <DropdownMenu.Separator className="bg-app-icon my-1 h-[1px]" />

            <DropdownMenu.Item className="hover:bg-app-nav flex rounded-xl p-0 outline-none">
              <NavLink
                to="/profile"
                className="flex w-full items-center p-3 text-app-text"
              >
                Личный кабинет
              </NavLink>
            </DropdownMenu.Item>

            <DropdownMenu.Item className="hover:bg-app-nav text-app-text flex items-center rounded-xl">
              <NavLink
                to={"/message"}
                className="flex w-full items-center p-3 text-app-text"
              >
                Сообщения
              </NavLink>
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="bg-app-icon my-1 h-[1px]" />

            <DropdownMenu.Item
              onSelect={logout}
              className="flex cursor-pointer items-center rounded-xl p-3 text-red-500 outline-none hover:bg-red-50"
            >
              <LogOut size={18} />
              Выйти
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </nav>
  );
};
