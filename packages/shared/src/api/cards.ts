import { z } from 'zod';
import { categoryIdSchema } from './common.ts';

/** The one simple chart on a card. Values are printed on the marks, so no axes or legend. */
export const cardChartSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('bars'),
    bars: z.array(z.object({ label: z.string(), valueEur: z.number(), highlight: z.boolean() })),
  }),
  z.object({
    type: z.literal('donut'),
    /** Largest first. The last slice may be "Other" (categoryId null). */
    slices: z.array(
      z.object({
        categoryId: categoryIdSchema.nullable(),
        label: z.string(),
        valueEur: z.number(),
        sharePct: z.number(),
      }),
    ),
  }),
  z.object({ type: z.literal('stat'), valueEur: z.number(), caption: z.string() }),
]);
export type CardChart = z.infer<typeof cardChartSchema>;

/** One swipeable card: one point about the user's money. */
export const deckCardSchema = z.object({
  /** Stable id of the rule that made the card, such as 'peer-total'. */
  id: z.string(),
  /** Small label above the chart. */
  topic: z.string(),
  chart: cardChartSchema,
  /** One sentence saying what the chart shows. */
  sentence: z.string(),
  /** Period and comparison group, such as "Last 12 months · people your age". */
  sourceNote: z.string(),
  /** One or two questions the user can tap to start a chat. */
  questions: z.array(z.string()).min(1).max(2),
});
export type DeckCard = z.infer<typeof deckCardSchema>;

export const cardDeckSchema = z.array(deckCardSchema);
