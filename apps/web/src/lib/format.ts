const EUR = new Intl.NumberFormat('fi-FI', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});
const EUR_CENTS = new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR' });
const PCT = new Intl.NumberFormat('fi-FI', { style: 'percent', maximumFractionDigits: 0 });
const NUMBER = new Intl.NumberFormat('fi-FI', { maximumFractionDigits: 1 });
const MONTH = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const SHORT_MONTH = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' });
const DAY = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' });

/** 1234.5 → "1 235 €". */
export function formatEur(value: number): string {
  return EUR.format(value);
}

/** 1234.5 → "1 234,50 €". For breakdown rows, where the cents matter. */
export function formatEurCents(value: number): string {
  return EUR_CENTS.format(value);
}

/** 0.2 → "20 %". */
export function formatPct(fraction: number): string {
  return PCT.format(fraction);
}

export function formatNumber(value: number): string {
  return NUMBER.format(value);
}

/** "2026-09" → "September 2026". */
export function formatMonth(month: string): string {
  return MONTH.format(new Date(`${month}-01T00:00:00Z`));
}

/** "2026-09" → "Sep". */
export function formatShortMonth(month: string): string {
  return SHORT_MONTH.format(new Date(`${month}-01T00:00:00Z`));
}

/** "2026-10-15" → "15 October". */
export function formatDay(date: string): string {
  return DAY.format(new Date(`${date}T00:00:00Z`));
}
