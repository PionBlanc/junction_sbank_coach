import type { DuckDBConnection } from '@duckdb/node-api';
import type { Action } from '@coach/shared';
import { LAST_MONTH, MONTHS_IN_YEAR, YEAR_FROM_MONTH, round2 } from '../helpers.ts';
import { getPeerComparison } from '../peers.ts';
import { getSpendingSummary } from '../spending-summary.ts';
import { abovePeersActions } from './above-peers.ts';
import { taxiActions } from './taxis.ts';

/** Runs every rule and ranks the actions by monthly saving, largest first. */
export async function getActions(db: DuckDBConnection, customerId: string): Promise<Action[]> {
  const peers = await getPeerComparison(db, customerId);
  const taxis = await getSpendingSummary(db, customerId, {
    subcategoryId: 'taxi',
    fromMonth: YEAR_FROM_MONTH,
    toMonth: LAST_MONTH,
  });

  const actions = [
    ...abovePeersActions(peers),
    ...taxiActions(round2(taxis.totalEur / MONTHS_IN_YEAR), taxis.txCount),
  ];
  return actions.sort((a, b) => b.savingPerMonthEur - a.savingPerMonthEur);
}
