import type { DeckCard } from '@coach/shared';
import { periodText, shortMonthText } from './text.ts';

/** A change smaller than this between the first and last three months counts as steady. */
const STEADY_PCT = 0.05;

/** Total spending per month for the last 6 months: going up, down, or steady. */
export function trendCard(monthly: { month: string; totalEur: number }[]): DeckCard | null {
  const firstMonth = monthly[0];
  const lastMonth = monthly.at(-1);
  const first = monthly.slice(0, 3).reduce((sum, m) => sum + m.totalEur, 0);
  const last = monthly.slice(-3).reduce((sum, m) => sum + m.totalEur, 0);
  if (monthly.length !== 6 || !firstMonth || !lastMonth || first <= 0) return null;

  const change = last / first - 1;
  let sentence = 'Your spending has stayed steady over the past 6 months.';
  let question = 'Where does most of my money go?';
  if (change > STEADY_PCT) {
    sentence = 'Your spending has been trending up over the past 6 months.';
    question = 'Why has my spending gone up over the last 6 months?';
  } else if (change < -STEADY_PCT) {
    sentence = 'Your spending has been trending down over the past 6 months.';
    question = 'Which costs have gone down over the last 6 months?';
  }

  return {
    id: 'trend',
    topic: 'Your spending',
    chart: {
      type: 'bars',
      bars: monthly.map((m) => ({
        label: shortMonthText(m.month),
        valueEur: m.totalEur,
        highlight: m === lastMonth,
      })),
    },
    sentence,
    sourceNote: `All spending per month · ${periodText(firstMonth.month, lastMonth.month)}`,
    questions: [question, 'How much did I spend last month?'],
  };
}
