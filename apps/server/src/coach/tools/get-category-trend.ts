import type { DuckDBConnection } from '@duckdb/node-api';
import { DATA_START_DATE, categoryTrendInputSchema } from '@coach/shared';
import { tool } from 'ai';
import { getCategoryTrend } from '../../insights/category-trend.ts';
import { LAST_MONTH, MONTHS_IN_YEAR, addMonths } from '../../insights/helpers.ts';

const FIRST_MONTH = DATA_START_DATE.slice(0, 7);

export function getCategoryTrendTool(db: DuckDBConnection, customerId: string) {
  return tool({
    description:
      'Spending in each month of a range (YYYY-MM, at most 12 months), split into the biggest ' +
      'categories over the range and "Other". Drawn as monthly bars with one colour per category.',
    inputSchema: categoryTrendInputSchema,
    execute: async (input) => {
      // Keep the range inside the dataset, in order, and at most a year long.
      const toMonth = input.toMonth > LAST_MONTH ? LAST_MONTH : input.toMonth;
      const earliest = [FIRST_MONTH, addMonths(toMonth, 1 - MONTHS_IN_YEAR)].sort().at(-1) ?? '';
      const fromMonth =
        input.fromMonth < earliest
          ? earliest
          : input.fromMonth > toMonth
            ? toMonth
            : input.fromMonth;
      return getCategoryTrend(db, customerId, fromMonth, toMonth);
    },
  });
}
