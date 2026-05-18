export const SocketAction = {
  USER_ONLINE: "USER_ONLINE",
  USER_OFFLINE: "USER_OFFLINE",
  INITIAL_ONLINE_LIST: "INITIAL_ONLINE_LIST",
  NEW_CONVERSATION: "NEW_CONVERSATION",
  NEW_MESSAGE: "NEW_MESSAGE",
  PARTNER_READ: "PARTNER_READ_MESSAGES",
  MESSAGES_READ: "MESSAGES_READ",
  TYPING_START: "TYPING_START",
  TYPING_STOP: "TYPING_STOP",
  MARK_AS_READ: "MARK_AS_READ",
} as const;

interface OnlinePayload {
  type: typeof SocketAction.USER_ONLINE | typeof SocketAction.USER_OFFLINE;
  userId: string | number;
}

interface InitialOnlinePayload {
  type: typeof SocketAction.INITIAL_ONLINE_LIST;
  userIds: (string | number)[];
}

interface NewMessagePayload {
  type: typeof SocketAction.NEW_MESSAGE;
  dialogId: string;
  senderId: number;
  text: string;
  status?: string;
}

interface TypingPayload {
  type: typeof SocketAction.TYPING_START | typeof SocketAction.TYPING_STOP;
  senderId: number;
}

export type SocketIncomingData =
  | OnlinePayload
  | InitialOnlinePayload
  | NewMessagePayload
  | TypingPayload
  | { type: "PARTNER_READ_MESSAGES"; dialogId: string }
  | { type: "NEW_CONVERSATION"; conversation: any }
  | { type: "MESSAGES_READ"; dialogId: string };
