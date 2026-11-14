import { useEffect } from 'react';

/** While `locked`, the page behind a sheet or dialog does not scroll. */
export function useLockPageScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const root = document.documentElement;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = '';
    };
  }, [locked]);
}
