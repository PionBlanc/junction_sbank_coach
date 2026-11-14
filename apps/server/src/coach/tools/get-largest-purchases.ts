import type { DuckDBConnection } from '@duckdb/node-api';
import { DATA_START_DATE, largestPurchasesInputSchema } from '@coach/shared';
import { tool } from 'ai';
import { LAST_MONTH } from '../../insights/helpers.ts';
import { getLargestPurchases } from '../../insights/largest-purchases.ts';

const FIRST_MONTH = DATA_START_DATE.slice(0, 7);

export function getLargestPurchasesTool(db: DuckDBConnection, customerId: string) {
  return tool({
    description:
      'The five largest purchases over a range of months (YYYY-MM), with their date, category and ' +
      'amount, and how many purchases there were in total. Optionally for one category. Rent and ' +
      'bills are not purchases and are left out.',
    inputSchema: largestPurchasesInputSchema,
    execute: async (input) => {
      // Keep the range inside the dataset, whatever the model asked for.
      const fromMonth = input.fromMonth < FIRST_MONTH ? FIRST_MONTH : input.fromMonth;
      const toMonth = input.toMonth > LAST_MONTH ? LAST_MONTH : input.toMonth;
      return getLargestPurchases(db, customerId, { ...input, fromMonth, toMonth });
    },
  });
}
