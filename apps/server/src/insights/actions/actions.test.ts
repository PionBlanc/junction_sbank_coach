import type { PeerComparison } from '@coach/shared';
import { describe, expect, it } from 'vitest';
import { abovePeersActions } from './above-peers.ts';
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

describe('taxiActions', () => {
  it('frees up half of the monthly taxi spending', () => {
    expect(taxiActions(26, 8)[0]).toMatchObject({ id: 'taxis', savingPerMonthEur: 13 });
  });
  it('stays quiet when taxi spending is small', () => {
    expect(taxiActions(9, 3)).toEqual([]);
  });
});
