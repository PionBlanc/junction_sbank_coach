import type { DuckDBConnection } from '@duckdb/node-api';
import type { BalanceHistory } from '@coach/shared';
import { getDailyBalances } from '../db/balance.ts';
import { round2 } from './helpers.ts';

/** "2026-02" → "2026-02-28". */
function lastDayOfMonth(month: string): string {
  const [year = 0, monthNumber = 1] = month.split('-').map(Number);
  return new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10);
}

/** The balance at the end of every day from the first of fromMonth to the end of toMonth. */
export async function getBalanceHistory(
  db: DuckDBConnection,
  customerId: string,
  fromMonth: string,
  toMonth: string,
): Promise<BalanceHistory> {
  const fromDate = `${fromMonth}-01`;
  const toDate = lastDayOfMonth(toMonth);
  const rows = await getDailyBalances(db, customerId, fromDate, toDate);
  const days = rows.map((r) => ({ date: r.date, balanceEur: round2(r.balanceEur) }));

  const startEur = days[0]?.balanceEur ?? 0;
  const endEur = days.at(-1)?.balanceEur ?? 0;
  let lowest = days[0] ?? { date: fromDate, balanceEur: 0 };
  for (const day of days) {
    if (day.balanceEur < lowest.balanceEur) lowest = day;
  }

  return {
    fromDate,
    toDate,
    days,
    startEur,
    endEur,
    changeEur: round2(endEur - startEur),
    lowestEur: lowest.balanceEur,
    lowestDate: lowest.date,
    daysBelowZero: days.filter((d) => d.balanceEur < 0).length,
  };
}
