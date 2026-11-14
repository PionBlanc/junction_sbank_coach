import type { DeckCard } from '@coach/shared';
import { round2 } from '../helpers.ts';
import { pctText } from './text.ts';
import { importanceOf } from './importance.ts';

/** The first days after a salary arrives, payday included. */
export const PAYDAY_WEEK_DAYS = 7;
/** A difference smaller than this counts as spending evenly. */
const SAME_PCT = 0.1;

/**
 * Purchases per day in the week after payday next to the rest of the pay period. Importance
 * compares the user's first-week-to-rest ratio with the median person's.
 */
export function paydayCard(
  days: { totalEur: number; daysSincePayday: number }[],
  peerMedianRatio: number,
): DeckCard | null {
  const firstWeek = days.filter((d) => d.daysSincePayday < PAYDAY_WEEK_DAYS);
  const rest = days.filter((d) => d.daysSincePayday >= PAYDAY_WEEK_DAYS);
  if (firstWeek.length === 0 || rest.length === 0) return null;

  const firstWeekEur = round2(firstWeek.reduce((sum, d) => sum + d.totalEur, 0) / firstWeek.length);
  const restEur = round2(rest.reduce((sum, d) => sum + d.totalEur, 0) / rest.length);
  if (restEur <= 0) return null;

  const diff = firstWeekEur / restEur - 1;
  let sentence = 'You spend evenly between paydays.';
  if (diff >= SAME_PCT) sentence = `You spend ${pctText(diff)} more a day right after payday.`;
  if (diff <= -SAME_PCT) sentence = `You spend ${pctText(diff)} less a day right after payday.`;

  return {
    id: 'payday',
    importance: importanceOf(firstWeekEur / restEur / peerMedianRatio - 1),
    topic: 'After payday',
    chart: {
      type: 'bars',
      bars: [
        { label: 'First week', valueEur: firstWeekEur, highlight: true },
        { label: 'Rest of the month', valueEur: restEur, highlight: false },
      ],
    },
    sentence,
    questions: [
      'How can I make my money last until payday?',
      'What is safe for me to spend this week?',
    ],
  };
}
