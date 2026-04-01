import { useUserStore } from "../../../User/model/store/useUserStore";
import { type Message, type MessagesList } from "../../model/types/Message";
import { MessageCard } from "../MessageCard/MessageCard";
import { useConversationStore } from "@/entities/Conversation/model/store/useConversationStore";

const groupMessagesByDate = (messages: Message[]) => {
  return messages.reduce(
    (groups: { [key: string]: Message[] }, msg: Message) => {
      const date = new Date(msg.createdAt).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
      return groups;
    },
    {},
  );
};

export const MessageList = ({ messages }: MessagesList) => {
  const user = useUserStore.getState().authData;
  const username = useConversationStore.getState().partner_username;

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <ul className="custom-scrollbar h-full w-full max-w-[700px] overflow-y-auto p-4">
      {Object.keys(groupedMessages).map((date) => (
        <div key={date} className="relative mb-6 flex flex-col gap-4">
          <div className="pointer-events-none sticky top-0 z-50 flex justify-center py-2">
            <span className="pointer-events-auto rounded-full border border-gray-100 bg-white/90 px-4 py-1.5 text-[11px] font-bold text-gray-500 uppercase shadow-sm backdrop-blur-md">
              {date}
            </span>
          </div>

          {groupedMessages[date].map((msg, index) => {
            const isMe = user?.id == Number(msg.senderId);

            return (
              <li
                key={msg._id || index}
                className={`message-item flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                data-id={msg._id}
              >
                <MessageCard
                  isMe={isMe}
                  username={username}
                  msg={msg}
                ></MessageCard>
              </li>
            );
          })}
        </div>
      ))}
    </ul>
  );
};
