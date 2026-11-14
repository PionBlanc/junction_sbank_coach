import { DuckDBInstance } from '@duckdb/node-api';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.ts';

describe('GET /api/health', () => {
  it('reports ok and the number of customers', async () => {
    const instance = await DuckDBInstance.create(':memory:');
    const db = await instance.connect();
    await db.run(`CREATE TABLE customers AS SELECT * FROM (VALUES ('c1'), ('c2')) t(customer_id)`);

    const res = await createApp(db).request('/api/health');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok', customers: 2 });
  });
});
