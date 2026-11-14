import { describe, expect, it } from 'vitest';
import { calculateWhatIf } from './what-if.ts';

describe('calculateWhatIf', () => {
  const result = calculateWhatIf({
    categoryId: 'restaurants',
    cutPct: 0.2,
    baseMonthlyEur: 500,
    monthlyEur: 100,
    housingMonthlyEur: 800,
  });

  it('returns the monthly and yearly amounts', () => {
    expect(result.monthlyEur).toBe(100);
    expect(result.yearlyEur).toBe(1200);
  });

  it('builds a series from year 0 to year 10', () => {
    expect(result.series).toHaveLength(11);
    expect(result.series[0]).toMatchObject({ years: 0, savedEur: 0, investedEur: 0 });
    expect(result.series[10]?.savedEur).toBe(12000);
  });

  it('invested grows faster than saved, and the range brackets it', () => {
    const tenYears = result.series[10];
    // 100 € a month for 10 years at 5% a year, compounded monthly.
    expect(tenYears?.investedEur).toBeCloseTo(15528.23, 1);
    expect(tenYears?.investedLowEur).toBeLessThan(tenYears?.investedEur ?? 0);
    expect(tenYears?.investedHighEur).toBeGreaterThan(tenYears?.investedEur ?? 0);
  });

  it('translates five years of saving into months of housing', () => {
    expect(result.fiveYearSavedEur).toBe(6000);
    expect(result.fiveYearHousingMonths).toBe(7.5);
  });

  it('skips the housing comparison when there is no housing cost', () => {
    const noHousing = calculateWhatIf({
      categoryId: null,
      cutPct: null,
      baseMonthlyEur: null,
      monthlyEur: 50,
      housingMonthlyEur: 0,
    });
    expect(noHousing.fiveYearHousingMonths).toBeNull();
  });
});
