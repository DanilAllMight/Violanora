import { useVideoCall } from "../lib/useVideoCall";
import { useEffect } from "react";

export const VideoChat = ({
  socket,
  targetUserId,
}: {
  socket: WebSocket;
  targetUserId: string;
}) => {
  const { startCall, handleSignal } = useVideoCall(socket);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (["offer", "answer", "ice-candidate"].includes(data.type)) {
        handleSignal(data);
      }
    };
    socket.addEventListener("message", onMessage);
    return () => socket.removeEventListener("message", onMessage);
  }, [socket, handleSignal]);

  return (
    <div>
      <button onClick={() => startCall(targetUserId)}>Позвонить</button>
    </div>
  );
};
