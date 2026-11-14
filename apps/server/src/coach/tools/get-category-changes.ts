import type { DuckDBConnection } from '@duckdb/node-api';
import { DATA_START_DATE, categoryChangesInputSchema } from '@coach/shared';
import { tool } from 'ai';
import { getCategoryChanges } from '../../insights/category-changes.ts';
import { LAST_MONTH, MONTHS_IN_YEAR, addMonths } from '../../insights/helpers.ts';

/** The first month with a full year of data before it. */
const FIRST_MONTH = addMonths(DATA_START_DATE.slice(0, 7), MONTHS_IN_YEAR);

export function getCategoryChangesTool(db: DuckDBConnection, customerId: string) {
  return tool({
    description:
      "One month (YYYY-MM) against the customer's own average over the 12 months before it: " +
      'spending in each category that month, the usual monthly amount, and the change, the ' +
      'biggest change first. Use it for "what changed", "where did I spend more or less than usual".',
    inputSchema: categoryChangesInputSchema,
    execute: async (input) => {
      // Keep the month inside the dataset, with a full year before it.
      const month =
        input.month < FIRST_MONTH
          ? FIRST_MONTH
          : input.month > LAST_MONTH
            ? LAST_MONTH
            : input.month;
      return getCategoryChanges(db, customerId, month);
    },
  });
}
