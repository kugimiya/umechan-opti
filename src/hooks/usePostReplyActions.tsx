import { useState } from 'react';

export const usePostReplyActions = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const handleReply = (id: number | string) => {
    setIsFormVisible(true);

    setTimeout(() => {
      const event = new Event('reply_at_post');
      // @ts-ignore потому что лень ебаться с тем чтобы положить в глобальный интерфейс Event поле postId
      event.postId = id;

      window.dispatchEvent(event);
    }, 250);
  };

  return { isFormVisible, setIsFormVisible, handleReply };
};
