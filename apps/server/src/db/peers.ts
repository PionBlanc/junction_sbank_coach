import type { DuckDBConnection } from '@duckdb/node-api';
import { queryRows } from './query.ts';

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
