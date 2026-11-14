import type { DeckCard } from '@coach/shared';
import { periodText } from './text.ts';

type MonthIncomeSpending = { month: string; incomeEur: number; spendingEur: number };

/** Income next to spending for each of the last 12 months, and how often spending was larger. */
export function incomeVsSpendingCard(months: MonthIncomeSpending[]): DeckCard | null {
  const first = months[0];
  const last = months.at(-1);
  if (!first || !last || months.every((m) => m.incomeEur === 0 && m.spendingEur === 0)) {
    return null;
  }

  const overMonths = months.filter((m) => m.spendingEur > m.incomeEur).length;
  const sentence =
    overMonths === 0
      ? `Your income covered your spending in all of the last ${months.length} months.`
      : `You spent more than you earned in ${overMonths} of the last ${months.length} months.`;

  return {
    id: 'income-vs-spending',
    topic: 'Income and spending',
    chart: { type: 'incomeVsSpending', months },
    sentence,
    sourceNote: `Per month · ${periodText(first.month, last.month)}`,
    questions: [
      overMonths === 0
        ? 'Which months did I spend the most?'
        : 'What made my spending higher in some months?',
      'How much did I spend last month?',
    ],
  };
}
