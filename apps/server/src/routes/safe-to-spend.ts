import type { DuckDBConnection } from '@duckdb/node-api';
import { customerParamSchema } from '@coach/shared';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { getSafeToSpend } from '../insights/safe-to-spend.ts';

export function safeToSpendRoutes(db: DuckDBConnection) {
  return new Hono().get(
    '/users/:id/safe-to-spend',
    zValidator('param', customerParamSchema),
    async (c) => c.json(await getSafeToSpend(db, c.req.valid('param').id)),
  );
}
