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

/**
 * The customers the demo shows, in user-switcher order. Picked from 12-month profiles
 * (2025-10 to 2026-09), see PLAN.md. None of them has salary sweeps.
 */
export const DEMO_CUSTOMERS = [
  { customerId: 'CUST00164', persona: 'Young diner: 23, restaurants a quarter of income' },
  { customerId: 'CUST03802', persona: 'Housing-heavy: 41, housing 44% of income, never overdrawn' },
  { customerId: 'CUST04092', persona: 'Tight budget: 26, overdrawn on 62 days in the last year' },
  { customerId: 'CUST03593', persona: 'On the move: 45, 125 fuel stops and 34 taxi rides a year' },
  { customerId: 'CUST03342', persona: 'Wardrobe builder: 30, clothing 7% of income' },
  { customerId: 'CUST04247', persona: 'Frequent traveller: 46, hotels 6% of income' },
  { customerId: 'CUST05039', persona: 'Front-row fan: 49, event tickets 8% of income' },
  { customerId: 'CUST03347', persona: 'Café regular: 70, 47 café and fast-food visits a year' },
] as const;
export type DemoCustomerId = (typeof DEMO_CUSTOMERS)[number]['customerId'];

export function ageBandOf(age: number): AgeBand {
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  if (age < 65) return '55-64';
  return '65+';
}
