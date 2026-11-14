import type { Action } from '@coach/shared';
import { round2 } from '../helpers.ts';

/** Share of taxi spending the swap frees up. */
const SWAP_PCT = 0.5;
/** Below this monthly taxi spending the action is not worth showing. */
const MIN_MONTHLY_EUR = 10;

/** Taxi rides over the last 12 months: suggest swapping half of them for public transport. */
export function taxiActions(taxiMonthlyAvgEur: number, rideCount: number): Action[] {
  if (taxiMonthlyAvgEur < MIN_MONTHLY_EUR) return [];

  const savingPerMonthEur = round2(taxiMonthlyAvgEur * SWAP_PCT);
  return [
    {
      id: 'taxis',
      title: 'Swap half your taxi rides for public transport',
      explanation:
        `You took ${rideCount} taxi rides in the last 12 months, about ` +
        `${Math.round(taxiMonthlyAvgEur)} € a month. ` +
        `Swapping half of them frees up about ${Math.round(savingPerMonthEur)} € a month.`,
      emoji: '🚕',
      savingPerMonthEur,
      savingPerWeekEur: round2((savingPerMonthEur * 12) / 52),
      categoryId: 'transportation',
      inputs: { taxiMonthlyAvgEur, rideCount, swapPct: SWAP_PCT },
    },
  ];
}
