import type { DuckDBConnection } from '@duckdb/node-api';
import { CATEGORIES, type CategoryId, type LargestPurchases } from '@coach/shared';
import { getLargestPurchases as queryLargestPurchases } from '../db/spending.ts';
import { isCategoryId, round2 } from './helpers.ts';

/** Enough to see what stands out, few enough for a small chart. */
const PURCHASE_COUNT = 5;

/** The largest purchases over a month range, for all spending or one category. */
export async function getLargestPurchases(
  db: DuckDBConnection,
  customerId: string,
  filter: { fromMonth: string; toMonth: string; categoryId?: CategoryId | undefined },
): Promise<LargestPurchases> {
  const { purchases, purchaseCount } = await queryLargestPurchases(db, customerId, {
    categoryId: filter.categoryId ?? null,
    fromMonth: filter.fromMonth,
    toMonth: filter.toMonth,
    limit: PURCHASE_COUNT,
  });
  return {
    fromMonth: filter.fromMonth,
    toMonth: filter.toMonth,
    label: filter.categoryId ? CATEGORIES[filter.categoryId].label : 'All spending',
    purchaseCount,
    purchases: purchases.flatMap((p) =>
      isCategoryId(p.categoryId)
        ? [
            {
              date: p.date,
              categoryId: p.categoryId,
              label: CATEGORIES[p.categoryId].label,
              amountEur: round2(p.amountEur),
            },
          ]
        : [],
    ),
  };
}
