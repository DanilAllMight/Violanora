import { useOnlineStore } from "../model/store/useOnlineStore";
import { useConversationListStore } from "@/entities/Conversation/model/store/useConversationListStore";
import { useConversationStore } from "@/entities/Conversation/model/store/useConversationStore";
import { useSocket } from "@/shared/api";
import { useEffect } from "react";

export const useOnlineListener = (userId: number | undefined) => {
  const { socket, subscribe } = useSocket(userId);
  const { setOnline, setOffline, setAllOnline } = useOnlineStore();

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribe((event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "USER_ONLINE") setOnline(Number(data.userId));
        if (data.type === "USER_OFFLINE") setOffline(Number(data.userId));
        if (data.type === "INITIAL_ONLINE_LIST")
          setAllOnline(data.userIds.map(Number));

        if (data.type === "NEW_CONVERSATION") {
          const listStore = useConversationListStore.getState();
          const conversation = data.conversation;

          listStore.addConversation(conversation);
        }

        if (data.type === "PARTNER_READ_MESSAGES") {
          const listStore = useConversationListStore.getState();
          const msgDialogId = String(data.dialogId);

          if (msgDialogId) {
            listStore.updateConversation(msgDialogId, {
              lastMessage: { status: "read" },
            });
          }
        }

        if (data.type === "NEW_MESSAGE") {
          const listStore = useConversationListStore.getState();
          const activeStore = useConversationStore.getState();

          const msgDialogId = String(data.dialogId);
          const isCurrentChat = msgDialogId === activeStore.activeDialogId;
          const isMyOwnMessage = String(data.senderId) === String(userId);

          listStore.updateConversation(msgDialogId, {
            lastMessage: {
              text: data.text,
              senderId: data.senderId,
              status: data.status || "sent",
              createdAt: new Date().toISOString(),
            },
          });

          if (!isCurrentChat && !isMyOwnMessage) {
            listStore.incrementUnread(msgDialogId, String(userId));
          }

          if (isCurrentChat && socket?.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({ type: "MARK_AS_READ", dialogId: msgDialogId }),
            );
          }
        }

        if (data.type === "MESSAGES_READ") {
          const listStore = useConversationListStore.getState();
          listStore.updateConversation(data.dialogId, {
            lastMessage: { status: "read" },
          });
        }

        if (data.type === "TYPING_START") {
          useConversationStore
            .getState()
            .setTyping(String(data.senderId), true);
        }

        if (data.type === "TYPING_STOP") {
          useConversationStore
            .getState()
            .setTyping(String(data.senderId), false);
        }
      } catch (e) {}
    });

    return () => unsubscribe();
  }, [subscribe, socket, userId]);
};
