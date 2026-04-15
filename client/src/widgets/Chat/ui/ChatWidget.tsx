import { ChatFooter } from "./ChatFooter";
import { ChatHeader } from "./ChatHeader";
import { useConversationSocket } from "@/entities/Conversation/model/hooks/useConversationSocket";
import { useConversationStore } from "@/entities/Conversation/model/store/useConversationStore";
import { MessageList } from "@/entities/Message/ui";
import { useUserStore } from "@/entities/User/model/store/useUserStore";
import { CallOverlay } from "@/features/video-call/ui/CallOverlay";
import { useSocket } from "@/shared/api/socket/useSocket";
import { useState, useRef, useLayoutEffect, useEffect } from "react";

interface ChatWidgetProps {
  userId: string | undefined;
}

export const ChatWidget = ({ userId: targetId }: ChatWidgetProps) => {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollHeight = useRef<number>(0);
  const isFirstLoad = useRef(true);
  const prevMsgCount = useRef(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!targetId) return <div>Выберите чат</div>;

  const myId = useUserStore.getState().authData?.id;
  const { socket } = useSocket(myId);

  const setActiveDialog = useConversationStore(
    (state) => state.setActiveDialog,
  );

  const resetActiveDialog = useConversationStore(
    (state) => state.resetActiveDialog,
  );
  const partner_avatar = useConversationStore((state) => state.partner.avatar);
  const username = useConversationStore((state) => state.partner.username);

  const {
    messages,
    sendMessage,
    fetchMoreMessages,
    hasMore,
    isLoading,
    //startCall,
    localStream,
    remoteStream,
    hangUp,
  } = useConversationSocket(targetId);

  const typingUsers = useConversationStore((state) => state.typingUsers);
  const isTyping = typingUsers.has(String(targetId));

  // 1. Инициализация диалога
  useEffect(() => {
    if (myId && targetId) {
      useConversationStore.getState().getConversation(myId, Number(targetId));
    }
    return () => {
      resetActiveDialog();
      isFirstLoad.current = true; // Сброс при выходе
    };
  }, [targetId, setActiveDialog, resetActiveDialog, username, myId]);

  // 2. Логика скролла (Замораживание при подгрузке истории)
  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container || messages.length === 0) return;

    const isHistoryLoading = lastScrollHeight.current > 0;
    const isMessageAdded = messages.length > prevMsgCount.current;

    if (isFirstLoad.current) {
      container.scrollTop = container.scrollHeight;
      isFirstLoad.current = false;
    } else if (isHistoryLoading) {
      const delta = container.scrollHeight - lastScrollHeight.current;
      container.scrollTop = Math.round(delta);
      lastScrollHeight.current = 0;
    } else if (isMessageAdded) {
      const distanceToBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      if (distanceToBottom < 250) {
        container.scrollTop = container.scrollHeight;
      }
    }
    prevMsgCount.current = messages.length;
  }, [messages.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (
      container.scrollTop === 0 &&
      hasMore &&
      !isLoading &&
      !isFirstLoad.current
    ) {
      lastScrollHeight.current = container.scrollHeight;
      fetchMoreMessages();
    }
  };

  // 3. Логика "Печатает..." (TYPING)
  const handleInputChange = (value: string) => {
    setInputValue(value);

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "TYPING_START", to: targetId }));

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "TYPING_STOP", to: targetId }));
        }
      }, 2000);
    }
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue("");

      // Остановка статуса "печатает" при отправке
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket?.send(JSON.stringify({ type: "TYPING_STOP", to: targetId }));

      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  };

  return (
    <div className="absolute inset-0 flex h-full flex-col bg-white">
      <ChatHeader
        username={username}
        partner_avatar={partner_avatar}
      ></ChatHeader>

      {(localStream || remoteStream) && (
        <CallOverlay
          localStream={localStream}
          remoteStream={remoteStream}
          onHangUp={hangUp}
        />
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ overflowAnchor: "none" }}
        className="custom-scrollbar flex-1 overflow-y-auto px-4 py-2"
      >
        <div className="flex min-h-full flex-col justify-end">
          {isLoading && (
            <div className="py-2 text-center text-xs text-gray-400 italic">
              Загрузка истории...
            </div>
          )}
          <div className="flex justify-center">
            <MessageList messages={messages} />
          </div>
        </div>
      </div>

      <ChatFooter
        isTyping={isTyping}
        username={username}
        handleInputChange={handleInputChange}
        handleSend={handleSend}
        inputValue={inputValue}
      ></ChatFooter>
    </div>
  );
};
