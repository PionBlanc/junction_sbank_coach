import { z } from 'zod';
import { monthSchema } from './common.ts';

/** Result of the coach's getInvestments tool: money put into and taken out of investments. */
export const investmentsSchema = z.object({
  fromMonth: monthSchema,
  toMonth: monthSchema,
  /** Every month in the range, oldest first. Months without investments are 0. */
  months: z.array(
    z.object({ month: monthSchema, depositedEur: z.number(), withdrawnEur: z.number() }),
  ),
  depositedEur: z.number(),
  withdrawnEur: z.number(),
  /** Deposits minus withdrawals. Negative when more was taken out than put in. */
  netEur: z.number(),
  monthsWithDeposit: z.number(),
  /** Deposits as a fraction of income over the range. Null when there was no income. */
  shareOfIncomePct: z.number().nullable(),
  /** The same totals since the data starts. */
  sinceMonth: monthSchema,
  allTimeDepositedEur: z.number(),
  allTimeWithdrawnEur: z.number(),
});
export type Investments = z.infer<typeof investmentsSchema>;
