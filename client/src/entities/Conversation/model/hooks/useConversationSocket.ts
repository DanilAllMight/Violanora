import { fetchMessages } from "../../api/fetchMessages";
import { useConversationListStore } from "../store";
import { useUserStore } from "@/entities/User/model/store";
import { useSocket } from "@/shared/api";
import logger from "@/utils/logger";
import { useEffect, useState, useCallback } from "react";

export const useConversationSocket = (targetId: string | undefined) => {
  const [messages, setMessages] = useState<any[]>([]);
  // Флаг, чтобы знать, есть ли еще сообщения в базе
  const [hasMore, setHasMore] = useState(true);
  // Состояние загрузки для лоадера
  const [isLoading, setIsLoading] = useState(false);

  const user = useUserStore((state) => state.authData);
  const { socket, subscribe } = useSocket(user?.id);

  // 1. Начальная загрузка (самые свежие 20-30 сообщений)
  const getMsgs = useCallback(async () => {
    if (!targetId || !user?.id) return;
    try {
      setIsLoading(true);
      const msgs = await fetchMessages({
        senderId: user.id,
        receiverId: targetId,
        limit: 20, // Ограничиваем первую порцию
      });
      setMessages(msgs);
      setHasMore(msgs.length === 20); // Если пришло меньше 20, значит истории больше нет
    } catch (e) {
      logger.error(e, "Failed to fetch messages");
    } finally {
      setIsLoading(false);
    }
  }, [targetId, user?.id]);

  // 2. Функция для подгрузки СТАРЫХ сообщений при скролле
  const fetchMoreMessages = useCallback(async () => {
    if (!targetId || !user?.id || !hasMore || isLoading) return;

    try {
      setIsLoading(true);
      // Берем дату самого первого (верхнего) сообщения
      const oldestMessage = messages[0];
      if (!oldestMessage) return;

      const olderMsgs = await fetchMessages({
        senderId: user.id,
        receiverId: targetId,
        before: oldestMessage.createdAt, // Передаем дату для фильтрации на бэкенде
        limit: 20,
      });

      if (olderMsgs.length < 20) {
        setHasMore(false); // Сообщений в прошлом больше нет
      }

      // Важно: старые сообщения добавляем в НАЧАЛО массива
      setMessages((prev) => [...olderMsgs, ...prev]);
    } catch (e) {
      logger.error(e, "Failed to fetch more messages");
    } finally {
      setIsLoading(false);
    }
  }, [targetId, user?.id, messages, hasMore, isLoading]);

  useEffect(() => {
    // Сброс данных при смене собеседника
    setMessages([]);
    setHasMore(true);
    getMsgs();

    const unsubscribe = subscribe((event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "NEW_MESSAGE") {
          if (
            String(data.senderId) === String(targetId) &&
            String(data.senderId) !== String(user?.id)
          ) {
            // Новые сообщения всегда в КОНЕЦ
            console.log("НОВОЕ СМС", data);
            setMessages((prev) => [...prev, data]);
          }
        }

        if (data.type === "SENT_CONFIRMED") {
          console.log("SENT_CONFIRMED ", data.tempId, data);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.tempId === data.tempId
                ? { ...msg, _id: data.realId, status: "sent" }
                : msg,
            ),
          );
          console.log("ОБНОВИЛИ");
        }

        if (data.type === "PARTNER_READ_MESSAGES") {
          console.log("Партнёр прочитал");
          const listStore = useConversationListStore.getState();
          const msgDialogId = String(data.dialogId);

          // 1. Обновляем статус в боковой панели (ListStore)
          if (msgDialogId) {
            console.log("ОБНОВЛЯЕМ СТАТУС 2");
            listStore.updateConversation(msgDialogId, {
              lastMessage: { status: "read" },
            });
          }

          // 2. Ваша текущая логика обновления сообщений на экране
          if (String(data.senderId) === String(targetId)) {
            setMessages((prev) =>
              prev.map((msg) =>
                // Если сообщение наше — помечаем прочитанным, так как партнер его открыл
                msg.senderId === user?.id ? { ...msg, status: "read" } : msg,
              ),
            );
          }
        }
      } catch (e) {
        logger.error(e, "Error parsing socket message");
      }
    });

    return () => unsubscribe();
  }, [targetId, user?.id, subscribe, getMsgs]);

  const sendMessage = (text: string) => {
    const tempId = Date.now().toString();
    console.log("Отправили смс");
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({ to: targetId, text, type: "MESSAGE", tempId: tempId }),
      );
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now(),
          senderId: user?.id,
          text,
          createdAt: new Date().toISOString(),
          status: "sending",
          tempId: tempId,
        },
      ]);
    }
  };

  // Возвращаем функцию fetchMoreMessages наружу для компонента списка
  return { messages, sendMessage, fetchMoreMessages, hasMore, isLoading };
};
