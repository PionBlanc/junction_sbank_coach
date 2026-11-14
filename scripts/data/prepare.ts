/**
 * Builds data/processed/coach.duckdb from the raw CSVs in data/raw/.
 *
 * Output tables:
 *   transactions          one row per transaction, cleaned and enriched (category_id, basket, ...)
 *   customers             customer_id, postal_code, age, age_band
 *   monthly_category      spend/income per customer, month and category (fast path for charts)
 *   peer_benchmarks       typical monthly amount per category, by age band and for everyone
 *   mortgage_applications final outcome per mortgage application
 *   mortgage_events       event history of mortgage applications
 *
 * Rerun safe: the database file is rebuilt from scratch.
 */
import { DuckDBInstance, type DuckDBConnection } from '@duckdb/node-api';
import { existsSync } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { CATEGORIES, SUBCATEGORIES, AGE_BANDS, DATA_END_DATE, DATA_START_DATE } from '@coach/shared';
import { demoProfilesSql } from './demo-profiles.ts';

const ROOT = join(import.meta.dirname, '..', '..');
const RAW = join(ROOT, 'data', 'raw');
const OUT_DIR = join(ROOT, 'data', 'processed');
const OUT = join(OUT_DIR, 'coach.duckdb');

/** DuckDB wants forward slashes in file paths inside SQL, also on Windows. */
const rawFile = (name: string) => join(RAW, name).replaceAll('\\', '/');
const sqlString = (value: string) => `'${value.replaceAll("'", "''")}'`;

async function step(con: DuckDBConnection, label: string, sql: string): Promise<void> {
  const started = Date.now();
  await con.run(sql);
  console.log(`${label.padEnd(28)} ${((Date.now() - started) / 1000).toFixed(1)} s`);
}

for (const name of ['tx_junction_transactions.csv', 'tx_customers_junction.csv']) {
  if (!existsSync(join(RAW, name))) {
    throw new Error(`Missing data/raw/${name}. Run "npm run data:fetch" first.`);
  }
}

await mkdir(OUT_DIR, { recursive: true });
await rm(OUT, { force: true });
await rm(`${OUT}.wal`, { force: true });

const db = await DuckDBInstance.create(OUT);
const con = await db.connect();

// Lookup tables generated from the shared taxonomy, so SQL and TypeScript can never disagree.
const categoryRows = Object.entries(CATEGORIES)
  .map(([id, c]) => `(${sqlString(c.source)}, ${sqlString(id)}, ${sqlString(c.basket)})`)
  .join(',\n');
const subcategoryRows = Object.entries(SUBCATEGORIES)
  .flatMap(([id, s]) =>
    s.mcc.map(
      (mcc) => `(${mcc}, ${sqlString(id)}, ${'basket' in s ? sqlString(s.basket) : 'NULL'})`,
    ),
  )
  .join(',\n');
// Generated from AGE_BANDS ('18-24', ..., '65+'): every band but the last has an upper bound.
const ageBandCase = `CASE ${AGE_BANDS.map((band) => {
  const upper = band.split('-')[1];
  return upper
    ? `WHEN customer_age <= ${Number(upper)} THEN ${sqlString(band)}`
    : `ELSE ${sqlString(band)}`;
}).join(' ')} END`;

await step(
  con,
  'lookup tables',
  `
  CREATE TEMP TABLE category_map(source VARCHAR, category_id VARCHAR, basket VARCHAR);
  INSERT INTO category_map VALUES ${categoryRows};
  CREATE TEMP TABLE subcategory_map(mcc_code INTEGER, subcategory_id VARCHAR, basket_override VARCHAR);
  INSERT INTO subcategory_map VALUES ${subcategoryRows};
`,
);

await step(
  con,
  'customers',
  `
  CREATE TABLE customers AS
  SELECT customer_id, customer_postal_code AS postal_code, customer_age AS age, ${ageBandCase} AS age_band
  FROM read_csv(${sqlString(rawFile('tx_customers_junction.csv'))}, header = true,
                types = {'customer_postal_code': 'VARCHAR', 'customer_age': 'INTEGER'});
`,
);

