import type { PeerComparison } from '@coach/shared';
import { describe, expect, it } from 'vitest';
import { abovePeersActions } from './above-peers.ts';
import { habitActions } from './habits.ts';
import { buildSwipeProfile } from './swipe-profile.ts';
import { taxiActions } from './taxis.ts';

describe('abovePeersActions', () => {
  const peers: PeerComparison = {
    ageBand: '18-24',
    categories: [
      // Everyday and above the top quarter: an action.
      {
        categoryId: 'restaurants',
        youMonthlyAvgEur: 600,
        peerMedianMonthlyEur: 200,
        peerP75MonthlyEur: 270,
      },
      // Everyday but below the top quarter: nothing.
      {
        categoryId: 'travel',
        youMonthlyAvgEur: 40,
        peerMedianMonthlyEur: 30,
        peerP75MonthlyEur: 42,
      },
      // Above the top quarter but mandatory: nothing.
      {
        categoryId: 'groceries',
        youMonthlyAvgEur: 900,
        peerMedianMonthlyEur: 270,
        peerP75MonthlyEur: 365,
      },
    ],
  };

  it('suggests a fifth less only for everyday categories above the top quarter', () => {
    const actions = abovePeersActions(peers);
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({
      id: 'above-peers-restaurants',
      categoryId: 'restaurants',
      savingPerMonthEur: 120,
      savingPerWeekEur: 27.69,
    });
  });
});

describe('habitActions', () => {
  it('frees up a fixed share of the 12-month average', () => {
    const actions = habitActions(new Map([['bar', { totalEur: 1200, txCount: 30 }]]));
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({
      id: 'habit-bar',
      categoryId: 'restaurants',
      savingPerMonthEur: 25,
      savingPerWeekEur: 5.77,
      inputs: { monthlyAvgEur: 100, purchaseCount: 30, cutPct: 0.25 },
    });
  });
  it('stays quiet when the spending is small, rare, or has no habit', () => {
    const totals = new Map([
      ['cinema', { totalEur: 100, txCount: 6 }],
      ['clothing', { totalEur: 900, txCount: 2 }],
      ['pharmacy', { totalEur: 2400, txCount: 40 }],
    ]);
    expect(habitActions(totals)).toEqual([]);
  });
});

describe('buildSwipeProfile', () => {
  it('splits the actions by swipe and totals the accepted ones', () => {
    const actions = [
      ...taxiActions(26, 8),
      ...habitActions(new Map([['bar', { totalEur: 1200, txCount: 30 }]])),
    ];
    const profile = buildSwipeProfile(actions, ['taxis', 'unknown'], ['habit-bar']);
    expect(profile.downToTry.map((a) => a.id)).toEqual(['taxis']);
    expect(profile.worthIt.map((a) => a.id)).toEqual(['habit-bar']);
    expect(profile.downToTryPerMonthEur).toBe(13);
  });
});

describe('taxiActions', () => {
  it('frees up half of the monthly taxi spending', () => {
    expect(taxiActions(26, 8)[0]).toMatchObject({ id: 'taxis', savingPerMonthEur: 13 });
  });
  it('stays quiet when taxi spending is small', () => {
    expect(taxiActions(9, 3)).toEqual([]);
  });
});
