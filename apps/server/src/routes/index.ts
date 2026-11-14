import type { DuckDBConnection } from '@duckdb/node-api';
import { Hono } from 'hono';
import { actionRoutes } from './actions.ts';
import { cardRoutes } from './cards.ts';
import { chatRoutes } from './chat.ts';
import { healthRoutes } from './health.ts';
import { overviewRoutes } from './overview.ts';
import { safeToSpendRoutes } from './safe-to-spend.ts';
import { spenderGroupRoutes } from './spender-group.ts';
import { whatIfRoutes } from './what-if.ts';

/** Registration only: one line per route file. */
export function apiRoutes(db: DuckDBConnection) {
  return new Hono()
    .route('/', healthRoutes(db))
    .route('/', overviewRoutes(db))
    .route('/', safeToSpendRoutes(db))
    .route('/', whatIfRoutes(db))
    .route('/', actionRoutes(db))
    .route('/', cardRoutes(db))
    .route('/', spenderGroupRoutes(db))
    .route('/', chatRoutes(db));
}
