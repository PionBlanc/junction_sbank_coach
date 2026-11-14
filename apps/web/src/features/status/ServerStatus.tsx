import { useHealth } from '../../api/useHealth.ts';

/** Scaffold check that the web app reaches the API and the database. Replace once real sections exist. */
export function ServerStatus() {
  const health = useHealth();

  if (health.isPending) {
    return <p className="text-muted">Connecting to the server…</p>;
  }
  if (health.isError) {
    return <p className="text-negative">Server unreachable: {health.error.message}</p>;
  }
  return (
    <p className="rounded-lg bg-card p-4 shadow-sm">
      Server <span className="font-semibold text-positive">{health.data.status}</span>,{' '}
      {health.data.customers} customers in the database.
    </p>
  );
}
