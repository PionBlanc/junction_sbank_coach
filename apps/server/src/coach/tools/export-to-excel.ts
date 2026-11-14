import type { DuckDBConnection } from '@duckdb/node-api';
import { excelExportQuerySchema } from '@coach/shared';
import { tool } from 'ai';
import { describeExcelExport } from '../../insights/excel-export.ts';

export function exportToExcelTool(db: DuckDBConnection, customerId: string) {
  return tool({
    description:
      'Give the customer their data as an Excel file for a range of months (YYYY-MM): every ' +
      'transaction, a monthly summary of income and spending, and spending by category. ' +
      'A download card appears in the chat by itself. Returns the months and how many ' +
      'transactions the file holds.',
    inputSchema: excelExportQuerySchema,
    execute: async (input) => describeExcelExport(db, customerId, input),
  });
}
