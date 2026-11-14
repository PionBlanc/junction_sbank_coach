import type { DuckDBConnection } from '@duckdb/node-api';
import { queryRows } from './query.ts';

export type SafeToSpendInputs = {
  balanceEur: number;
  /** Most common day of the month for salary. Null when there is no salary in the period. */
  paydayDayOfMonth: number | null;
  /** Typical day and amount of the monthly housing payment, from the last 3. Null without housing. */
  housingDayOfMonth: number | null;
  housingEur: number;
  /** Utility bills paid between utilitiesFromMonth and utilitiesToMonth. */
  utilitiesTotalEur: number;
};

export type SafeToSpendPeriod = {
  today: string;
  salaryFromDate: string;
  utilitiesFromMonth: string;
  utilitiesToMonth: string;
};

export async function getSafeToSpendInputs(
  db: DuckDBConnection,
  customerId: string,
  period: SafeToSpendPeriod,
): Promise<SafeToSpendInputs> {
  const rows = await queryRows(
    db,
    `SELECT
       (SELECT arg_max(balance_after_eur, tx_timestamp) FROM transactions
        WHERE customer_id = $customerId AND tx_date <= CAST($today AS DATE)) AS balance_eur,
       (SELECT mode(day(tx_date)) FROM transactions
        WHERE customer_id = $customerId AND category_id = 'salary'
          AND tx_date BETWEEN CAST($salaryFromDate AS DATE) AND CAST($today AS DATE)) AS payday_dom,
       (SELECT CAST(median(day(tx_date)) AS INTEGER) FROM (
          SELECT tx_date FROM transactions
          WHERE customer_id = $customerId AND category_id = 'housing'
            AND tx_date <= CAST($today AS DATE)
          ORDER BY tx_date DESC LIMIT 3)) AS housing_dom,
       (SELECT round(avg(abs_amount_eur), 2) FROM (
          SELECT abs_amount_eur FROM transactions
          WHERE customer_id = $customerId AND category_id = 'housing'
            AND tx_date <= CAST($today AS DATE)
          ORDER BY tx_date DESC LIMIT 3)) AS housing_eur,
       (SELECT sum(total_eur) FROM monthly_category
        WHERE customer_id = $customerId AND category_id = 'utilities'
          AND month BETWEEN $utilitiesFromMonth AND $utilitiesToMonth) AS utilities_total_eur`,
    { customerId, ...period },
  );
  const row = rows[0] ?? {};
  return {
    balanceEur: Number(row.balance_eur ?? 0),
    paydayDayOfMonth: row.payday_dom == null ? null : Number(row.payday_dom),
    housingDayOfMonth: row.housing_dom == null ? null : Number(row.housing_dom),
    housingEur: Number(row.housing_eur ?? 0),
    utilitiesTotalEur: Number(row.utilities_total_eur ?? 0),
  };
}
