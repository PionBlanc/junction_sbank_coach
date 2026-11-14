import type { DuckDBConnection } from '@duckdb/node-api';
import { tool } from 'ai';
import { z } from 'zod';
import { getMortgageApplication } from '../../insights/mortgage.ts';

export function getMortgageApplicationTool(db: DuckDBConnection, customerId: string) {
  return tool({
    description:
      "The customer's mortgage application with the bank: the decision and the reason for a " +
      'rejection, the property, its price and what the bank valued it at, the loan, their ' +
      'equity, the loan-to-value, the steps with dates, and the costs recorded. Null when they ' +
      'have not applied.',
    inputSchema: z.object({}),
    execute: async () => getMortgageApplication(db, customerId),
  });
}
