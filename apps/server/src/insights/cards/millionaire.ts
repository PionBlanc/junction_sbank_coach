import type { DeckCard } from '@coach/shared';
import { eurText, pctText } from './text.ts';

const MILLION_EUR = 1_000_000;
/** Beyond this the number stops meaning anything, so no card. */
const MAX_YEARS = 80;

/** Whole years until monthly deposits with monthly compounding reach a million. */
export function yearsToMillion(monthlyEur: number, yearlyReturnPct: number): number {
  const monthlyRate = yearlyReturnPct / 12;
  const months = Math.log(1 + (MILLION_EUR * monthlyRate) / monthlyEur) / Math.log(1 + monthlyRate);
  return Math.ceil(months / 12);
}

/**
 * Years to a million euros if the user invested a monthly amount: what is left of their income
 * each month, or, when nothing is left, what their actions free up.
 */
export function millionaireCard(
  amount: { monthlyEur: number; source: 'left-over' | 'actions' },
  age: number,
  yearlyReturnPct: number,
): DeckCard | null {
  if (amount.monthlyEur <= 0) return null;
  const years = yearsToMillion(amount.monthlyEur, yearlyReturnPct);
  if (years > MAX_YEARS) return null;

  return {
    id: 'millionaire',
    topic: 'Millionaire',
    chart: {
      type: 'years',
      years,
      caption: `years to 1 000 000 € at ${pctText(yearlyReturnPct)} a year`,
    },
    sentence: `Investing ${eurText(amount.monthlyEur)} a month, you are a millionaire at ${age + years}.`,
    questions: ['How does investing grow my money over time?', 'What if I invested 100 € a month?'],
  };
}
