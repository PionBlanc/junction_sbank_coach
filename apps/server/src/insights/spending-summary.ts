import type { DuckDBConnection } from '@duckdb/node-api';
import {
  CATEGORIES,
  SUBCATEGORIES,
  type CategoryId,
  type SpendingSummary,
  type SubcategoryId,
} from '@coach/shared';
import { getSpendingByMonth } from '../db/spending.ts';
import { round2 } from './helpers.ts';

export type SpendingSummaryFilter = {
  categoryId?: CategoryId | undefined;
  subcategoryId?: SubcategoryId | undefined;
  fromMonth: string;
  toMonth: string;
};

/** Total spending and a month-by-month series, for everything or one category or subcategory. */
export async function getSpendingSummary(
  db: DuckDBConnection,
  customerId: string,
  filter: SpendingSummaryFilter,
): Promise<SpendingSummary> {
  const monthly = await getSpendingByMonth(db, customerId, {
    categoryId: filter.categoryId ?? null,
    subcategoryId: filter.subcategoryId ?? null,
    fromMonth: filter.fromMonth,
    toMonth: filter.toMonth,
  });

  let label = 'All spending';
  if (filter.subcategoryId) label = SUBCATEGORIES[filter.subcategoryId].label;
  else if (filter.categoryId) label = CATEGORIES[filter.categoryId].label;

  return {
    label,
    fromMonth: filter.fromMonth,
    toMonth: filter.toMonth,
    totalEur: round2(monthly.reduce((sum, m) => sum + m.totalEur, 0)),
    txCount: monthly.reduce((sum, m) => sum + m.txCount, 0),
    monthly: monthly.map((m) => ({ month: m.month, totalEur: m.totalEur })),
  };
}
