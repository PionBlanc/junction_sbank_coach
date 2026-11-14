import type { Action } from '@coach/shared';
import { useState } from 'react';
import { Card } from '../../components/Card.tsx';
import { useCoachChat } from '../../lib/chat-context.ts';
import { formatEur } from '../../lib/format.ts';
import { useSwipes } from '../../lib/swipe-context.ts';
import { WhatIfDialog } from './WhatIfDialog.tsx';

type SwipeResultsProps = { actions: Action[] };

/** The view after the last swipe: the user's matches and what they keep. */
export function SwipeResults(props: SwipeResultsProps) {
  const { swipes, reset } = useSwipes();
  const { ask, busy } = useCoachChat();
  const [showWhatIf, setShowWhatIf] = useState(false);

  const likedIds = swipes.filter((s) => s.liked).map((s) => s.id);
  const matches = props.actions.filter((a) => likedIds.includes(a.id));
  const swipedNo = props.actions.filter((a) => !likedIds.includes(a.id));

  // The one sum the frontend is allowed to do: the selected action points.
  const monthlyEur = matches.reduce((sum, a) => sum + a.savingPerMonthEur, 0);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-small text-muted">
        You matched with {matches.length} of {props.actions.length} saving ideas.
      </p>

      {matches.length > 0 && (
        <Card title="Your matches">
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
          <p className="text-small">
            Together: <span className="font-semibold">{formatEur(monthlyEur)}/month</span>.
          </p>
          <button
            type="button"
            className="h-11 rounded-md bg-brand text-small font-semibold text-card disabled:opacity-40"
            disabled={busy}
            onClick={() => ask('Make me a plan for my first week with the ideas I matched with.')}
          >
            Plan my first week
          </button>
          <button
            type="button"
            className="h-11 rounded-md border border-line text-small font-semibold"
            onClick={() => setShowWhatIf(true)}
          >
            See what this becomes
          </button>
          {showWhatIf && (
            <WhatIfDialog
              monthlyEur={Math.round(monthlyEur * 100) / 100}
              onClose={() => setShowWhatIf(false)}
            />
          )}
        </Card>
      )}

      {/* Collapsed: the matches are the point. The rest is there if the user wants to look. */}
      {swipedNo.length > 0 && (
        <details className="rounded-md border border-line bg-card px-4">
          <summary className="flex min-h-11 cursor-pointer items-center text-small text-brand">
            You swiped no on these ({swipedNo.length})
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

      <button type="button" className="h-11 rounded-md text-small text-muted" onClick={reset}>
        Swipe again
      </button>
    </div>
  );
}
