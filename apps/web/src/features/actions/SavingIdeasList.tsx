import type { SavingIdeas } from '@coach/shared';
import { formatEur } from '../../lib/format.ts';

type SavingIdeasListProps = { ideas: SavingIdeas['ideas'] };

/** Each idea on one row: emoji, title, and what it frees up a month. */
export function SavingIdeasList(props: SavingIdeasListProps) {
  return (
    <ul className="flex flex-col divide-y divide-line text-small">
      {props.ideas.map((idea) => (
        <li key={idea.id} className="flex items-center gap-2 py-2 first:pt-0 last:pb-0">
          <span aria-hidden>{idea.emoji}</span>
          <span className="flex-1">{idea.title}</span>
          <span className="font-semibold whitespace-nowrap text-positive">
            {formatEur(idea.savingPerMonthEur)}/mo
          </span>
        </li>
      ))}
    </ul>
  );
}
