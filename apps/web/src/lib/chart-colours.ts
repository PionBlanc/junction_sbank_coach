import type { CategoryId, SpendingBasketId } from '@coach/shared';

/** A pie slice's colour and the text colour that reads on top of it. */
export type SliceColour = { fill: string; textFill: string };

const INK = 'var(--color-ink)';
const WHITE = 'var(--color-card)';

/**
 * Category slices by size, biggest first. By size, not by category id: there are more spending
 * categories than colours that stay apart for colour-blind readers, and a pie shows only the top four.
 */
const SLICE_COLOURS: SliceColour[] = [
  { fill: 'var(--color-chart-slice-1)', textFill: INK },
  { fill: 'var(--color-chart-slice-2)', textFill: INK },
  { fill: 'var(--color-chart-slice-3)', textFill: INK },
  { fill: 'var(--color-chart-slice-4)', textFill: INK },
];
const OTHER_COLOUR: SliceColour = { fill: 'var(--color-chart-rest-2)', textFill: INK };

/** The colour of the category slice at this position. "Other" (categoryId null) is always grey. */
export function categorySliceColour(index: number, categoryId: CategoryId | null): SliceColour {
  if (categoryId === null) return OTHER_COLOUR;
  return SLICE_COLOURS[index] ?? OTHER_COLOUR;
}

export const BASKET_SLICE_COLOURS: Record<SpendingBasketId, SliceColour> = {
  mandatory_regular: { fill: 'var(--color-basket-regular)', textFill: WHITE },
  mandatory_irregular: { fill: 'var(--color-basket-irregular)', textFill: INK },
  everyday: { fill: 'var(--color-basket-everyday)', textFill: INK },
};
