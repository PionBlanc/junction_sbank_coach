import { z } from 'zod';

/** Result of the coach's getMortgageApplication tool. Null when the customer has not applied. */
export const mortgageApplicationSchema = z.object({
  application: z
    .object({
      /** "approved" or "rejected". */
      decision: z.string(),
      /** In words, such as "insufficient income". Null when approved. */
      rejectionReason: z.string().nullable(),
      /** In words, such as "detached house". */
      propertyType: z.string().nullable(),
      propertyPriceEur: z.number(),
      loanEur: z.number(),
      equityEur: z.number(),
      /** What the bank valued the collateral at. */
      collateralValueEur: z.number(),
      loanToValuePct: z.number(),
      startedDate: z.string(),
      decidedDate: z.string().nullable(),
      /** The application's steps, oldest first. Contacts and costs are left out. */
      steps: z.array(z.object({ date: z.string(), label: z.string() })),
      /** Costs recorded during the assessment, such as transfer tax. */
      costs: z.array(z.object({ label: z.string(), amountEur: z.number() })),
    })
    .nullable(),
});
export type MortgageApplication = z.infer<typeof mortgageApplicationSchema>;

export const downPaymentInputSchema = z.object({
  /** The home the customer has in mind. Without it, the median price in approved applications. */
  propertyPriceEur: z.number().min(10_000).max(5_000_000).optional(),
});

/** Result of the coach's getDownPayment tool: equity for a home, from the bank's mortgage applications. */
export const downPaymentSchema = z.object({
  propertyPriceEur: z.number(),
  /** True when the price is the median in approved applications, not one the customer gave. */
  priceIsTypical: z.boolean(),
  applicationCount: z.number(),
  approvedCount: z.number(),
  /** Median equity as a share of the price, in approved and in rejected applications. */
  approvedEquityPct: z.number(),
  rejectedEquityPct: z.number(),
  /** The price times the approved median share. */
  equityNeededEur: z.number(),
  balanceEur: z.number(),
});
export type DownPayment = z.infer<typeof downPaymentSchema>;
