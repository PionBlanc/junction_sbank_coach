import type { DeckCard } from '@coach/shared';

/** Spending breakdown cards, and urgent ones, always come first. */
export const ALWAYS_IMPORTANT = 1;
/** Spending more than the benchmark matters more than spending less, so it counts double. */
const OVERSPEND_WEIGHT = 2;

/**
 * Importance from how far the user is from a benchmark: diff is user / benchmark − 1.
 * A bigger difference scores higher; the score approaches 1 but never reaches the "always" cards.
 */
export function importanceOf(diff: number): number {
  const raw = Math.abs(diff) * (diff > 0 ? OVERSPEND_WEIGHT : 1);
  return Math.round((raw / (1 + raw)) * 1000) / 1000;
}

/** Most important first. Equal scores keep their catalogue order. */
export function rankCards(cards: DeckCard[]): DeckCard[] {
  return [...cards].sort((a, b) => b.importance - a.importance);
}
