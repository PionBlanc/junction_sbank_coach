import { DuckDBInstance } from '@duckdb/node-api';
import { describe, expect, it } from 'vitest';
import { getBasketTrend } from './basket-trend.ts';

async function fixture() {
  const instance = await DuckDBInstance.create(':memory:');
  const db = await instance.connect();
  await db.run(`
    CREATE TABLE monthly_category AS SELECT * FROM (VALUES
      ('c1', '2026-09', 'salary',      'income',              3000.0),
      ('c1', '2026-09', 'housing',     'mandatory_regular',    900.0),
      ('c1', '2026-09', 'groceries',   'mandatory_regular',    300.0),
      ('c1', '2026-09', 'restaurants', 'everyday',             120.0),
      ('c1', '2026-08', 'housing',     'mandatory_regular',    900.0),
      ('c1', '2026-08', 'health',      'mandatory_irregular',  240.0),
      ('c1', '2025-09', 'housing',     'mandatory_regular',    999.0)
    ) t(customer_id, month, category_id, basket, total_eur);
  `);
  return db;
}

describe('getBasketTrend', () => {
  it('gives every one of the last 12 months, with 0 where there was no spending', async () => {
    const trend = await getBasketTrend(await fixture(), 'c1');
    expect(trend.months).toHaveLength(12);
    expect(trend.months[0]).toEqual({
      month: '2025-10',
      mandatoryRegularEur: 0,
      mandatoryIrregularEur: 0,
      everydayEur: 0,
    });
    expect(trend.months.at(-1)).toEqual({
      month: '2026-09',
      mandatoryRegularEur: 1200,
      mandatoryIrregularEur: 0,
      everydayEur: 120,
    });
  });

  it('totals each basket over the year, leaving out income and older months', async () => {
    const trend = await getBasketTrend(await fixture(), 'c1');
    expect(trend.baskets.map((b) => [b.basketId, b.totalEur, b.monthlyAvgEur])).toEqual([
      ['mandatory_regular', 2100, 175],
      ['mandatory_irregular', 240, 20],
      ['everyday', 120, 10],
    ]);
  });
});
