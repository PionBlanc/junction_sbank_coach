import type { DuckDBConnection } from '@duckdb/node-api';
import { SPENDER_GROUPS } from '@coach/shared';
import { queryRows } from './query.ts';

/** A constant list from the shared package, never user input. */
const GROUP_CATEGORIES_SQL = Object.values(SPENDER_GROUPS)
  .flatMap((g) => (g.categoryId ? [`'${g.categoryId}'`] : []))
  .join(', ');

export type GroupCategoryRow = {
  customerId: string;
  /** Null for a customer with no spending in any group category. */
  categoryId: string | null;
  monthlyAvgEur: number;
  peerMedianMonthlyEur: number;
  peerP75MonthlyEur: number;
};

/**
 * Every customer's monthly average in each spender-group category, next to their age band.
 * Salary-sweep customers are left out: most of their spending is invisible (see docs/data.md).
 */
export async function getGroupCategoryRows(
  db: DuckDBConnection,
  fromMonth: string,
  toMonth: string,
  monthCount: number,
): Promise<GroupCategoryRow[]> {
  const rows = await queryRows(
    db,
    `WITH spend AS (
       SELECT customer_id, category_id, sum(total_eur) / $monthCount AS monthly_avg_eur
       FROM monthly_category
       WHERE month BETWEEN $fromMonth AND $toMonth AND category_id IN (${GROUP_CATEGORIES_SQL})
       GROUP BY customer_id, category_id
     )
     SELECT c.customer_id, s.category_id, s.monthly_avg_eur,
            p.median_monthly_eur, p.p75_monthly_eur
     FROM customers c
     LEFT JOIN spend s ON s.customer_id = c.customer_id
     LEFT JOIN peer_benchmarks p ON p.age_band = c.age_band AND p.category_id = s.category_id
     WHERE c.customer_id NOT IN
       (SELECT customer_id FROM monthly_category WHERE category_id = 'salary_sweep')`,
    { fromMonth, toMonth, monthCount },
  );
  return rows.map((r) => ({
    customerId: String(r.customer_id),
    categoryId: r.category_id === null ? null : String(r.category_id),
    monthlyAvgEur: Number(r.monthly_avg_eur ?? 0),
    peerMedianMonthlyEur: Number(r.median_monthly_eur ?? 0),
    peerP75MonthlyEur: Number(r.p75_monthly_eur ?? 0),
  }));
}
