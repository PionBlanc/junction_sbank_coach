import type { Action } from '@coach/shared';
import { useState } from 'react';
import { Card } from '../../components/Card.tsx';
import { useCoachChat } from '../../lib/chat-context.ts';
import { formatEur } from '../../lib/format.ts';
import { moneyType } from '../../lib/money-type.ts';
import { useSwipes } from '../../lib/swipe-context.ts';
import { WhatIfCard } from '../what-if/WhatIfCard.tsx';

type SwipeResultsProps = { actions: Action[] };

/** The view after the last swipe: the user's money type, their matches, and what they keep. */
export function SwipeResults(props: SwipeResultsProps) {
  const { swipes, reset } = useSwipes();
  const { ask, busy } = useCoachChat();
  const [showWhatIf, setShowWhatIf] = useState(false);

  const likedIds = swipes.filter((s) => s.liked).map((s) => s.id);
  const matches = props.actions.filter((a) => likedIds.includes(a.id));
  const worthIt = props.actions.filter((a) => !likedIds.includes(a.id));
  const type = moneyType(matches, worthIt);

  // The one sum the frontend is allowed to do: the selected action points.
  const monthlyEur = matches.reduce((sum, a) => sum + a.savingPerMonthEur, 0);

  return (
    <div className="flex flex-col gap-4">
      <Card title="Your money type">
        <div className="flex items-center gap-4">
          <span className="text-display" aria-hidden>
            {type.emoji}
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-title font-semibold">{type.label}</p>
            <p className="text-small text-muted">{type.line}</p>
          </div>
        </div>
        <p className="text-small">
          You matched with {matches.length} of {props.actions.length} ideas.
        </p>
      </Card>

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
            onClick={() => setShowWhatIf(!showWhatIf)}
          >
            {showWhatIf ? 'Hide' : 'See what this becomes'}
          </button>
          {showWhatIf && (
            <WhatIfCard key={monthlyEur} monthlyEur={Math.round(monthlyEur * 100) / 100} />
          )}
        </Card>
      )}

      {worthIt.length > 0 && (
        <Card title="Worth it to you">
          <div className="flex flex-col divide-y divide-line">
            {worthIt.map((action) => (
              <p key={action.id} className="flex gap-4 py-2 text-small first:pt-0">
                <span aria-hidden>{action.emoji}</span>
                <span className="flex-1">{action.title}</span>
              </p>
            ))}
          </div>
          <p className="text-caption text-muted">
            You swiped left on these. Your advisor will not ask you to change them.
          </p>
        </Card>
      )}

      <button type="button" className="h-11 rounded-md text-small text-muted" onClick={reset}>
        Swipe again
      </button>
    </div>
  );
}
