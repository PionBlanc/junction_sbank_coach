import { CATEGORIES, type DeckCard, type PeerComparison } from '@coach/shared';
import { eurText } from './text.ts';

/** Only a clear gap makes a card: at least this much above the peer median... */
const MIN_GAP_PCT = 0.2;
/** ...and at least this many euros a month. */
const MIN_GAP_EUR = 20;

/** The category where the user is furthest above people their age, in euros. */
export function biggestGapCard(peers: PeerComparison): DeckCard | null {
  let best: PeerComparison['categories'][number] | null = null;
  for (const row of peers.categories) {
    const gap = row.youMonthlyAvgEur - row.peerMedianMonthlyEur;
    if (row.peerMedianMonthlyEur <= 0 || gap < MIN_GAP_EUR) continue;
    if (row.youMonthlyAvgEur < row.peerMedianMonthlyEur * (1 + MIN_GAP_PCT)) continue;
    if (!best || gap > best.youMonthlyAvgEur - best.peerMedianMonthlyEur) best = row;
  }
  if (!best) return null;

  const category = CATEGORIES[best.categoryId];
  const name = category.label.toLowerCase();
  return {
    id: 'biggest-gap',
    topic: category.label,
    chart: {
      type: 'bars',
      bars: [
        { label: 'You', valueEur: best.youMonthlyAvgEur, highlight: true },
        { label: 'People your age', valueEur: best.peerMedianMonthlyEur, highlight: false },
      ],
    },
    sentence:
      `You spend ${eurText(best.youMonthlyAvgEur)} a month on ${name}. ` +
      `People your age: ${eurText(best.peerMedianMonthlyEur)}.`,
    sourceNote: 'Monthly average · last 12 months · people your age',
    questions: [
      `Why is my ${name} spending higher than people my age?`,
      category.basket === 'everyday'
        ? `How much could I save if I cut ${name} by 20%?`
        : `How much do I spend on ${name} each month?`,
    ],
  };
}
