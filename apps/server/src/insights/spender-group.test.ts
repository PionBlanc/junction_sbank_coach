import { DuckDBInstance } from '@duckdb/node-api';
import { describe, expect, it } from 'vitest';
import { getSpenderGroup, placeInGroup } from './spender-group.ts';

function row(categoryId: string, monthlyAvgEur: number) {
  return {
    customerId: 'c1',
    categoryId,
    monthlyAvgEur,
    peerMedianMonthlyEur: 100,
    peerP75MonthlyEur: 150,
  };
}

describe('placeInGroup', () => {
  it('picks the category furthest above the median among those above the top quarter', () => {
    const placement = placeInGroup([
      row('restaurants', 200),
      row('travel', 300),
      row('lifestyle', 120),
    ]);
    expect(placement.groupId).toBe('window_seat');
  });

  it('is balanced when nothing is above the top quarter', () => {
    expect(placeInGroup([row('restaurants', 150), row('travel', 90)]).groupId).toBe('balanced');
    expect(placeInGroup([]).groupId).toBe('balanced');
  });
});

async function fixture() {
  const instance = await DuckDBInstance.create(':memory:');
  const db = await instance.connect();
  await db.run(`
    CREATE TABLE customers AS SELECT * FROM (VALUES
      ('c1', 23, '18-24'), ('c2', 23, '18-24'), ('c3', 23, '18-24'), ('c4', 23, '18-24')
    ) t(customer_id, age, age_band);
    CREATE TABLE monthly_category AS SELECT * FROM (VALUES
      ('c1', '2026-09', 'restaurants',    'everyday',          3600.0, 30),
      ('c2', '2026-09', 'restaurants',    'everyday',          3000.0, 30),
      ('c3', '2026-09', 'restaurants',    'everyday',           600.0, 30),
      ('c3', '2026-09', 'transportation', 'mandatory_regular', 1200.0, 30),
      ('c3', '2026-09', 'transportation', 'everyday',          1200.0, 2),
      ('c4', '2026-09', 'salary_sweep',   'transfer',          2000.0, 1)
    ) t(customer_id, month, category_id, basket, total_eur, tx_count);
    CREATE TABLE peer_benchmarks AS SELECT * FROM (VALUES
      ('18-24', 'restaurants',    100.0, 150.0),
      ('18-24', 'transportation', 100.0, 150.0)
    ) t(age_band, category_id, median_monthly_eur, p75_monthly_eur);
  `);
  return db;
}

describe('getSpenderGroup', () => {
  it('names the group and counts who shares it, leaving out salary-sweep customers', async () => {
    const db = await fixture();
    // 3600 / 12 = 300 a month in restaurants, three times the median.
    expect(await getSpenderGroup(db, 'c1')).toEqual({
      groupId: 'foodie',
      label: 'Foodie at heart',
      meaning: expect.any(String),
      categoryId: 'restaurants',
      youMonthlyAvgEur: 300,
      peerMedianMonthlyEur: 100,
      customersInGroup: 2,
      totalCustomers: 3,
      sharePct: 0.67,
    });
    // Both transportation rows count: (1200 + 1200) / 12 = 200 a month.
    expect(await getSpenderGroup(db, 'c3')).toMatchObject({
      groupId: 'door_to_door',
      youMonthlyAvgEur: 200,
      customersInGroup: 1,
    });
  });
});
