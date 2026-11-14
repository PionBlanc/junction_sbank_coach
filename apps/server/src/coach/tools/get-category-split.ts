import type { DuckDBConnection } from '@duckdb/node-api';
import { DATA_START_DATE, categorySplitInputSchema } from '@coach/shared';
import { tool } from 'ai';
import { LAST_MONTH } from '../../insights/helpers.ts';
import { getCategorySplit } from '../../insights/category-split.ts';

const FIRST_MONTH = DATA_START_DATE.slice(0, 7);

export function getCategorySplitTool(db: DuckDBConnection, customerId: string) {
  return tool({
    description:
      'Where spending went over a range of months (YYYY-MM): each category as a share of all ' +
      'spending, biggest first, with the smaller ones grouped as "Other". Drawn as a pie chart.',
    inputSchema: categorySplitInputSchema,
    execute: async (input) => {
      // Keep the range inside the dataset, whatever the model asked for.
      const fromMonth = input.fromMonth < FIRST_MONTH ? FIRST_MONTH : input.fromMonth;
      const toMonth = input.toMonth > LAST_MONTH ? LAST_MONTH : input.toMonth;
      return getCategorySplit(db, customerId, fromMonth, toMonth);
    },
  });
}
