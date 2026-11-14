import type { DuckDBConnection } from '@duckdb/node-api';
import { queryRows } from './query.ts';

export type MortgageApplicationRow = {
  decision: string;
  rejectionReason: string | null;
  propertyPriceEur: number;
  loanEur: number;
  equityEur: number;
  collateralValueEur: number;
  loanToValue: number;
};

/** The customer's mortgage application, or null. The data has at most one per customer. */
export async function getMortgageApplicationRow(
  db: DuckDBConnection,
  customerId: string,
): Promise<MortgageApplicationRow | null> {
  const [row] = await queryRows(
    db,
    `SELECT final_decision, rejection_reason, final_property_price_eur, final_requested_loan_eur,
            final_equity_amount_eur, final_collateral_value_eur, final_loan_to_value
     FROM mortgage_applications WHERE customer_id = $customerId LIMIT 1`,
    { customerId },
  );
  if (!row) return null;
  return {
    decision: String(row.final_decision),
    rejectionReason: row.rejection_reason === null ? null : String(row.rejection_reason),
    propertyPriceEur: Number(row.final_property_price_eur),
    loanEur: Number(row.final_requested_loan_eur),
    equityEur: Number(row.final_equity_amount_eur),
    collateralValueEur: Number(row.final_collateral_value_eur),
    loanToValue: Number(row.final_loan_to_value),
  };
}

export type MortgageEventRow = {
  date: string;
  eventType: string;
  propertyType: string | null;
  decision: string | null;
  expenseType: string | null;
  expenseEur: number | null;
};

/** The events of the customer's mortgage application, oldest first. */
export async function getMortgageEvents(
  db: DuckDBConnection,
  customerId: string,
): Promise<MortgageEventRow[]> {
  const rows = await queryRows(
    db,
    `SELECT CAST(CAST(e.timestamp AS DATE) AS VARCHAR) AS event_date, e.event_type, e.property_type,
            e.decision, e.expense_type, e.expense_amount
     FROM mortgage_events e
     JOIN mortgage_applications a USING (mortgage_customer_id)
     WHERE a.customer_id = $customerId
     ORDER BY e.timestamp`,
    { customerId },
  );
  return rows.map((r) => ({
    date: String(r.event_date),
    eventType: String(r.event_type),
    propertyType: r.property_type === null ? null : String(r.property_type),
    decision: r.decision === null ? null : String(r.decision),
    expenseType: r.expense_type === null ? null : String(r.expense_type),
    expenseEur: r.expense_amount === null ? null : Number(r.expense_amount),
  }));
}

export type EquityShareRow = {
  decision: string;
  applicationCount: number;
  medianEquityShare: number;
  medianPriceEur: number;
};

/** Per decision across all applications: how many, the median equity share, and the median price. */
export async function getEquityShares(db: DuckDBConnection): Promise<EquityShareRow[]> {
  const rows = await queryRows(
    db,
    `SELECT final_decision, count(*) AS application_count,
            median(final_equity_amount_eur / final_property_price_eur) AS median_equity_share,
            median(final_property_price_eur) AS median_price_eur
     FROM mortgage_applications GROUP BY final_decision`,
  );
  return rows.map((r) => ({
    decision: String(r.final_decision),
    applicationCount: Number(r.application_count),
    medianEquityShare: Number(r.median_equity_share),
    medianPriceEur: Number(r.median_price_eur),
  }));
}
