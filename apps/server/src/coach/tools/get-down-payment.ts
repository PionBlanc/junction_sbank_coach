import type { DuckDBConnection } from '@duckdb/node-api';
import { downPaymentInputSchema } from '@coach/shared';
import { tool } from 'ai';
import { getDownPayment } from '../../insights/mortgage.ts';

export function getDownPaymentTool(db: DuckDBConnection, customerId: string) {
  return tool({
    description:
      "How much of their own money (equity) a home would need, from the bank's own mortgage " +
      'applications: the median share of the price that approved applicants put in, applied to ' +
      'the price the customer gives or to the typical price, next to their balance today.',
    inputSchema: downPaymentInputSchema,
    execute: async (input) => getDownPayment(db, customerId, input.propertyPriceEur),
  });
}
