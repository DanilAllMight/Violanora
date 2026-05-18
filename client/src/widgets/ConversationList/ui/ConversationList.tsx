import { useConversationListStore } from "@/entities/Conversation/model/store";
import { ConversationCard } from "@/entities/Conversation/ui";
import { useUserStore } from "@/entities/User/model/store/useUserStore";
import { Button } from "@/shared/ui/Button/button";
import { Input } from "@/shared/ui/Input/input";
import { Loader2, RefreshCw } from "lucide-react";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

export const ConversationList = () => {
  const userId = useUserStore((state) => state.authData?.id);
  const { error, isLoading, getConversations } = useConversationListStore();
  const [isSearch, setIsSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const conversations = useConversationListStore(
    (state) => state.conversations,
  );

  useEffect(() => {
    if (userId) {
      getConversations(userId);
    }
  }, [getConversations, userId]);

  if (isLoading)
    return (
      <div className="flex h-full flex-grow items-center justify-center">
        <Loader2 className="text-app-text h-8 w-8 animate-spin"></Loader2>
      </div>
    );

  if (error) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-app-text p-10 text-center font-bold">{error}</div>
        <Button
          onClick={() => {
            if (userId) {
              getConversations(userId);
            }
          }}
        >
          <RefreshCw size={20}></RefreshCw>
          Повторить попытку
        </Button>
      </div>
    );
  }

  if (conversations.length == 0) {
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
      <div className="flex items-center justify-center gap-3 pb-3">
        <h2 className="text-app-text text-center text-xl font-bold">
          Сообщения
        </h2>
        <div
          className="bg-app-nav cursor-pointer rounded p-2"
          onClick={() => setIsSearch(!isSearch)}
        >
          {isSearch ? (
            <X size={20}></X>
          ) : (
            <Search className="" size={20}></Search>
          )}
        </div>
      </div>
      <div>
        {isSearch ? (
          <div className="bg-app-card rounded p-1">
            <Input
              placeholder="Введите запрос"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            ></Input>
          </div>
        ) : (
          <div></div>
        )}
      </div>

      <ul className="flex flex-col gap-2">
        {conversations.map((conversation) => (
          <ConversationCard key={conversation.id} conversation={conversation} />
        ))}
      </ul>
    </section>
  );
};
