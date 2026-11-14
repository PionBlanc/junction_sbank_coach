import type { DuckDBConnection } from '@duckdb/node-api';
import { SPENDING_BASKETS } from '@coach/shared';
import { queryRows } from './query.ts';

/** A constant list from the shared package, never user input. */
const SPENDING_BASKETS_SQL = SPENDING_BASKETS.map((b) => `'${b}'`).join(', ');

export type PeerBenchmark = { categoryId: string; medianMonthlyEur: number; p75MonthlyEur: number };

/** Typical monthly spending per category for one age band (averages over the whole dataset). */
export async function getPeerBenchmarks(
  db: DuckDBConnection,
  ageBand: string,
): Promise<PeerBenchmark[]> {
  const rows = await queryRows(
    db,
    `SELECT category_id, median_monthly_eur, p75_monthly_eur FROM peer_benchmarks
     WHERE age_band = $ageBand ORDER BY category_id`,
    { ageBand },
  );
  return rows.map((r) => ({
    categoryId: String(r.category_id),
    medianMonthlyEur: Number(r.median_monthly_eur),
    p75MonthlyEur: Number(r.p75_monthly_eur),
  }));
}

/**
 * Median of total monthly spending in one age band over a month range. Customers with salary
 * sweeps are left out: most of their spending happens on another account (see docs/data.md).
 */
export async function getPeerTotalMedian(
  db: DuckDBConnection,
  ageBand: string,
  fromMonth: string,
  toMonth: string,
  monthCount: number,
): Promise<number> {
  const rows = await queryRows(
    db,
    `WITH per_customer AS (
       SELECT c.customer_id, coalesce(sum(m.total_eur), 0) / $monthCount AS monthly_eur
       FROM customers c
       LEFT JOIN monthly_category m ON m.customer_id = c.customer_id
         AND m.month BETWEEN $fromMonth AND $toMonth AND m.basket IN (${SPENDING_BASKETS_SQL})
       WHERE c.age_band = $ageBand
         AND c.customer_id NOT IN
           (SELECT customer_id FROM monthly_category WHERE category_id = 'salary_sweep')
       GROUP BY c.customer_id
     )
     SELECT round(median(monthly_eur), 2) AS median_monthly_eur FROM per_customer`,
    { ageBand, fromMonth, toMonth, monthCount },
  );
  return Number(rows[0]?.median_monthly_eur ?? 0);
}
