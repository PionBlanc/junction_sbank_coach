import { DuckDBInstance } from '@duckdb/node-api';
import type { PeerComparison, SafeToSpend } from '@coach/shared';
import { describe, expect, it } from 'vitest';
import { getPeerPaydayRatio, getPeerTotalMedian, getPeerWeekendRatio } from '../../db/peers.ts';
import { basketsCard } from './baskets.ts';
import { biggestChangeCard } from './biggest-change.ts';
import { biggestGapCard } from './biggest-gap.ts';
import { importanceOf, rankCards } from './importance.ts';
import { incomeVsSpendingCard } from './income-vs-spending.ts';
import { millionaireCard, yearsToMillion } from './millionaire.ts';
import { paydayCard } from './payday.ts';
import { peerTotalCard } from './peer-total.ts';
import { safeToSpendCard } from './safe-to-spend.ts';
import { periodText } from './text.ts';
import { weekendCard } from './weekend.ts';
import { whereItGoesCard } from './where-it-goes.ts';

describe('importanceOf', () => {
  it('grows with the difference and counts spending more double', () => {
    expect(importanceOf(0)).toBe(0);
    // 50% less: raw 0.5. 50% more: raw 1.0.
    expect(importanceOf(-0.5)).toBe(0.333);
    expect(importanceOf(0.5)).toBe(0.5);
    expect(importanceOf(3)).toBeLessThan(1);
  });
});

describe('rankCards', () => {
  it('puts the most important first and keeps catalogue order on ties', () => {
    const card = (id: string, importance: number) => ({
      id,
      importance,
      topic: id,
      chart: { type: 'stat' as const, valueEur: 0, caption: '' },
      sentence: '',
      questions: ['a', 'b'],
    });
    const ranked = rankCards([card('a', 0.2), card('b', 1), card('c', 0.7), card('d', 1)]);
    expect(ranked.map((c) => c.id)).toEqual(['b', 'd', 'c', 'a']);
  });
});

describe('safeToSpendCard', () => {
  const data: SafeToSpend = {
    balanceEur: 500,
    nextPaydayDate: '2026-10-15',
    daysToPayday: 15,
    upcomingHousingEur: 0,
    upcomingUtilitiesEur: 50,
    availableEur: 450,
    perDayEur: 30,
    safeThisWeekEur: 210,
  };

  it('shows the weekly amount', () => {
    const card = safeToSpendCard(data);
    expect(card.chart).toEqual({ type: 'stat', valueEur: 210, caption: 'this week' });
    expect(card.sentence).toBe('You can spend 210 € this week, 30 € a day until payday.');
  });

  it('says plainly when bills are larger than the balance', () => {
    const card = safeToSpendCard({ ...data, availableEur: -120, perDayEur: 0, safeThisWeekEur: 0 });
    expect(card.sentence).toBe('The bills due before payday are 120 € more than your balance.');
    expect(card.importance).toBe(1);
  });
});

describe('incomeVsSpendingCard', () => {
  it('counts the months where spending was larger than income', () => {
    const card = incomeVsSpendingCard([
      { month: '2026-07', incomeEur: 2000, spendingEur: 2500 },
      { month: '2026-08', incomeEur: 2000, spendingEur: 1800 },
      { month: '2026-09', incomeEur: 2000, spendingEur: 2100 },
    ]);
    expect(card?.sentence).toBe('You spent more than you earned in 2 of the last 3 months.');
    expect(card?.chart).toMatchObject({ type: 'incomeVsSpending' });
  });

  it('says so when income covered every month', () => {
    const card = incomeVsSpendingCard([
      { month: '2026-08', incomeEur: 2000, spendingEur: 1900 },
      { month: '2026-09', incomeEur: 2000, spendingEur: 1500 },
    ]);
    expect(card?.sentence).toBe('Your income covered your spending in all of the last 2 months.');
  });

  it('says so when spending was larger every month', () => {
    const card = incomeVsSpendingCard([
      { month: '2026-08', incomeEur: 2000, spendingEur: 2100 },
      { month: '2026-09', incomeEur: 2000, spendingEur: 2500 },
    ]);
    expect(card?.sentence).toBe(
      'You spent more than you earned in every one of the last 2 months.',
    );
  });

  it('has nothing to say without data', () => {
    expect(incomeVsSpendingCard([])).toBeNull();
  });
});

describe('periodText', () => {
  it('names both years when the period crosses a new year', () => {
    expect(periodText('2026-07', '2026-09')).toBe('Jul–Sep 2026');
    expect(periodText('2025-10', '2026-09')).toBe('Oct 2025–Sep 2026');
  });
});

describe('weekendCard', () => {
  it('compares an average weekend day with an average weekday', () => {
    // 2026-09-05 and 2026-09-06 are a Saturday and a Sunday.
    const card = weekendCard(
      [
        { date: '2026-09-04', totalEur: 40 },
        { date: '2026-09-05', totalEur: 100 },
        { date: '2026-09-06', totalEur: 60 },
        { date: '2026-09-07', totalEur: 60 },
      ],
      1.1,
    );
    expect(card?.sentence).toBe('You spend 60% more on a weekend day.');
    if (card?.chart.type !== 'bars') throw new Error('expected bars');
    expect(card.chart.bars.map((b) => b.valueEur)).toEqual([50, 80]);
    // Ratio 1.6 against the median person's 1.1: 45% more, counted double.
    expect(card.importance).toBe(0.476);
  });
});

