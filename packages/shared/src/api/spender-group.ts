import { z } from 'zod';
import { SPENDER_GROUPS, type SpenderGroupId } from '../spender-groups.ts';
import { categoryIdSchema } from './common.ts';

export const spenderGroupIdSchema = z.enum(
  Object.keys(SPENDER_GROUPS) as [SpenderGroupId, ...SpenderGroupId[]],
);

/** The customer's spender group and how many customers share it. */
export const spenderGroupSchema = z.object({
  groupId: spenderGroupIdSchema,
  label: z.string(),
  meaning: z.string(),
  /** The category that decided the group. Null for the balanced group. */
  categoryId: categoryIdSchema.nullable(),
  /** The customer's 12-month monthly average in that category. Null for the balanced group. */
  youMonthlyAvgEur: z.number().nullable(),
  /** Median of people in the same age band. Null for the balanced group. */
  peerMedianMonthlyEur: z.number().nullable(),
  customersInGroup: z.number(),
  /** Customers counted, salary-sweep customers left out (see docs/data.md). */
  totalCustomers: z.number(),
  /** customersInGroup / totalCustomers. */
  sharePct: z.number(),
});
export type SpenderGroup = z.infer<typeof spenderGroupSchema>;
