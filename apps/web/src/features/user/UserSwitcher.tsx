import { DEMO_CUSTOMERS } from '@coach/shared';
import { useUser } from '../../lib/user-context.ts';

/** Header with the demo customer picker. No login. */
export function UserSwitcher() {
  const { userId, setUserId } = useUser();
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold">Coach</h1>
      <select
        aria-label="Demo customer"
        className="h-11 rounded-lg bg-card px-3 text-sm shadow-sm"
        value={userId}
        onChange={(event) => {
          const customer = DEMO_CUSTOMERS.find((c) => c.customerId === event.target.value);
          if (customer) setUserId(customer.customerId);
        }}
      >
        {DEMO_CUSTOMERS.map((customer) => (
          <option key={customer.customerId} value={customer.customerId}>
            {customer.persona}
          </option>
        ))}
      </select>
    </header>
  );
}
