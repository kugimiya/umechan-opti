import { useEffect, useState } from 'react';
import { isServer } from 'src/utils/isServer';

export const useSubscriptions = () => {
  const [subsIds, setSubsIds] = useState<Record<string, string>>({});
  const subscribe = (id: string, cursor: string) => {
    const fromGlobalState = JSON.parse(localStorage.getItem('subs') || '{}') as Record<
      string,
      string
    >;
    fromGlobalState[id] = cursor;
    localStorage.setItem('subs', JSON.stringify(fromGlobalState));

    setSubsIds(fromGlobalState);
  };

  const deleteEntry = (id: string) => {
    const fromGlobalState = JSON.parse(localStorage.getItem('subs') || '{}') as Record<
      string,
      string
    >;
    delete fromGlobalState[id];
    localStorage.setItem('subs', JSON.stringify(fromGlobalState));

    setSubsIds(fromGlobalState);
  };

  useEffect(() => {
    if (isServer()) {
      return;
    }

    setSubsIds(JSON.parse(localStorage.getItem('subs') || '{}') as Record<string, string>);

    const int = setInterval(() => {
      const nextSubs = JSON.parse(localStorage.getItem('subs') || '{}') as Record<string, string>;

      setSubsIds((prevSubs) => {
        const update = Object.entries(nextSubs).some(([key, value]) => {
          return prevSubs[key] === undefined || prevSubs[key] !== value;
        });

        if (update) {
          return nextSubs;
        }

        return prevSubs;
      });
    }, 2000);

    return () => clearInterval(int);
  }, []);

  return { subsIds, subscribe, deleteEntry };
};
