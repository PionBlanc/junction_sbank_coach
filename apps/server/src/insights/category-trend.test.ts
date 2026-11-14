import { DuckDBInstance } from '@duckdb/node-api';
import { describe, expect, it } from 'vitest';
import { getCategoryTrend } from './category-trend.ts';

async function fixture() {
  const instance = await DuckDBInstance.create(':memory:');
  const db = await instance.connect();
  await db.run(`
    CREATE TABLE monthly_category AS SELECT * FROM (VALUES
      ('c1', '2026-09', 'salary',         'income',              3000.0),
      ('c1', '2026-09', 'housing',        'mandatory_regular',    900.0),
      ('c1', '2026-09', 'groceries',      'mandatory_regular',    300.0),
      ('c1', '2026-09', 'transportation', 'mandatory_regular',    100.0),
      ('c1', '2026-09', 'transportation', 'everyday',              50.0),
      ('c1', '2026-09', 'restaurants',    'everyday',             120.0),
      ('c1', '2026-09', 'travel',         'everyday',              40.0),
      ('c1', '2026-07', 'housing',        'mandatory_regular',    900.0),
      ('c1', '2026-07', 'health',         'mandatory_irregular',   30.0),
      ('c1', '2026-06', 'housing',        'mandatory_regular',    999.0)
    ) t(customer_id, month, category_id, basket, total_eur);
  `);
  return db;
}

describe('getCategoryTrend', () => {
  it('splits each month into the four biggest categories and the rest', async () => {
    const trend = await getCategoryTrend(await fixture(), 'c1', '2026-07', '2026-09');
    // Income and months outside the range never count. Taxis count towards transportation.
    expect(trend.series.map((s) => [s.label, s.totalEur])).toEqual([
      ['Housing', 1800],
      ['Groceries', 300],
      ['Transportation', 150],
      ['Restaurants & cafés', 120],
      ['Other', 70],
    ]);
    expect(trend.months).toEqual([
      { month: '2026-07', totalEur: 930, valuesEur: [900, 0, 0, 0, 30] },
      { month: '2026-08', totalEur: 0, valuesEur: [0, 0, 0, 0, 0] },
      { month: '2026-09', totalEur: 1510, valuesEur: [900, 300, 150, 120, 40] },
    ]);
  });
});
