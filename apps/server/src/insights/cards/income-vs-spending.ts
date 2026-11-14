import type { DeckCard } from '@coach/shared';

type MonthIncomeSpending = { month: string; incomeEur: number; spendingEur: number };

/** Income next to spending for each recent month, and how often spending was larger. */
export function incomeVsSpendingCard(months: MonthIncomeSpending[]): DeckCard | null {
  if (months.length === 0 || months.every((m) => m.incomeEur === 0 && m.spendingEur === 0)) {
    return null;
  }

  const overMonths = months.filter((m) => m.spendingEur > m.incomeEur).length;
  let sentence = `You spent more than you earned in ${overMonths} of the last ${months.length} months.`;
  if (overMonths === 0) {
    sentence = `Your income covered your spending in all of the last ${months.length} months.`;
  } else if (overMonths === months.length) {
    sentence = `You spent more than you earned in every one of the last ${months.length} months.`;
  }

  return {
    id: 'income-vs-spending',
    topic: 'Income and spending',
    chart: { type: 'incomeVsSpending', months },
    sentence,
    questions: [
      overMonths === 0
        ? 'Which months did I spend the most?'
        : 'What made my spending higher in some months?',
      'How much did I spend last month?',
    ],
  };
}
