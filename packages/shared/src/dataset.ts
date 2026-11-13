/**
 * Facts about the S-Pankki dataset that every part of the app must agree on.
 * See docs/data.md for how these were established.
 */

/** Last day covered by the dataset. The app treats this as "today". */
export const DATA_END_DATE = '2026-09-30';

/** First day covered by the dataset. */
export const DATA_START_DATE = '2024-10-01';

export const AGE_BANDS = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

export function ageBandOf(age: number): AgeBand {
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  if (age < 65) return '55-64';
  return '65+';
}
