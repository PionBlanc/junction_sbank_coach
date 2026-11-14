import { z } from 'zod';
import { monthSchema } from './common.ts';

/** Which months to put in the Excel file. Used by the coach tool and the download route. */
export const excelExportQuerySchema = z.object({ fromMonth: monthSchema, toMonth: monthSchema });
export type ExcelExportQuery = z.infer<typeof excelExportQuerySchema>;

/** The downloaded file's name. The server sends it and the chat card shows it. */
export function excelExportFileName(query: ExcelExportQuery): string {
  return `my-data-${query.fromMonth}-to-${query.toMonth}.xlsx`;
}

/** Result of the coach's exportToExcel tool: what the download card links to. */
export const excelExportSchema = z.object({
  fromMonth: monthSchema,
  toMonth: monthSchema,
  transactionCount: z.number(),
});
export type ExcelExport = z.infer<typeof excelExportSchema>;
