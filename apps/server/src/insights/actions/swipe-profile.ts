import type { Action } from '@coach/shared';
import { round2 } from '../helpers.ts';

export type SwipeProfile = {
  /** Swiped right: ideas the customer wants to try. */
  downToTry: Action[];
  /** Swiped left: spending the customer finds worth it. */
  worthIt: Action[];
  downToTryPerMonthEur: number;
};

/** What the customer's swipes say about them. Ids that are not among their actions are ignored. */
export function buildSwipeProfile(
  actions: Action[],
  acceptedIds: string[],
  rejectedIds: string[],
): SwipeProfile {
  const downToTry = actions.filter((a) => acceptedIds.includes(a.id));
  return {
    downToTry,
    worthIt: actions.filter((a) => rejectedIds.includes(a.id) && !acceptedIds.includes(a.id)),
    downToTryPerMonthEur: round2(downToTry.reduce((sum, a) => sum + a.savingPerMonthEur, 0)),
  };
}
