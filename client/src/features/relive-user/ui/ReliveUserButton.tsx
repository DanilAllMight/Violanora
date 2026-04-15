import { reliveUser } from "../api/reliveUser";
import { ArrowDownCircle } from "lucide-react";

interface ReliveUserButtonProps {
  userId: number;
  handleRelive: () => void;
}

export const ReliveUserButton = ({
  userId,
  handleRelive,
}: ReliveUserButtonProps) => {
  const handleClick = () => {
    reliveUser({ userId });
    handleRelive();
  };

  return (
    <div>
      <button aria-label="Вернуть пользователя" onClick={handleClick}>
        <ArrowDownCircle size={20}></ArrowDownCircle>
      </button>
    </div>
  );
};
