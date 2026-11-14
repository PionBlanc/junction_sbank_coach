import { DuckDBInstance } from '@duckdb/node-api';
import { describe, expect, it } from 'vitest';
import { getCategoryChanges } from './category-changes.ts';

async function fixture() {
  const instance = await DuckDBInstance.create(':memory:');
  const db = await instance.connect();
  await db.run(`
    CREATE TABLE monthly_category AS SELECT * FROM (VALUES
      ('c1', '2026-09', 'restaurants',    'everyday',          300.0),
      ('c1', '2025-12', 'restaurants',    'everyday',         1200.0),
      ('c1', '2026-09', 'groceries',      'mandatory_regular', 350.0),
      ('c1', '2026-03', 'groceries',      'mandatory_regular', 4800.0),
      ('c1', '2026-09', 'transportation', 'everyday',           25.0),
      ('c1', '2026-09', 'transportation', 'mandatory_regular',  75.0),
      ('c1', '2025-06', 'travel',         'everyday',         9999.0),
      ('c1', '2026-09', 'salary',         'income',           2000.0)
    ) t(customer_id, month, category_id, basket, total_eur);
  `);
  return db;
}

describe('getCategoryChanges', () => {
  it('puts the month next to the average of the 12 months before, biggest change first', async () => {
    const result = await getCategoryChanges(await fixture(), 'c1', '2026-09');
    expect(result).toMatchObject({
      month: '2026-09',
      averageFromMonth: '2025-09',
      averageToMonth: '2026-08',
      monthTotalEur: 750,
      averageTotalEur: 500,
      changeEur: 250,
    });
    // Groceries 350 against 4800 / 12 = 400. Restaurants 300 against 1200 / 12 = 100.
    // Taxis count towards transportation, and months outside the 12 never count.
    expect(result.categories.map((c) => [c.label, c.monthEur, c.averageEur, c.changeEur])).toEqual([
      ['Restaurants & cafés', 300, 100, 200],
      ['Transportation', 100, 0, 100],
      ['Groceries', 350, 400, -50],
    ]);
    expect(result.categories[1]?.changePct).toBeNull();
  });
});
