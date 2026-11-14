import type { DuckDBConnection } from '@duckdb/node-api';
import { yearOverYearInputSchema } from '@coach/shared';
import { tool } from 'ai';
import { getYearOverYear } from '../../insights/year-over-year.ts';

export function getYearOverYearTool(db: DuckDBConnection, customerId: string) {
  return tool({
    description:
      'This year against last year: spending in each of the last 12 months next to the same ' +
      'month a year earlier, with both yearly totals and the change. Optionally for one category.',
    inputSchema: yearOverYearInputSchema,
    execute: async (input) => getYearOverYear(db, customerId, input.categoryId),
  });
}
