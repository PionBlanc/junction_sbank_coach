import type { DuckDBConnection } from '@duckdb/node-api';
import { tool } from 'ai';
import { z } from 'zod';
import { getSpenderGroup } from '../../insights/spender-group.ts';

export function getSpenderGroupTool(db: DuckDBConnection, customerId: string) {
  return tool({
    description:
      'What kind of spender the customer is: their spender group, what it means, the category ' +
      'that decided it, and how many customers are in the same group.',
    inputSchema: z.object({}),
    execute: async () => getSpenderGroup(db, customerId),
  });
}
