import type { DuckDBConnection } from '@duckdb/node-api';
import { tool } from 'ai';
import { z } from 'zod';
import { getBasketTrend } from '../../insights/basket-trend.ts';

export function getBasketTrendTool(db: DuckDBConnection, customerId: string) {
  return tool({
    description:
      'The last 12 months, month by month: spending in each of the three spending types (mandatory ' +
      "regular, mandatory irregular, everyday), with each type's total and monthly average.",
    inputSchema: z.object({}),
    execute: async () => getBasketTrend(db, customerId),
  });
}
