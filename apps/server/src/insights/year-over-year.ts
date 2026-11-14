import type { DuckDBConnection } from '@duckdb/node-api';
import { CATEGORIES, type CategoryId, type YearOverYear } from '@coach/shared';
import { getSpendingByMonth } from '../db/spending.ts';
import { LAST_MONTH, MONTHS_IN_YEAR, YEAR_FROM_MONTH, addMonths, round2 } from './helpers.ts';

/** Spending in each of the last 12 months next to the same month a year earlier. */
export async function getYearOverYear(
  db: DuckDBConnection,
  customerId: string,
  categoryId?: CategoryId,
): Promise<YearOverYear> {
  const rows = await getSpendingByMonth(db, customerId, {
    categoryId: categoryId ?? null,
    subcategoryId: null,
    fromMonth: addMonths(YEAR_FROM_MONTH, -MONTHS_IN_YEAR),
    toMonth: LAST_MONTH,
  });
  const byMonth = new Map(rows.map((r) => [r.month, r.totalEur]));

  const months = Array.from({ length: MONTHS_IN_YEAR }, (_, i) => {
    const month = addMonths(YEAR_FROM_MONTH, i);
    const lastYearMonth = addMonths(month, -MONTHS_IN_YEAR);
    const thisYearEur = byMonth.get(month) ?? 0;
    const lastYearEur = byMonth.get(lastYearMonth) ?? 0;
    return {
      month,
      lastYearMonth,
      thisYearEur,
      lastYearEur,
      changeEur: round2(thisYearEur - lastYearEur),
    };
  });
  const thisYearTotalEur = round2(months.reduce((sum, m) => sum + m.thisYearEur, 0));
  const lastYearTotalEur = round2(months.reduce((sum, m) => sum + m.lastYearEur, 0));

  return {
    label: categoryId ? CATEGORIES[categoryId].label : 'All spending',
    months,
    thisYearTotalEur,
    lastYearTotalEur,
    changeEur: round2(thisYearTotalEur - lastYearTotalEur),
    changePct:
      lastYearTotalEur > 0
        ? round2((thisYearTotalEur - lastYearTotalEur) / lastYearTotalEur)
        : null,
  };
}
