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

/** Result of the coach's getIncomeVsSpending tool: the last 12 months, oldest first. */
export const incomeVsSpendingSchema = z.object({
  fromMonth: monthSchema,
  toMonth: monthSchema,
  months: z.array(
    z.object({
      month: monthSchema,
      incomeEur: z.number(),
      spendingEur: z.number(),
      /** Income minus spending. Negative when more went out than came in. */
      leftEur: z.number(),
    }),
  ),
  totalIncomeEur: z.number(),
  totalSpendingEur: z.number(),
  totalLeftEur: z.number(),
  /** Months where spending was larger than income. */
  monthsOverspent: z.number(),
});
export type IncomeVsSpending = z.infer<typeof incomeVsSpendingSchema>;

export const yearOverYearInputSchema = z.object({ categoryId: categoryIdSchema.optional() });

/** Result of the coach's getYearOverYear tool: each of the last 12 months next to a year earlier. */
export const yearOverYearSchema = z.object({
  /** "All spending" or the category label. */
  label: z.string(),
  /** This year's months, oldest first. */
  months: z.array(
    z.object({
      month: monthSchema,
      /** The same month a year earlier. */
      lastYearMonth: monthSchema,
      thisYearEur: z.number(),
      lastYearEur: z.number(),
      /** This year minus last year. Positive means more spending this year. */
      changeEur: z.number(),
    }),
  ),
  thisYearTotalEur: z.number(),
  lastYearTotalEur: z.number(),
  changeEur: z.number(),
  /** Change as a fraction of last year's total. Null when last year had no spending. */
  changePct: z.number().nullable(),
});
export type YearOverYear = z.infer<typeof yearOverYearSchema>;

export const categorySplitInputSchema = z.object({ fromMonth: monthSchema, toMonth: monthSchema });

/** Result of the coach's getCategorySplit tool: where spending went over a range of months. */
export const categorySplitSchema = z.object({
  fromMonth: monthSchema,
  toMonth: monthSchema,
  totalEur: z.number(),
  /** Largest first. The last slice may be "Other" (categoryId null). */
  slices: z.array(
    z.object({
      categoryId: categoryIdSchema.nullable(),
      label: z.string(),
      totalEur: z.number(),
      sharePct: z.number(),
    }),
  ),
});
export type CategorySplit = z.infer<typeof categorySplitSchema>;
