import { describe, expect, it } from 'vitest';
import { nextDayOfMonth } from './helpers.ts';
import { calculateSafeToSpend } from './safe-to-spend.ts';

describe('nextDayOfMonth', () => {
  it('stays in the same month when the day is still ahead', () => {
    expect(nextDayOfMonth('2026-09-10', 15)).toBe('2026-09-15');
  });
  it('moves to the next month when the day has passed', () => {
    expect(nextDayOfMonth('2026-09-30', 15)).toBe('2026-10-15');
    expect(nextDayOfMonth('2026-12-20', 3)).toBe('2027-01-03');
  });
  it('clamps to the end of a short month', () => {
    expect(nextDayOfMonth('2026-02-10', 31)).toBe('2026-02-28');
  });
});

describe('calculateSafeToSpend', () => {
  const inputs = {
    balanceEur: 1000,
    paydayDayOfMonth: 15,
    housingDayOfMonth: 3,
    housingEur: 500,
    utilitiesTotalEur: 180,
  };

  it('subtracts housing and utilities due before payday and spreads the rest', () => {
    // 15 days to payday. Utilities: 180 / 3 months * 15/30 = 30. Left: 1000 - 500 - 30 = 470.
    expect(calculateSafeToSpend(inputs, '2026-09-30')).toEqual({
      balanceEur: 1000,
      nextPaydayDate: '2026-10-15',
      daysToPayday: 15,
      upcomingHousingEur: 500,
      upcomingUtilitiesEur: 30,
      availableEur: 470,
      perDayEur: 31.33,
      safeThisWeekEur: 219.33,
    });
  });

  it('leaves housing out when it falls after payday', () => {
    const result = calculateSafeToSpend({ ...inputs, housingDayOfMonth: 20 }, '2026-09-30');
    expect(result.upcomingHousingEur).toBe(0);
    expect(result.availableEur).toBe(970);
  });

  it('never goes below zero when the bills are larger than the balance', () => {
    const result = calculateSafeToSpend({ ...inputs, balanceEur: 400 }, '2026-09-30');
    expect(result.availableEur).toBe(-130);
    expect(result.perDayEur).toBe(0);
    expect(result.safeThisWeekEur).toBe(0);
  });
});
