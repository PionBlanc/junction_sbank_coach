import type { DuckDBConnection } from '@duckdb/node-api';
import { whatIfQuerySchema } from '@coach/shared';
import { tool } from 'ai';
import { getWhatIf } from '../../insights/what-if.ts';

export function simulateWhatIfTool(db: DuckDBConnection, customerId: string) {
  return tool({
    description:
      'What a change frees up per month and what it becomes over 1 to 10 years, saved and invested. ' +
      'Give a categoryId with cutPct as a fraction (0.2 = 20% less), or a plain monthlyEur amount.',
    inputSchema: whatIfQuerySchema,
    execute: async (input) => getWhatIf(db, customerId, input),
  });
}
