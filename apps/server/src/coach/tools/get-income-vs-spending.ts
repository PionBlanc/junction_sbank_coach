import type { DuckDBConnection } from '@duckdb/node-api';
import { tool } from 'ai';
import { z } from 'zod';
import { getIncomeVsSpending } from '../../insights/income-vs-spending.ts';

export function getIncomeVsSpendingTool(db: DuckDBConnection, customerId: string) {
  return tool({
    description:
      'The last 12 months, month by month: income, spending, and what was left over (income ' +
      'minus spending), with totals and the number of months where spending was larger.',
    inputSchema: z.object({}),
    execute: async () => getIncomeVsSpending(db, customerId),
  });
}
