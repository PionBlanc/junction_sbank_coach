import type { DuckDBConnection } from '@duckdb/node-api';
import { customerParamSchema, whatIfQuerySchema } from '@coach/shared';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { getWhatIf } from '../insights/what-if.ts';

export function whatIfRoutes(db: DuckDBConnection) {
  return new Hono().get(
    '/users/:id/what-if',
    zValidator('param', customerParamSchema),
    zValidator('query', whatIfQuerySchema),
    async (c) => c.json(await getWhatIf(db, c.req.valid('param').id, c.req.valid('query'))),
  );
}
