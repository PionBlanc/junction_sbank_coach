import { z } from 'zod';
import { categoryIdSchema } from './common.ts';

/** Either a category with a cut ("restaurants, 20% less") or a plain monthly amount. */
export const whatIfQuerySchema = z
  .object({
    categoryId: categoryIdSchema.optional(),
    cutPct: z.coerce.number().min(0.01).max(1).optional(),
    monthlyEur: z.coerce.number().min(1).max(100000).optional(),
  })
  .refine((q) => q.categoryId !== undefined || q.monthlyEur !== undefined, {
    message: 'Give a categoryId or a monthlyEur',
  });
export type WhatIfQuery = z.infer<typeof whatIfQuerySchema>;

export const whatIfSchema = z.object({
  categoryId: categoryIdSchema.nullable(),
  cutPct: z.number().nullable(),
  /** The user's 12-month average for the category. Null for a plain monthly amount. */
  baseMonthlyEur: z.number().nullable(),
  /** What the change frees up each month. */
  monthlyEur: z.number(),
  yearlyEur: z.number(),
  /** Example yearly returns for the invested lines. Assumptions, not promises. */
  returnPct: z.number(),
  returnLowPct: z.number(),
  returnHighPct: z.number(),
  series: z.array(
    z.object({
      years: z.number(),
      savedEur: z.number(),
      investedEur: z.number(),
      investedLowEur: z.number(),
      investedHighEur: z.number(),
    }),
  ),
  fiveYearSavedEur: z.number(),
  /** The user's 12-month average housing payment, for the "months of rent" comparison. */
  housingMonthlyEur: z.number(),
  /** fiveYearSavedEur expressed in months of the user's own housing cost. Null without housing. */
  fiveYearHousingMonths: z.number().nullable(),
});
export type WhatIf = z.infer<typeof whatIfSchema>;
