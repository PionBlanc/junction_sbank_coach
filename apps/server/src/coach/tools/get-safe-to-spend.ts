import type { DuckDBConnection } from '@duckdb/node-api';
import { tool } from 'ai';
import { z } from 'zod';
import { getSafeToSpend } from '../../insights/safe-to-spend.ts';

export function getSafeToSpendTool(db: DuckDBConnection, customerId: string) {
  return tool({
    description:
      'What the customer can safely spend this week: balance now minus the housing payment and ' +
      'utility bills expected before the next payday, spread over the days until payday.',
    inputSchema: z.object({}),
    execute: async () => getSafeToSpend(db, customerId),
  });
}
