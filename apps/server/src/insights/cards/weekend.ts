import type { DeckCard } from '@coach/shared';
import { round2 } from '../helpers.ts';
import { pctText } from './text.ts';
import { importanceOf } from './importance.ts';

/** A difference smaller than this counts as "about the same". */
const SAME_PCT = 0.1;

function isWeekend(date: string): boolean {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}

/**
 * Purchases on an average Saturday or Sunday next to an average weekday. Importance compares the
 * user's weekend-to-weekday ratio with the median person's.
 */
export function weekendCard(
  days: { date: string; totalEur: number }[],
  peerMedianRatio: number,
): DeckCard | null {
  const weekend = days.filter((d) => isWeekend(d.date));
  const weekdays = days.filter((d) => !isWeekend(d.date));
  if (weekend.length === 0 || weekdays.length === 0) return null;

  const weekendEur = round2(weekend.reduce((sum, d) => sum + d.totalEur, 0) / weekend.length);
  const weekdayEur = round2(weekdays.reduce((sum, d) => sum + d.totalEur, 0) / weekdays.length);
  if (weekdayEur <= 0) return null;

  const diff = weekendEur / weekdayEur - 1;
  let sentence = 'You spend about the same on weekends and weekdays.';
  if (diff >= SAME_PCT) sentence = `You spend ${pctText(diff)} more on a weekend day.`;
  if (diff <= -SAME_PCT) sentence = `You spend ${pctText(diff)} less on a weekend day.`;

  return {
    id: 'weekend',
    importance: importanceOf(weekendEur / weekdayEur / peerMedianRatio - 1),
    topic: 'Weekends',
    chart: {
      type: 'bars',
      bars: [
        { label: 'Weekday', valueEur: weekdayEur, highlight: false },
        { label: 'Weekend day', valueEur: weekendEur, highlight: true },
      ],
    },
    sentence,
    questions: [
      'What do I buy on weekends?',
      'How much could I save by spending less on weekends?',
    ],
  };
}
