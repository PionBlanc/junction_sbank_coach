/** Number formatting for card sentences, so the server's text matches the app's charts. */
const EUR = new Intl.NumberFormat('fi-FI', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});
/** Fixed names: Intl's short months differ between ICU versions ("Sep" or "Sept"). */
const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;
const DAY = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' });

/** 1234.5 → "1 235 €". */
export function eurText(value: number): string {
  return EUR.format(value);
}

/** 0.204 or -0.204 → "20%". The sentence says whether it is more or less. */
export function pctText(fraction: number): string {
  return `${Math.round(Math.abs(fraction) * 100)}%`;
}

/** "2026-04" → "Apr". */
export function shortMonthText(month: string): string {
  return SHORT_MONTHS[Number(month.slice(5, 7)) - 1] ?? month;
}

/** ('2026-07', '2026-09') → "Jul–Sep 2026". */
export function periodText(fromMonth: string, toMonth: string): string {
  return `${shortMonthText(fromMonth)}–${shortMonthText(toMonth)} ${toMonth.slice(0, 4)}`;
}

/** "2026-09-30" → "30 September". */
export function dayText(date: string): string {
  return DAY.format(new Date(`${date}T00:00:00Z`));
}
