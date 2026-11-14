import type { CategoryId } from './taxonomy.ts';

type SpenderGroupDef = {
  /** The everyday category that puts a customer in this group. Null for the balanced group. */
  categoryId: CategoryId | null;
  label: string;
  /** One plain sentence saying what the group means. */
  meaning: string;
};

/**
 * The six spender groups. A customer belongs to the group of the category where their 12-month
 * average is furthest above the median for their age, among categories above the top quarter.
 * When no category is above the top quarter, they are in the balanced group.
 */
export const SPENDER_GROUPS = {
  foodie: {
    categoryId: 'restaurants',
    label: 'Foodie at heart',
    meaning:
      'Eating out stands out in your spending: you spend more on it than most people your age.',
  },
  door_to_door: {
    categoryId: 'transportation',
    label: 'Door-to-door traveller',
    meaning:
      'Getting around stands out in your spending: you spend more on it than most people your age.',
  },
  treat_collector: {
    categoryId: 'lifestyle',
    label: 'Treat collector',
    meaning:
      'Shopping and treats stand out in your spending: you spend more on them than most people your age.',
  },
  front_row: {
    categoryId: 'entertainment',
    label: 'Front-row regular',
    meaning:
      'Events and fun stand out in your spending: you spend more on them than most people your age.',
  },
  window_seat: {
    categoryId: 'travel',
    label: 'Window-seat dreamer',
    meaning: 'Travel stands out in your spending: you spend more on it than most people your age.',
  },
  balanced: {
    categoryId: null,
    label: 'Picky in a good way',
    meaning: 'No everyday category stands out: your spending is close to people your age.',
  },
} as const satisfies Record<string, SpenderGroupDef>;
export type SpenderGroupId = keyof typeof SPENDER_GROUPS;
