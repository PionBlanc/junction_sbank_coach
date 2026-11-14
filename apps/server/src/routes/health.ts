import type { DuckDBConnection } from '@duckdb/node-api';
import { Hono } from 'hono';
import { countCustomers } from '../db/health.ts';

export function healthRoutes(db: DuckDBConnection) {
  return new Hono().get('/health', async (c) => {
    const customers = await countCustomers(db);
    return c.json({ status: 'ok' as const, customers });
  });
}
