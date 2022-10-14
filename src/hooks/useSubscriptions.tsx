import { useEffect, useState } from 'react';
import { isServer } from 'src/utils/isServer';

export const useSubscriptions = () => {
  const [subsIds, setSubsIds] = useState<Record<string, string>>({});
  const subscribe = (id: string, cursor: string) => {
    const fromGlobalState = JSON.parse(localStorage.getItem('subs') || '{}');
    fromGlobalState[id] = cursor;
    localStorage.setItem('subs', JSON.stringify(fromGlobalState));

    setSubsIds(fromGlobalState);
  };

  const deleteEntry = (id: string) => {
    const fromGlobalState = JSON.parse(localStorage.getItem('subs') || '{}');
    delete fromGlobalState[id];
    localStorage.setItem('subs', JSON.stringify(fromGlobalState));

    setSubsIds(fromGlobalState);
  };

  useEffect(() => {
    if (!isServer()) {
      setSubsIds(JSON.parse(localStorage.getItem('subs') || '{}'));

      const int = setInterval(() => {
        setSubsIds(JSON.parse(localStorage.getItem('subs') || '{}'));
      }, 2000);

      return () => clearInterval(int);
    }
  }, []);

  return { subsIds, subscribe, deleteEntry };
};
