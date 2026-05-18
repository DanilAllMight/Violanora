export interface LastMessage {
  text: string;
  senderId: number;
  createdAt: string; // ISO дата для сортировки
  status: string;
}

export interface ChatPartner {
  id: number;
  username: string;
  avatar_url: string | null;
}

// не используется
export interface Conversation {
  id: string;
  matchKey: string;
  participants: ChatPartner[];
  lastMessage: LastMessage;
  unreadCount: Record<string, number>;
  updatedAt: string;
}

export type ConversationListResponse = Conversation[];
