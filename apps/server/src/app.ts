import type { DuckDBConnection } from '@duckdb/node-api';
import { Hono } from 'hono';
import { apiRoutes } from './routes/index.ts';

/** The API, without static file serving. Tests call this with an in-memory database. */
export function createApp(db: DuckDBConnection) {
  return new Hono().route('/api', apiRoutes(db));
}

/** Imported by the web app's Hono RPC client. Type only, never runtime code. */
export type AppType = ReturnType<typeof createApp>;
