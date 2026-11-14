import { CATEGORIES, DATA_END_DATE, type CategoryId } from '@coach/shared';

/** "Last month" in the demo: the month of DATA_END_DATE. */
export const LAST_MONTH = DATA_END_DATE.slice(0, 7);

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function isCategoryId(value: string): value is CategoryId {
  return value in CATEGORIES;
}

/** addMonths('2026-09', -11) → '2025-10'. */
export function addMonths(month: string, count: number): string {
  const [year = 0, monthNumber = 1] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + count, 1));
  return date.toISOString().slice(0, 7);
}

/** The last 12 months of the data, used for "your monthly average". */
export const YEAR_FROM_MONTH = addMonths(LAST_MONTH, -11);
export const MONTHS_IN_YEAR = 12;

/** First date after `today` that falls on the given day of the month (clamped to the month's length). */
export function nextDayOfMonth(today: string, dayOfMonth: number): string {
  const [year = 0, month = 1, day = 1] = today.split('-').map(Number);
  for (const offset of [0, 1]) {
    const daysInMonth = new Date(Date.UTC(year, month + offset, 0)).getUTCDate();
    const candidate = new Date(
      Date.UTC(year, month - 1 + offset, Math.min(dayOfMonth, daysInMonth)),
    );
    if (offset === 1 || candidate.getUTCDate() > day) {
      return candidate.toISOString().slice(0, 10);
    }
  }
  return today;
}

export function daysBetween(fromDate: string, toDate: string): number {
  return Math.round((Date.parse(toDate) - Date.parse(fromDate)) / 86_400_000);
}
