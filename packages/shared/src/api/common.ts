import { z } from 'zod';
import { DEMO_CUSTOMERS } from '../dataset.ts';
import { CATEGORIES, SUBCATEGORIES, type BasketId } from '../taxonomy.ts';
import type { CategoryId, SubcategoryId } from '../taxonomy.ts';

/** The baskets that count as spending (see AGENTS.md, domain rules). */
export const SPENDING_BASKETS = [
  'mandatory_regular',
  'mandatory_irregular',
  'everyday',
] as const satisfies readonly BasketId[];
export type SpendingBasketId = (typeof SPENDING_BASKETS)[number];

export const spendingBasketSchema = z.enum(SPENDING_BASKETS);
export const categoryIdSchema = z.enum(Object.keys(CATEGORIES) as [CategoryId, ...CategoryId[]]);
export const subcategoryIdSchema = z.enum(
  Object.keys(SUBCATEGORIES) as [SubcategoryId, ...SubcategoryId[]],
);
export const monthSchema = z.string().regex(/^\d{4}-\d{2}$/);

/** Route parameter: only the demo customers can be opened. */
export const customerParamSchema = z.object({
  id: z.enum(DEMO_CUSTOMERS.map((c) => c.customerId)),
});
