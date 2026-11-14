import { useState, type ReactNode } from 'react';
import { SwipeContext, type Swipe } from '../../lib/swipe-context.ts';

type SwipeProviderProps = { children: ReactNode };

/** Holds which saving ideas the user swiped right and left on. */
export function SwipeProvider(props: SwipeProviderProps) {
  const [swipes, setSwipes] = useState<Swipe[]>([]);

  function swipe(id: string, liked: boolean) {
    setSwipes((all) => [...all.filter((s) => s.id !== id), { id, liked }]);
  }
  function undo() {
    setSwipes((all) => all.slice(0, -1));
  }
  function reset() {
    setSwipes([]);
  }

  return <SwipeContext value={{ swipes, swipe, undo, reset }}>{props.children}</SwipeContext>;
}
