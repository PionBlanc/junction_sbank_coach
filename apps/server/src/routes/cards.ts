import type { DuckDBConnection } from '@duckdb/node-api';
import { customerParamSchema } from '@coach/shared';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { getCards } from '../insights/cards/index.ts';

export function cardRoutes(db: DuckDBConnection) {
  return new Hono().get('/users/:id/cards', zValidator('param', customerParamSchema), async (c) =>
    c.json(await getCards(db, c.req.valid('param').id)),
  );
}
