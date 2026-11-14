import { SUBCATEGORIES, type Action, type SubcategoryId } from '@coach/shared';
import type { SubcategoryTotal } from '../../db/spending.ts';
import { MONTHS_IN_YEAR, round2 } from '../helpers.ts';

/** Below this monthly spending a habit is not worth showing. */
const MIN_MONTHLY_EUR = 10;
/** "Every fourth one" only makes sense for something bought at least this often in a year. */
const MIN_PURCHASES = 4;

type Habit = {
  subcategoryId: SubcategoryId;
  emoji: string;
  title: string;
  /** Share of the subcategory's spending the habit frees up. */
  cutPct: number;
};

/** Taxis are not here: they have their own rule. */
const HABITS: Habit[] = [
  {
    subcategoryId: 'restaurant',
    emoji: '🍝',
    title: 'Cook one in four restaurant meals at home',
    cutPct: 0.25,
  },
  {
    subcategoryId: 'fast_food',
    emoji: '☕',
    title: 'Make every third coffee or quick lunch at home',
    cutPct: 1 / 3,
  },
  { subcategoryId: 'bar', emoji: '🍻', title: 'Skip every fourth bar tab', cutPct: 0.25 },
  {
    subcategoryId: 'grocery_store',
    emoji: '🛒',
    title: 'Trim 5% off groceries with a weekly meal plan',
    cutPct: 0.05,
  },
  {
    subcategoryId: 'convenience_store',
    emoji: '🏪',
    title: 'Skip every fourth convenience-store run',
    cutPct: 0.25,
  },
  {
    subcategoryId: 'fuel',
    emoji: '⛽',
    title: 'Walk, cycle or share one car trip in ten',
    cutPct: 0.1,
  },
  {
    subcategoryId: 'parking',
    emoji: '🅿️',
    title: 'Skip paid parking one time in four',
    cutPct: 0.25,
  },
  {
    subcategoryId: 'clothing',
    emoji: '👕',
    title: 'Skip every fourth clothing buy',
    cutPct: 0.25,
  },
  {
    subcategoryId: 'sports',
    emoji: '🏃',
    title: 'Skip every fourth sports gear buy',
    cutPct: 0.25,
  },
  {
    subcategoryId: 'other_retail',
    emoji: '🛍️',
    title: 'Sleep on one in four impulse buys',
    cutPct: 0.25,
  },
  {
    subcategoryId: 'books_hobbies',
    emoji: '📚',
    title: 'Borrow every third book or game from the library',
    cutPct: 1 / 3,
  },
  {
    subcategoryId: 'electronics',
    emoji: '🎧',
    title: 'Skip every fourth gadget or software buy',
    cutPct: 0.25,
  },
  {
    subcategoryId: 'cinema',
    emoji: '🍿',
    title: 'Swap every third cinema trip for a film night at home',
    cutPct: 1 / 3,
  },
  {
    subcategoryId: 'events',
    emoji: '🎟️',
    title: 'Skip every fourth event ticket',
    cutPct: 0.25,
  },
  {
    subcategoryId: 'attractions',
    emoji: '🎡',
    title: 'Skip every fourth attraction or park visit',
    cutPct: 0.25,
  },
  {
    subcategoryId: 'recreation',
    emoji: '🎳',
    title: 'Swap every fourth paid activity for a free one',
    cutPct: 0.25,
  },
  {
    subcategoryId: 'hotels',
    emoji: '🏨',
    title: 'Skip one hotel night in four',
    cutPct: 0.25,
  },
  // The subcategories below exist only for the hand-made demo customers, see taxonomy.ts.
  {
    subcategoryId: 'bakery',
    emoji: '🥐',
    title: 'Bake at home instead of every third bakery visit',
    cutPct: 1 / 3,
  },
  {
    subcategoryId: 'alcohol_store',
    emoji: '🍷',
    title: 'Skip every fourth trip to the wine shop',
    cutPct: 0.25,
  },
  {
    subcategoryId: 'train',
    emoji: '🚆',
    title: 'Book train tickets early and save about 15%',
    cutPct: 0.15,
  },
  {
    subcategoryId: 'micromobility',
    emoji: '🛴',
    title: 'Walk instead of every third e-scooter ride',
    cutPct: 1 / 3,
  },
  {
    subcategoryId: 'car_wash',
    emoji: '🧽',
    title: 'Wash the car yourself every other time',
    cutPct: 0.5,
  },
  {
    subcategoryId: 'streaming',
    emoji: '📺',
    title: 'Keep two streaming services out of three',
    cutPct: 1 / 3,
  },
  {
    subcategoryId: 'games',
    emoji: '🎮',
    title: 'Wait for a sale on every third game',
    cutPct: 1 / 3,
  },
  {
    subcategoryId: 'betting',
    emoji: '🎰',
    title: 'Halve your betting and lottery budget',
    cutPct: 0.5,
  },
  {
    subcategoryId: 'garden',
    emoji: '🪴',
    title: 'Skip every fourth garden-centre buy',
    cutPct: 0.25,
  },
  {
    subcategoryId: 'shoes',
    emoji: '👟',
    title: 'Skip every fourth pair of shoes',
    cutPct: 0.25,
  },
  {
    subcategoryId: 'cosmetics',
    emoji: '💄',
    title: 'Skip every fourth cosmetics buy',
    cutPct: 0.25,
  },
  {
    subcategoryId: 'beauty',
    emoji: '💇',
    title: 'Stretch the time between salon visits by a quarter',
    cutPct: 0.25,
  },
  {
    subcategoryId: 'gym',
    emoji: '🏋️',
    title: 'Swap every fourth paid class for a free workout',
    cutPct: 0.25,
  },
  {
    subcategoryId: 'flowers_gifts',
    emoji: '💐',
    title: 'Make every fourth gift yourself',
    cutPct: 0.25,
  },
  {
    subcategoryId: 'ferries',
    emoji: '⛴️',
    title: 'Skip one ferry trip or cruise in four',
    cutPct: 0.25,
  },
];

/**
 * Concrete habits, one per subcategory the user actually spends on:
 * a fixed share of their own 12-month spending in that subcategory.
 */
export function habitActions(yearTotals: Map<string, SubcategoryTotal>): Action[] {
  const actions: Action[] = [];
  for (const habit of HABITS) {
    const total = yearTotals.get(habit.subcategoryId);
    if (!total || total.txCount < MIN_PURCHASES) continue;
    const monthlyAvgEur = round2(total.totalEur / MONTHS_IN_YEAR);
    if (monthlyAvgEur < MIN_MONTHLY_EUR) continue;

    const subcategory = SUBCATEGORIES[habit.subcategoryId];
    const savingPerMonthEur = round2(monthlyAvgEur * habit.cutPct);
    actions.push({
      id: `habit-${habit.subcategoryId}`,
      title: habit.title,
      explanation:
        `You spend about ${Math.round(monthlyAvgEur)} € a month on ${subcategory.label.toLowerCase()}: ` +
        `${total.txCount} purchases in the last 12 months.`,
      emoji: habit.emoji,
      savingPerMonthEur,
      savingPerWeekEur: round2((savingPerMonthEur * 12) / 52),
      categoryId: subcategory.category,
      inputs: { monthlyAvgEur, purchaseCount: total.txCount, cutPct: habit.cutPct },
    });
  }
  return actions;
}
