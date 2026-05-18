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
  text?: string;
  senderId?: string | number;
  status: string;
  createdAt?: string;
}

export interface Conversation {
  id: string;
  matchKey: string;
  participants: Participant[];
  lastMessage: LastMessage;
  unreadCount: Record<string, number>;
  updatedAt: string;
}

export interface ConversationResponse {
  id: string;
  matchKey: string;
  participants: Participant[];
  lastMessage?: LastMessage;
  unreadCount?: Record<string, number>;
  updatedAt: string;
  createdAt: string;
}
