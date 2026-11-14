import type { DuckDBConnection } from '@duckdb/node-api';
import { CATEGORIES, type CategorySplit } from '@coach/shared';
import { getCategoryTotals } from '../db/spending.ts';
import { isCategoryId, round2 } from './helpers.ts';

/** Categories shown by name. The rest are one "Other" slice, so the donut has five colours at most. */
const TOP_COUNT = 4;

/** Where spending went over a range of months: the biggest categories and the rest. */
export async function getCategorySplit(
  db: DuckDBConnection,
  customerId: string,
  fromMonth: string,
  toMonth: string,
): Promise<CategorySplit> {
  const totals = await getCategoryTotals(db, customerId, fromMonth, toMonth);
  const rows = [...totals]
    .flatMap(([categoryId, totalEur]) =>
      isCategoryId(categoryId) && totalEur > 0 ? [{ categoryId, totalEur }] : [],
    )
    .sort((a, b) => b.totalEur - a.totalEur);
  const total = rows.reduce((sum, r) => sum + r.totalEur, 0);

  const slices: CategorySplit['slices'] = rows.slice(0, TOP_COUNT).map((r) => ({
    categoryId: r.categoryId,
    label: CATEGORIES[r.categoryId].label,
    totalEur: round2(r.totalEur),
    sharePct: round2(r.totalEur / total),
  }));
  const otherEur = rows.slice(TOP_COUNT).reduce((sum, r) => sum + r.totalEur, 0);
  if (otherEur > 0) {
    slices.push({
      categoryId: null,
      label: 'Other',
      totalEur: round2(otherEur),
      sharePct: round2(otherEur / total),
    });
  }

  return { fromMonth, toMonth, totalEur: round2(total), slices };
}
