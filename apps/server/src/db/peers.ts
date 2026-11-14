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

/** Customers whose salary moves to another own account: most of their spending is invisible. */
const NOT_SWEEPERS_SQL = `customer_id NOT IN
  (SELECT customer_id FROM monthly_category WHERE category_id = 'salary_sweep')`;

/**
 * Median over all customers of (purchases per weekend day) / (purchases per weekday), between two
 * dates. Saturday and Sunday are the weekend.
 */
export async function getPeerWeekendRatio(
  db: DuckDBConnection,
  fromDate: string,
  toDate: string,
): Promise<number> {
  const rows = await queryRows(
    db,
    `WITH calendar AS (
       SELECT dayofweek(CAST(d AS DATE)) IN (0, 6) AS weekend
       FROM range(CAST($fromDate AS DATE), CAST($toDate AS DATE) + 1, INTERVAL 1 DAY) t(d)
     ),
     day_counts AS (
       SELECT count(*) FILTER (WHERE weekend) AS weekend_days,
              count(*) FILTER (WHERE NOT weekend) AS weekdays
       FROM calendar
     ),
     per_customer AS (
       SELECT sum(abs_amount_eur) FILTER (WHERE dayofweek(tx_date) IN (0, 6)) AS weekend_eur,
              sum(abs_amount_eur) FILTER (WHERE dayofweek(tx_date) NOT IN (0, 6)) AS weekday_eur
       FROM transactions
       WHERE transaction_type = 'purchase' AND basket IN (${SPENDING_BASKETS_SQL})
         AND tx_date BETWEEN CAST($fromDate AS DATE) AND CAST($toDate AS DATE)
         AND ${NOT_SWEEPERS_SQL}
       GROUP BY customer_id
     )
     SELECT median((weekend_eur / weekend_days) / (weekday_eur / weekdays)) AS ratio
     FROM per_customer, day_counts
     WHERE weekday_eur > 0`,
    { fromDate, toDate },
  );
  return Number(rows[0]?.ratio ?? 1);
}

/**
 * Median over all customers of (purchases per day in the first week after a salary) / (purchases
 * per day in the rest of the pay period), between two dates.
 */
export async function getPeerPaydayRatio(
  db: DuckDBConnection,
  fromDate: string,
  toDate: string,
  firstWeekDays: number,
): Promise<number> {
  const rows = await queryRows(
    db,
    `WITH people AS (SELECT customer_id FROM customers WHERE ${NOT_SWEEPERS_SQL}),
     pay AS (
       SELECT DISTINCT customer_id, tx_date AS pay_date FROM transactions
       WHERE category_id = 'salary'
     ),
     calendar AS (
       SELECT p.customer_id, CAST(d AS DATE) AS day
       FROM people p,
            range(CAST($fromDate AS DATE), CAST($toDate AS DATE) + 1, INTERVAL 1 DAY) t(d)
     ),
     days AS (
       SELECT c.customer_id, c.day, date_diff('day', p.pay_date, c.day) < $firstWeekDays AS first_week
       FROM calendar c
       ASOF JOIN pay p ON c.customer_id = p.customer_id AND c.day >= p.pay_date
     ),
     spend AS (
       SELECT customer_id, tx_date, sum(abs_amount_eur) AS total_eur FROM transactions
       WHERE transaction_type = 'purchase' AND basket IN (${SPENDING_BASKETS_SQL})
         AND tx_date BETWEEN CAST($fromDate AS DATE) AND CAST($toDate AS DATE)
       GROUP BY customer_id, tx_date
     ),
     per_customer AS (
       SELECT avg(coalesce(s.total_eur, 0)) FILTER (WHERE first_week) AS first_week_eur,
              avg(coalesce(s.total_eur, 0)) FILTER (WHERE NOT first_week) AS rest_eur
       FROM days d
       LEFT JOIN spend s ON s.customer_id = d.customer_id AND s.tx_date = d.day
       GROUP BY d.customer_id
     )
     SELECT median(first_week_eur / rest_eur) AS ratio FROM per_customer WHERE rest_eur > 0`,
    { fromDate, toDate, firstWeekDays },
  );
  return Number(rows[0]?.ratio ?? 1);
}
