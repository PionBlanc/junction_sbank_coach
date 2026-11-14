import { createContext, useContext } from 'react';

/** One swiped saving idea: right is liked ("down to try"), left is not ("no thanks"). */
export type Swipe = { id: string; liked: boolean };

export type SwipeContextValue = {
  /** In the order they were swiped. */
  swipes: Swipe[];
  swipe: (id: string, liked: boolean) => void;
  /** Takes back the last swipe. */
  undo: () => void;
  reset: () => void;
};

export const SwipeContext = createContext<SwipeContextValue | null>(null);

/** The user's swipes, shared so the coach chat can send them along. */
export function useSwipes(): SwipeContextValue {
  const value = useContext(SwipeContext);
  if (!value) {
    throw new Error('useSwipes must be used inside SwipeProvider');
  }
  return value;
}
