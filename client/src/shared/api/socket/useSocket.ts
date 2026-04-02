//import logger from "@/utils/logger";
import { useState, useEffect, useCallback } from "react";

let globalSocket: WebSocket | null = null;
let messageListeners: Array<(ev: MessageEvent) => void> = [];

export const useSocket = (userId: number | undefined) => {
  const [socket, setSocket] = useState<WebSocket | null>(globalSocket);

  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout;
    let heartbeatTimer: NodeJS.Timeout;

    const connect = () => {
      // Если нет ID или сокет уже открыт — ничего не делаем
      if (
        !userId ||
        (globalSocket && globalSocket.readyState === WebSocket.OPEN)
      )
        return;

      const baseUrl = import.meta.env.VITE_WS_URL;
      const ws = new WebSocket(`${baseUrl}?userId=${userId}`);

      ws.onopen = () => {
        console.log("WSS: Соединение установлено");
        globalSocket = ws;
        setSocket(ws);

        // 1. Пинг-понг для Nginx (Heartbeat)
        heartbeatTimer = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        // Пропускаем системные сообщения (если сервер шлет 'pong')
        try {
          const data = JSON.parse(event.data);
          if (data.type === "pong") return;
        } catch (e) {}

        messageListeners.forEach((fn) => fn(event));
      };

      ws.onclose = (event) => {
        console.log(
          `WSS: Соединение закрыто (код: ${event.code}). Реконнект через 3 сек...`,
        );

        // Очистка перед новой попыткой
        clearInterval(heartbeatTimer);
        globalSocket = null;
        setSocket(null);

        // 2. АВТО-РЕКОННЕКТ
        // Не пытаемся соединиться, если закрыли намеренно (код 1000)
        if (event.code !== 1000) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error("WSS: Ошибка сокета", error);
        ws.close(); // Провоцируем onclose для запуска реконнекта
      };
    };

    connect();

    // 3. Cleanup: Очистка таймеров при размонтировании или смене userId
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
