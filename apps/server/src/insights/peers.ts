import type { DuckDBConnection } from '@duckdb/node-api';
import type { PeerComparison } from '@coach/shared';
import { getCustomer } from '../db/customers.ts';
import { getPeerBenchmarks } from '../db/peers.ts';
import { getCategoryTotals } from '../db/spending.ts';
import { LAST_MONTH, MONTHS_IN_YEAR, YEAR_FROM_MONTH, isCategoryId, round2 } from './helpers.ts';

/**
 * The user's 12-month monthly average per spending category next to people in the same age band.
 * A 12-month average, because the peer figures are long-run averages too (see docs/data.md).
 */
export async function getPeerComparison(
  db: DuckDBConnection,
  customerId: string,
): Promise<PeerComparison> {
  const customer = await getCustomer(db, customerId);
  const totals = await getCategoryTotals(db, customerId, YEAR_FROM_MONTH, LAST_MONTH);
  const benchmarks = await getPeerBenchmarks(db, customer.ageBand);

  const categories = [];
  for (const benchmark of benchmarks) {
    if (!isCategoryId(benchmark.categoryId)) continue;
    categories.push({
      categoryId: benchmark.categoryId,
      youMonthlyAvgEur: round2((totals.get(benchmark.categoryId) ?? 0) / MONTHS_IN_YEAR),
      peerMedianMonthlyEur: benchmark.medianMonthlyEur,
      peerP75MonthlyEur: benchmark.p75MonthlyEur,
    });
  }
  return { ageBand: customer.ageBand, categories };
}
