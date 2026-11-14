import { DuckDBInstance } from '@duckdb/node-api';
import { describe, expect, it } from 'vitest';
import { getLargestPurchases } from './largest-purchases.ts';

async function fixture() {
  const instance = await DuckDBInstance.create(':memory:');
  const db = await instance.connect();
  await db.run(`
    CREATE TABLE transactions AS SELECT
      customer_id, CAST(tx_date AS DATE) AS tx_date, CAST(tx_timestamp AS TIMESTAMP) AS tx_timestamp,
      month, category_id, basket, transaction_type, abs_amount_eur
    FROM (VALUES
      ('c1', '2026-09-03', '2026-09-03 09:00:00', '2026-09', 'housing',     'mandatory_regular', 'housing_payment', 900.0),
      ('c1', '2026-09-05', '2026-09-05 12:00:00', '2026-09', 'travel',      'everyday',          'purchase',        450.0),
      ('c1', '2026-09-06', '2026-09-06 12:00:00', '2026-09', 'restaurants', 'everyday',          'purchase',         40.0),
      ('c1', '2026-08-20', '2026-08-20 12:00:00', '2026-08', 'home_tech',   'mandatory_irregular', 'purchase',      700.0),
      ('c1', '2026-07-01', '2026-07-01 12:00:00', '2026-07', 'lifestyle',   'everyday',          'purchase',       5000.0)
    ) t(customer_id, tx_date, tx_timestamp, month, category_id, basket, transaction_type, abs_amount_eur);
  `);
  return db;
}

describe('getLargestPurchases', () => {
  it('lists the largest purchases in the range, leaving out rent and bills', async () => {
    const result = await getLargestPurchases(await fixture(), 'c1', {
      fromMonth: '2026-08',
      toMonth: '2026-09',
    });
    expect(result.purchaseCount).toBe(3);
    expect(result.purchases.map((p) => [p.label, p.date, p.amountEur])).toEqual([
      ['Home & tech', '2026-08-20', 700],
      ['Travel', '2026-09-05', 450],
      ['Restaurants & cafés', '2026-09-06', 40],
    ]);
  });

  it('can look at one category', async () => {
    const result = await getLargestPurchases(await fixture(), 'c1', {
      fromMonth: '2026-08',
      toMonth: '2026-09',
      categoryId: 'travel',
    });
    expect(result).toMatchObject({ label: 'Travel', purchaseCount: 1 });
  });
});
