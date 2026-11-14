import { z } from 'zod';
import { categoryIdSchema } from './common.ts';

/** The user's own 12-month monthly average next to people in the same age band. */
export const peerComparisonSchema = z.object({
  ageBand: z.string(),
  categories: z.array(
    z.object({
      categoryId: categoryIdSchema,
      youMonthlyAvgEur: z.number(),
      peerMedianMonthlyEur: z.number(),
      peerP75MonthlyEur: z.number(),
    }),
  ),
});
export type PeerComparison = z.infer<typeof peerComparisonSchema>;
