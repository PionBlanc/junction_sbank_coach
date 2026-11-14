import type { DuckDBConnection } from '@duckdb/node-api';
import {
  CATEGORIES,
  SPENDING_BASKETS,
  SUBCATEGORIES,
  type BasketCategory,
  type Overview,
} from '@coach/shared';
import { getMonthTotals } from '../db/spending.ts';
import { getCategorySplit } from './category-split.ts';
import { isCategoryId, round2 } from './helpers.ts';
import { getPeerComparison } from './peers.ts';

/** One month: income, the three baskets with their categories, and what was left. */
export async function getOverview(
  db: DuckDBConnection,
  customerId: string,
  month: string,
): Promise<Overview> {
  const totals = await getMonthTotals(db, customerId, month);
  const peers = await getPeerComparison(db, customerId);

  const incomeEur = round2(
    totals.filter((t) => t.basket === 'income').reduce((sum, t) => sum + t.totalEur, 0),
  );

  const baskets = SPENDING_BASKETS.map((basket) => {
    const categories: BasketCategory[] = [];
    for (const row of totals) {
      if (row.basket !== basket || !isCategoryId(row.categoryId)) continue;
      // A category outside its own basket is the taxi part of transportation.
      const isHomeBasket = CATEGORIES[row.categoryId].basket === basket;
      const peer = peers.categories.find((p) => p.categoryId === row.categoryId);
      categories.push({
        categoryId: row.categoryId,
        label: isHomeBasket ? CATEGORIES[row.categoryId].label : SUBCATEGORIES.taxi.label,
        totalEur: row.totalEur,
        youMonthlyAvgEur: isHomeBasket && peer ? peer.youMonthlyAvgEur : null,
        peerMedianMonthlyEur: isHomeBasket && peer ? peer.peerMedianMonthlyEur : null,
      });
    }
    categories.sort((a, b) => b.totalEur - a.totalEur);
    const totalEur = round2(categories.reduce((sum, c) => sum + c.totalEur, 0));
    return { basket, totalEur, categories };
  });

  const spendingEur = round2(baskets.reduce((sum, b) => sum + b.totalEur, 0));
  const basketsWithShare = baskets.map((b) => ({
    ...b,
    sharePct: spendingEur > 0 ? round2(b.totalEur / spendingEur) : 0,
  }));
  const split = await getCategorySplit(db, customerId, month, month);
  return {
    month,
    ageBand: peers.ageBand,
    incomeEur,
    spendingEur,
    leftEur: round2(incomeEur - spendingEur),
    baskets: basketsWithShare,
    categorySplit: split.slices,
  };
}
