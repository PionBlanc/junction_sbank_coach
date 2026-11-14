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

export type SubcategoryTotal = { totalEur: number; txCount: number };

/** Spending and purchase count per subcategory over a month range. Purchases without an MCC are left out. */
export async function getSubcategoryTotals(
  db: DuckDBConnection,
  customerId: string,
  fromMonth: string,
  toMonth: string,
): Promise<Map<string, SubcategoryTotal>> {
  const rows = await queryRows(
    db,
    `SELECT subcategory_id, round(sum(abs_amount_eur), 2) AS total_eur, count(*) AS tx_count
     FROM transactions
     WHERE customer_id = $customerId AND month BETWEEN $fromMonth AND $toMonth
       AND basket IN (${SPENDING_BASKETS_SQL})
       AND subcategory_id IS NOT NULL
     GROUP BY subcategory_id`,
    { customerId, fromMonth, toMonth },
  );
  return new Map(
    rows.map((r) => [
      String(r.subcategory_id),
      { totalEur: Number(r.total_eur), txCount: Number(r.tx_count) },
    ]),
  );
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

export type MonthIncomeSpending = { month: string; incomeEur: number; spendingEur: number };

/** Income and spending per month over a month range. Months without any rows are absent. */
export async function getIncomeAndSpendingByMonth(
  db: DuckDBConnection,
  customerId: string,
  fromMonth: string,
  toMonth: string,
): Promise<MonthIncomeSpending[]> {
  const rows = await queryRows(
    db,
    `SELECT month,
       coalesce(sum(total_eur) FILTER (WHERE basket = 'income'), 0) AS income_eur,
       coalesce(sum(total_eur) FILTER (WHERE basket IN (${SPENDING_BASKETS_SQL})), 0) AS spending_eur
     FROM monthly_category
     WHERE customer_id = $customerId AND month BETWEEN $fromMonth AND $toMonth
     GROUP BY month ORDER BY month`,
    { customerId, fromMonth, toMonth },
  );
  return rows.map((r) => ({
    month: String(r.month),
    incomeEur: Number(r.income_eur),
    spendingEur: Number(r.spending_eur),
  }));
}

export type DayPurchases = { date: string; totalEur: number; daysSincePayday: number };

/**
 * Card purchases per calendar day (zero on days without any), with the days since the last salary.
 * Purchases only, so housing and utility bills on fixed dates do not skew the pattern.
 */
export async function getDailyPurchases(
  db: DuckDBConnection,
  customerId: string,
  fromDate: string,
  toDate: string,
): Promise<DayPurchases[]> {
  const rows = await queryRows(
    db,
    `WITH pay AS (
       SELECT DISTINCT tx_date AS pay_date FROM transactions
       WHERE customer_id = $customerId AND category_id = 'salary'
     ),
     calendar AS (
       SELECT CAST(d AS DATE) AS day
       FROM range(CAST($fromDate AS DATE), CAST($toDate AS DATE) + 1, INTERVAL 1 DAY) t(d)
     ),
     spend AS (
       SELECT tx_date, sum(abs_amount_eur) AS total_eur FROM transactions
       WHERE customer_id = $customerId AND transaction_type = 'purchase'
         AND basket IN (${SPENDING_BASKETS_SQL})
         AND tx_date BETWEEN CAST($fromDate AS DATE) AND CAST($toDate AS DATE)
       GROUP BY tx_date
     )
     SELECT CAST(c.day AS VARCHAR) AS day, coalesce(s.total_eur, 0) AS total_eur,
            date_diff('day', p.pay_date, c.day) AS days_since_payday
     FROM calendar c
     ASOF JOIN pay p ON c.day >= p.pay_date
     LEFT JOIN spend s ON s.tx_date = c.day
     ORDER BY c.day`,
    { customerId, fromDate, toDate },
  );
  return rows.map((r) => ({
    date: String(r.day),
    totalEur: Number(r.total_eur),
    daysSincePayday: Number(r.days_since_payday),
  }));
}

export type Purchase = { date: string; categoryId: string; amountEur: number };

/**
 * The largest card purchases over a month range, optionally in one category. Purchases only, so
 * rent and bills, which are the same every month, do not crowd them out.
 */
export async function getLargestPurchases(
  db: DuckDBConnection,
  customerId: string,
  filter: { categoryId: string | null; fromMonth: string; toMonth: string; limit: number },
): Promise<{ purchases: Purchase[]; purchaseCount: number }> {
  const params = {
    customerId,
    categoryId: filter.categoryId,
    fromMonth: filter.fromMonth,
    toMonth: filter.toMonth,
  };
  const where = `customer_id = $customerId AND month BETWEEN $fromMonth AND $toMonth
       AND transaction_type = 'purchase' AND basket IN (${SPENDING_BASKETS_SQL})
       AND (CAST($categoryId AS VARCHAR) IS NULL OR category_id = $categoryId)`;
  const rows = await queryRows(
    db,
    `SELECT CAST(tx_date AS VARCHAR) AS tx_date, category_id, abs_amount_eur FROM transactions
     WHERE ${where}
     ORDER BY abs_amount_eur DESC, tx_timestamp LIMIT ${filter.limit}`,
    params,
  );
  const [count] = await queryRows(
    db,
    `SELECT count(*) AS n FROM transactions WHERE ${where}`,
    params,
  );
  return {
    purchases: rows.map((r) => ({
      date: String(r.tx_date),
      categoryId: String(r.category_id),
      amountEur: Number(r.abs_amount_eur),
    })),
    purchaseCount: Number(count?.n ?? 0),
  };
}
