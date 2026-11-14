import type { DuckDBConnection } from '@duckdb/node-api';
import { CATEGORIES, type CategoryId, type CategoryTrend } from '@coach/shared';
import { getCategoryTotalsByMonth } from '../db/spending.ts';
import { addMonths, isCategoryId, round2 } from './helpers.ts';

/** Categories shown by name. The rest are one "Other" colour, like the pie. */
const TOP_COUNT = 4;

/** Spending in each month of a range, split into the biggest categories and the rest. */
export async function getCategoryTrend(
  db: DuckDBConnection,
  customerId: string,
  fromMonth: string,
  toMonth: string,
): Promise<CategoryTrend> {
  const rows = (await getCategoryTotalsByMonth(db, customerId, fromMonth, toMonth)).flatMap((r) =>
    isCategoryId(r.categoryId) && r.totalEur > 0 ? [{ ...r, categoryId: r.categoryId }] : [],
  );

  const totals = new Map<CategoryId, number>();
  for (const r of rows) totals.set(r.categoryId, (totals.get(r.categoryId) ?? 0) + r.totalEur);
  const ranked = [...totals].sort((a, b) => b[1] - a[1]);
  const topIds = ranked.slice(0, TOP_COUNT).map(([id]) => id);

  const series: CategoryTrend['series'] = ranked.slice(0, TOP_COUNT).map(([id, total]) => ({
    categoryId: id,
    label: CATEGORIES[id].label,
    totalEur: round2(total),
  }));
  const otherEur = ranked.slice(TOP_COUNT).reduce((sum, [, total]) => sum + total, 0);
  if (otherEur > 0) series.push({ categoryId: null, label: 'Other', totalEur: round2(otherEur) });

  const months: CategoryTrend['months'] = [];
  for (let month = fromMonth; month <= toMonth; month = addMonths(month, 1)) {
    const inMonth = rows.filter((r) => r.month === month);
    const valuesEur = series.map((s) =>
      round2(
        inMonth
          .filter((r) =>
            s.categoryId === null ? !topIds.includes(r.categoryId) : r.categoryId === s.categoryId,
          )
          .reduce((sum, r) => sum + r.totalEur, 0),
      ),
    );
    const totalEur = round2(inMonth.reduce((sum, r) => sum + r.totalEur, 0));
    months.push({ month, totalEur, valuesEur });
  }

  return { fromMonth, toMonth, series, months };
}
