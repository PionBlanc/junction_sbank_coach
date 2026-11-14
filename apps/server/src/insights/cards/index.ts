import type { DuckDBConnection } from '@duckdb/node-api';
import type { DeckCard } from '@coach/shared';
import { getPeerTotalMedian } from '../../db/peers.ts';
import {
  getBasketTotals,
  getCategoryTotals,
  getIncomeAndSpendingByMonth,
} from '../../db/spending.ts';
import { LAST_MONTH, MONTHS_IN_YEAR, YEAR_FROM_MONTH, addMonths, round2 } from '../helpers.ts';
import { getPeerComparison } from '../peers.ts';
import { getSafeToSpend } from '../safe-to-spend.ts';
import { getSpendingSummary } from '../spending-summary.ts';
import { basketsCard } from './baskets.ts';
import { biggestChangeCard } from './biggest-change.ts';
import { biggestGapCard } from './biggest-gap.ts';
import { incomeVsSpendingCard } from './income-vs-spending.ts';
import { peerTotalCard } from './peer-total.ts';
import { safeToSpendCard } from './safe-to-spend.ts';
import { periodText } from './text.ts';
import { trendCard } from './trend.ts';
import { whereItGoesCard } from './where-it-goes.ts';

/** Months on the trend card. */
const TREND_MONTHS = 6;
/** Months compared on the biggest-change card, against the same months a year earlier. */
const CHANGE_MONTHS = 3;

/**
 * Runs every card rule in deck order and drops the ones whose story does not hold.
 * Income vs. spending and where the money goes are the key cards: they stay in the first three.
 */
export async function getCards(db: DuckDBConnection, customerId: string): Promise<DeckCard[]> {
  const safeToSpend = await getSafeToSpend(db, customerId);

  const trendFrom = addMonths(LAST_MONTH, -(TREND_MONTHS - 1));
  const trend = await getSpendingSummary(db, customerId, {
    fromMonth: trendFrom,
    toMonth: LAST_MONTH,
  });
  const trendMonthly = Array.from({ length: TREND_MONTHS }, (_, i) => {
    const month = addMonths(trendFrom, i);
    return { month, totalEur: trend.monthly.find((m) => m.month === month)?.totalEur ?? 0 };
  });

  const incomeSpending = await getIncomeAndSpendingByMonth(
    db,
    customerId,
    YEAR_FROM_MONTH,
    LAST_MONTH,
  );
  const yearMonthly = Array.from({ length: MONTHS_IN_YEAR }, (_, i) => {
    const month = addMonths(YEAR_FROM_MONTH, i);
    const row = incomeSpending.find((m) => m.month === month);
    return { month, incomeEur: row?.incomeEur ?? 0, spendingEur: row?.spendingEur ?? 0 };
  });

  const yearCategories = await getCategoryTotals(db, customerId, YEAR_FROM_MONTH, LAST_MONTH);
  const yearBaskets = await getBasketTotals(db, customerId, YEAR_FROM_MONTH, LAST_MONTH);
  const youMonthlyEur = round2(
    [...yearCategories.values()].reduce((sum, v) => sum + v, 0) / MONTHS_IN_YEAR,
  );

  const peers = await getPeerComparison(db, customerId);
  const peerTotal = await getPeerTotalMedian(
    db,
    peers.ageBand,
    YEAR_FROM_MONTH,
    LAST_MONTH,
    MONTHS_IN_YEAR,
  );

  const afterFrom = addMonths(LAST_MONTH, -(CHANGE_MONTHS - 1));
  const beforeFrom = addMonths(afterFrom, -MONTHS_IN_YEAR);
  const beforeTo = addMonths(LAST_MONTH, -MONTHS_IN_YEAR);
  const after = await getCategoryTotals(db, customerId, afterFrom, LAST_MONTH);
  const before = await getCategoryTotals(db, customerId, beforeFrom, beforeTo);

  const cards = [
    safeToSpendCard(safeToSpend),
    incomeVsSpendingCard(yearMonthly),
    whereItGoesCard(yearCategories),
    trendCard(trendMonthly),
    basketsCard(yearBaskets),
    peerTotalCard(youMonthlyEur, peerTotal, peers.ageBand),
    biggestGapCard(peers),
    biggestChangeCard(
      before,
      after,
      { label: periodText(beforeFrom, beforeTo), months: CHANGE_MONTHS },
      { label: periodText(afterFrom, LAST_MONTH), months: CHANGE_MONTHS },
    ),
  ];
  return cards.filter((card) => card !== null);
}
