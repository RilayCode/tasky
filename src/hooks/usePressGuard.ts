import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';

// Délai de secours si l'appui n'a finalement pas changé d'écran.
const FALLBACK_UNLOCK_MS = 1000;

// Une seule navigation par passage sur l'écran : un double appui rapide n'empile
// pas deux fois le même écran. Le verrou se lève quand l'écran reprend le focus.
export function usePressGuard() {
  const locked = useRef(false);

  useFocusEffect(
    useCallback(() => {
      locked.current = false;
    }, []),
  );

  return (action: () => void) => () => {
    if (locked.current) return;
    locked.current = true;
    setTimeout(() => {
      locked.current = false;
    }, FALLBACK_UNLOCK_MS);
    action();
  };
}
