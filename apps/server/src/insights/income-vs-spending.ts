import type { DuckDBConnection } from '@duckdb/node-api';
import type { IncomeVsSpending } from '@coach/shared';
import { getIncomeAndSpendingByMonth } from '../db/spending.ts';
import { LAST_MONTH, YEAR_FROM_MONTH, round2 } from './helpers.ts';

/** Income, spending, and what was left over in each of the last 12 months. */
export async function getIncomeVsSpending(
  db: DuckDBConnection,
  customerId: string,
): Promise<IncomeVsSpending> {
  const rows = await getIncomeAndSpendingByMonth(db, customerId, YEAR_FROM_MONTH, LAST_MONTH);
  const months = rows.map((m) => ({
    month: m.month,
    incomeEur: round2(m.incomeEur),
    spendingEur: round2(m.spendingEur),
    leftEur: round2(m.incomeEur - m.spendingEur),
  }));
  const totalIncomeEur = round2(months.reduce((sum, m) => sum + m.incomeEur, 0));
  const totalSpendingEur = round2(months.reduce((sum, m) => sum + m.spendingEur, 0));

  return {
    fromMonth: YEAR_FROM_MONTH,
    toMonth: LAST_MONTH,
    months,
    totalIncomeEur,
    totalSpendingEur,
    totalLeftEur: round2(totalIncomeEur - totalSpendingEur),
    monthsOverspent: months.filter((m) => m.leftEur < 0).length,
  };
}
