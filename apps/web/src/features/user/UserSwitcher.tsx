import { DEMO_CUSTOMERS } from '@coach/shared';
import { useSwipes } from '../../lib/swipe-context.ts';
import { useUser } from '../../lib/user-context.ts';

/**
 * Yellow demo banner with the customer picker. No login: the picker exists only in the demo.
 * Shown on the start screen only: it disappears with the first swipe.
 */
export function UserSwitcher() {
  const { userId, setUserId } = useUser();
  const { swipes } = useSwipes();
  if (swipes.length > 0) return null;

  return (
    <header className="flex items-center justify-between gap-2 rounded-md bg-demo py-1 pr-1 pl-3 text-ink">
      <h1 className="flex shrink-0 items-center gap-2 text-small font-semibold">
        <span className="rounded-sm bg-ink px-1.5 text-caption font-bold tracking-wide text-demo uppercase">
          Demo
        </span>
        Select user
      </h1>
      <select
        aria-label="Demo customer"
        className="h-11 max-w-[65%] min-w-0 truncate rounded-md bg-transparent text-small text-ink"
        value={userId}
        onChange={(event) => {
          const customer = DEMO_CUSTOMERS.find((c) => c.customerId === event.target.value);
          if (customer) setUserId(customer.customerId);
        }}
      >
        {DEMO_CUSTOMERS.map((customer) => (
          <option key={customer.customerId} value={customer.customerId}>
            {customer.persona} ({customer.customerId})
          </option>
        ))}
      </select>
    </header>
  );
}
