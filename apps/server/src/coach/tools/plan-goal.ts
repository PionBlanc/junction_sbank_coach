import type { DuckDBConnection } from '@duckdb/node-api';
import { goalPlanInputSchema } from '@coach/shared';
import { tool } from 'ai';
import { getActions } from '../../insights/actions/index.ts';
import { getGoalPlan, pickGoalIdeas } from '../../insights/goal-plan.ts';

export function planGoalTool(db: DuckDBConnection, customerId: string, acceptedIds: string[]) {
  return tool({
    description:
      "How long saving up for a goal of the customer's own takes: months at their pace (how much " +
      'their balance grew per month over the last 12 months), and months with their saving ideas ' +
      'on top (the ones they picked, or the top three). Also gives their balance now.',
    inputSchema: goalPlanInputSchema,
    execute: async (input) => {
      const actions = await getActions(db, customerId);
      return getGoalPlan(db, customerId, input, pickGoalIdeas(actions, acceptedIds));
    },
  });
}
