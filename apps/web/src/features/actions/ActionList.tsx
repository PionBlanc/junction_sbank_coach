import { useState } from 'react';
import { useActions } from '../../api/useActions.ts';
import { Card } from '../../components/Card.tsx';
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
        <p className="text-muted">Loading…</p>
      </Card>
    );
  }
  if (actions.isError) {
    return (
      <Card title={TITLE}>
        <p className="text-negative">Could not load: {actions.error.message}</p>
      </Card>
    );
  }
  if (actions.data.length === 0) {
    return (
      <Card title={TITLE}>
        <p className="text-sm">
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
      {actions.data.map((action) => (
        <label key={action.id} className="flex min-h-11 cursor-pointer gap-3">
          <input
            type="checkbox"
            className="mt-1 size-5 accent-brand"
            checked={selectedIds.includes(action.id)}
            onChange={() => toggle(action.id)}
          />
          <span className="flex flex-1 flex-col gap-1">
            <span className="flex justify-between gap-2 text-sm font-semibold">
              <span>{action.title}</span>
              <span className="whitespace-nowrap text-positive">
                ~{formatEur(action.savingPerMonthEur)}/month
              </span>
            </span>
            <span className="text-xs text-muted">{action.explanation}</span>
          </span>
        </label>
      ))}
      <p className="border-t border-surface pt-3 text-sm">
        Selected: <span className="font-semibold">{formatEur(monthlyEur)}/month</span>
        {selected.length > 0 && (
          <>. That is +{formatEur(weeklyEur)} a week on your safe to spend.</>
        )}
      </p>
      {selected.length > 0 && (
        <button
          type="button"
          className="h-11 rounded-lg bg-brand text-sm font-semibold text-card"
          onClick={() => setShowWhatIf(!showWhatIf)}
        >
          {showWhatIf ? 'Hide' : 'See what this becomes'}
        </button>
      )}
      {showWhatIf && selected.length > 0 && (
        <WhatIfCard key={monthlyEur} monthlyEur={Math.round(monthlyEur * 100) / 100} />
      )}
    </Card>
  );
}