describe('paydayCard', () => {
  it('compares the week after payday with the rest of the pay period', () => {
    const days = Array.from({ length: 28 }, (_, i) => ({
      daysSincePayday: i,
      totalEur: i < 7 ? 30 : 20,
    }));
    expect(paydayCard(days, 1.15)?.sentence).toBe('You spend 50% more a day right after payday.');
  });

  it('calls a small difference even', () => {
    const days = Array.from({ length: 28 }, (_, i) => ({ daysSincePayday: i, totalEur: 20 }));
    expect(paydayCard(days, 1.15)?.sentence).toBe('You spend evenly between paydays.');
  });
});

describe('millionaireCard', () => {
  it('counts the whole years until monthly investing reaches a million', () => {
    // 1 000 € a month at 5%: 395 months, so 33 whole years.
    expect(yearsToMillion(1000, 0.05)).toBe(33);
    const card = millionaireCard({ monthlyEur: 1000, source: 'left-over' }, 30, 0.05);
    expect(card?.chart).toEqual({
      type: 'years',
      years: 33,
      caption: 'years to 1 000 000 € at 5% a year',
    });
    expect(card?.sentence).toBe('Investing 1 000 € a month, you are a millionaire at 63.');
  });

  it('stays quiet when there is nothing to invest or it would take too long', () => {
    expect(millionaireCard({ monthlyEur: 0, source: 'actions' }, 30, 0.05)).toBeNull();
    expect(millionaireCard({ monthlyEur: 5, source: 'actions' }, 30, 0.05)).toBeNull();
  });
});

describe('whereItGoesCard', () => {
  it('shows the four biggest categories and groups the rest as other', () => {
    const totals = new Map([
      ['housing', 6000],
      ['groceries', 2400],
      ['restaurants', 1200],
      ['utilities', 1200],
      ['travel', 600],
      ['health', 600],
    ]);
    const card = whereItGoesCard(totals);
    expect(card?.sentence).toBe('Housing takes the biggest share: 50% of your spending.');
    expect(card?.importance).toBe(1);
    if (card?.chart.type !== 'donut') throw new Error('expected a donut');
    expect(card.chart.slices.map((s) => [s.label, s.valueEur, s.sharePct])).toEqual([
      ['Housing', 500, 0.5],
      ['Groceries', 200, 0.2],
      ['Restaurants & cafés', 100, 0.1],
      ['Utilities', 100, 0.1],
      ['Other', 100, 0.1],
    ]);
  });
});

describe('basketsCard', () => {
  it('gives everyday spending as a share of all spending', () => {
    const totals = new Map([
      ['mandatory_regular', 7200],
      ['mandatory_irregular', 1200],
      ['everyday', 3600],
    ]);
    const card = basketsCard(totals);
    expect(card?.sentence).toBe(
      'Everyday spending is 30% of what you spend: the easiest part to change.',
    );
    if (card?.chart.type !== 'bars') throw new Error('expected bars');
    expect(card.chart.bars.map((b) => b.valueEur)).toEqual([600, 100, 300]);
    expect(card.importance).toBe(1);
  });
});

describe('peerTotalCard', () => {
  it('says how much more or less the user spends', () => {
    expect(peerTotalCard(900, 1000)?.sentence).toBe('You spend 10% less than people your age.');
    expect(peerTotalCard(1250, 1000)?.sentence).toBe('You spend 25% more than people your age.');
    expect(peerTotalCard(1030, 1000)?.sentence).toBe(
      'You spend about the same as people your age.',
    );
  });
});

describe('biggestGapCard', () => {
  const peers: PeerComparison = {
    ageBand: '18-24',
    categories: [
      {
        categoryId: 'restaurants',
        youMonthlyAvgEur: 600,
        peerMedianMonthlyEur: 200,
        peerP75MonthlyEur: 270,
      },
      {
        categoryId: 'groceries',
        youMonthlyAvgEur: 500,
        peerMedianMonthlyEur: 300,
        peerP75MonthlyEur: 380,
      },
      // A bigger gap in euros, but less than 20% above peers: skipped.
      {
        categoryId: 'housing',
        youMonthlyAvgEur: 3000,
        peerMedianMonthlyEur: 2600,
        peerP75MonthlyEur: 2900,
      },
    ],
  };

  it('picks the category furthest above peers', () => {
    const card = biggestGapCard(peers);
    expect(card?.topic).toBe('Restaurants & cafés');
    expect(card?.sentence).toBe(
      'You spend 600 € a month on restaurants & cafés. People your age: 200 €.',
    );
  });

  it('stays quiet when nothing stands out', () => {
    expect(biggestGapCard({ ageBand: '18-24', categories: [] })).toBeNull();
  });
});

