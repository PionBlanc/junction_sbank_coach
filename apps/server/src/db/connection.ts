import { DuckDBInstance, type DuckDBConnection } from '@duckdb/node-api';
import { existsSync } from 'node:fs';

/** Opens the processed database read-only. Call once at startup and pass the connection down. */
export async function openDatabase(path: string): Promise<DuckDBConnection> {
  if (!existsSync(path)) {
    throw new Error(`Database not found at ${path}. Run "npm run data" or set COACH_DB_PATH.`);
  }
  const instance = await DuckDBInstance.create(path, { access_mode: 'READ_ONLY' });
  return instance.connect();
}
