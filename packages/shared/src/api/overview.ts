import { z } from 'zod';
import { categoryIdSchema, monthSchema, spendingBasketSchema } from './common.ts';
import { categorySliceSchema } from './spending.ts';

export const overviewQuerySchema = z.object({ month: monthSchema });

export const basketCategorySchema = z.object({
  categoryId: categoryIdSchema,
  /** "Taxis" for the taxi part of transportation, otherwise the category label. */
  label: z.string(),
  totalEur: z.number(),
  /** The user's own 12-month average for the whole category. Null on the taxi row. */
  youMonthlyAvgEur: z.number().nullable(),
  /** Median of people in the same age band. Null on the taxi row. */
  peerMedianMonthlyEur: z.number().nullable(),
});

export const overviewSchema = z.object({
  month: monthSchema,
  ageBand: z.string(),
  incomeEur: z.number(),
  spendingEur: z.number(),
  /** Income minus spending. Negative when the month's spending was larger than its income. */
  leftEur: z.number(),
  baskets: z.array(
    z.object({
      basket: spendingBasketSchema,
      totalEur: z.number(),
      /** Share of the month's spending. */
      sharePct: z.number(),
      categories: z.array(basketCategorySchema),
    }),
  ),
  /** The month's spending by category, largest first, for the pie chart. The last slice may be "Other". */
  categorySplit: z.array(categorySliceSchema),
});
export type Overview = z.infer<typeof overviewSchema>;
export type BasketCategory = z.infer<typeof basketCategorySchema>;
