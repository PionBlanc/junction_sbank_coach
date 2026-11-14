import { DEMO_CUSTOMERS, type DemoCustomerId } from '@coach/shared';
import { Fragment, useState, type ReactNode } from 'react';
import { UserContext } from '../../lib/user-context.ts';

type UserProviderProps = { children: ReactNode };

/** Holds the selected demo customer. Switching customer remounts the page, so local state resets. */
export function UserProvider(props: UserProviderProps) {
  const [userId, setUserId] = useState<DemoCustomerId>(DEMO_CUSTOMERS[0].customerId);
  return (
    <UserContext value={{ userId, setUserId }}>
      <Fragment key={userId}>{props.children}</Fragment>
    </UserContext>
  );
}
