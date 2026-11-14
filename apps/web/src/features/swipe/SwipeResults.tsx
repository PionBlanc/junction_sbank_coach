import type { Action } from '@coach/shared';
import { useState } from 'react';
import { Card } from '../../components/Card.tsx';
import { useCoachChat } from '../../lib/chat-context.ts';
import { formatEur } from '../../lib/format.ts';
import { useSwipes } from '../../lib/swipe-context.ts';
import { WhatIfDialog } from './WhatIfDialog.tsx';

type SwipeResultsProps = { actions: Action[] };

/** The view after the last swipe: the user's top saving opportunities and what they keep. */
export function SwipeResults(props: SwipeResultsProps) {
  const { swipes, reset } = useSwipes();
  const { ask, busy } = useCoachChat();
  const [showWhatIf, setShowWhatIf] = useState(false);

  const likedIds = swipes.filter((s) => s.liked).map((s) => s.id);
  // Biggest saving first: this list is the user's top opportunities.
  const matches = props.actions
    .filter((a) => likedIds.includes(a.id))
    .sort((a, b) => b.savingPerMonthEur - a.savingPerMonthEur);
  const swipedNo = props.actions.filter((a) => !likedIds.includes(a.id));

  // The one sum the frontend is allowed to do: the selected action points.
  const monthlyEur = matches.reduce((sum, a) => sum + a.savingPerMonthEur, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* The headline the swipe total was counting up to. */}
      <div className="flex flex-col gap-2">
        {matches.length > 0 ? (
          <>
            <p className="text-title font-semibold text-ink">
              You could free up <span className="text-positive">+{formatEur(monthlyEur)}</span> a
              month
            </p>
          </>
        ) : (
          <p className="text-title font-semibold text-ink">No saving ideas picked this time</p>
        )}
        <p className="text-small text-muted">
          You picked {matches.length} of {props.actions.length} saving ideas.
        </p>
      </div>

      {matches.length > 0 && (
        <Card title="Your top monthly saving opportunities">
          <div className="flex flex-col divide-y divide-line">
            {matches.map((action) => (
              <p key={action.id} className="flex gap-4 py-2 text-small first:pt-0">
                <span aria-hidden>{action.emoji}</span>
                <span className="flex-1">{action.title}</span>
                <span className="font-semibold whitespace-nowrap text-positive">
                  ~{formatEur(action.savingPerMonthEur)}/month
                </span>
              </p>
            ))}
          </div>
          <button
            type="button"
            className="flex h-11 items-center justify-center gap-2 rounded-md bg-brand text-small font-semibold text-card disabled:opacity-40"
            disabled={busy}
            onClick={() =>
              ask('Help me turn the saving ideas I picked into a plan I can start this week.')
            }
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
              <path d="M10 2c-4.42 0-8 2.91-8 6.5 0 1.88.98 3.57 2.55 4.76-.12 1.06-.53 2.1-1.24 2.98a.5.5 0 0 0 .45.81c1.7-.17 3.1-.78 4.12-1.6.68.14 1.39.22 2.12.22 4.42 0 8-2.91 8-6.5S14.42 2 10 2Z" />
            </svg>
            Make a plan with my coach
          </button>
          <button
            type="button"
            className="flex h-11 items-center justify-center gap-2 rounded-md border border-line text-small font-semibold"
            onClick={() => setShowWhatIf(true)}
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
              aria-hidden
            >
              <path d="M3 15l5-5 3 3 6-6M13 7h4v4" />
            </svg>
            See how {formatEur(monthlyEur)} a month can grow
          </button>
          {showWhatIf && (
            <WhatIfDialog
              monthlyEur={Math.round(monthlyEur * 100) / 100}
              onClose={() => setShowWhatIf(false)}
            />
          )}
        </Card>
      )}

      {/* Collapsed: the picked ideas are the point. The rest is there if the user wants to look. */}
      {swipedNo.length > 0 && (
        <details className="rounded-md border border-line bg-card px-4">
          <summary className="flex min-h-11 cursor-pointer items-center text-small text-brand">
            Ideas you skipped ({swipedNo.length})
          </summary>
          <div className="flex flex-col divide-y divide-line">
            {swipedNo.map((action) => (
              <p key={action.id} className="flex gap-4 py-2 text-small first:pt-0">
                <span aria-hidden>{action.emoji}</span>
                <span className="flex-1">{action.title}</span>
              </p>
            ))}
          </div>
          <p className="pt-2 pb-4 text-caption text-muted">
            Your advisor will not ask you to change them.
          </p>
        </details>
      )}

      <button
        type="button"
        className="flex h-11 items-center justify-center gap-2 rounded-md text-small text-muted"
        onClick={reset}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
          <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
        </svg>
        Swipe again
      </button>
    </div>
  );
}
