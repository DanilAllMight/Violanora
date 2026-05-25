// src/components/MessageMenu.tsx
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Copy, CornerUpLeft, Forward, Pencil, Trash2 } from "lucide-react";
import { type ReactNode } from "react";

interface MessageOptionsMenuProps {
  children: ReactNode;
  align: "start" | "end";
  isMe: boolean;
  onCopy: () => void;
  onReply: () => void;
  onForward: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const MessageOptionsMenu = ({
  children,
  align,
  isMe,
  onCopy,
  onReply,
  onForward,
  onEdit,
  onDelete,
}: MessageOptionsMenuProps) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="bottom"
          align={align}
          sideOffset={5}
          className="animate-in fade-in slide-in-from-top-1 z-50 min-w-[150px] rounded-lg border border-gray-100 bg-white p-1 shadow-md duration-100"
        >
          <DropdownMenu.Item
            onClick={onCopy}
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs text-gray-700 outline-none hover:bg-gray-50 focus:bg-gray-50"
          >
            <Copy size={14} />
            Копировать
          </DropdownMenu.Item>

          {isMe && (
            <>
              <DropdownMenu.Item
                onClick={onReply}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs text-gray-700 outline-none hover:bg-gray-50 focus:bg-gray-50"
              >
                <CornerUpLeft size={14} />
                Ответить
              </DropdownMenu.Item>

              <DropdownMenu.Item
                onClick={onForward}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs text-gray-700 outline-none hover:bg-gray-50 focus:bg-gray-50"
              >
                <Forward size={14} />
                Переслать
              </DropdownMenu.Item>

              <DropdownMenu.Item
                onClick={onEdit}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs text-gray-700 outline-none hover:bg-gray-50 focus:bg-gray-50"
              >
                <Pencil size={14} />
                Изменить
              </DropdownMenu.Item>
            </>
          )}

          <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />

          <DropdownMenu.Item
            onClick={onDelete}
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs text-red-600 outline-none hover:bg-red-50 focus:bg-red-50"
          >
            <Trash2 size={14} />
            Удалить
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default MessageOptionsMenu;
