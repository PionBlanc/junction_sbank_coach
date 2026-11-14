import type { DuckDBConnection } from '@duckdb/node-api';
import { DATA_END_DATE, type Action, type GoalPlan, type GoalPlanInput } from '@coach/shared';
import { getDailyBalances } from '../db/balance.ts';
import { LAST_MONTH, MONTHS_IN_YEAR, YEAR_FROM_MONTH, addMonths, round2 } from './helpers.ts';

/** Saving ideas used when the customer has not picked any. */
const TOP_IDEA_COUNT = 3;
/** The chart stops here, so a far-off goal still draws as a readable line. */
const MAX_PATH_MONTHS = 36;

type GoalIdea = GoalPlan['ideas'][number];

/** The ideas the customer swiped right on, or else the ones that free up the most. */
export function pickGoalIdeas(
  actions: Action[],
  acceptedIds: string[],
): { ideas: GoalIdea[]; ideasArePicked: boolean } {
  const picked = actions.filter((a) => acceptedIds.includes(a.id));
  const chosen = picked.length > 0 ? picked : actions.slice(0, TOP_IDEA_COUNT);
  return {
    ideas: chosen.map((a) => ({ title: a.title, savingPerMonthEur: a.savingPerMonthEur })),
    ideasArePicked: picked.length > 0,
  };
}

function monthsTo(goalEur: number, perMonthEur: number): number | null {
  return perMonthEur > 0 ? Math.ceil(goalEur / perMonthEur) : null;
}

/**
 * How long saving up for a goal takes at the customer's own pace (how much their balance grew per
 * month over the last 12 months), and with their saving ideas on top.
 */
export async function getGoalPlan(
  db: DuckDBConnection,
  customerId: string,
  input: GoalPlanInput,
  picked: { ideas: GoalIdea[]; ideasArePicked: boolean },
): Promise<GoalPlan> {
  // The balance on the day before the 12 months start, and today.
  const dayBefore = new Date(Date.parse(`${YEAR_FROM_MONTH}-01`) - 86_400_000)
    .toISOString()
    .slice(0, 10);
  const [start] = await getDailyBalances(db, customerId, dayBefore, dayBefore);
  const [end] = await getDailyBalances(db, customerId, DATA_END_DATE, DATA_END_DATE);
  const balanceEur = round2(end?.balanceEur ?? 0);
  const pace = round2((balanceEur - (start?.balanceEur ?? 0)) / MONTHS_IN_YEAR);

  const ideasPerMonthEur = round2(picked.ideas.reduce((sum, i) => sum + i.savingPerMonthEur, 0));
  const withIdeas = picked.ideas.length > 0 ? round2(pace + ideasPerMonthEur) : null;
  const monthsAtPace = monthsTo(input.goalEur, pace);
  const monthsWithIdeas = withIdeas === null ? null : monthsTo(input.goalEur, withIdeas);

  const reachable = [monthsAtPace, monthsWithIdeas].filter((m) => m !== null);
  const pathMonths = reachable.length > 0 ? Math.min(Math.max(...reachable), MAX_PATH_MONTHS) : -1;
  const savedAfter = (months: number, perMonthEur: number) =>
    perMonthEur > 0 ? Math.min(input.goalEur, round2(months * perMonthEur)) : 0;
  const path = Array.from({ length: pathMonths + 1 }, (_, index) => ({
    month: addMonths(LAST_MONTH, index),
    atPaceEur: savedAfter(index, pace),
    withIdeasEur: withIdeas === null ? null : savedAfter(index, withIdeas),
  }));

  return {
    goalEur: input.goalEur,
    label: input.label ?? null,
    fromMonth: YEAR_FROM_MONTH,
    toMonth: LAST_MONTH,
    monthlyPaceEur: pace,
    balanceEur,
    monthsAtPace,
    ...picked,
    ideasPerMonthEur,
    monthsWithIdeas,
    path,
  };
}
