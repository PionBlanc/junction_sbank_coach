import { z } from 'zod';
import { categoryIdSchema, monthSchema, subcategoryIdSchema } from './common.ts';

/** Result of the coach's getSpendingSummary tool. */
export const spendingSummarySchema = z.object({
  label: z.string(),
  fromMonth: monthSchema,
  toMonth: monthSchema,
  totalEur: z.number(),
  txCount: z.number(),
  monthly: z.array(z.object({ month: monthSchema, totalEur: z.number() })),
});
export type SpendingSummary = z.infer<typeof spendingSummarySchema>;

export const spendingSummaryInputSchema = z.object({
  categoryId: categoryIdSchema.optional(),
  subcategoryId: subcategoryIdSchema.optional(),
  fromMonth: monthSchema,
  toMonth: monthSchema,
});
