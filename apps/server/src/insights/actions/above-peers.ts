import { CATEGORIES, type Action, type PeerComparison } from '@coach/shared';
import { round2 } from '../helpers.ts';

/** The suggested cut. A fifth is small enough to be realistic. */
const CUT_PCT = 0.2;

/**
 * Everyday categories where the user's 12-month average is above the top quarter of their age band:
 * suggest spending a fifth less.
 */
export function abovePeersActions(peers: PeerComparison): Action[] {
  const actions: Action[] = [];
  for (const row of peers.categories) {
    const category = CATEGORIES[row.categoryId];
    if (category.basket !== 'everyday' || row.youMonthlyAvgEur <= row.peerP75MonthlyEur) continue;

    const savingPerMonthEur = round2(row.youMonthlyAvgEur * CUT_PCT);
    actions.push({
      id: `above-peers-${row.categoryId}`,
      title: `${category.label}: spend a fifth less`,
      explanation:
        `You spend about ${Math.round(row.youMonthlyAvgEur)} € a month here (12-month average). ` +
        `People your age typically spend ${Math.round(row.peerMedianMonthlyEur)} €. ` +
        `A fifth less frees up about ${Math.round(savingPerMonthEur)} € a month.`,
      emoji: '💸',
      savingPerMonthEur,
      savingPerWeekEur: round2((savingPerMonthEur * 12) / 52),
      categoryId: row.categoryId,
      inputs: {
        youMonthlyAvgEur: row.youMonthlyAvgEur,
        peerMedianMonthlyEur: row.peerMedianMonthlyEur,
        peerP75MonthlyEur: row.peerP75MonthlyEur,
        cutPct: CUT_PCT,
      },
    });
  }
  return actions;
}