await step(
  con,
  'transactions',
  `
  CREATE TABLE transactions AS
  SELECT
    t.customer_id,
    t.bank_account_id                                   AS account_id,
    t.tx_date,
    strptime(t.tx_timestamp, '%d%b%y:%H:%M:%S')         AS tx_timestamp,
    strftime(t.tx_date, '%Y-%m')                        AS month,
    t.tx_amount_eur                                     AS amount_eur,
    abs(t.tx_amount_eur)                                AS abs_amount_eur,
    CASE WHEN t.tx_amount_eur < 0 THEN 'out' ELSE 'in' END AS direction,
    t.balance_after_eur,
    t.transaction_type,
    t.category                                          AS source_category,
    c.category_id,
    s.subcategory_id,
    coalesce(s.basket_override, c.basket)               AS basket,
    t.merchant_id,
    CAST(t.mcc_code AS INTEGER)                         AS mcc_code
  FROM read_csv(${sqlString(rawFile('tx_junction_transactions.csv'))}, header = true,
                types = {'mcc_code': 'INTEGER', 'tx_timestamp': 'VARCHAR'}) t
  LEFT JOIN category_map c ON c.source = t.category
  LEFT JOIN subcategory_map s ON s.mcc_code = t.mcc_code
  ORDER BY t.customer_id, tx_timestamp;
`,
);

const unmapped = await con.runAndReadAll(
  `SELECT DISTINCT source_category FROM transactions WHERE category_id IS NULL`,
);
if (unmapped.getRows().length > 0) {
  throw new Error(
    `Unmapped categories in the dataset: ${JSON.stringify(unmapped.getRows())}. ` +
      'Add them to packages/shared/src/taxonomy.ts.',
  );
}

// The demo customers get a hand-made subcategory mix. Must run before anything is aggregated.
await step(con, 'demo profiles', demoProfilesSql());

await step(
  con,
  'monthly_category',
  `
  CREATE TABLE monthly_category AS
  SELECT customer_id, month, category_id, basket,
         round(sum(abs_amount_eur), 2) AS total_eur,
         count(*)                      AS tx_count
  FROM transactions
  GROUP BY ALL;
`,
);

// Average monthly amount per customer over the full period, zero-filled for months without
// spending, then the median and mean across customers. Only spending baskets are benchmarked.
const monthsInData = `(date_diff('month', DATE ${sqlString(DATA_START_DATE)}, DATE ${sqlString(DATA_END_DATE)}) + 1)`;
await step(
  con,
  'peer_benchmarks',
  `
  CREATE TABLE peer_benchmarks AS
  WITH per_customer AS (
    SELECT c.customer_id, c.age_band, m.category_id,
           coalesce(sum(t.total_eur), 0) / ${monthsInData} AS monthly_eur
    FROM customers c
    CROSS JOIN (SELECT DISTINCT category_id FROM monthly_category
                WHERE basket IN ('mandatory_regular', 'mandatory_irregular', 'everyday')) m
    LEFT JOIN monthly_category t ON t.customer_id = c.customer_id AND t.category_id = m.category_id
    GROUP BY ALL
  )
  SELECT coalesce(age_band, 'all') AS age_band, category_id,
         round(median(monthly_eur), 2) AS median_monthly_eur,
         round(avg(monthly_eur), 2)    AS mean_monthly_eur,
         round(quantile_cont(monthly_eur, 0.75), 2) AS p75_monthly_eur,
         count(*)                      AS customers
  FROM per_customer
  GROUP BY GROUPING SETS ((age_band, category_id), (category_id));
`,
);

if (existsSync(join(RAW, 'mtg_tx_customer_link_and_final_mtg_infio.csv'))) {
  await step(
    con,
    'mortgage tables',
    `
    CREATE TABLE mortgage_applications AS
    SELECT * RENAME (lfinal_loan_to_value AS final_loan_to_value)
    FROM read_csv(${sqlString(rawFile('mtg_tx_customer_link_and_final_mtg_infio.csv'))}, header = true);
    CREATE TABLE mortgage_events AS
    SELECT * REPLACE (strptime(timestamp, '%d%b%y:%H:%M:%S') AS timestamp)
    FROM read_csv(${sqlString(rawFile('mtg_negotiation_history.csv'))}, header = true,
                  types = {'timestamp': 'VARCHAR'});
  `,
  );
}

const summary = await con.runAndReadAll(`
  SELECT (SELECT count(*) FROM transactions) AS transactions,
         (SELECT count(*) FROM customers) AS customers,
         (SELECT count(*) FROM peer_benchmarks) AS benchmark_rows,
         (SELECT count(DISTINCT age_band) FROM peer_benchmarks WHERE age_band <> 'all') AS age_bands
`);
console.table(summary.getRowObjectsJson());

const bandsFound = Number(summary.getRowObjectsJson()[0]?.age_bands ?? 0);
if (bandsFound !== AGE_BANDS.length) {
  console.warn(`Expected ${AGE_BANDS.length} age bands, found ${bandsFound}.`);
}

con.closeSync();
db.closeSync();
console.log(`Wrote ${OUT}`);
