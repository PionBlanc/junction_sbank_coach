import type { DuckDBConnection } from '@duckdb/node-api';
import { customerParamSchema } from '@coach/shared';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { getActions } from '../insights/actions/index.ts';

export function actionRoutes(db: DuckDBConnection) {
  return new Hono().get('/users/:id/actions', zValidator('param', customerParamSchema), async (c) =>
    c.json(await getActions(db, c.req.valid('param').id)),
  );
}
