import { DuckDBInstance } from '@duckdb/node-api';
import { describe, expect, it } from 'vitest';
import { getCategorySplit } from './category-split.ts';

async function fixture() {
  const instance = await DuckDBInstance.create(':memory:');
  const db = await instance.connect();
  await db.run(`
    CREATE TABLE monthly_category AS SELECT * FROM (VALUES
      ('c1', '2026-09', 'salary',         'income',            2000.0),
      ('c1', '2026-09', 'housing',        'mandatory_regular',  500.0),
      ('c1', '2026-08', 'housing',        'mandatory_regular',  500.0),
      ('c1', '2026-09', 'groceries',      'mandatory_regular',  400.0),
      ('c1', '2026-09', 'transportation', 'mandatory_regular',  100.0),
      ('c1', '2026-09', 'transportation', 'everyday',           200.0),
      ('c1', '2026-09', 'restaurants',    'everyday',           200.0),
      ('c1', '2026-09', 'travel',         'everyday',            50.0),
      ('c1', '2026-09', 'health',         'mandatory_irregular', 50.0),
      ('c1', '2026-07', 'restaurants',    'everyday',           999.0)
    ) t(customer_id, month, category_id, basket, total_eur);
  `);
  return db;
}

describe('getCategorySplit', () => {
  it('shows the four biggest categories and groups the rest as other', async () => {
    const split = await getCategorySplit(await fixture(), 'c1', '2026-08', '2026-09');
    // Income and months outside the range never count. Taxis count towards transportation.
    expect(split.totalEur).toBe(2000);
    expect(split.slices.map((s) => [s.label, s.totalEur, s.sharePct])).toEqual([
      ['Housing', 1000, 0.5],
      ['Groceries', 400, 0.2],
      ['Transportation', 300, 0.15],
      ['Restaurants & cafés', 200, 0.1],
      ['Other', 100, 0.05],
    ]);
    expect(split.slices.at(-1)?.categoryId).toBeNull();
  });

  it('is empty when there is no spending in the range', async () => {
    const split = await getCategorySplit(await fixture(), 'c1', '2025-01', '2025-02');
    expect(split).toEqual({ fromMonth: '2025-01', toMonth: '2025-02', totalEur: 0, slices: [] });
  });
});
