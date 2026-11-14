import { CATEGORIES, type CategoryId, type DeckCard } from '@coach/shared';
import { isCategoryId, round2 } from '../helpers.ts';
import { pctText } from './text.ts';

/** Only a clear change makes a card: at least this share... */
const MIN_CHANGE_PCT = 0.15;
/** ...and at least this many euros a month. */
const MIN_CHANGE_EUR = 20;

export type ChangePeriod = { label: string; months: number };

/**
 * The category that changed most between two periods, in euros a month. A drop wins over a rise,
 * so a user who has cut back hears about it.
 */
export function biggestChangeCard(
  before: Map<string, number>,
  after: Map<string, number>,
  beforePeriod: ChangePeriod,
  afterPeriod: ChangePeriod,
): DeckCard | null {
  const changes: { categoryId: CategoryId; beforeEur: number; afterEur: number }[] = [];
  for (const categoryId of new Set([...before.keys(), ...after.keys()])) {
    if (!isCategoryId(categoryId)) continue;
    const beforeEur = round2((before.get(categoryId) ?? 0) / beforePeriod.months);
    const afterEur = round2((after.get(categoryId) ?? 0) / afterPeriod.months);
    const diff = afterEur - beforeEur;
    if (beforeEur <= 0 || Math.abs(diff) < MIN_CHANGE_EUR) continue;
    if (Math.abs(diff / beforeEur) < MIN_CHANGE_PCT) continue;
    changes.push({ categoryId, beforeEur, afterEur });
  }
  const drops = changes.filter((c) => c.afterEur < c.beforeEur);
  const pool = drops.length > 0 ? drops : changes;
  const best = pool.sort(
    (a, b) => Math.abs(b.afterEur - b.beforeEur) - Math.abs(a.afterEur - a.beforeEur),
  )[0];
  if (!best) return null;

  const label = CATEGORIES[best.categoryId].label;
  const direction = best.afterEur < best.beforeEur ? 'down' : 'up';
  return {
    id: 'biggest-change',
    topic: label,
    chart: {
      type: 'bars',
      bars: [
        { label: beforePeriod.label, valueEur: best.beforeEur, highlight: false },
        { label: afterPeriod.label, valueEur: best.afterEur, highlight: true },
      ],
    },
    sentence:
      `${label} spending is ${direction} ${pctText(best.afterEur / best.beforeEur - 1)} ` +
      'from the same months last year.',
    sourceNote: `Monthly average · ${afterPeriod.label} vs. a year earlier`,
    questions: [`How has my ${label.toLowerCase()} spending changed over the last year?`],
  };
}
