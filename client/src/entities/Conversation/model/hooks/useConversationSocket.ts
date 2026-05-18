import { fetchMessages } from "../../api/fetchMessages";
import { useConversationListStore } from "../store";
import { useUserStore } from "@/entities/User/model/store";
import { useSocket } from "@/shared/api";
import { useEffect, useState, useCallback } from "react";

export const useConversationSocket = (targetId: string | undefined) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const user = useUserStore((state) => state.authData);
  const { socket, subscribe } = useSocket(user?.id);

  const getMsgs = useCallback(async () => {
    if (!targetId || !user?.id) return;
    try {
      setIsLoading(true);
      const msgs = await fetchMessages({
        senderId: user.id,
        receiverId: targetId,
        limit: 20,
      });
      setMessages(msgs);
      setHasMore(msgs.length === 20);
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  }, [targetId, user?.id]);

  const fetchMoreMessages = useCallback(async () => {
    if (!targetId || !user?.id || !hasMore || isLoading) return;

    try {
      setIsLoading(true);
      const oldestMessage = messages[0];
      if (!oldestMessage) return;

      const olderMsgs = await fetchMessages({
        senderId: user.id,
        receiverId: targetId,
        before: oldestMessage.createdAt,
        limit: 20,
      });

      if (olderMsgs.length < 20) {
        setHasMore(false);
      }

      setMessages((prev) => [...olderMsgs, ...prev]);
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  }, [targetId, user?.id, messages, hasMore, isLoading]);

  useEffect(() => {
    setMessages([]);
    setHasMore(true);
    getMsgs();

    const unsubscribe = subscribe(async (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "NEW_MESSAGE") {
          if (
            String(data.senderId) === String(targetId) &&
            String(data.senderId) !== String(user?.id)
          ) {
            setMessages((prev) => [...prev, data]);
          }
        }

        if (data.type === "SENT_CONFIRMED") {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.tempId === data.tempId
                ? { ...msg, _id: data.realId, status: "sent" }
                : msg,
            ),
          );
        }

        if (data.type === "PARTNER_READ_MESSAGES") {
          const listStore = useConversationListStore.getState();
          const msgDialogId = String(data.dialogId);

          if (msgDialogId) {
            listStore.updateConversation(msgDialogId, {
              lastMessage: { status: "read" },
            });
          }

          if (String(data.senderId) === String(targetId)) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.senderId === user?.id || targetId
                  ? { ...msg, status: "read" }
                  : msg,
              ),
            );
          }
        }
      } catch (e) {}
    });

    return () => {
      unsubscribe();
    };
  }, [targetId, user?.id, subscribe, getMsgs]);

  const sendMessage = (
    text: string,
    attachments: { url: string; type: string }[] = [],
  ) => {
    const tempId = Date.now().toString();

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          to: targetId,
          text,
          type: "MESSAGE",
          tempId: tempId,
          attachments,
        }),
      );

      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now(),
          senderId: user?.id,
          text,
          attachments,
          createdAt: new Date().toISOString(),
          status: "sending",
          tempId: tempId,
        },
      ]);
    }
  };

  return {
    messages,
    sendMessage,
    fetchMoreMessages,
    hasMore,
    isLoading,
  };
};
