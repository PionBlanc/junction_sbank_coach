import { z } from 'zod';
import { monthSchema } from './common.ts';

/** Which months to put in the Excel file. Used by the coach tool and the download route. */
export const excelExportQuerySchema = z.object({ fromMonth: monthSchema, toMonth: monthSchema });
export type ExcelExportQuery = z.infer<typeof excelExportQuerySchema>;

const MONTH_NAMES = 'jan feb mar apr may jun jul aug sep oct nov dec'.split(' ');

/** "2026-09" → "sep-2026". */
function monthForFileName(month: string): string {
  const [year = '', monthNumber = '1'] = month.split('-');
  return `${MONTH_NAMES[Number(monthNumber) - 1] ?? monthNumber}-${year}`;
}

/**
 * The downloaded file's name, saying what is inside and for which months:
 * "transactions-income-and-spending-oct-2025-to-sep-2026.xlsx". The server sends it and the chat card shows it.
 */
export function excelExportFileName(query: ExcelExportQuery): string {
  const from = monthForFileName(query.fromMonth);
  const to = monthForFileName(query.toMonth);
  const period = from === to ? from : `${from}-to-${to}`;
  return `transactions-income-and-spending-${period}.xlsx`;
}

/** Result of the coach's exportToExcel tool: what the download card links to. */
export const excelExportSchema = z.object({
  fromMonth: monthSchema,
  toMonth: monthSchema,
  transactionCount: z.number(),
});
export type ExcelExport = z.infer<typeof excelExportSchema>;
