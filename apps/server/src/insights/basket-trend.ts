import type { DuckDBConnection } from '@duckdb/node-api';
import { BASKET_LABELS, SPENDING_BASKETS, type BasketTrend } from '@coach/shared';
import { getBasketTotalsByMonth } from '../db/spending.ts';
import { LAST_MONTH, MONTHS_IN_YEAR, YEAR_FROM_MONTH, addMonths, round2 } from './helpers.ts';

/** Spending per basket in each of the last 12 months, and each basket's total and monthly average. */
export async function getBasketTrend(
  db: DuckDBConnection,
  customerId: string,
): Promise<BasketTrend> {
  const rows = await getBasketTotalsByMonth(db, customerId, YEAR_FROM_MONTH, LAST_MONTH);
  const amount = (month: string, basket: string) =>
    round2(rows.find((r) => r.month === month && r.basket === basket)?.totalEur ?? 0);

  const months = Array.from({ length: MONTHS_IN_YEAR }, (_, index) => {
    const month = addMonths(YEAR_FROM_MONTH, index);
    return {
      month,
      mandatoryRegularEur: amount(month, 'mandatory_regular'),
      mandatoryIrregularEur: amount(month, 'mandatory_irregular'),
      everydayEur: amount(month, 'everyday'),
    };
  });
  const baskets = SPENDING_BASKETS.map((basketId) => {
    const total = rows.filter((r) => r.basket === basketId).reduce((s, r) => s + r.totalEur, 0);
    return {
      basketId,
      label: BASKET_LABELS[basketId],
      totalEur: round2(total),
      monthlyAvgEur: round2(total / MONTHS_IN_YEAR),
    };
  });

  return { fromMonth: YEAR_FROM_MONTH, toMonth: LAST_MONTH, months, baskets };
}
