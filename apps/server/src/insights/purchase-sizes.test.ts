import { DuckDBInstance } from '@duckdb/node-api';
import { describe, expect, it } from 'vitest';
import { getPurchaseSizes } from './purchase-sizes.ts';

async function fixture() {
  const instance = await DuckDBInstance.create(':memory:');
  const db = await instance.connect();
  await db.run(`
    CREATE TABLE transactions AS SELECT * FROM (VALUES
      ('c1', '2026-09', 'housing',        'mandatory_regular', 'housing_payment', 900.0),
      ('c1', '2026-09', 'restaurants',    'everyday',          'purchase',         10.0),
      ('c1', '2026-08', 'restaurants',    'everyday',          'purchase',         20.0),
      ('c1', '2026-07', 'restaurants',    'everyday',          'purchase',         90.0),
      ('c1', '2026-09', 'transportation', 'everyday',          'purchase',         30.0),
      ('c1', '2026-09', 'transportation', 'mandatory_regular', 'purchase',         50.0),
      ('c1', '2026-09', 'travel',         'everyday',          'purchase',        600.0),
      ('c1', '2025-09', 'restaurants',    'everyday',          'purchase',        999.0)
    ) t(customer_id, month, category_id, basket, transaction_type, abs_amount_eur);
  `);
  return db;
}

describe('getPurchaseSizes', () => {
  it('gives the median purchase per category over the last 12 months, bills left out', async () => {
    const result = await getPurchaseSizes(await fixture(), 'c1');
    // Taxis (everyday) and other transportation count as one category.
    expect(result.categories.map((c) => [c.label, c.purchaseCount, c.typicalPurchaseEur])).toEqual([
      ['Travel', 1, 600],
      ['Transportation', 2, 40],
      ['Restaurants & cafés', 3, 20],
    ]);
    expect(result.categories[2]?.purchasesPerMonth).toBe(0.25);
  });
});
