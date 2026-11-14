import type { DuckDBConnection } from '@duckdb/node-api';
import { DATA_START_DATE, type Investments } from '@coach/shared';
import { getIncomeAndSpendingByMonth, getInvestmentsByMonth } from '../db/spending.ts';
import { LAST_MONTH, MONTHS_IN_YEAR, YEAR_FROM_MONTH, addMonths, round2 } from './helpers.ts';

const FIRST_MONTH = DATA_START_DATE.slice(0, 7);

/** Investments in each of the last 12 months, with totals for the year and since the data starts. */
export async function getInvestments(
  db: DuckDBConnection,
  customerId: string,
): Promise<Investments> {
  const allTime = await getInvestmentsByMonth(db, customerId, FIRST_MONTH, LAST_MONTH);
  const income = await getIncomeAndSpendingByMonth(db, customerId, YEAR_FROM_MONTH, LAST_MONTH);

  const months = Array.from({ length: MONTHS_IN_YEAR }, (_, index) => {
    const month = addMonths(YEAR_FROM_MONTH, index);
    const row = allTime.find((r) => r.month === month);
    return {
      month,
      depositedEur: round2(row?.depositedEur ?? 0),
      withdrawnEur: round2(row?.withdrawnEur ?? 0),
    };
  });
  const deposited = months.reduce((sum, m) => sum + m.depositedEur, 0);
  const withdrawn = months.reduce((sum, m) => sum + m.withdrawnEur, 0);
  const incomeEur = income.reduce((sum, m) => sum + m.incomeEur, 0);

  return {
    fromMonth: YEAR_FROM_MONTH,
    toMonth: LAST_MONTH,
    months,
    depositedEur: round2(deposited),
    withdrawnEur: round2(withdrawn),
    netEur: round2(deposited - withdrawn),
    monthsWithDeposit: months.filter((m) => m.depositedEur > 0).length,
    shareOfIncomePct: incomeEur > 0 ? round2(deposited / incomeEur) : null,
    sinceMonth: FIRST_MONTH,
    allTimeDepositedEur: round2(allTime.reduce((sum, r) => sum + r.depositedEur, 0)),
    allTimeWithdrawnEur: round2(allTime.reduce((sum, r) => sum + r.withdrawnEur, 0)),
  };
}
