import { z } from 'zod';
import { monthSchema } from './common.ts';

/** Which months to put in the Excel file. Used by the coach tool and the download route. */
export const excelExportQuerySchema = z.object({ fromMonth: monthSchema, toMonth: monthSchema });
export type ExcelExportQuery = z.infer<typeof excelExportQuerySchema>;

/** Result of the coach's exportToExcel tool: what the download card links to. */
export const excelExportSchema = z.object({
  fromMonth: monthSchema,
  toMonth: monthSchema,
  transactionCount: z.number(),
});
export type ExcelExport = z.infer<typeof excelExportSchema>;
