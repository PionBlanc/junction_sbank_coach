import type { DuckDBConnection, Json } from '@duckdb/node-api';

type Params = Record<string, string | number | null>;

/** Runs a prepared statement with named parameters ($name) and returns plain row objects. */
export async function queryRows(
  db: DuckDBConnection,
  sql: string,
  params: Params = {},
): Promise<Record<string, Json>[]> {
  const reader = await db.runAndReadAll(sql, params);
  return reader.getRowObjectsJson();
}
