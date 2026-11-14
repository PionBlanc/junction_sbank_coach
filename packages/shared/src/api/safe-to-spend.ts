import { z } from 'zod';

export const safeToSpendSchema = z.object({
  balanceEur: z.number(),
  nextPaydayDate: z.string(),
  daysToPayday: z.number(),
  /** Housing payment expected before payday. 0 when none is due. */
  upcomingHousingEur: z.number(),
  /** Utility bills expected before payday, from the last 3 months' average. */
  upcomingUtilitiesEur: z.number(),
  /** Balance minus the upcoming payments. Can be negative. */
  availableEur: z.number(),
  perDayEur: z.number(),
  safeThisWeekEur: z.number(),
});
export type SafeToSpend = z.infer<typeof safeToSpendSchema>;
