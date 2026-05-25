export interface IAttachment {
  url: string;
  type: "image";
}

export interface Message {
  _id: string;
  senderId: string;
  text: string;
  status: "sending" | "sent" | "read";
  createdAt: string;
  attachments: IAttachment[];
}

export interface MessagesListProps {
  messages: Message[];
}
