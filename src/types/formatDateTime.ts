export const formatDateTime = (timestamp: number) => {
  const normalized = new Date(timestamp * 1000); // TODO: тут может быть нужен TZ конвертинг
  const date = (normalized).toLocaleDateString('ru-RU');
  const time = (normalized).toLocaleTimeString('ru-RU', { timeStyle: 'short' });
  return `${date} ${time}`;
};
