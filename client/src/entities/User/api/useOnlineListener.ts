import { useOnlineStore } from "../model/store/useOnlineStore";
import { useConversationListStore } from "@/entities/Conversation/model/store/useConversationListStore";
import { useConversationStore } from "@/entities/Conversation/model/store/useConversationStore";
import { useSocket } from "@/shared/api";
import { useEffect } from "react";

export const useOnlineListener = (userId: number | undefined) => {
  if (!userId) return;
  const { socket, subscribe } = useSocket(userId);
  const { setOnline, setOffline, setAllOnline } = useOnlineStore();

  useEffect(() => {
    console.log("USE ONLINE LISTENER");
    const unsubscribe = subscribe((event) => {
      try {
        const data = JSON.parse(event.data);

        // --- Логика статусов онлайна ---
        if (data.type === "USER_ONLINE") setOnline(Number(data.userId));
        if (data.type === "USER_OFFLINE") setOffline(Number(data.userId));
        if (data.type === "INITIAL_ONLINE_LIST")
          setAllOnline(data.userIds.map(Number));

        if (data.type === "NEW_CONVERSATION") {
          console.log("NEW CONVERSATION");

          const listStore = useConversationListStore.getState();
          const conversation = data.conversation;

          listStore.addConversation(conversation);
        }

        if (data.type === "PARTNER_READ_MESSAGES") {
          console.log("Партнёр прочитал");
          const listStore = useConversationListStore.getState();
          const msgDialogId = String(data.dialogId);
          console.log("DIALOG ID", msgDialogId);

          // 1. Обновляем статус в боковой панели (ListStore)
          if (msgDialogId) {
            console.log("ОБНОВЛЯЕМ СТАТУС");
            listStore.updateConversation(msgDialogId, {
              lastMessage: { status: "read" },
            });
          }
        }

        // --- Логика НОВЫХ СООБЩЕНИЙ ---
        if (data.type === "NEW_MESSAGE") {
          console.log("NEW MESSAGE");
          const listStore = useConversationListStore.getState();
          const activeStore = useConversationStore.getState();

          const msgDialogId = String(data.dialogId);
          const isCurrentChat = msgDialogId === activeStore.activeDialogId;
          const isMyOwnMessage = String(data.senderId) === String(userId);

          // 1. Просто обновляем текст и поднимаем чат вверх
          listStore.updateConversation(msgDialogId, {
            lastMessage: {
              text: data.text,
              senderId: data.senderId,
              status: data.status || "sent",
              createdAt: new Date().toISOString(),
            },
          });

          // 2. Инкрементируем счетчик через атомарный метод стора
          if (!isCurrentChat && !isMyOwnMessage) {
            console.log("INCREMENT 0");
            listStore.incrementUnread(msgDialogId, String(userId));
          }

          // 3. Логика прочтения...
          if (isCurrentChat && socket?.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({ type: "MARK_AS_READ", dialogId: msgDialogId }),
            );
          }
        }

        if (data.type === "MESSAGES_READ") {
          const listStore = useConversationListStore.getState();
          // Обновляем статус последнего сообщения в списке чатов
          listStore.updateConversation(data.dialogId, {
            lastMessage: { status: "read" },
          });

          // Если это наш открытый чат — можно также обновить статус в сторе сообщений
          if (
            useConversationStore.getState().activeDialogId === data.dialogId
          ) {
            // логика обновления статуса сообщений на экране
          }
        }

        //console.log("data ", data.type);

        if (data.type === "TYPING_START") {
          //logger.info(`User ${data.senderId} is typing...`);
          useConversationStore
            .getState()
            .setTyping(String(data.senderId), true);
        }

        if (data.type === "TYPING_STOP") {
          // logger.info(`User ${data.senderId} stopped typing`);
          useConversationStore
            .getState()
            .setTyping(String(data.senderId), false);
        }
      } catch (e) {
        //logger.error(e, "useOnlineListener :: Parse error");
      }
    });

    return () => unsubscribe();
  }, [subscribe, socket, userId]);
};
