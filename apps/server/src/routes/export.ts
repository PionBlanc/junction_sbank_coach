import type { DuckDBConnection } from '@duckdb/node-api';
import { customerParamSchema, excelExportFileName, excelExportQuerySchema } from '@coach/shared';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { buildExcelExport, clampExportRange } from '../insights/excel-export.ts';

export function exportRoutes(db: DuckDBConnection) {
  return new Hono().get(
    '/users/:id/export',
    zValidator('param', customerParamSchema),
    zValidator('query', excelExportQuerySchema),
    async (c) => {
      const query = clampExportRange(c.req.valid('query'));
      const file = await buildExcelExport(db, c.req.valid('param').id, query);
      return c.body(new Uint8Array(file), 200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${excelExportFileName(query)}"`,
      });
    },
  );
}
