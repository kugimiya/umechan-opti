"use client";

import { FC } from "react";
import { Box } from "@/components/layout/Box/Box";
import { useChatApp } from "../../context/useChatApp";

export const ChatLogin: FC = () => {
  const { passphrase, setPassphrase, identify } = useChatApp();

  return (
    <Box flexDirection="column" gap="12px">
      <h3>Вход в чат</h3>
      <p>Введите кодовую фразу, чтобы сервер запомнил ваши чаты, непрочитанные и папки.</p>
      <input
        value={passphrase}
        onChange={(e) => setPassphrase(e.target.value)}
        placeholder="Кодовая фраза"
      />
      <button onClick={identify} disabled={passphrase.trim().length < 3}>
        Войти
      </button>
    </Box>
  );
};
