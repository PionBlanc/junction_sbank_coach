import { z } from 'zod';
import { categoryIdSchema } from './common.ts';

export const actionSchema = z.object({
  id: z.string(),
  title: z.string(),
  explanation: z.string(),
  savingPerMonthEur: z.number(),
  /** The same saving per week, so the UI can relate it to safe to spend. */
  savingPerWeekEur: z.number(),
  categoryId: categoryIdSchema,
  /** The numbers behind the estimate. */
  inputs: z.record(z.string(), z.number()),
});
export type Action = z.infer<typeof actionSchema>;
