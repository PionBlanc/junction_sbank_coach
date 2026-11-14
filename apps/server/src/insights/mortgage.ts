import type { DuckDBConnection } from '@duckdb/node-api';
import { DATA_END_DATE, type DownPayment, type MortgageApplication } from '@coach/shared';
import { getDailyBalances } from '../db/balance.ts';
import { getEquityShares, getMortgageApplicationRow, getMortgageEvents } from '../db/mortgage.ts';
import { round2 } from './helpers.ts';

/** Steps worth showing, in the customer's words. Contacts and costs are left out. */
const STEP_LABELS: Record<string, string> = {
  application_created: 'Application started',
  property_added: 'Property added',
  property_price_updated: 'Price updated',
  loan_calculation: 'Loan calculated',
  income_information_received: 'Income details received',
  collateral_added: 'Collateral added',
  collateral_valuation: 'Collateral valued',
  additional_collateral_requested: 'More collateral asked for',
  document_received: 'Documents received',
};

/** "insufficient_income" → "insufficient income". */
function words(value: string): string {
  return value.replaceAll('_', ' ');
}

/** Equity shares have three decimals, so 14.7 % stays 14.7 %. */
function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** The customer's mortgage application: the decision, the figures, and the steps on the way. */
export async function getMortgageApplication(
  db: DuckDBConnection,
  customerId: string,
): Promise<MortgageApplication> {
  const row = await getMortgageApplicationRow(db, customerId);
  if (!row) return { application: null };
  const events = await getMortgageEvents(db, customerId);

  const steps = events.flatMap((e) => {
    if (e.eventType === 'loan_decision') {
      return [{ date: e.date, label: e.decision === 'approved' ? 'Approved' : 'Rejected' }];
    }
    const label = STEP_LABELS[e.eventType];
    return label ? [{ date: e.date, label }] : [];
  });
  const costs = events.flatMap((e) =>
    e.eventType === 'expense_recorded' && e.expenseType && e.expenseEur !== null
      ? [{ label: words(e.expenseType), amountEur: round2(e.expenseEur) }]
      : [],
  );
  const propertyType = events.findLast((e) => e.propertyType !== null)?.propertyType ?? null;

  return {
    application: {
      decision: row.decision,
      rejectionReason: row.rejectionReason ? words(row.rejectionReason) : null,
      propertyType: propertyType ? words(propertyType) : null,
      propertyPriceEur: round2(row.propertyPriceEur),
      loanEur: round2(row.loanEur),
      equityEur: round2(row.equityEur),
      collateralValueEur: round2(row.collateralValueEur),
      loanToValuePct: round3(row.loanToValue),
      startedDate: events[0]?.date ?? '',
      decidedDate: events.find((e) => e.eventType === 'loan_decision')?.date ?? null,
      steps,
      costs,
    },
  };
}

/**
 * The equity a home needs, from the bank's own mortgage applications: the median share of the
 * price that approved applicants put in, next to the customer's balance today.
 */
export async function getDownPayment(
  db: DuckDBConnection,
  customerId: string,
  propertyPriceEur: number | undefined,
): Promise<DownPayment> {
  const shares = await getEquityShares(db);
  const approved = shares.find((s) => s.decision === 'approved');
  const rejected = shares.find((s) => s.decision === 'rejected');
  const applicationCount = shares.reduce((sum, s) => sum + s.applicationCount, 0);
  // Without a price from the customer, the typical home in the approved applications.
  const price = propertyPriceEur ?? approved?.medianPriceEur ?? 0;
  const approvedEquityPct = round3(approved?.medianEquityShare ?? 0);
  const [today] = await getDailyBalances(db, customerId, DATA_END_DATE, DATA_END_DATE);

  return {
    propertyPriceEur: round2(price),
    priceIsTypical: propertyPriceEur === undefined,
    applicationCount,
    approvedCount: approved?.applicationCount ?? 0,
    approvedEquityPct,
    rejectedEquityPct: round3(rejected?.medianEquityShare ?? 0),
    equityNeededEur: round2(price * approvedEquityPct),
    balanceEur: round2(today?.balanceEur ?? 0),
  };
}
