export interface Message {
  _id: string;
  senderId: string;
  text: string;
  status: "sending" | "sent" | "read";
  createdAt: string;
}

export interface MessagesList {
  messages: Message[];
}
