import { useUsersListStore } from "@/entities/User/model/store/useUserListStore";
import { UserCard } from "@/entities/User/ui";
import { PageLoader } from "@/shared/ui";
import { Button } from "@/shared/ui/button/button";
import { RefreshCw } from "lucide-react";
import { useEffect } from "react";

export const UserList = () => {
  const { users, error, isLoading, getUsers } = useUsersListStore();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  if (isLoading) return <PageLoader></PageLoader>;

  if (error) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-app-text p-10 text-center font-bold">{error}</div>
        <Button onClick={getUsers}>
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
        Пользователи
      </h2>
      <ul className="flex flex-col gap-2">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </ul>
    </section>
  );
};
