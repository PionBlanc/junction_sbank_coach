import type { DuckDBConnection } from '@duckdb/node-api';
import { SPENDING_BASKETS } from '@coach/shared';
import { queryRows } from './query.ts';

/** A constant list from the shared package, never user input. */
const SPENDING_BASKETS_SQL = SPENDING_BASKETS.map((b) => `'${b}'`).join(', ');

export type MonthTotal = { basket: string; categoryId: string; totalEur: number };

/** One month's totals per basket and category, income included. */
export async function getMonthTotals(
  db: DuckDBConnection,
  customerId: string,
  month: string,
): Promise<MonthTotal[]> {
  const rows = await queryRows(
    db,
    `SELECT basket, category_id, total_eur FROM monthly_category
     WHERE customer_id = $customerId AND month = $month`,
    { customerId, month },
  );
  return rows.map((r) => ({
    basket: String(r.basket),
    categoryId: String(r.category_id),
    totalEur: Number(r.total_eur),
  }));
}

/** Spending per category over a month range, summed across baskets (taxis included). */
export async function getCategoryTotals(
  db: DuckDBConnection,
  customerId: string,
  fromMonth: string,
  toMonth: string,
): Promise<Map<string, number>> {
  const rows = await queryRows(
    db,
    `SELECT category_id, sum(total_eur) AS total_eur FROM monthly_category
     WHERE customer_id = $customerId AND month BETWEEN $fromMonth AND $toMonth
       AND basket IN (${SPENDING_BASKETS_SQL})
     GROUP BY category_id`,
    { customerId, fromMonth, toMonth },
  );
  return new Map(rows.map((r) => [String(r.category_id), Number(r.total_eur)]));
}

export type SpendingFilter = {
  categoryId: string | null;
  subcategoryId: string | null;
  fromMonth: string;
  toMonth: string;
};
export type MonthSpending = { month: string; totalEur: number; txCount: number };

/** Spending per month, optionally for one category or subcategory. Months without spending are absent. */
export async function getSpendingByMonth(
  db: DuckDBConnection,
  customerId: string,
  filter: SpendingFilter,
): Promise<MonthSpending[]> {
  const rows = await queryRows(
    db,
    `SELECT month, round(sum(abs_amount_eur), 2) AS total_eur, count(*) AS tx_count
     FROM transactions
     WHERE customer_id = $customerId AND month BETWEEN $fromMonth AND $toMonth
       AND basket IN (${SPENDING_BASKETS_SQL})
       AND (CAST($categoryId AS VARCHAR) IS NULL OR category_id = $categoryId)
       AND (CAST($subcategoryId AS VARCHAR) IS NULL OR subcategory_id = $subcategoryId)
     GROUP BY month ORDER BY month`,
    { customerId, ...filter },
  );
  return rows.map((r) => ({
    month: String(r.month),
    totalEur: Number(r.total_eur),
    txCount: Number(r.tx_count),
  }));
}

/** Spending per basket over a month range. Taxis count towards everyday spending. */
export async function getBasketTotals(
  db: DuckDBConnection,
  customerId: string,
  fromMonth: string,
  toMonth: string,
): Promise<Map<string, number>> {
  const rows = await queryRows(
    db,
    `SELECT basket, sum(total_eur) AS total_eur FROM monthly_category
     WHERE customer_id = $customerId AND month BETWEEN $fromMonth AND $toMonth
       AND basket IN (${SPENDING_BASKETS_SQL})
     GROUP BY basket`,
    { customerId, fromMonth, toMonth },
  );
  return new Map(rows.map((r) => [String(r.basket), Number(r.total_eur)]));
}
