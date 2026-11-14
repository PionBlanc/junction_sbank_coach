import { z } from 'zod';
import { monthSchema } from './common.ts';

export const balanceHistoryInputSchema = z.object({ fromMonth: monthSchema, toMonth: monthSchema });

/** Result of the coach's getBalanceHistory tool: the account balance at the end of every day. */
export const balanceHistorySchema = z.object({
  fromDate: z.string(),
  toDate: z.string(),
  /** Oldest first, one entry per calendar day. A day without transactions keeps the day before's balance. */
  days: z.array(z.object({ date: z.string(), balanceEur: z.number() })),
  /** Balance at the end of the first day. */
  startEur: z.number(),
  /** Balance at the end of the last day. */
  endEur: z.number(),
  /** End minus start. Negative when the balance went down. */
  changeEur: z.number(),
  lowestEur: z.number(),
  /** The first day the balance was at its lowest. */
  lowestDate: z.string(),
  /** Days that ended with a balance below zero. */
  daysBelowZero: z.number(),
});
export type BalanceHistory = z.infer<typeof balanceHistorySchema>;
