import { useState } from 'react';
import { useActions } from '../../api/useActions.ts';
import { Card } from '../../components/Card.tsx';
import { LoadError } from '../../components/LoadError.tsx';
import { formatEur } from '../../lib/format.ts';
import { useUser } from '../../lib/user-context.ts';
import { WhatIfCard } from '../what-if/WhatIfCard.tsx';

const TITLE = 'Ways to free up money';

/** Options with a gain, not faults. Tick several and the total updates. */
export function ActionList() {
  const { userId } = useUser();
  const actions = useActions(userId);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showWhatIf, setShowWhatIf] = useState(false);

  if (actions.isPending) {
    return (
      <Card title={TITLE}>
        <div className="h-40 animate-pulse rounded-sm bg-fill" aria-busy aria-label="Loading" />
      </Card>
    );
  }
  if (actions.isError) {
    return (
      <Card title={TITLE}>
        <LoadError message={actions.error.message} onRetry={() => void actions.refetch()} />
      </Card>
    );
  }
  if (actions.data.length === 0) {
    return (
      <Card title={TITLE}>
        <p className="text-small">
          Your everyday spending is in line with people your age. Nothing stands out to change.
        </p>
      </Card>
    );
  }

  // The one sum the frontend is allowed to do: the selected action points.
  const selected = actions.data.filter((a) => selectedIds.includes(a.id));
  const monthlyEur = selected.reduce((sum, a) => sum + a.savingPerMonthEur, 0);
  const weeklyEur = selected.reduce((sum, a) => sum + a.savingPerWeekEur, 0);

  function toggle(id: string) {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));
  }

  return (
    <Card title={TITLE}>
      <div className="flex flex-col divide-y divide-line">
        {actions.data.map((action) => (
          <label key={action.id} className="flex min-h-11 cursor-pointer gap-4 py-4 first:pt-0">
            <input
              type="checkbox"
              className="size-5 shrink-0 accent-brand"
              checked={selectedIds.includes(action.id)}
              onChange={() => toggle(action.id)}
            />
            <span className="flex flex-1 flex-col gap-1">
              <span className="flex justify-between gap-4 text-small">
                <span>{action.title}</span>
                <span className="font-semibold whitespace-nowrap text-positive">
                  ~{formatEur(action.savingPerMonthEur)}/month
                </span>
              </span>
              <span className="text-caption text-muted">{action.explanation}</span>
            </span>
          </label>
        ))}
      </div>
      {/* Stays at the bottom of the card while the list scrolls. It sits on the card border. */}
      <div className="sticky bottom-0 -mx-[calc(1rem+1px)] -mb-[calc(1rem+1px)] flex flex-col gap-4 rounded-b-md border border-line bg-card p-4">
        <p className="text-small">
          Selected: <span className="font-semibold">{formatEur(monthlyEur)}/month</span>
          {selected.length > 0 && (
            <>. That is +{formatEur(weeklyEur)} a week on your safe to spend.</>
          )}
        </p>
        {selected.length > 0 && (
          <button
            type="button"
            className="h-11 rounded-md bg-brand text-small font-semibold text-card"
            onClick={() => setShowWhatIf(!showWhatIf)}
          >
            {showWhatIf ? 'Hide' : 'See what this becomes'}
          </button>
        )}
      </div>
      {showWhatIf && selected.length > 0 && (
        <WhatIfCard key={monthlyEur} monthlyEur={Math.round(monthlyEur * 100) / 100} />
      )}
    </Card>
  );
}
