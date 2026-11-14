import type { DuckDBConnection } from '@duckdb/node-api';
import { SPENDER_GROUPS, type SpenderGroup, type SpenderGroupId } from '@coach/shared';
import { getGroupCategoryRows, type GroupCategoryRow } from '../db/spender-groups.ts';
import { LAST_MONTH, MONTHS_IN_YEAR, YEAR_FROM_MONTH, round2 } from './helpers.ts';

type Placement = { groupId: SpenderGroupId; row: GroupCategoryRow | null };

const GROUP_BY_CATEGORY = new Map(
  Object.entries(SPENDER_GROUPS).flatMap(([id, g]) =>
    g.categoryId ? [[g.categoryId as string, id as SpenderGroupId] as const] : [],
  ),
);

/**
 * The rule: among the customer's group categories above the top quarter of their age band, the one
 * furthest above the median wins. None above the top quarter means the balanced group.
 */
export function placeInGroup(rows: GroupCategoryRow[]): Placement {
  let best: Placement = { groupId: 'balanced', row: null };
  let bestRatio = 0;
  for (const row of rows) {
    const groupId = row.categoryId === null ? undefined : GROUP_BY_CATEGORY.get(row.categoryId);
    if (!groupId || row.peerMedianMonthlyEur <= 0) continue;
    if (row.monthlyAvgEur <= row.peerP75MonthlyEur) continue;
    const ratio = row.monthlyAvgEur / row.peerMedianMonthlyEur;
    if (ratio > bestRatio) {
      best = { groupId, row };
      bestRatio = ratio;
    }
  }
  return best;
}

/** Every customer's group. The database is read-only, so it is worked out once per connection. */
const placements = new WeakMap<DuckDBConnection, Promise<Map<string, Placement>>>();

async function placeEveryone(db: DuckDBConnection): Promise<Map<string, Placement>> {
  const rows = await getGroupCategoryRows(db, YEAR_FROM_MONTH, LAST_MONTH, MONTHS_IN_YEAR);
  const byCustomer = new Map<string, GroupCategoryRow[]>();
  for (const row of rows) {
    byCustomer.set(row.customerId, [...(byCustomer.get(row.customerId) ?? []), row]);
  }
  return new Map([...byCustomer].map(([id, customerRows]) => [id, placeInGroup(customerRows)]));
}

/** The customer's spender group, with how many customers share it. */
export async function getSpenderGroup(
  db: DuckDBConnection,
  customerId: string,
): Promise<SpenderGroup> {
  let everyone = placements.get(db);
  if (!everyone) {
    everyone = placeEveryone(db);
    placements.set(db, everyone);
  }
  const all = await everyone;
  const placement = all.get(customerId) ?? { groupId: 'balanced', row: null };
  const group = SPENDER_GROUPS[placement.groupId];
  const customersInGroup = [...all.values()].filter((p) => p.groupId === placement.groupId).length;

  return {
    groupId: placement.groupId,
    label: group.label,
    meaning: group.meaning,
    categoryId: group.categoryId,
    youMonthlyAvgEur: placement.row ? round2(placement.row.monthlyAvgEur) : null,
    peerMedianMonthlyEur: placement.row ? placement.row.peerMedianMonthlyEur : null,
    customersInGroup,
    totalCustomers: all.size,
    sharePct: all.size > 0 ? round2(customersInGroup / all.size) : 0,
  };
}
