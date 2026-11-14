import type { DuckDBConnection } from '@duckdb/node-api';
import { DATA_START_DATE, balanceHistoryInputSchema } from '@coach/shared';
import { tool } from 'ai';
import { getBalanceHistory } from '../../insights/balance-history.ts';
import { LAST_MONTH, MONTHS_IN_YEAR, addMonths } from '../../insights/helpers.ts';

const FIRST_MONTH = DATA_START_DATE.slice(0, 7);

export function getBalanceHistoryTool(db: DuckDBConnection, customerId: string) {
  return tool({
    description:
      'The account balance at the end of every day for a range of months (YYYY-MM), at most 12, ' +
      'with the balance at the start and end, the change, the lowest balance and its date, and ' +
      'the number of days below zero. Drawn as a line.',
    inputSchema: balanceHistoryInputSchema,
    execute: async (input) => {
      // Keep the range inside the dataset and at most 12 months, whatever the model asked for.
      const toMonth = input.toMonth > LAST_MONTH ? LAST_MONTH : input.toMonth;
      const earliest = addMonths(toMonth, -(MONTHS_IN_YEAR - 1));
      let fromMonth = input.fromMonth < earliest ? earliest : input.fromMonth;
      if (fromMonth < FIRST_MONTH) fromMonth = FIRST_MONTH;
      if (fromMonth > toMonth) fromMonth = toMonth;
      return getBalanceHistory(db, customerId, fromMonth, toMonth);
    },
  });
}
