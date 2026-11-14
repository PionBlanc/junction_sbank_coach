import type { DuckDBConnection } from '@duckdb/node-api';
import type { Action } from '@coach/shared';
import { LAST_MONTH, MONTHS_IN_YEAR, YEAR_FROM_MONTH, round2 } from '../helpers.ts';
import { getPeerComparison } from '../peers.ts';
import { getSpendingSummary } from '../spending-summary.ts';
import { getSubcategoryTotals } from '../../db/spending.ts';
import { abovePeersActions } from './above-peers.ts';
import { habitActions } from './habits.ts';
import { taxiActions } from './taxis.ts';

/** The most a user is asked to swipe through. */
const MAX_ACTIONS = 12;

/** Runs every rule and keeps the actions that free up the most for this user, largest first. */
export async function getActions(db: DuckDBConnection, customerId: string): Promise<Action[]> {
  const peers = await getPeerComparison(db, customerId);
  const taxis = await getSpendingSummary(db, customerId, {
    subcategoryId: 'taxi',
    fromMonth: YEAR_FROM_MONTH,
    toMonth: LAST_MONTH,
  });

  const habits = habitActions(
    await getSubcategoryTotals(db, customerId, YEAR_FROM_MONTH, LAST_MONTH),
  );
  // A concrete habit beats "spend a fifth less" on the same category, and the two would overlap.
  const habitCategories = new Set(habits.map((a) => a.categoryId));

  const actions = [
    ...habits,
    ...abovePeersActions(peers).filter((a) => !habitCategories.has(a.categoryId)),
    ...taxiActions(round2(taxis.totalEur / MONTHS_IN_YEAR), taxis.txCount),
  ];
  return actions.sort((a, b) => b.savingPerMonthEur - a.savingPerMonthEur).slice(0, MAX_ACTIONS);
}
