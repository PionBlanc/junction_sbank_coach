import { z } from 'zod';
import { categoryIdSchema } from './common.ts';

export const actionSchema = z.object({
  id: z.string(),
  title: z.string(),
  explanation: z.string(),
  /** The "photo" on the swipe card. */
  emoji: z.string(),
  savingPerMonthEur: z.number(),
  /** The same saving per week, so the UI can relate it to safe to spend. */
  savingPerWeekEur: z.number(),
  categoryId: categoryIdSchema,
  /** The numbers behind the estimate. */
  inputs: z.record(z.string(), z.number()),
});
export type Action = z.infer<typeof actionSchema>;

/** Result of the coach's getSavingIdeas tool: the ideas that free up the most, largest first. */
export const savingIdeasSchema = z.object({
  ideas: z.array(
    z.object({
      id: z.string(),
      emoji: z.string(),
      title: z.string(),
      categoryId: categoryIdSchema,
      savingPerMonthEur: z.number(),
    }),
  ),
  /** All ideas the app has for this customer, including those left out. */
  ideaCount: z.number(),
});
export type SavingIdeas = z.infer<typeof savingIdeasSchema>;
