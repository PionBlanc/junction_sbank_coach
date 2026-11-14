import type { DuckDBConnection } from '@duckdb/node-api';
import { queryRows } from './query.ts';

export type DayBalance = { date: string; balanceEur: number };

/**
 * The balance at the end of every calendar day in the range. A day without transactions keeps the
 * last balance before it. Days before the customer's first transaction get the opening balance.
 */
export async function getDailyBalances(
  db: DuckDBConnection,
  customerId: string,
  fromDate: string,
  toDate: string,
): Promise<DayBalance[]> {
  const rows = await queryRows(
    db,
    `WITH end_of_day AS (
       SELECT tx_date, arg_max(balance_after_eur, tx_timestamp) AS balance_eur
       FROM transactions
       WHERE customer_id = $customerId AND tx_date <= CAST($toDate AS DATE)
       GROUP BY tx_date
     ),
     opening AS (
       SELECT arg_min(balance_after_eur - amount_eur, tx_timestamp) AS balance_eur
       FROM transactions WHERE customer_id = $customerId
     ),
     calendar AS (
       SELECT CAST(d AS DATE) AS day
       FROM range(CAST($fromDate AS DATE), CAST($toDate AS DATE) + 1, INTERVAL 1 DAY) t(d)
     )
     SELECT CAST(c.day AS VARCHAR) AS day,
            coalesce(e.balance_eur, (SELECT balance_eur FROM opening)) AS balance_eur
     FROM calendar c
     ASOF LEFT JOIN end_of_day e ON c.day >= e.tx_date
     ORDER BY c.day`,
    { customerId, fromDate, toDate },
  );
  return rows.map((r) => ({ date: String(r.day), balanceEur: Number(r.balance_eur ?? 0) }));
}
