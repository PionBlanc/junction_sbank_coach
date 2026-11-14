import { ServerStatus } from './features/status/ServerStatus.tsx';

/** Registration only: one line per page section. */
export function App() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <main className="mx-auto flex max-w-[390px] flex-col gap-4 p-4">
        <h1 className="text-2xl font-semibold">Transactions to actions</h1>
        <ServerStatus />
      </main>
    </div>
  );
}
