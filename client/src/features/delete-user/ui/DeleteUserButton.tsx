import { deleteUser } from "../api/deleteUser";
import { X } from "lucide-react";

interface DeleteUserButtonProps {
  userId: number;
  handleDelete: () => void;
}

export const DeleteUserButton = ({
  userId,
  handleDelete,
}: DeleteUserButtonProps) => {
  const handleClick = () => {
    deleteUser({ userId });
    handleDelete();
  };

  return (
    <div>
      <button aria-label="Удалить пользователя" onClick={handleClick}>
        <X size={20}></X>
      </button>
    </div>
  );
};
