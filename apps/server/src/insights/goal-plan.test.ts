import { DuckDBInstance } from '@duckdb/node-api';
import type { Action } from '@coach/shared';
import { describe, expect, it } from 'vitest';
import { getGoalPlan, pickGoalIdeas } from './goal-plan.ts';

/** The balance grows from 1 000 € to 7 000 € over the 12 months: 500 € a month. */
async function fixture() {
  const instance = await DuckDBInstance.create(':memory:');
  const db = await instance.connect();
  await db.run(`
    CREATE TABLE transactions AS SELECT
      customer_id, CAST(tx_date AS DATE) AS tx_date, CAST(tx_timestamp AS TIMESTAMP) AS tx_timestamp,
      amount_eur, balance_after_eur
    FROM (VALUES
      ('c1', '2025-09-15', '2025-09-15 12:00:00', 1000.0, 1000.0),
      ('c1', '2026-09-15', '2026-09-15 12:00:00', 6000.0, 7000.0),
      ('c2', '2025-09-15', '2025-09-15 12:00:00', 2000.0, 2000.0),
      ('c2', '2026-09-15', '2026-09-15 12:00:00', -800.0, 1200.0)
    ) t(customer_id, tx_date, tx_timestamp, amount_eur, balance_after_eur);
  `);
  return db;
}

function action(id: string, savingPerMonthEur: number): Action {
  return {
    id,
    title: `Idea ${id}`,
    explanation: '',
    emoji: '💡',
    savingPerMonthEur,
    savingPerWeekEur: 0,
    categoryId: 'restaurants',
    inputs: {},
  };
}

describe('pickGoalIdeas', () => {
  const actions = [action('a', 100), action('b', 80), action('c', 50), action('d', 20)];

  it('uses the ideas the customer swiped right on', () => {
    const picked = pickGoalIdeas(actions, ['d']);
    expect(picked).toEqual({
      ideas: [{ title: 'Idea d', savingPerMonthEur: 20 }],
      ideasArePicked: true,
    });
  });

  it('falls back to the top three', () => {
    const picked = pickGoalIdeas(actions, []);
    expect(picked.ideas.map((i) => i.savingPerMonthEur)).toEqual([100, 80, 50]);
    expect(picked.ideasArePicked).toBe(false);
  });
});

describe('getGoalPlan', () => {
  const ideas = { ideas: [{ title: 'Idea a', savingPerMonthEur: 100 }], ideasArePicked: true };

  it('counts the months at the balance pace and with the ideas on top', async () => {
    const plan = await getGoalPlan(await fixture(), 'c1', { goalEur: 3000 }, ideas);
    expect(plan).toMatchObject({
      monthlyPaceEur: 500,
      balanceEur: 7000,
      monthsAtPace: 6,
      ideasPerMonthEur: 100,
      monthsWithIdeas: 5,
    });
    // From now until the slower line reaches the goal, never past it.
    expect(plan.path).toHaveLength(7);
    expect(plan.path[0]).toEqual({ month: '2026-09', atPaceEur: 0, withIdeasEur: 0 });
    expect(plan.path.at(-1)).toEqual({ month: '2027-03', atPaceEur: 3000, withIdeasEur: 3000 });
  });

  it('has no months at pace when the balance shrank, but the ideas can still get there', async () => {
    const plan = await getGoalPlan(await fixture(), 'c2', { goalEur: 3000 }, ideas);
    expect(plan.monthlyPaceEur).toBe(-66.67);
    expect(plan.monthsAtPace).toBeNull();
    expect(plan.monthsWithIdeas).toBe(91);
    // A far-off goal stops the chart at three years.
    expect(plan.path).toHaveLength(37);
  });

  it('has no path when nothing gets there', async () => {
    const none = { ideas: [], ideasArePicked: false };
    const plan = await getGoalPlan(await fixture(), 'c2', { goalEur: 3000 }, none);
    expect(plan.monthsWithIdeas).toBeNull();
    expect(plan.path).toEqual([]);
  });
});
