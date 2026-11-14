import type { DuckDBConnection } from '@duckdb/node-api';
import { tool } from 'ai';
import { z } from 'zod';
import { getPurchaseSizes } from '../../insights/purchase-sizes.ts';

export function getPurchaseSizesTool(db: DuckDBConnection, customerId: string) {
  return tool({
    description:
      'For each spending category over the last 12 months: how many purchases, how many a ' +
      'month, and the typical (median) purchase, the largest typical purchase first. Rent and ' +
      'bills are not purchases and are left out.',
    inputSchema: z.object({}),
    execute: async () => getPurchaseSizes(db, customerId),
  });
}
