import { DEMO_CUSTOMERS } from '@coach/shared';
import { useUser } from '../../lib/user-context.ts';

/** Header with the demo customer picker. No login. */
export function UserSwitcher() {
  const { userId, setUserId } = useUser();
  return (
    <header className="flex items-center justify-between gap-4">
      <h1 className="text-title font-semibold">Coach</h1>
      <select
        aria-label="Demo customer"
        className="h-11 max-w-[70%] min-w-0 truncate rounded-md text-small text-muted"
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
