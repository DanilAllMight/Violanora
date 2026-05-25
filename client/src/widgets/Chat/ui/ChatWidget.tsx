import { ChatFooter } from "./ChatFooter";
import { ChatHeader } from "./ChatHeader";
import { useCallConversationSocket } from "@/entities/Conversation/model/hooks";
import { useConversationSocket } from "@/entities/Conversation/model/hooks/useConversationSocket";
import { useConversationUnreadStore } from "@/entities/Conversation/model/store";
import { useConversationStore } from "@/entities/Conversation/model/store/useConversationStore";
import { updateMessage } from "@/entities/Message/api/updateMessage";
import { useMessageEditStore } from "@/entities/Message/model/store";
import type { MessageUpdateProps } from "@/entities/Message/model/types";
import { MessageList } from "@/entities/Message/ui";
import { useUserStore } from "@/entities/User/model/store/useUserStore";
import { uploadChatMedia } from "@/features/attach-media";
import { CallOverlay } from "@/features/video-call/ui/CallOverlay";
import { useSocket } from "@/shared/api/socket/useSocket";
import { Phone } from "lucide-react";
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
  const [files, setFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);

  if (!targetId) return <div>Выберите чат</div>;

  const myId = useUserStore.getState().authData?.id;
  const { socket } = useSocket(myId);

  const resetActiveDialog = useConversationStore(
    (state) => state.resetActiveDialog,
  );

  const messageId = useMessageEditStore((state) => state.editingMessage?._id);

  const partner_avatar = useConversationStore((state) => state.partner.avatar);
  const username = useConversationStore((state) => state.partner.username);

  const { messages, isLoading, hasMore, fetchMoreMessages, sendMessage } =
    useConversationSocket(targetId);

  const {
    localStream,
    remoteStream,
    incomingCall,
    startCall,
    acceptCall,
    rejectCall,
    hangUp,
  } = useCallConversationSocket(targetId);

  const typingUsers = useConversationStore((state) => state.typingUsers);
  const isTyping = typingUsers.has(String(targetId));

  const activeDialogId = useConversationStore((state) => state.activeDialogId);

  const removeUnread =
    useConversationUnreadStore.getState().removeUnreadConversation;

  useEffect(() => {
    if (myId && targetId) {
      useConversationStore.getState().getConversation(myId, Number(targetId));
    }

    if (activeDialogId) {
      removeUnread(activeDialogId);
    }

    return () => {
      resetActiveDialog();
      isFirstLoad.current = true;
    };
  }, [targetId, myId]);

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

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles].slice(0, 10));
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

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

  const handleUpdate = async () => {
    const hasFiles = files.length > 0;

    const editingText = useMessageEditStore.getState().editingText;
    const editingAttachments =
      useMessageEditStore.getState().editingMessage?.attachments;
    const editingMessage = useMessageEditStore.getState().editingMessage;

    if (editingAttachments) {
      let attachmentUrls: { url: string; type: string }[] = [];

      if (hasFiles) {
        const urls = await uploadChatMedia(files);
        attachmentUrls = urls.map((url) => ({ url, type: "image" }));
      }

      if (messageId && editingMessage) {
        const data: MessageUpdateProps = {
          editingText: editingText,
          editingAttachments: editingAttachments,
          attachmentsUrls: attachmentUrls,
          messageId: messageId,
          createdAt: editingMessage?.createdAt,
          targetId: targetId,
        };

        await updateMessage({ data });

        useMessageEditStore.getState().setEditingText("");
        useMessageEditStore.getState().setEditingMessage(null);
        useMessageEditStore.getState().setIsEdit(false);
        setFiles([]);
      }
    }
  };

  const handleSend = async () => {
    const hasFiles = files.length > 0;
    const hasText = inputValue.trim().length > 0;

    if ((hasText || hasFiles) && !isSending) {
      setIsSending(true);
      try {
        let attachmentUrls: { url: string; type: string }[] = [];

        if (hasFiles) {
          const urls = await uploadChatMedia(files);
          attachmentUrls = urls.map((url) => ({ url, type: "image" }));
        }

        sendMessage(inputValue, attachmentUrls);

        setInputValue("");
        setFiles([]);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socket?.send(JSON.stringify({ type: "TYPING_STOP", to: targetId }));

        setTimeout(() => {
          scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
          });
        }, 100);
      } catch (error) {
        alert("Ошибка при загрузке медиа");
      } finally {
        setIsSending(false);
      }
    }
  };

  return (
    <div className="bg-app-bg absolute inset-0 flex h-full flex-col">
      <ChatHeader
        username={username}
        partner_avatar={partner_avatar}
        startCall={startCall}
      ></ChatHeader>

      {(localStream || remoteStream) && (
        <CallOverlay
          localStream={localStream}
          remoteStream={remoteStream}
          onHangUp={hangUp}
        />
      )}

      {incomingCall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl duration-300">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-20 w-20 animate-bounce items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Phone size={40} />
              </div>

              <h3 className="mb-1 text-xl font-bold text-gray-900">
                Входящий звонок
              </h3>
              <p className="mb-6 text-gray-500">
                Собеседник хочет начать видеочат
              </p>

              <div className="flex w-full gap-3">
                <button
                  onClick={acceptCall}
                  className="flex-1 rounded-xl bg-green-500 py-3 font-semibold text-white transition-colors hover:bg-green-600 active:scale-95"
                >
                  Принять
                </button>
                <button
                  onClick={rejectCall}
                  className="flex-1 rounded-xl bg-red-500 py-3 font-semibold text-white transition-colors hover:bg-red-600 active:scale-95"
                >
                  Отклонить
                </button>
              </div>
            </div>
          </div>
        </div>
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
        files={files}
        onFilesSelected={handleFilesSelected}
        onRemoveFile={handleRemoveFile}
        isSending={isSending}
        handleUpdate={handleUpdate}
      ></ChatFooter>
    </div>
  );
};
