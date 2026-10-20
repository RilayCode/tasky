import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { toDateKey, type DateKey } from '@/lib/date';

function msUntilNextMidnight(): number {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return midnight.getTime() - now.getTime() + 1000;
}

// Date du jour qui se met à jour à minuit et au retour au premier plan.
export function useToday(): DateKey {
  const [today, setToday] = useState(() => toDateKey(new Date()));

  useEffect(() => {
    const refresh = () => setToday(toDateKey(new Date()));
    let timer = setTimeout(function tick() {
      refresh();
      timer = setTimeout(tick, msUntilNextMidnight());
    }, msUntilNextMidnight());
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, []);

  return today;
}
