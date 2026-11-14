import { DuckDBInstance } from '@duckdb/node-api';
import { describe, expect, it } from 'vitest';
import { getYearOverYear } from './year-over-year.ts';

async function fixture() {
  const instance = await DuckDBInstance.create(':memory:');
  const db = await instance.connect();
  await db.run(`
    CREATE TABLE transactions AS SELECT * FROM (VALUES
      ('c1', '2024-10', 'restaurants',  NULL, 'everyday',          100.0),
      ('c1', '2025-10', 'restaurants',  NULL, 'everyday',          150.0),
      ('c1', '2025-10', 'groceries',    NULL, 'mandatory_regular',  50.0),
      ('c1', '2025-09', 'restaurants',  NULL, 'everyday',           70.0),
      ('c1', '2026-09', 'salary',       NULL, 'income',           2000.0)
    ) t(customer_id, month, category_id, subcategory_id, basket, abs_amount_eur);
  `);
  return db;
}

describe('getYearOverYear', () => {
  it('puts each month of the last 12 next to the same month a year earlier', async () => {
    const result = await getYearOverYear(await fixture(), 'c1');
    expect(result.months).toHaveLength(12);
    expect(result.months[0]).toEqual({
      month: '2025-10',
      lastYearMonth: '2024-10',
      thisYearEur: 200,
      lastYearEur: 100,
      changeEur: 100,
    });
    // 2025-09 belongs to last year's September, and income never counts as spending.
    expect(result.months[11]).toMatchObject({ month: '2026-09', thisYearEur: 0, lastYearEur: 70 });
    expect(result).toMatchObject({
      label: 'All spending',
      thisYearTotalEur: 200,
      lastYearTotalEur: 170,
      changeEur: 30,
      changePct: 0.18,
    });
  });

  it('can look at one category', async () => {
    const result = await getYearOverYear(await fixture(), 'c1', 'restaurants');
    expect(result).toMatchObject({ label: 'Restaurants & cafés', thisYearTotalEur: 150 });
  });
});
