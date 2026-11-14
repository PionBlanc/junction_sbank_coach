import type { Action } from '@coach/shared';
import { useState } from 'react';
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
    <div className="flex flex-col gap-6">
      {/* The headline the swipe total was counting up to. */}
      <div className="flex flex-col gap-2 rounded-lg bg-ink p-6 text-card">
        {matches.length > 0 ? (
          <>
<<<<<<< Updated upstream
            <p className="text-title font-semibold text-ink">
              You could save up to <span className="text-positive">{formatEur(monthlyEur)}</span> a
              month
=======
            <p className="text-small font-semibold text-card/75">You could free up</p>
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-display text-poster font-extrabold text-lime font-stretch-75%">
                +{formatEur(monthlyEur)}
              </span>
              <span className="text-body font-semibold">a month</span>
>>>>>>> Stashed changes
            </p>
          </>
        ) : (
          <p className="font-display text-headline font-bold">No saving ideas picked this time</p>
        )}
        <p className="text-small text-card/75">
          You picked {matches.length} of {props.actions.length} saving ideas.
        </p>
      </div>

      {matches.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-title font-bold">Your picks, biggest first</h2>
          <div className="flex flex-col divide-y divide-line border-y border-line">
            {matches.map((action) => (
              <p key={action.id} className="flex items-baseline gap-4 py-3 text-small">
                <span aria-hidden>{action.emoji}</span>
                <span className="flex-1">{action.title}</span>
                <span className="font-semibold whitespace-nowrap">
                  ~{formatEur(action.savingPerMonthEur)}/month
                </span>
              </p>
            ))}
          </div>
          <button
            type="button"
            className="h-14 rounded-full bg-ink px-4 text-body font-semibold text-lime disabled:opacity-40"
            disabled={busy}
            onClick={() =>
              ask('Help me turn the saving ideas I picked into a plan I can start this week.')
            }
          >
            Make a plan with my coach
          </button>
          <button
            type="button"
            className="h-14 rounded-full border border-line bg-card px-4 text-body font-semibold"
            onClick={() => setShowWhatIf(true)}
          >
            See how {formatEur(monthlyEur)} a month can grow
          </button>
          {showWhatIf && (
            <WhatIfDialog
              monthlyEur={Math.round(monthlyEur * 100) / 100}
              onClose={() => setShowWhatIf(false)}
            />
          )}
        </section>
      )}

      {/* Collapsed: the picked ideas are the point. The rest is there if the user wants to look. */}
      {swipedNo.length > 0 && (
        <details className="group border-y border-line">
          <summary className="flex min-h-11 cursor-pointer items-center justify-between text-small font-semibold">
            Ideas you skipped ({swipedNo.length})
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-5 group-open:rotate-180"
              aria-hidden
            >
              <path d="M4.3 7.3a1 1 0 0 1 1.4 0L10 11.6l4.3-4.3a1 1 0 1 1 1.4 1.4l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 0 1 0-1.4Z" />
            </svg>
          </summary>
          <div className="flex flex-col divide-y divide-line">
            {swipedNo.map((action) => (
              <p key={action.id} className="flex gap-4 py-3 text-small first:pt-0">
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
        className="flex h-11 items-center justify-center gap-2 text-small font-semibold text-muted"
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
