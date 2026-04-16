import { useUserStore } from "@/entities/User/model/store";
import { useSocket } from "@/shared/api";
import logger from "@/utils/logger";
import { useEffect, useState, useCallback, useRef } from "react";

export const useCallConversationSocket = (targetId: string | undefined) => {
  const user = useUserStore((state) => state.authData);
  const { socket, subscribe } = useSocket(user?.id);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);

  const iceCandidatesQueue = useRef<RTCIceCandidateInit[]>([]);

  const [incomingCall, setIncomingCall] = useState<{
    from: string;
    offer: any;
  } | null>(null); // Когда звонят нам

  const processIceQueue = useCallback(async () => {
    console.log(
      "🔄 Обработка накопленной очереди ICE-кандидатов:",
      iceCandidatesQueue.current.length,
    );
    while (iceCandidatesQueue.current.length > 0) {
      const candidate = iceCandidatesQueue.current.shift();
      if (candidate && pc.current) {
        try {
          await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("❌ Ошибка при добавлении кандидата из очереди:", e);
        }
      }
    }
  }, []);

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

  useEffect(() => {
    const unsubscribe = subscribe(async (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "offer") {
          console.log("Входящий звонок от:", data.from);
          // Вместо авто-ответа просто открываем модалку
          setIncomingCall({ from: data.from, offer: data.payload });
        }

        if (data.type === "hangup") {
          console.log("Собеседник повесил трубку");
          // Вызываем твою функцию очистки, которая останавливает стримы и закрывает Peer
          stopAllTracks();
        }

        if (data.type === "answer") {
          if (pc.current) {
            await pc.current.setRemoteDescription(
              new RTCSessionDescription(data.payload),
            );

            // КРИТИЧЕСКИЙ МОМЕНТ: То же самое для вызывающей стороны
            await processIceQueue();
          }
        }

        if (data.type === "ice-candidate") {
          // Если удаленное описание уже установлено — добавляем сразу
          if (pc.current?.remoteDescription) {
            try {
              await pc.current.addIceCandidate(
                new RTCIceCandidate(data.payload),
              );
            } catch (e) {
              console.error("Ошибка добавления прямого ICE кандидата:", e);
            }
          } else {
            // Иначе — сохраняем в очередь до востребования
            console.log(
              "⏳ Кандидат получен раньше RemoteDescription, сохраняем в очередь",
            );
            iceCandidatesQueue.current.push(data.payload);
          }
        }
      } catch (e) {
        console.error("ПОЛНАЯ ОШИБКА", e);
        logger.error(e, "Error parsing socket message");
      }
    });

    return () => {
      unsubscribe();
      localStream?.getTracks().forEach((t) => t.stop());
      pc.current?.close();
    };
  }, [targetId, user?.id, subscribe]);

  const acceptCall = async () => {
    if (!incomingCall) return;

    const { from, offer } = incomingCall;
    const peer = setupPeer(from);

    try {
      // 1. Запрашиваем доступ к камере/микрофону
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      // 2. Устанавливаем удаленное описание
      await peer.setRemoteDescription(new RTCSessionDescription(offer));

      // 3. Прорабатываем очередь ICE-кандидатов (из предыдущего шага)
      await processIceQueue();

      // 4. Создаем и отправляем ответ
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "answer",
            to: from,
            payload: answer,
          }),
        );
      }

      // Очищаем состояние входящего звонка
      setIncomingCall(null);
    } catch (e) {
      console.error("Ошибка при принятии вызова:", e);
    }
  };

  const hangUp = () => {
    // Отправляем сигнал другому
    socket?.send(JSON.stringify({ type: "hangup", to: targetId }));
    // Чистим у себя
    stopAllTracks();
  };

  const rejectCall = () => {
    if (incomingCall && socket?.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "hangup",
          to: incomingCall.from,
        }),
      );
    }
    setIncomingCall(null);
    iceCandidatesQueue.current = [];
  };

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

  const stopAllTracks = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
        console.log(`Track ${track.kind} stopped`);
      });
    }

    if (pc.current) {
      pc.current.onicecandidate = null;
      pc.current.ontrack = null;
      pc.current.close();
      pc.current = null;
    }

    iceCandidatesQueue.current = [];

    setLocalStream(null);
    setRemoteStream(null);
    setIncomingCall(null);
  }, [localStream]);

  return {
    startCall,
    localStream,
    remoteStream,
    hangUp,
    acceptCall,
    rejectCall,
    incomingCall,
  };
};
