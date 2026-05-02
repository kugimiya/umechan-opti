export const formatDateTime = (timestamp: number) => {
  const normalized = new Date(timestamp * 1000); // TODO: тут может быть нужен TZ конвертинг
  const date = (normalized).toLocaleDateString('ru-RU');
  const time = (normalized).toLocaleTimeString('ru-RU', { timeStyle: 'short' });
  return `${date} ${time}`;
};

function isToday(date: Date) {  
  const today = new Date();

  return date.getFullYear() === today.getFullYear() &&
         date.getMonth() === today.getMonth() &&
         date.getDate() === today.getDate();
}

export const formatChatDateTime = (timestamp: number) => {
  const normalized = new Date(timestamp * 1000); // TODO: тут может быть нужен TZ конвертинг
  const date = (normalized).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
  const time = (normalized).toLocaleTimeString('ru-RU', { timeStyle: 'short' });
  return isToday(normalized) ? `${time}` : `${time} ${date}`;
};
