import { useOnlineStore } from "../model/store/useOnlineStore";
import { useConversationListStore } from "@/entities/Conversation/model/store/useConversationListStore";
import { useConversationStore } from "@/entities/Conversation/model/store/useConversationStore";
import { useSocket } from "@/shared/api";
import logger from "@/utils/logger";
import { useEffect } from "react";

export const useOnlineListener = (userId: number | undefined) => {
  const { socket, subscribe } = useSocket(userId);
  const { setOnline, setOffline, setAllOnline } = useOnlineStore();

  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      try {
        const data = JSON.parse(event.data);

        // --- Логика статусов онлайна ---
        if (data.type === "USER_ONLINE") setOnline(Number(data.userId));
        if (data.type === "USER_OFFLINE") setOffline(Number(data.userId));
        if (data.type === "INITIAL_ONLINE_LIST")
          setAllOnline(data.userIds.map(Number));

        if (data.type === "NEW_CONVERSATION") {
          console.log("NEW_CONVERSATION");
          useConversationListStore
            .getState()
            .setConversation(data.conversation);
        }

        // --- Логика НОВЫХ СООБЩЕНИЙ ---
        if (data.type === "NEW_MESSAGE") {
          logger.info("Новое сообщение");
          const store = useConversationStore.getState();
          const msgDialogId = String(data.dialogId);
          const currentActiveId = store.activeDialogId
            ? String(store.activeDialogId)
            : null;
          const isMyOwnMessage = String(data.senderId) === String(userId);

          // Обновляем текст сообщения в любом случае
          store.setLastMessage(msgDialogId, data.text);

          console.log(
            "MSGDiaolg currentId ",
            msgDialogId,
            " ",
            currentActiveId,
          );

          // Если мы в этом чате прямо сейчас — просто шлем прочтение (даже если пишем сами себе)
          if (msgDialogId === currentActiveId) {
            if (socket && socket.readyState === WebSocket.OPEN) {
              logger.info("Мы в этом чате");
              socket.send(
                JSON.stringify({ type: "MARK_AS_READ", dialogId: msgDialogId }),
              );
            }
            return; // Выходим, так как чат открыт и счетчик инкрементировать не надо
          }

          // Если чат НЕ открыт и сообщение НЕ наше — только тогда увеличиваем счетчик
          if (!isMyOwnMessage) {
            //logger.info(`User NOT in chat ${msgDialogId}, incrementing badge`);
            store.incrementUnread(msgDialogId);
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
