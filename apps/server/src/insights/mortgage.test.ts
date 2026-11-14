import { DuckDBInstance } from '@duckdb/node-api';
import { describe, expect, it } from 'vitest';
import { getDownPayment, getMortgageApplication } from './mortgage.ts';

async function fixture() {
  const instance = await DuckDBInstance.create(':memory:');
  const db = await instance.connect();
  await db.run(`
    CREATE TABLE mortgage_applications AS SELECT * FROM (VALUES
      ('M1', 'c1', 'rejected', 'insufficient_income', 300000, 255000, 45000, 230000, 0.85),
      ('M2', 'c2', 'approved', NULL,                  200000, 170000, 30000, 200000, 0.85),
      ('M3', 'c3', 'approved', NULL,                  400000, 320000, 80000, 400000, 0.80)
    ) t(mortgage_customer_id, customer_id, final_decision, rejection_reason,
        final_property_price_eur, final_requested_loan_eur, final_equity_amount_eur,
        final_collateral_value_eur, final_loan_to_value);
    CREATE TABLE mortgage_events AS SELECT
      mortgage_customer_id, CAST(timestamp AS TIMESTAMP) AS timestamp, event_type, property_type,
      decision, expense_type, expense_amount
    FROM (VALUES
      ('M1', '2026-06-08 09:00:00', 'application_created', NULL,             NULL,       NULL,           NULL),
      ('M1', '2026-06-09 09:00:00', 'customer_contact',    NULL,             NULL,       NULL,           NULL),
      ('M1', '2026-06-13 09:00:00', 'property_added',      'detached_house', NULL,       NULL,           NULL),
      ('M1', '2026-06-18 09:00:00', 'expense_recorded',    NULL,             NULL,       'transfer_tax', 6000),
      ('M1', '2026-06-29 09:00:00', 'loan_decision',       'detached_house', 'rejected', NULL,           NULL)
    ) t(mortgage_customer_id, timestamp, event_type, property_type, decision, expense_type, expense_amount);
    CREATE TABLE transactions AS SELECT
      customer_id, CAST(tx_date AS DATE) AS tx_date, CAST(tx_timestamp AS TIMESTAMP) AS tx_timestamp,
      amount_eur, balance_after_eur
    FROM (VALUES ('c4', '2026-09-15', '2026-09-15 12:00:00', 500.0, 5000.0))
      t(customer_id, tx_date, tx_timestamp, amount_eur, balance_after_eur);
  `);
  return db;
}

describe('getMortgageApplication', () => {
  it('gives the decision, the figures in words, and the steps without contacts or costs', async () => {
    const { application } = await getMortgageApplication(await fixture(), 'c1');
    expect(application).toMatchObject({
      decision: 'rejected',
      rejectionReason: 'insufficient income',
      propertyType: 'detached house',
      propertyPriceEur: 300000,
      collateralValueEur: 230000,
      loanToValuePct: 0.85,
      startedDate: '2026-06-08',
      decidedDate: '2026-06-29',
      costs: [{ label: 'transfer tax', amountEur: 6000 }],
    });
    expect(application?.steps.map((s) => s.label)).toEqual([
      'Application started',
      'Property added',
      'Rejected',
    ]);
  });

  it('is null for a customer who has not applied', async () => {
    expect(await getMortgageApplication(await fixture(), 'c4')).toEqual({ application: null });
  });
});

describe('getDownPayment', () => {
  it('uses the median equity share of approved applications for the price given', async () => {
    const result = await getDownPayment(await fixture(), 'c4', 250000);
    expect(result).toEqual({
      propertyPriceEur: 250000,
      priceIsTypical: false,
      applicationCount: 3,
      approvedCount: 2,
      approvedEquityPct: 0.175,
      rejectedEquityPct: 0.15,
      equityNeededEur: 43750,
      balanceEur: 5000,
    });
  });

  it('falls back to the typical price in the applications', async () => {
    const result = await getDownPayment(await fixture(), 'c4', undefined);
    expect(result).toMatchObject({ propertyPriceEur: 300000, priceIsTypical: true });
  });
});
