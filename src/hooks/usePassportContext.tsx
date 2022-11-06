import { createContext, useContext, useEffect, useState } from 'react';

import { isServer } from '../utils/isServer';

export type Passport = {
  name: string;
  key: string;
};

type ReturnType = {
  isAuthorized: boolean;
  passport?: Passport;
};

export const readFromLocalStorage = () => {
  if (isServer()) {
    return { isAuthorized: false };
  }

  let isAuthorized = false;
  let passport: Passport;
  const passportStr = localStorage.getItem('passport');

  if (passportStr && !isServer()) {
    isAuthorized = true;
    passport = JSON.parse(passportStr) as unknown as {
      name: string;
      key: string;
    };

    return { isAuthorized, passport };
  }

  return { isAuthorized };
};
export const writeToLocalStorage = (passport: Passport) => {
  localStorage.setItem('passport', JSON.stringify(passport));
};
export const clearFromLocalStorage = () => {
  localStorage.removeItem('passport');
};
export const PassportContext = createContext<ReturnType | null>(null);
export const usePassportContext = (): ReturnType => {
  const ctx = useContext(PassportContext);

  if (ctx) {
    return ctx;
  }

  return { isAuthorized: false };
};
export const usePassportLocalStorageAdapter = () => {
  const [passport, setPassport] = useState<ReturnType>({ isAuthorized: false });

  useEffect(() => {
    if (isServer()) {
      return;
    }

    const intervalPointer = setInterval(() => {
      const nextPass = readFromLocalStorage();
      setPassport((prevPass) => {
        if (
          prevPass.isAuthorized !== nextPass.isAuthorized ||
          prevPass.passport?.key !== nextPass.passport?.key ||
          prevPass.passport?.name !== nextPass.passport?.name
        ) {
          return nextPass;
        }

        return prevPass;
      });
    }, 1000);

    return () => clearInterval(intervalPointer);
  }, []);

  return { passport };
};
