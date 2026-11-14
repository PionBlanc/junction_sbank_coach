import { DuckDBInstance } from '@duckdb/node-api';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.ts';
import { clampExportRange, describeExcelExport } from './excel-export.ts';

async function fixture() {
  const instance = await DuckDBInstance.create(':memory:');
  const db = await instance.connect();
  await db.run(`
    CREATE TABLE transactions AS SELECT
      customer_id, CAST(tx_date AS DATE) AS tx_date, CAST(tx_timestamp AS TIMESTAMP) AS tx_timestamp,
      category_id, basket, amount_eur, balance_after_eur
    FROM (VALUES
      ('CUST00164', '2026-08-31', '2026-08-31 10:00:00', 'groceries', 'mandatory_regular', -40.0, 960.0),
      ('CUST00164', '2026-09-15', '2026-09-15 08:00:00', 'salary',    'income',          2000.0, 2960.0),
      ('CUST00164', '2026-09-20', '2026-09-20 12:00:00', 'restaurants', 'everyday',       -60.0, 2900.0)
    ) t(customer_id, tx_date, tx_timestamp, category_id, basket, amount_eur, balance_after_eur);
    CREATE TABLE monthly_category AS SELECT * FROM (VALUES
      ('CUST00164', '2026-09', 'salary',      'income',   2000.0),
      ('CUST00164', '2026-09', 'restaurants', 'everyday',   60.0)
    ) t(customer_id, month, category_id, basket, total_eur);
  `);
  return db;
}

describe('excel export', () => {
  it('keeps the months inside the dataset and in order', () => {
    expect(clampExportRange({ fromMonth: '2020-01', toMonth: '2030-01' })).toEqual({
      fromMonth: '2024-10',
      toMonth: '2026-09',
    });
    expect(clampExportRange({ fromMonth: '2026-09', toMonth: '2026-01' })).toEqual({
      fromMonth: '2026-01',
      toMonth: '2026-01',
    });
  });

  it('counts the transactions in the chosen months', async () => {
    const result = await describeExcelExport(await fixture(), 'CUST00164', {
      fromMonth: '2026-09',
      toMonth: '2026-09',
    });
    expect(result).toEqual({ fromMonth: '2026-09', toMonth: '2026-09', transactionCount: 2 });
  });

  it('serves an xlsx download', async () => {
    const res = await createApp(await fixture()).request(
      '/api/users/CUST00164/export?fromMonth=2026-09&toMonth=2026-09',
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Disposition')).toContain('my-data-2026-09-to-2026-09.xlsx');
    // An xlsx file is a zip archive, which starts with "PK".
    const bytes = new Uint8Array(await res.arrayBuffer());
    expect(String.fromCharCode(bytes[0] ?? 0, bytes[1] ?? 0)).toBe('PK');
  });
});
