import { SPENDING_BASKETS, type DeckCard, type SpendingBasketId } from '@coach/shared';
import { MONTHS_IN_YEAR, round2 } from '../helpers.ts';
import { pctText } from './text.ts';

/** Short bar labels. The full names are in BASKET_LABELS. */
const SHORT_LABELS: Record<SpendingBasketId, string> = {
  mandatory_regular: 'Regular',
  mandatory_irregular: 'Irregular',
  everyday: 'Everyday',
};

/** The teaching card: the three baskets, with everyday spending as the part easiest to change. */
export function basketsCard(yearTotals: Map<string, number>): DeckCard | null {
  const total = SPENDING_BASKETS.reduce((sum, b) => sum + (yearTotals.get(b) ?? 0), 0);
  if (total <= 0) return null;
  const everyday = yearTotals.get('everyday') ?? 0;

  return {
    id: 'baskets',
    topic: 'Three baskets',
    chart: {
      type: 'bars',
      bars: SPENDING_BASKETS.map((basket) => ({
        label: SHORT_LABELS[basket],
        valueEur: round2((yearTotals.get(basket) ?? 0) / MONTHS_IN_YEAR),
        highlight: basket === 'everyday',
      })),
    },
    sentence: `Everyday spending is ${pctText(everyday / total)} of what you spend: the easiest part to change.`,
    sourceNote: 'Monthly average · last 12 months',
    questions: ['What are the three spending baskets?', 'What counts as my everyday spending?'],
  };
}
