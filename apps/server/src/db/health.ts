import type { DuckDBConnection } from '@duckdb/node-api';

/** Number of customers in the database. Used by the health check to prove the data is loaded. */
export async function countCustomers(db: DuckDBConnection): Promise<number> {
  const reader = await db.runAndReadAll('SELECT count(*) FROM customers');
  return Number(reader.getRows()[0]?.[0] ?? 0);
}
