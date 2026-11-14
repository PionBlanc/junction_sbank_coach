import type { DuckDBConnection } from '@duckdb/node-api';
import { customerParamSchema, overviewQuerySchema } from '@coach/shared';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { getOverview } from '../insights/overview.ts';

export function overviewRoutes(db: DuckDBConnection) {
  return new Hono().get(
    '/users/:id/overview',
    zValidator('param', customerParamSchema),
    zValidator('query', overviewQuerySchema),
    async (c) => {
      const overview = await getOverview(db, c.req.valid('param').id, c.req.valid('query').month);
      return c.json(overview);
    },
  );
}
