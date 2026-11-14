import type { DuckDBConnection } from '@duckdb/node-api';
import { customerParamSchema } from '@coach/shared';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { getSpenderGroup } from '../insights/spender-group.ts';

export function spenderGroupRoutes(db: DuckDBConnection) {
  return new Hono().get(
    '/users/:id/spender-group',
    zValidator('param', customerParamSchema),
    async (c) => c.json(await getSpenderGroup(db, c.req.valid('param').id)),
  );
}
