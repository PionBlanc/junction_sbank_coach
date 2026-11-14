/**
 * Server settings from environment variables. The only place that reads process.env.
 * Locally, values come from the .env file at the repo root (see .env.example).
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..', '..');

const envFile = join(ROOT, '.env');
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

export const CONFIG = {
  port: Number(process.env.PORT || 8787),
  /** Read-only DuckDB file built by `npm run data`. Override on the host. */
  dbPath: process.env.COACH_DB_PATH || join(ROOT, 'data', 'processed', 'coach.duckdb'),
  /** Built web app, served by this server in production. */
  webDistDir: join(ROOT, 'apps', 'web', 'dist'),
} as const;
