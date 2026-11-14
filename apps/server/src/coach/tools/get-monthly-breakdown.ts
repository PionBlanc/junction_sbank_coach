import type { DuckDBConnection } from '@duckdb/node-api';
import { DATA_START_DATE, overviewQuerySchema } from '@coach/shared';
import { tool } from 'ai';
import { LAST_MONTH } from '../../insights/helpers.ts';
import { getOverview } from '../../insights/overview.ts';

const FIRST_MONTH = DATA_START_DATE.slice(0, 7);

export function getMonthlyBreakdownTool(db: DuckDBConnection, customerId: string) {
  return tool({
    description:
      'One month (YYYY-MM) at a glance: income, spending split into the three spending types with ' +
      'their categories, and what was left over. Use it when the customer wants an overview ' +
      'or breakdown of a month, or asks where their money went.',
    inputSchema: overviewQuerySchema,
    execute: async (input) => {
      // Keep the month inside the dataset, whatever the model asked for.
      const month =
        input.month < FIRST_MONTH
          ? FIRST_MONTH
          : input.month > LAST_MONTH
            ? LAST_MONTH
            : input.month;
      return getOverview(db, customerId, month);
    },
  });
}
