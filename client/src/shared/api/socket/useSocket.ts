//import logger from "@/utils/logger";
import { useState, useEffect, useCallback } from "react";

let globalSocket: WebSocket | null = null;
let messageListeners: Array<(ev: MessageEvent) => void> = [];

export const useSocket = (userId: number | undefined) => {
  const [socket, setSocket] = useState<WebSocket | null>(globalSocket);

  useEffect(() => {
    // Если пользователь авторизован, но соединения ещё нет с WSS, то оно создаётся
    if (userId && !globalSocket) {
      const baseUrl = import.meta.env.VITE_WS_URL;
      const ws = new WebSocket(`${baseUrl}?userId=${userId}`);

      // Сразу после создания вешается обработчик, чтобы не пропустить сообщения от WSS
      ws.onmessage = (event) => {
        //logger.info("Raw WS Message received in global handler");
        messageListeners.forEach((fn) => fn(event));
      };

      // Соединяемся к созданному WSS и сохраняем его в состояние и в глобальный сокет
      ws.onopen = () => {
        globalSocket = ws;
        setSocket(ws);
      };

      // В случае разрыва соединения обнуляем глобальный сокет и состояние
      ws.onclose = () => {
        globalSocket = null;
        setSocket(null);
      };
    }
  }, [userId]);

  // Единая функция для подписки всех слушателей на сообщения, получаемые этим сокетом с WSS
  // Функция CallBack потому что чувствительная к отрисовке компонента - спам на сервер
  const subscribe = useCallback((callback: (ev: MessageEvent) => void) => {
    messageListeners.push(callback);
    return () => {
      messageListeners = messageListeners.filter((l) => l !== callback);
    };
  }, []);

  // Возвращаем сокет (чтобы отправлять сообщения) и объект для подписки на события с WSS
  return { socket, subscribe };
};
