// features/video-call/lib/useVideoCall.ts
import { useRef, useState } from "react";

export const useVideoCall = (socket: WebSocket | null) => {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Инициализация RTCPeerConnection
  const initPeerConnection = (targetUserId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:://google.com" }],
    });

    // Когда браузер находит ICE-кандидата (свой адрес), отправляем его через сокет
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.send(
          JSON.stringify({
            type: "ice-candidate",
            to: targetUserId,
            payload: event.candidate,
          }),
        );
      }
    };

    // Когда получаем поток от собеседника
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    peerConnection.current = pc;
    return pc;
  };

  // Функция начала звонка (создание Offer)
  const startCall = async (targetUserId: string) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setLocalStream(stream);

    const pc = initPeerConnection(targetUserId);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket?.send(
      JSON.stringify({
        type: "offer",
        to: targetUserId,
        payload: offer,
      }),
    );
  };

  // Обработка входящих сообщений WebRTC
  const handleSignal = async (message: any) => {
    const { type, payload, from } = message;

    if (type === "offer") {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);

      const pc = initPeerConnection(from);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(payload));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket?.send(
        JSON.stringify({ type: "answer", to: from, payload: answer }),
      );
    } else if (type === "answer") {
      await peerConnection.current?.setRemoteDescription(
        new RTCSessionDescription(payload),
      );
    } else if (type === "ice-candidate") {
      await peerConnection.current?.addIceCandidate(
        new RTCIceCandidate(payload),
      );
    }
  };

  return { startCall, handleSignal, localStream, remoteStream, localVideoRef };
};
