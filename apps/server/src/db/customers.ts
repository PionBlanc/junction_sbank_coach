import type { DuckDBConnection } from '@duckdb/node-api';
import { queryRows } from './query.ts';

export type Customer = { customerId: string; age: number; ageBand: string };

export async function getCustomer(db: DuckDBConnection, customerId: string): Promise<Customer> {
  const rows = await queryRows(
    db,
    'SELECT age, age_band FROM customers WHERE customer_id = $customerId',
    { customerId },
  );
  const row = rows[0];
  if (!row) {
    throw new Error(`Unknown customer ${customerId}`);
  }
  return { customerId, age: Number(row.age), ageBand: String(row.age_band) };
}
