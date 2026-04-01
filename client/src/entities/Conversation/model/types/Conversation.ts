export interface ConversationRequest {
  userId: number;
  partnerId?: number;
}

export interface Participant {
  id: string | number;
  username: string;
  avatar_url: string | null;
}

export interface LastMessage {
  text: string;
  senderId: string | number;
  createdAt?: string;
}

export interface Conversation {
  _id: string; // ID диалога из MongoDB
  matchKey: string; // Твой ключ "1_2"
  participants: Participant[]; // Массив из двух объектов пользователей
  lastMessage: LastMessage;
  unreadCount: Record<string, number>; // { "1": 5, "2": 0 }
  updatedAt: string;
}

export interface ConversationResponse {
  _id: string;
  matchKey: string;
  participants: Participant[];
  lastMessage?: LastMessage;
  unreadCount?: Record<string, number>;
  updatedAt: string;
  createdAt: string;
}

//createdAt: string;
