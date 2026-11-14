import { DuckDBInstance } from '@duckdb/node-api';
import { describe, expect, it } from 'vitest';
import { getInvestments } from './investments.ts';

async function fixture() {
  const instance = await DuckDBInstance.create(':memory:');
  const db = await instance.connect();
  await db.run(`
    CREATE TABLE monthly_category AS SELECT * FROM (VALUES
      ('c1', '2026-09', 'salary',                'income',              2000.0),
      ('c1', '2026-08', 'salary',                'income',              2000.0),
      ('c1', '2026-09', 'investment_deposit',    'savings_investments',  200.0),
      ('c1', '2026-08', 'investment_deposit',    'savings_investments',  200.0),
      ('c1', '2026-08', 'investment_withdrawal', 'savings_investments',  150.0),
      ('c1', '2026-09', 'groceries',             'mandatory_regular',    300.0),
      ('c1', '2024-12', 'investment_deposit',    'savings_investments',  500.0),
      ('c2', '2026-09', 'salary',                'income',              2000.0)
    ) t(customer_id, month, category_id, basket, total_eur);
  `);
  return db;
}

describe('getInvestments', () => {
  it('gives the last 12 months, and totals for the year and since the data starts', async () => {
    const result = await getInvestments(await fixture(), 'c1');
    expect(result.months).toHaveLength(12);
    expect(result.months.at(-2)).toEqual({
      month: '2026-08',
      depositedEur: 200,
      withdrawnEur: 150,
    });
    expect(result).toMatchObject({
      depositedEur: 400,
      withdrawnEur: 150,
      netEur: 250,
      monthsWithDeposit: 2,
      shareOfIncomePct: 0.1,
      sinceMonth: '2024-10',
      allTimeDepositedEur: 900,
      allTimeWithdrawnEur: 150,
    });
  });

  it('is all zeros for a customer who does not invest', async () => {
    const result = await getInvestments(await fixture(), 'c2');
    expect(result).toMatchObject({ depositedEur: 0, monthsWithDeposit: 0, allTimeDepositedEur: 0 });
  });
});
