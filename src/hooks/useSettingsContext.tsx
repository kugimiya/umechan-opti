import { createContext, useContext, useEffect, useState } from 'react';

import { isServer } from '../utils/isServer';

type ReturnType = {
  show_banners: boolean;
  show_links: boolean;
  show_login: boolean;
  show_radio: boolean;
};

export const SettingsContext = createContext<ReturnType | null>({
  show_banners: true,
  show_links: true,
  show_login: true,
  show_radio: true,
});

const setInLocalStorage = (key: string, value: boolean) => {
  const settings = readSettingsFromLocalStorage();
  settings[key as keyof ReturnType] = value;

  if (isServer()) {
    return;
  }

  localStorage.setItem('settings', JSON.stringify(settings));
};

export const useSettingsContext = (): {
  settings: ReturnType;
  change: (key: string, value: boolean) => void;
} => {
  const ctx = useContext(SettingsContext);

  if (ctx) {
    return { settings: ctx, change: (key, value) => setInLocalStorage(key, value) };
  }

  return {
    settings: {
      show_banners: true,
      show_links: true,
      show_login: true,
      show_radio: true,
    },
    change: (key, value) => setInLocalStorage(key, value),
  };
};

export const readSettingsFromLocalStorage = (): ReturnType => {
  if (isServer()) {
    return {
      show_banners: true,
      show_links: true,
      show_login: true,
      show_radio: true,
    };
  }

  const settingsStr = localStorage.getItem('settings');
  let settings: ReturnType = {
    show_banners: true,
    show_links: true,
    show_login: true,
    show_radio: true,
  };

  if (settingsStr && !isServer()) {
    settings = JSON.parse(settingsStr) as unknown as ReturnType;

    return settings;
  }

  return settings;
};

export const useSettingsLocalStorageAdapter = () => {
  const [settings, setSettings] = useState<ReturnType>({
    show_banners: true,
    show_links: true,
    show_login: true,
    show_radio: true,
  });

  useEffect(() => {
    if (isServer()) {
      return;
    }

    const intervalPointer = setInterval(() => {
      const nextSettings = readSettingsFromLocalStorage();
      const asVal = Object.values(nextSettings);

      setSettings((oldSettings) => {
        if (Object.values(oldSettings).every((v, i) => v === asVal[i])) {
          return oldSettings;
        }

        return nextSettings;
      });
    }, 1000);

    return () => clearInterval(intervalPointer);
  }, []);

  return settings;
};
