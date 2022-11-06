import { createContext, useContext, useEffect, useState } from 'react';

import { isServer } from '../utils/isServer';

export type PostPassword = {
  post_id: number;
  password: string;
};

type ReturnType = {
  passwords: PostPassword[];
};

export const readPostPasswordFromLocalStorage = () => {
  if (isServer()) {
    return { passwords: [] };
  }

  let passwords: PostPassword[] = [];
  const passportStr = localStorage.getItem('posts_passwords');

  if (passportStr && !isServer()) {
    passwords = JSON.parse(passportStr) as unknown as PostPassword[];

    return { passwords };
  }

  return { passwords };
};
export const writePostPasswordToLocalStorage = (password: PostPassword) => {
  const { passwords } = readPostPasswordFromLocalStorage();
  localStorage.setItem('posts_passwords', JSON.stringify([...passwords, password]));
};
export const PostsPasswordsContext = createContext<ReturnType | null>(null);
export const usePostsPasswordsContext = (): ReturnType => {
  const ctx = useContext(PostsPasswordsContext);

  if (ctx) {
    return ctx;
  }

  return { passwords: [] };
};
export const usePostsPasswordsLocalStorageAdapter = () => {
  const [passwords, setPasswords] = useState<ReturnType>({ passwords: [] });

  useEffect(() => {
    if (isServer()) {
      return;
    }

    const intervalPointer = setInterval(() => {
      const nextPasswords = readPostPasswordFromLocalStorage();
      setPasswords((oldPasswords) => {
        if (oldPasswords.passwords.length !== nextPasswords.passwords.length) {
          return nextPasswords;
        }

        return oldPasswords;
      });
    }, 1000);

    return () => clearInterval(intervalPointer);
  }, []);

  return passwords;
};
