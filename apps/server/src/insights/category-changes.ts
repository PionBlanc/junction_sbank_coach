import type { DuckDBConnection } from '@duckdb/node-api';
import { CATEGORIES, type CategoryChanges } from '@coach/shared';
import { getCategoryTotals } from '../db/spending.ts';
import { MONTHS_IN_YEAR, addMonths, isCategoryId, round2 } from './helpers.ts';

/** Spending per category in one month next to the customer's own average over the 12 months before. */
export async function getCategoryChanges(
  db: DuckDBConnection,
  customerId: string,
  month: string,
): Promise<CategoryChanges> {
  const averageFromMonth = addMonths(month, -MONTHS_IN_YEAR);
  const averageToMonth = addMonths(month, -1);
  const monthTotals = await getCategoryTotals(db, customerId, month, month);
  const yearTotals = await getCategoryTotals(db, customerId, averageFromMonth, averageToMonth);

  const categories: CategoryChanges['categories'] = [];
  for (const categoryId of new Set([...monthTotals.keys(), ...yearTotals.keys()])) {
    if (!isCategoryId(categoryId)) continue;
    const monthEur = round2(monthTotals.get(categoryId) ?? 0);
    const averageEur = round2((yearTotals.get(categoryId) ?? 0) / MONTHS_IN_YEAR);
    if (monthEur === 0 && averageEur === 0) continue;
    const changeEur = round2(monthEur - averageEur);
    categories.push({
      categoryId,
      label: CATEGORIES[categoryId].label,
      monthEur,
      averageEur,
      changeEur,
      changePct: averageEur > 0 ? round2(changeEur / averageEur) : null,
    });
  }
  categories.sort((a, b) => Math.abs(b.changeEur) - Math.abs(a.changeEur));

  const monthTotalEur = round2(categories.reduce((sum, c) => sum + c.monthEur, 0));
  const averageTotalEur = round2(categories.reduce((sum, c) => sum + c.averageEur, 0));
  return {
    month,
    averageFromMonth,
    averageToMonth,
    monthTotalEur,
    averageTotalEur,
    changeEur: round2(monthTotalEur - averageTotalEur),
    categories,
  };
}
