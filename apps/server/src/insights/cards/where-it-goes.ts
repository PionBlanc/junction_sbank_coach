import { CATEGORIES, type CardChart, type DeckCard } from '@coach/shared';
import { MONTHS_IN_YEAR, isCategoryId, round2 } from '../helpers.ts';
import { pctText } from './text.ts';
import { ALWAYS_IMPORTANT } from './importance.ts';

type DonutSlice = Extract<CardChart, { type: 'donut' }>['slices'][number];

/** Categories shown by name. The rest are one "Other" slice. */
const TOP_COUNT = 4;

/** Where a year's spending went, as a donut: the biggest categories and the rest. */
export function whereItGoesCard(yearTotals: Map<string, number>): DeckCard | null {
  const rows = [...yearTotals]
    .flatMap(([categoryId, totalEur]) =>
      isCategoryId(categoryId) && totalEur > 0 ? [{ categoryId, totalEur }] : [],
    )
    .sort((a, b) => b.totalEur - a.totalEur);
  const total = rows.reduce((sum, r) => sum + r.totalEur, 0);
  const top = rows[0];
  if (!top || total <= 0) return null;

  const slices: DonutSlice[] = rows.slice(0, TOP_COUNT).map((r) => ({
    categoryId: r.categoryId,
    label: CATEGORIES[r.categoryId].label,
    valueEur: round2(r.totalEur / MONTHS_IN_YEAR),
    sharePct: round2(r.totalEur / total),
  }));
  const otherEur = rows.slice(TOP_COUNT).reduce((sum, r) => sum + r.totalEur, 0);
  if (otherEur > 0) {
    slices.push({
      categoryId: null,
      label: 'Other',
      valueEur: round2(otherEur / MONTHS_IN_YEAR),
      sharePct: round2(otherEur / total),
    });
  }

  const label = CATEGORIES[top.categoryId].label;
  return {
    id: 'where-it-goes',
    importance: ALWAYS_IMPORTANT,
    topic: 'Where your money goes',
    chart: { type: 'donut', slices },
    sentence: `${label} takes the biggest share: ${pctText(top.totalEur / total)} of your spending.`,
    questions: [
      `How much do I spend on ${label.toLowerCase()} each month?`,
      'What are my biggest costs?',
    ],
  };
}
