import { DuckDBInstance } from '@duckdb/node-api';
import { describe, expect, it } from 'vitest';
import { getBalanceHistory } from './balance-history.ts';

async function fixture() {
  const instance = await DuckDBInstance.create(':memory:');
  const db = await instance.connect();
  await db.run(`
    CREATE TABLE transactions AS SELECT
      customer_id, CAST(tx_date AS DATE) AS tx_date, CAST(tx_timestamp AS TIMESTAMP) AS tx_timestamp,
      amount_eur, balance_after_eur
    FROM (VALUES
      ('c1', '2026-08-30', '2026-08-30 10:00:00',  -50.0,  100.0),
      ('c1', '2026-09-02', '2026-09-02 09:00:00', -120.0,  -20.0),
      ('c1', '2026-09-02', '2026-09-02 18:00:00',  -30.0,  -50.0),
      ('c1', '2026-09-15', '2026-09-15 08:00:00', 2000.0, 1950.0),
      ('c2', '2026-09-10', '2026-09-10 08:00:00',  -10.0,  490.0)
    ) t(customer_id, tx_date, tx_timestamp, amount_eur, balance_after_eur);
  `);
  return db;
}

describe('getBalanceHistory', () => {
  it('gives every day the balance after its last transaction, carried over quiet days', async () => {
    const history = await getBalanceHistory(await fixture(), 'c1', '2026-09', '2026-09');
    expect(history.days).toHaveLength(30);
    expect(history.days.slice(0, 3)).toEqual([
      { date: '2026-09-01', balanceEur: 100 },
      { date: '2026-09-02', balanceEur: -50 },
      { date: '2026-09-03', balanceEur: -50 },
    ]);
    expect(history).toMatchObject({
      fromDate: '2026-09-01',
      toDate: '2026-09-30',
      startEur: 100,
      endEur: 1950,
      changeEur: 1850,
      lowestEur: -50,
      lowestDate: '2026-09-02',
      // 2 to 14 September.
      daysBelowZero: 13,
    });
  });

  it('uses the opening balance before the first transaction', async () => {
    const history = await getBalanceHistory(await fixture(), 'c2', '2026-09', '2026-09');
    expect(history.days[0]).toEqual({ date: '2026-09-01', balanceEur: 500 });
    expect(history.days[9]).toEqual({ date: '2026-09-10', balanceEur: 490 });
  });
});
