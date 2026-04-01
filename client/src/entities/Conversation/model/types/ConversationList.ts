export interface LastMessage {
  text: string;
  senderId: number;
  createdAt: string; // ISO дата для сортировки
}

export interface ChatPartner {
  id: number;
  username: string;
  avatar_url: string | null;
}

// не используется
export interface Conversation {
  _id: string; // ID диалога из MongoDB
  matchKey: string; // Твой ключ "1_2"
  participants: ChatPartner[]; // Массив из двух объектов пользователей
  lastMessage: LastMessage;
  unreadCount: Record<string, number>; // { "1": 5, "2": 0 }
  updatedAt: string;
}

export type ConversationListResponse = Conversation[];
