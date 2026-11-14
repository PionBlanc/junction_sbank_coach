import type { DuckDBConnection } from '@duckdb/node-api';
import { categoryIdSchema } from '@coach/shared';
import { tool } from 'ai';
import { z } from 'zod';
import { getPeerComparison } from '../../insights/peers.ts';

export function compareToPeersTool(db: DuckDBConnection, customerId: string) {
  return tool({
    description:
      "The customer's 12-month monthly average per spending category next to people in the same " +
      'age band (median and top quarter). Optionally only one category.',
    inputSchema: z.object({ categoryId: categoryIdSchema.optional() }),
    execute: async ({ categoryId }) => {
      const comparison = await getPeerComparison(db, customerId);
      if (!categoryId) return comparison;
      return {
        ...comparison,
        categories: comparison.categories.filter((c) => c.categoryId === categoryId),
      };
    },
  });
}
