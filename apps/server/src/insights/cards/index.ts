import type { DuckDBConnection } from '@duckdb/node-api';
import { DATA_END_DATE, type DeckCard } from '@coach/shared';
import { getCustomer } from '../../db/customers.ts';
import { getPeerPaydayRatio, getPeerTotalMedian, getPeerWeekendRatio } from '../../db/peers.ts';
import {
  getBasketTotals,
  getCategoryTotals,
  getDailyPurchases,
  getIncomeAndSpendingByMonth,
} from '../../db/spending.ts';
import { LAST_MONTH, MONTHS_IN_YEAR, YEAR_FROM_MONTH, addMonths, round2 } from '../helpers.ts';
import { getActions } from '../actions/index.ts';
import { getPeerComparison } from '../peers.ts';
import { getSafeToSpend } from '../safe-to-spend.ts';
import { RETURN_PCT } from '../what-if.ts';
import { basketsCard } from './baskets.ts';
import { biggestChangeCard } from './biggest-change.ts';
import { biggestGapCard } from './biggest-gap.ts';
import { rankCards } from './importance.ts';
import { incomeVsSpendingCard } from './income-vs-spending.ts';
import { millionaireCard } from './millionaire.ts';
import { PAYDAY_WEEK_DAYS, paydayCard } from './payday.ts';
import { peerTotalCard } from './peer-total.ts';
import { safeToSpendCard } from './safe-to-spend.ts';
import { periodText } from './text.ts';
import { weekendCard } from './weekend.ts';
import { whereItGoesCard } from './where-it-goes.ts';

/** Months on the income and spending card. */
const INCOME_MONTHS = 6;
/** Months compared on the biggest-change card, against the same months a year earlier. */
const CHANGE_MONTHS = 3;

type PeerPatterns = { weekendRatio: number; paydayRatio: number };

/** The data never changes while the server runs, so the median person's patterns are computed once. */
let peerPatterns: PeerPatterns | null = null;

async function getPeerPatterns(db: DuckDBConnection): Promise<PeerPatterns> {
  if (!peerPatterns) {
    const fromDate = `${YEAR_FROM_MONTH}-01`;
    peerPatterns = {
      weekendRatio: await getPeerWeekendRatio(db, fromDate, DATA_END_DATE),
      paydayRatio: await getPeerPaydayRatio(db, fromDate, DATA_END_DATE, PAYDAY_WEEK_DAYS),
    };
  }
  return peerPatterns;
}

/**
 * Runs every card rule, drops the ones whose story does not hold, and puts the most important first.
 * The list below is the catalogue order, used only to break ties between equal scores.
 */
export async function getCards(db: DuckDBConnection, customerId: string): Promise<DeckCard[]> {
  const safeToSpend = await getSafeToSpend(db, customerId);

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
  const leftOverMonthlyEur = round2(
    yearMonthly.reduce((sum, m) => sum + m.incomeEur - m.spendingEur, 0) / MONTHS_IN_YEAR,
  );
  const actionsMonthlyEur = round2(
    (await getActions(db, customerId)).reduce((sum, a) => sum + a.savingPerMonthEur, 0),
  );
  const customer = await getCustomer(db, customerId);

  const days = await getDailyPurchases(db, customerId, `${YEAR_FROM_MONTH}-01`, DATA_END_DATE);

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

  const patterns = await getPeerPatterns(db);

  const cards = [
    safeToSpendCard(safeToSpend),
    incomeVsSpendingCard(yearMonthly.slice(-INCOME_MONTHS)),
    whereItGoesCard(yearCategories),
    paydayCard(days, patterns.paydayRatio),
    weekendCard(days, patterns.weekendRatio),
    millionaireCard(
      leftOverMonthlyEur > 0
        ? { monthlyEur: leftOverMonthlyEur, source: 'left-over' }
        : { monthlyEur: actionsMonthlyEur, source: 'actions' },
      customer.age,
      RETURN_PCT,
    ),
    basketsCard(yearBaskets),
    peerTotalCard(youMonthlyEur, peerTotal),
    biggestGapCard(peers),
    biggestChangeCard(
      before,
      after,
      { label: periodText(beforeFrom, beforeTo), months: CHANGE_MONTHS },
      { label: periodText(afterFrom, LAST_MONTH), months: CHANGE_MONTHS },
    ),
  ];
  return rankCards(cards.filter((card) => card !== null));
}
