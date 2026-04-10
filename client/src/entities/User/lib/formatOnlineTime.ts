export const formatOnlineTime = (dateInput: string | Date): string => {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "только что";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    if (diffInMinutes === 1) return "1 минуту назад";
    if (diffInMinutes > 1 && diffInMinutes < 5)
      return `${diffInMinutes} минуты назад`;
    return `${diffInMinutes} минут назад`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    if (diffInHours === 1) return "час назад";
    if (diffInHours > 1 && diffInHours < 5) return `${diffInHours} часа назад`;
    return `${diffInHours} часов назад`;
  }

  // Проверка на "вчера"
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isYesterday) {
    return `вчера в ${time}`;
  }

  // Если больше 2 дней назад — число и месяц
  const dayMonth = date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
  return `${dayMonth} в ${time}`;
};
