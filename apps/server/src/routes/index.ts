import type { DuckDBConnection } from '@duckdb/node-api';
import { Hono } from 'hono';
import { healthRoutes } from './health.ts';

/** Registration only: one line per route file. */
export function apiRoutes(db: DuckDBConnection) {
  return new Hono().route('/', healthRoutes(db));
}
