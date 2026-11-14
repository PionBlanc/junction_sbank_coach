import type { DuckDBConnection } from '@duckdb/node-api';
import type { CategoryId, WhatIf, WhatIfQuery } from '@coach/shared';
import { getCategoryTotals } from '../db/spending.ts';
import { LAST_MONTH, MONTHS_IN_YEAR, YEAR_FROM_MONTH, round2 } from './helpers.ts';

/**
 * Example yearly returns for the "invested" line and its range. Assumptions shown as such in the UI.
 * TODO(team): placeholders, agree on the rates and write down the source.
 */
const RETURN_PCT = 0.05;
const RETURN_LOW_PCT = 0.03;
const RETURN_HIGH_PCT = 0.07;

const DEFAULT_CUT_PCT = 0.2;
const MAX_YEARS = 10;

/** Value of putting `monthlyEur` aside every month for `years`, with monthly compounding. */
function investedValue(monthlyEur: number, years: number, yearlyReturnPct: number): number {
  const monthlyRate = yearlyReturnPct / 12;
  return round2((monthlyEur * ((1 + monthlyRate) ** (years * 12) - 1)) / monthlyRate);
}

export type WhatIfInputs = {
  categoryId: CategoryId | null;
  cutPct: number | null;
  baseMonthlyEur: number | null;
  monthlyEur: number;
  housingMonthlyEur: number;
};

export function calculateWhatIf(inputs: WhatIfInputs): WhatIf {
  const monthlyEur = round2(inputs.monthlyEur);
  const series = [];
  for (let years = 0; years <= MAX_YEARS; years++) {
    series.push({
      years,
      savedEur: round2(monthlyEur * 12 * years),
      investedEur: investedValue(monthlyEur, years, RETURN_PCT),
      investedLowEur: investedValue(monthlyEur, years, RETURN_LOW_PCT),
      investedHighEur: investedValue(monthlyEur, years, RETURN_HIGH_PCT),
    });
  }
  const fiveYearSavedEur = round2(monthlyEur * 12 * 5);
  return {
    categoryId: inputs.categoryId,
    cutPct: inputs.cutPct,
    baseMonthlyEur: inputs.baseMonthlyEur,
    monthlyEur,
    yearlyEur: round2(monthlyEur * 12),
    returnPct: RETURN_PCT,
    returnLowPct: RETURN_LOW_PCT,
    returnHighPct: RETURN_HIGH_PCT,
    series,
    fiveYearSavedEur,
    housingMonthlyEur: inputs.housingMonthlyEur,
    fiveYearHousingMonths:
      inputs.housingMonthlyEur > 0
        ? Math.round((fiveYearSavedEur / inputs.housingMonthlyEur) * 10) / 10
        : null,
  };
}

/** A cut in one category (from the user's 12-month average), or a plain monthly amount. */
export async function getWhatIf(
  db: DuckDBConnection,
  customerId: string,
  query: WhatIfQuery,
): Promise<WhatIf> {
  const totals = await getCategoryTotals(db, customerId, YEAR_FROM_MONTH, LAST_MONTH);
  const housingMonthlyEur = round2((totals.get('housing') ?? 0) / MONTHS_IN_YEAR);

  if (query.categoryId !== undefined) {
    const cutPct = query.cutPct ?? DEFAULT_CUT_PCT;
    const baseMonthlyEur = round2((totals.get(query.categoryId) ?? 0) / MONTHS_IN_YEAR);
    return calculateWhatIf({
      categoryId: query.categoryId,
      cutPct,
      baseMonthlyEur,
      monthlyEur: baseMonthlyEur * cutPct,
      housingMonthlyEur,
    });
  }
  return calculateWhatIf({
    categoryId: null,
    cutPct: null,
    baseMonthlyEur: null,
    monthlyEur: query.monthlyEur ?? 0,
    housingMonthlyEur,
  });
}
