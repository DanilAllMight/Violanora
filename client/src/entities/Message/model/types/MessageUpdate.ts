import type { IAttachment } from "./Message";

export interface MessageUpdateProps {
  editingText: string | null;
  attachmentsUrls: { url: string; type: string }[];
  editingAttachments: IAttachment[];
  messageId: string;
  createdAt: string | null;
  targetId: string;
}

export interface MessageUpdateRequest {
  data: MessageUpdateProps;
}
