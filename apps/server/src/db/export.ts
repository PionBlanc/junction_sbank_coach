import type { DuckDBConnection } from '@duckdb/node-api';
import { queryRows } from './query.ts';

export type ExportTransaction = {
  date: string;
  categoryId: string;
  basket: string;
  /** Signed: money in is positive, money out negative. */
  amountEur: number;
  balanceAfterEur: number;
};

/** Every transaction in the date range, oldest first. Merchants and MCC codes are left out: they are random in this dataset. */
export async function getExportTransactions(
  db: DuckDBConnection,
  customerId: string,
  fromDate: string,
  toDate: string,
): Promise<ExportTransaction[]> {
  const rows = await queryRows(
    db,
    `SELECT CAST(tx_date AS VARCHAR) AS tx_date, category_id, basket, amount_eur, balance_after_eur
     FROM transactions
     WHERE customer_id = $customerId
       AND tx_date BETWEEN CAST($fromDate AS DATE) AND CAST($toDate AS DATE)
     ORDER BY tx_timestamp`,
    { customerId, fromDate, toDate },
  );
  return rows.map((r) => ({
    date: String(r.tx_date),
    categoryId: String(r.category_id),
    basket: String(r.basket),
    amountEur: Number(r.amount_eur),
    balanceAfterEur: Number(r.balance_after_eur),
  }));
}
