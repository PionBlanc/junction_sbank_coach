import type { DuckDBConnection } from '@duckdb/node-api';
import { CATEGORIES, type PurchaseSizes } from '@coach/shared';
import { getPurchaseStats } from '../db/spending.ts';
import { LAST_MONTH, MONTHS_IN_YEAR, YEAR_FROM_MONTH, isCategoryId, round2 } from './helpers.ts';

/** How often the customer buys in each category over the last 12 months, and how big a typical purchase is. */
export async function getPurchaseSizes(
  db: DuckDBConnection,
  customerId: string,
): Promise<PurchaseSizes> {
  const rows = await getPurchaseStats(db, customerId, YEAR_FROM_MONTH, LAST_MONTH);
  const categories = rows
    .flatMap((r) =>
      isCategoryId(r.categoryId)
        ? [
            {
              categoryId: r.categoryId,
              label: CATEGORIES[r.categoryId].label,
              purchaseCount: r.purchaseCount,
              purchasesPerMonth: round2(r.purchaseCount / MONTHS_IN_YEAR),
              typicalPurchaseEur: round2(r.medianEur),
            },
          ]
        : [],
    )
    .sort((a, b) => b.typicalPurchaseEur - a.typicalPurchaseEur);

  return { fromMonth: YEAR_FROM_MONTH, toMonth: LAST_MONTH, categories };
}
