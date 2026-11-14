import { DuckDBInstance } from '@duckdb/node-api';
import { describe, expect, it } from 'vitest';
import { getOverview } from './overview.ts';
import { getPeerComparison } from './peers.ts';

async function fixture() {
  const instance = await DuckDBInstance.create(':memory:');
  const db = await instance.connect();
  await db.run(`
    CREATE TABLE customers AS SELECT * FROM (VALUES ('c1', 23, '18-24')) t(customer_id, age, age_band);
    CREATE TABLE monthly_category AS SELECT * FROM (VALUES
      ('c1', '2026-09', 'salary',         'income',            2000.0, 1),
      ('c1', '2026-09', 'housing',        'mandatory_regular',  500.0, 1),
      ('c1', '2026-09', 'transportation', 'mandatory_regular',  100.0, 4),
      ('c1', '2026-09', 'transportation', 'everyday',            40.0, 1),
      ('c1', '2026-09', 'restaurants',    'everyday',           360.0, 9),
      ('c1', '2026-03', 'restaurants',    'everyday',           240.0, 6)
    ) t(customer_id, month, category_id, basket, total_eur, tx_count);
    CREATE TABLE peer_benchmarks AS SELECT * FROM (VALUES
      ('18-24', 'restaurants',    200.0, 270.0),
      ('18-24', 'transportation', 120.0, 170.0),
      ('35-44', 'restaurants',    190.0, 300.0)
    ) t(age_band, category_id, median_monthly_eur, p75_monthly_eur);
  `);
  return db;
}

describe('getPeerComparison', () => {
  it('compares the 12-month average with the same age band', async () => {
    const peers = await getPeerComparison(await fixture(), 'c1');
    expect(peers.ageBand).toBe('18-24');
    expect(peers.categories).toEqual([
      // (360 + 240) / 12
      {
        categoryId: 'restaurants',
        youMonthlyAvgEur: 50,
        peerMedianMonthlyEur: 200,
        peerP75MonthlyEur: 270,
      },
      // Taxis count towards the category: (100 + 40) / 12
      {
        categoryId: 'transportation',
        youMonthlyAvgEur: 11.67,
        peerMedianMonthlyEur: 120,
        peerP75MonthlyEur: 170,
      },
    ]);
  });
});

describe('getOverview', () => {
  it('splits the month into baskets and shows taxis as their own everyday row', async () => {
    const overview = await getOverview(await fixture(), 'c1', '2026-09');
    expect(overview).toMatchObject({ incomeEur: 2000, spendingEur: 1000, leftEur: 1000 });
    expect(overview.baskets.map((b) => [b.basket, b.totalEur, b.sharePct])).toEqual([
      ['mandatory_regular', 600, 0.6],
      ['mandatory_irregular', 0, 0],
      ['everyday', 400, 0.4],
    ]);
    expect(overview.baskets[2]?.categories).toEqual([
      {
        categoryId: 'restaurants',
        label: 'Restaurants & cafés',
        totalEur: 360,
        youMonthlyAvgEur: 50,
        peerMedianMonthlyEur: 200,
      },
      {
        categoryId: 'transportation',
        label: 'Taxis',
        totalEur: 40,
        youMonthlyAvgEur: null,
        peerMedianMonthlyEur: null,
      },
    ]);
    // The pie chart counts taxis towards transportation: 100 + 40.
    expect(overview.categorySplit.map((s) => [s.label, s.totalEur, s.sharePct])).toEqual([
      ['Housing', 500, 0.5],
      ['Restaurants & cafés', 360, 0.36],
      ['Transportation', 140, 0.14],
    ]);
  });
});
