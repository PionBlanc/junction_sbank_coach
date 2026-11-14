import type { DemoCustomerId } from '@coach/shared';
import { createContext, useContext } from 'react';

export type UserContextValue = {
  userId: DemoCustomerId;
  setUserId: (userId: DemoCustomerId) => void;
};

export const UserContext = createContext<UserContextValue | null>(null);

/** The demo customer currently shown. */
export function useUser(): UserContextValue {
  const value = useContext(UserContext);
  if (!value) {
    throw new Error('useUser must be used inside UserProvider');
  }
  return value;
}
