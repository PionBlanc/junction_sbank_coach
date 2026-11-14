import type { Action } from '@coach/shared';
import { round2 } from '../helpers.ts';

/** A plan covers this many of the accepted ideas, the biggest first. */
const PLAN_SIZE = 5;

export type SwipeProfile = {
  /** Swiped right: ideas the customer wants to try. */
  downToTry: Action[];
  /** Swiped left: spending the customer finds worth it. */
  worthIt: Action[];
  downToTryPerMonthEur: number;
  /** The accepted ideas a plan covers: the biggest ones, largest saving first. */
  planIdeas: Action[];
  planPerMonthEur: number;
};

/** What the customer's swipes say about them. Ids that are not among their actions are ignored. */
export function buildSwipeProfile(
  actions: Action[],
  acceptedIds: string[],
  rejectedIds: string[],
): SwipeProfile {
  // Actions arrive sorted by saving, largest first, and filter keeps that order.
  const downToTry = actions.filter((a) => acceptedIds.includes(a.id));
  const planIdeas = downToTry.slice(0, PLAN_SIZE);
  return {
    downToTry,
    worthIt: actions.filter((a) => rejectedIds.includes(a.id) && !acceptedIds.includes(a.id)),
    downToTryPerMonthEur: round2(downToTry.reduce((sum, a) => sum + a.savingPerMonthEur, 0)),
    planIdeas,
    planPerMonthEur: round2(planIdeas.reduce((sum, a) => sum + a.savingPerMonthEur, 0)),
  };
}
