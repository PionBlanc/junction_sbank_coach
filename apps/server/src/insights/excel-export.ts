import type { DuckDBConnection } from '@duckdb/node-api';
import {
  BASKET_LABELS,
  CATEGORIES,
  DATA_START_DATE,
  type BasketId,
  type ExcelExport,
  type ExcelExportQuery,
} from '@coach/shared';
import writeXlsxFile, { type SheetData } from 'write-excel-file/node';
import { getExportTransactions } from '../db/export.ts';
import { getCategoryTotals, getIncomeAndSpendingByMonth } from '../db/spending.ts';
import { LAST_MONTH, isCategoryId, round2 } from './helpers.ts';

const FIRST_MONTH = DATA_START_DATE.slice(0, 7);
const EUR_FORMAT = '#,##0.00';

/** Keeps the months inside the dataset and in order, whatever was asked for. */
export function clampExportRange(query: ExcelExportQuery): ExcelExportQuery {
  const toMonth = query.toMonth > LAST_MONTH ? LAST_MONTH : query.toMonth;
  let fromMonth = query.fromMonth < FIRST_MONTH ? FIRST_MONTH : query.fromMonth;
  if (fromMonth > toMonth) fromMonth = toMonth;
  return { fromMonth, toMonth };
}

/** "2026-02" → "2026-02-28". */
function lastDayOfMonth(month: string): string {
  const [year = 0, monthNumber = 1] = month.split('-').map(Number);
  return new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10);
}

function categoryLabel(categoryId: string): string {
  return isCategoryId(categoryId) ? CATEGORIES[categoryId].label : categoryId;
}

function basketLabel(basket: string): string {
  return basket in BASKET_LABELS ? BASKET_LABELS[basket as BasketId] : basket;
}

/** What the coach tells the customer about the file before they download it. */
export async function describeExcelExport(
  db: DuckDBConnection,
  customerId: string,
  query: ExcelExportQuery,
): Promise<ExcelExport> {
  const { fromMonth, toMonth } = clampExportRange(query);
  const rows = await getExportTransactions(
    db,
    customerId,
    `${fromMonth}-01`,
    lastDayOfMonth(toMonth),
  );
  return { fromMonth, toMonth, transactionCount: rows.length };
}

/** The customer's data as an Excel file: every transaction, a monthly summary, spending by category. */
export async function buildExcelExport(
  db: DuckDBConnection,
  customerId: string,
  query: ExcelExportQuery,
): Promise<Buffer> {
  const { fromMonth, toMonth } = clampExportRange(query);
  const transactions = await getExportTransactions(
    db,
    customerId,
    `${fromMonth}-01`,
    lastDayOfMonth(toMonth),
  );
  const months = await getIncomeAndSpendingByMonth(db, customerId, fromMonth, toMonth);
  const categories = [...(await getCategoryTotals(db, customerId, fromMonth, toMonth))].sort(
    (a, b) => b[1] - a[1],
  );

  const header = (labels: string[]) =>
    labels.map((value) => ({ value, fontWeight: 'bold' as const }));
  const eur = (value: number) => ({ value: round2(value), type: Number, format: EUR_FORMAT });

  const transactionSheet: SheetData = [
    header(['Date', 'Category', 'Type', 'Amount (€)', 'Balance after (€)']),
    ...transactions.map((t) => [
      { value: new Date(`${t.date}T00:00:00Z`), type: Date, format: 'yyyy-mm-dd' },
      categoryLabel(t.categoryId),
      basketLabel(t.basket),
      eur(t.amountEur),
      eur(t.balanceAfterEur),
    ]),
  ];
  const monthSheet: SheetData = [
    header(['Month', 'Income (€)', 'Spending (€)', 'Left over (€)']),
    ...months.map((m) => [
      m.month,
      eur(m.incomeEur),
      eur(m.spendingEur),
      eur(m.incomeEur - m.spendingEur),
    ]),
  ];
  const categorySheet: SheetData = [
    header(['Category', 'Spending (€)']),
    ...categories.map(([categoryId, totalEur]) => [categoryLabel(categoryId), eur(totalEur)]),
  ];

  return writeXlsxFile([
    {
      sheet: 'Transactions',
      data: transactionSheet,
      columns: [{ width: 12 }, { width: 26 }, { width: 22 }, { width: 14 }, { width: 18 }],
      stickyRowsCount: 1,
    },
    {
      sheet: 'Monthly summary',
      data: monthSheet,
      columns: [{ width: 10 }, { width: 14 }, { width: 14 }, { width: 14 }],
      stickyRowsCount: 1,
    },
    {
      sheet: 'Spending by category',
      data: categorySheet,
      columns: [{ width: 26 }, { width: 14 }],
      stickyRowsCount: 1,
    },
  ]).toBuffer();
}
