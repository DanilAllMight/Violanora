import { useState, useEffect, useCallback } from "react";

let globalSocket: WebSocket | null = null;
let messageListeners: Array<(ev: MessageEvent) => void> = [];

export const useSocket = (userId: number | undefined) => {
  const [socket, setSocket] = useState<WebSocket | null>(globalSocket);

  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout;
    let heartbeatTimer: NodeJS.Timeout;

    const connect = () => {
      if (
        !userId ||
        (globalSocket && globalSocket.readyState === WebSocket.OPEN)
      )
        return;

      const baseUrl = import.meta.env.VITE_WS_URL;
      const ws = new WebSocket(`${baseUrl}?userId=${userId}`);

      ws.onopen = () => {
        globalSocket = ws;
        setSocket(ws);

        heartbeatTimer = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "pong") return;
        } catch (e) {}

        messageListeners.forEach((fn) => fn(event));
      };

      ws.onclose = (event) => {
        clearInterval(heartbeatTimer);
        globalSocket = null;
        setSocket(null);

        if (event.code !== 1000) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };

      ws.onerror = (error) => {
        ws.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      clearInterval(heartbeatTimer);
    };
  }, [userId]);

  const subscribe = useCallback((callback: (ev: MessageEvent) => void) => {
    messageListeners.push(callback);
    return () => {
      messageListeners = messageListeners.filter((l) => l !== callback);
    };
  }, []);

  return { socket, subscribe };
};