describe('biggestChangeCard', () => {
  const periods = [
    { label: 'Jul–Sep 2025', months: 3 },
    { label: 'Jul–Sep 2026', months: 3 },
  ] as const;

  it('prefers a drop over a bigger rise', () => {
    const before = new Map([
      ['restaurants', 900],
      ['groceries', 600],
    ]);
    const after = new Map([
      ['restaurants', 720],
      ['groceries', 1200],
    ]);
    const card = biggestChangeCard(before, after, ...periods);
    expect(card?.sentence).toBe(
      'Restaurants & cafés spending is down 20% from the same months last year.',
    );
  });

  it('ignores small changes', () => {
    const before = new Map([['groceries', 900]]);
    const after = new Map([['groceries', 960]]);
    expect(biggestChangeCard(before, after, ...periods)).toBeNull();
  });
});

describe('getPeerTotalMedian', () => {
  it('takes the median monthly spending of the age band, without salary-sweep customers', async () => {
    const instance = await DuckDBInstance.create(':memory:');
    const db = await instance.connect();
    await db.run(`
      CREATE TABLE customers AS SELECT * FROM (VALUES
        ('c1', '18-24'), ('c2', '18-24'), ('c3', '18-24'), ('c4', '18-24'), ('c5', '35-44')
      ) t(customer_id, age_band);
      CREATE TABLE monthly_category AS SELECT * FROM (VALUES
        ('c1', '2026-09', 'groceries',    'mandatory_regular', 200.0),
        ('c1', '2026-09', 'salary',       'income',           2000.0),
        ('c2', '2026-09', 'restaurants',  'everyday',          400.0),
        ('c3', '2026-09', 'groceries',    'mandatory_regular', 600.0),
        ('c4', '2026-09', 'salary_sweep', 'transfer',         3000.0),
        ('c5', '2026-09', 'groceries',    'mandatory_regular', 999.0)
      ) t(customer_id, month, category_id, basket, total_eur);
    `);
    expect(await getPeerTotalMedian(db, '18-24', '2026-09', '2026-09', 1)).toBe(400);
  });
});

describe('peer ratios', () => {
  async function fixture() {
    const instance = await DuckDBInstance.create(':memory:');
    const db = await instance.connect();
    await db.run(`
      CREATE TABLE customers AS SELECT * FROM (VALUES ('c1'), ('c2'), ('c3')) t(customer_id);
      CREATE TABLE monthly_category AS SELECT * FROM (VALUES
        ('c3', 'salary_sweep')
      ) t(customer_id, category_id);
      CREATE TABLE transactions AS SELECT customer_id, CAST(tx_date AS DATE) AS tx_date,
        abs_amount_eur, transaction_type, basket, category_id FROM (VALUES
        ('c1', '2026-09-01', 2000.0, 'salary',   'income',   'salary'),
        ('c2', '2026-09-01', 2000.0, 'salary',   'income',   'salary'),
        ('c3', '2026-09-01', 2000.0, 'salary',   'income',   'salary'),
        ('c1', '2026-09-02',   70.0, 'purchase', 'everyday', 'restaurants'),
        ('c1', '2026-09-05',  100.0, 'purchase', 'everyday', 'restaurants'),
        ('c1', '2026-09-07',   50.0, 'purchase', 'everyday', 'restaurants'),
        ('c1', '2026-09-09',   30.0, 'purchase', 'everyday', 'restaurants'),
        ('c2', '2026-09-03',  140.0, 'purchase', 'everyday', 'restaurants'),
        ('c2', '2026-09-06',  300.0, 'purchase', 'everyday', 'restaurants'),
        ('c2', '2026-09-07',  100.0, 'purchase', 'everyday', 'restaurants'),
        ('c2', '2026-09-08',   30.0, 'purchase', 'everyday', 'restaurants'),
        ('c3', '2026-09-05', 9999.0, 'purchase', 'everyday', 'restaurants')
      ) t(customer_id, tx_date, abs_amount_eur, transaction_type, basket, category_id);
    `);
    return db;
  }

  it('takes the median weekend-to-weekday ratio per day, without salary-sweep customers', async () => {
    // 2026-09-05 Sat, 09-06 Sun, 09-07 Mon. c1: (100 / 2) / (50 / 1) = 1. c2: (300 / 2) / 100 = 1.5.
    expect(await getPeerWeekendRatio(await fixture(), '2026-09-05', '2026-09-07')).toBe(1.25);
  });

  it('takes the median first-week-to-rest ratio per day after payday', async () => {
    // Payday 09-01. First week 09-01..07 (7 days), rest 09-08..10 (3 days).
    // c1: (70 + 100 + 50) / 7 against 30 / 3. c2: (140 + 300 + 100) / 7 against 30 / 3.
    const ratio = await getPeerPaydayRatio(await fixture(), '2026-09-01', '2026-09-10', 7);
    expect(ratio).toBeCloseTo((220 / 7 / 10 + 540 / 7 / 10) / 2, 6);
  });
});
