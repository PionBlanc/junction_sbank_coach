import { z } from 'zod';
import { monthSchema } from './common.ts';

/** What the coach sends to `planGoal`: the amount and, if the customer said, what it is for. */
export const goalPlanInputSchema = z.object({
  goalEur: z.number().min(1).max(1_000_000),
  /** A short name in the customer's words ("Trip to Japan"). Shown as the card title. */
  label: z.string().min(1).max(40).optional(),
});
export type GoalPlanInput = z.infer<typeof goalPlanInputSchema>;

/** Result of the coach's planGoal tool: how long saving up for the goal takes. */
export const goalPlanSchema = z.object({
  goalEur: z.number(),
  label: z.string().nullable(),
  /** The months the pace is measured over. */
  fromMonth: monthSchema,
  toMonth: monthSchema,
  /** How much the balance grew per month on average. Negative when it shrank. */
  monthlyPaceEur: z.number(),
  balanceEur: z.number(),
  /** Months to the goal at that pace. Null when the balance is not growing. */
  monthsAtPace: z.number().nullable(),
  /** The customer's picked saving ideas, or the top ones when they have not picked any. */
  ideas: z.array(z.object({ title: z.string(), savingPerMonthEur: z.number() })),
  ideasArePicked: z.boolean(),
  ideasPerMonthEur: z.number(),
  /** Months to the goal at the pace plus the ideas. Null without ideas or when still not growing. */
  monthsWithIdeas: z.number().nullable(),
  /** Saved so far, month by month from now, stopping at the goal. Empty when out of reach. */
  path: z.array(
    z.object({ month: monthSchema, atPaceEur: z.number(), withIdeasEur: z.number().nullable() }),
  ),
});
export type GoalPlan = z.infer<typeof goalPlanSchema>;
