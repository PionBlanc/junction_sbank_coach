import type { DuckDBConnection } from '@duckdb/node-api';
import { DATA_START_DATE, spendingSummaryInputSchema } from '@coach/shared';
import { tool } from 'ai';
import { LAST_MONTH } from '../../insights/helpers.ts';
import { getSpendingSummary } from '../../insights/spending-summary.ts';

const FIRST_MONTH = DATA_START_DATE.slice(0, 7);

export function getSpendingSummaryTool(db: DuckDBConnection, customerId: string) {
  return tool({
    description:
      'Total spending and a month-by-month series for a range of months (YYYY-MM). ' +
      'Optionally for one category or one subcategory (for example taxi). Without either: all spending.',
    inputSchema: spendingSummaryInputSchema,
    execute: async (input) => {
      // Keep the range inside the dataset, whatever the model asked for.
      const fromMonth = input.fromMonth < FIRST_MONTH ? FIRST_MONTH : input.fromMonth;
      const toMonth = input.toMonth > LAST_MONTH ? LAST_MONTH : input.toMonth;
      return getSpendingSummary(db, customerId, { ...input, fromMonth, toMonth });
    },
  });
}
