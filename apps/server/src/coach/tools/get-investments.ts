import type { DuckDBConnection } from '@duckdb/node-api';
import { tool } from 'ai';
import { z } from 'zod';
import { getInvestments } from '../../insights/investments.ts';

export function getInvestmentsTool(db: DuckDBConnection, customerId: string) {
  return tool({
    description:
      'Money the customer put into and took out of investments in each of the last 12 months, ' +
      'with totals, the months with a deposit, deposits as a share of income, and the totals ' +
      'since the data starts. All zeros when they do not invest.',
    inputSchema: z.object({}),
    execute: async () => getInvestments(db, customerId),
  });
}
