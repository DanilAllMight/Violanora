import { fetchMessages } from "../../api/fetchMessages";
import { useConversationListStore } from "../store";
import { useUserStore } from "@/entities/User/model/store";
import { useSocket } from "@/shared/api";
import logger from "@/utils/logger";
import { useEffect, useState, useCallback, useRef } from "react";

export const useConversationSocket = (targetId: string | undefined) => {
  const [messages, setMessages] = useState<any[]>([]);
  // Флаг, чтобы знать, есть ли еще сообщения в базе
  const [hasMore, setHasMore] = useState(true);
  // Состояние загрузки для лоадера
  const [isLoading, setIsLoading] = useState(false);

  const user = useUserStore((state) => state.authData);
  const { socket, subscribe } = useSocket(user?.id);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);

  const setupPeer = useCallback(
    (id: string) => {
      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      peer.onicecandidate = (event) => {
        if (event.candidate && socket?.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: "ice-candidate",
              to: id,
              payload: event.candidate,
            }),
          );
        }
      };

      peer.ontrack = (event) => {
        const stream = event.streams[0];
        console.log("📍 ПОЛУЧЕН ПОТОК ОТ СОБЕСЕДНИКА:", stream.id);
        console.log("🔊 Аудио-треков найдено:", stream.getAudioTracks().length);

        if (stream.getAudioTracks().length > 0) {
          const audioTrack = stream.getAudioTracks()[0];
          console.log("📊 Статус звука:", {
            enabled: audioTrack.enabled, // Должно быть true
            readyState: audioTrack.readyState, // Должно быть 'live'
          });
        }

        setRemoteStream(stream);
      };

      pc.current = peer;
      return peer;
    },
    [socket],
  );

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

  const hangUp = () => {
    // Останавливаем камеру и микрофон
    localStream?.getTracks().forEach((track) => track.stop());
    // Закрываем соединение
    pc.current?.close();
    pc.current = null;
    // Сбрасываем стейты
    setLocalStream(null);
    setRemoteStream(null);

    // (Опционально) Отправьте сообщение 'hangup' через сокет, чтобы у партнера тоже закрылось окно
  };

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

    const unsubscribe = subscribe(async (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "offer") {
          console.log("Входящий звонок...");
          const peer = setupPeer(data.from);
          console.log("peer ", peer);
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          console.log("stream ", stream);
          setLocalStream(stream);
          stream.getTracks().forEach((track) => peer.addTrack(track, stream));

          await peer.setRemoteDescription(
            new RTCSessionDescription(data.payload),
          );
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);

          if (socket?.readyState === WebSocket.OPEN) {
            socket?.send(
              JSON.stringify({
                type: "answer",
                to: data.from,
                payload: answer,
              }),
            );
          }
        }

        if (data.type === "answer") {
          await pc.current?.setRemoteDescription(
            new RTCSessionDescription(data.payload),
          );
        }

        if (data.type === "ice-candidate") {
          // Добавляем проверку: если описание еще не установлено, просто игнорируем кандидата (или ждем)
          if (pc.current && pc.current.remoteDescription && data.payload) {
            try {
              await pc.current.addIceCandidate(
                new RTCIceCandidate(data.payload),
              );
            } catch (e) {
              console.error("Ошибка добавления ICE кандидата:", e);
            }
          } else {
            // Можно складывать их во временный массив, но для теста достаточно просто пропустить
            console.warn(
              "Кандидат получен раньше, чем установилось соединение. Пропускаем.",
            );
          }
        }

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
        console.error("ПОЛНАЯ ОШИБКА", e);
        logger.error(e, "Error parsing socket message");
      }
    });

    return () => {
      unsubscribe();
      // Очистка потоков при выходе
      localStream?.getTracks().forEach((t) => t.stop());
      pc.current?.close();
    };
  }, [targetId, user?.id, subscribe, getMsgs]);

  const startCall = async () => {
    console.log("ЗАЯВОЧКА НА ЗВОНОК");
    if (!targetId) return;
    const peer = setupPeer(targetId);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setLocalStream(stream);
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    console.log("ЗАЯВОЧКА НА ЗВОНОК ОТПРАВЛЯЕТСЯ");
    socket?.send(
      JSON.stringify({ type: "offer", to: targetId, payload: offer }),
    );
  };

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
  return {
    messages,
    sendMessage,
    fetchMoreMessages,
    hasMore,
    isLoading,
    startCall,
    localStream,
    remoteStream,
    hangUp,
  };
};
