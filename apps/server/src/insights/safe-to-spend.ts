import type { DuckDBConnection } from '@duckdb/node-api';
import { DATA_END_DATE, type SafeToSpend } from '@coach/shared';
import { getSafeToSpendInputs, type SafeToSpendInputs } from '../db/safe-to-spend.ts';
import { LAST_MONTH, addMonths, daysBetween, nextDayOfMonth, round2 } from './helpers.ts';

/** Utility bills are averaged over this many past months. */
const UTILITY_MONTHS = 3;

/**
 * Balance now, minus the housing payment and utility bills expected before the next payday,
 * spread evenly over the days until payday. "This week" is the next 7 days.
 */
export function calculateSafeToSpend(inputs: SafeToSpendInputs, today: string): SafeToSpend {
  if (inputs.paydayDayOfMonth === null) {
    throw new Error('No salary found, cannot work out the next payday');
  }
  const nextPaydayDate = nextDayOfMonth(today, inputs.paydayDayOfMonth);
  const daysToPayday = daysBetween(today, nextPaydayDate);

  const housingDueBeforePayday =
    inputs.housingDayOfMonth !== null &&
    nextDayOfMonth(today, inputs.housingDayOfMonth) <= nextPaydayDate;
  const upcomingHousingEur = housingDueBeforePayday ? inputs.housingEur : 0;
  const upcomingUtilitiesEur = round2(
    (inputs.utilitiesTotalEur / UTILITY_MONTHS) * (daysToPayday / 30),
  );

  const availableEur = round2(inputs.balanceEur - upcomingHousingEur - upcomingUtilitiesEur);
  const perDay = Math.max(0, availableEur) / daysToPayday;
  return {
    balanceEur: round2(inputs.balanceEur),
    nextPaydayDate,
    daysToPayday,
    upcomingHousingEur,
    upcomingUtilitiesEur,
    availableEur,
    perDayEur: round2(perDay),
    safeThisWeekEur: round2(perDay * Math.min(7, daysToPayday)),
  };
}

export async function getSafeToSpend(
  db: DuckDBConnection,
  customerId: string,
): Promise<SafeToSpend> {
  const inputs = await getSafeToSpendInputs(db, customerId, {
    today: DATA_END_DATE,
    salaryFromDate: `${addMonths(LAST_MONTH, -11)}-01`,
    utilitiesFromMonth: addMonths(LAST_MONTH, -(UTILITY_MONTHS - 1)),
    utilitiesToMonth: LAST_MONTH,
  });
  return calculateSafeToSpend(inputs, DATA_END_DATE);
}
