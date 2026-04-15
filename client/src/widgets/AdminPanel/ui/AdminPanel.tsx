import { AdminUserCard } from "./AdminUserCard";
import { useUsersListStore } from "@/entities/User/model/store";
import { Button, PageLoader } from "@/shared/ui";
import { RefreshCw } from "lucide-react";
import { useEffect } from "react";

export const AdminPanel = () => {
  const { users, error, isLoading, getUsersForAdmin } = useUsersListStore();

  const handleDelete = () => {
    getUsersForAdmin();
  };

  const handleRelive = () => {
    getUsersForAdmin();
  };

  useEffect(() => {
    getUsersForAdmin();
  }, [getUsersForAdmin]);

  if (isLoading) return <PageLoader></PageLoader>;

  if (error) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-app-text p-10 text-center font-bold">{error}</div>
        <Button onClick={getUsersForAdmin}>
          <RefreshCw size={20}></RefreshCw>
          Повторить попытку
        </Button>
      </div>
    );
  }

  if (users.length == 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 opacity-60">
        <p className="text-app-text text-lg font-medium">
          Пользователи не найдены
        </p>
        <span className="text-sm">Попробуйте обновить страницу позже</span>
      </div>
    );
  }

  return (
    <section className="flex w-100 flex-col justify-start gap-2 p-4">
      <h2 className="text-app-text w-full pb-3 text-center text-xl font-bold">
        Панель Администратора. Пользователи
      </h2>
      <ul className="flex flex-col gap-2">
        {users.map((user) => (
          <AdminUserCard
            key={user.id}
            user={user}
            handleDelete={handleDelete}
            handleRelive={handleRelive}
          />
        ))}
      </ul>
    </section>
  );
};
