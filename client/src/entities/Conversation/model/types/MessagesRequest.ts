export interface MessagesRequest {
  senderId: number | undefined;
  receiverId: String | undefined;
  before?: string;
  limit?: number;
}
