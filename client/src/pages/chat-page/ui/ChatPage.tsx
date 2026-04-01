import { ChatWidget } from "@/widgets/Chat";
import { useParams } from "react-router-dom";

export const ChatPage = () => {
  const { userId: targetId } = useParams<{
    userId: string;
  }>();

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden text-center">
      <ChatWidget userId={targetId} />
    </div>
  );
};
