import { CATEGORIES, type Action, type CategoryId } from '@coach/shared';

export type MoneyType = { emoji: string; label: string; line: string };

/** Named after the spending the user protects. */
const TYPE_BY_CATEGORY: Partial<Record<CategoryId, { emoji: string; label: string }>> = {
  restaurants: { emoji: '🍽️', label: 'Foodie at heart' },
  transportation: { emoji: '🚕', label: 'Door-to-door traveller' },
  lifestyle: { emoji: '🛍️', label: 'Treat collector' },
  entertainment: { emoji: '🎭', label: 'Front-row regular' },
  travel: { emoji: '✈️', label: 'Window-seat dreamer' },
};

/**
 * A playful label for the swipes. `worthIt` is in the server's order, largest saving first,
 * so the first one is the biggest thing the user chose to keep.
 */
export function moneyType(matches: Action[], worthIt: Action[]): MoneyType {
  const kept = worthIt[0];
  if (!kept) {
    return { emoji: '🌈', label: 'Open to anything', line: 'You were down to try every idea.' };
  }
  if (matches.length === 0) {
    return {
      emoji: '🛋️',
      label: 'Happy as you are',
      line: 'Nothing here was worth changing for you. That is a fine answer.',
    };
  }
  const type = TYPE_BY_CATEGORY[kept.categoryId] ?? { emoji: '⚖️', label: 'Picky in a good way' };
  return {
    ...type,
    line: `${CATEGORIES[kept.categoryId].label} stays. You are happy to trade in other things.`,
  };
}
