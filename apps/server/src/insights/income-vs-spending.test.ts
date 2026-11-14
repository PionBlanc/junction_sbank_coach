import { DuckDBInstance } from '@duckdb/node-api';
import { describe, expect, it } from 'vitest';
import { getIncomeVsSpending } from './income-vs-spending.ts';

async function fixture() {
  const instance = await DuckDBInstance.create(':memory:');
  const db = await instance.connect();
  await db.run(`
    CREATE TABLE monthly_category AS SELECT * FROM (VALUES
      ('c1', '2026-08', 'salary',       'income',            2000.0, 1),
      ('c1', '2026-08', 'groceries',    'mandatory_regular',  500.0, 9),
      ('c1', '2026-08', 'salary_sweep', 'transfer',          1000.0, 1),
      ('c1', '2026-09', 'salary',       'income',            2000.0, 1),
      ('c1', '2026-09', 'restaurants',  'everyday',          2500.0, 9),
      ('c1', '2024-09', 'salary',       'income',            9999.0, 1)
    ) t(customer_id, month, category_id, basket, total_eur, tx_count);
  `);
  return db;
}

describe('getIncomeVsSpending', () => {
  it('gives each month of the last 12 with what was left, leaving out transfers', async () => {
    const result = await getIncomeVsSpending(await fixture(), 'c1');
    expect(result.months).toEqual([
      { month: '2026-08', incomeEur: 2000, spendingEur: 500, leftEur: 1500 },
      { month: '2026-09', incomeEur: 2000, spendingEur: 2500, leftEur: -500 },
    ]);
    expect(result).toMatchObject({
      fromMonth: '2025-10',
      toMonth: '2026-09',
      totalIncomeEur: 4000,
      totalSpendingEur: 3000,
      totalLeftEur: 1000,
      monthsOverspent: 1,
    });
  });
});
