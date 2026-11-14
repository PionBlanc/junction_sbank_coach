import type { DeckCard } from '@coach/shared';
import { pctText } from './text.ts';

/** A difference smaller than this counts as "about the same". */
const SAME_PCT = 0.05;

/** The user's total monthly spending next to the median of people in the same age band. */
export function peerTotalCard(
  youMonthlyEur: number,
  peerMedianMonthlyEur: number,
): DeckCard | null {
  if (peerMedianMonthlyEur <= 0) return null;

  const diff = youMonthlyEur / peerMedianMonthlyEur - 1;
  let sentence = 'You spend about the same as people your age.';
  if (diff >= SAME_PCT) sentence = `You spend ${pctText(diff)} more than people your age.`;
  if (diff <= -SAME_PCT) sentence = `You spend ${pctText(diff)} less than people your age.`;

  return {
    id: 'peer-total',
    topic: 'You vs. people your age',
    chart: {
      type: 'bars',
      bars: [
        { label: 'You', valueEur: youMonthlyEur, highlight: true },
        { label: 'People your age', valueEur: peerMedianMonthlyEur, highlight: false },
      ],
    },
    sentence,
    questions: [
      'Where do I spend more than people my age?',
      'How do I compare with people my age?',
    ],
  };
}
