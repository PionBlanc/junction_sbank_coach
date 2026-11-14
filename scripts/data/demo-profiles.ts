/**
 * Hand-made spending profiles for the demo customers.
 *
 * In the raw data every customer has the same subcategory mix inside a category (see "What is real
 * signal and what is noise" in docs/data.md), so every swipe deck looks alike. For the demo customers
 * listed here, prepare.ts moves their purchases inside a category to other merchants, so that the
 * subcategory mix fits the persona: the young diner has no car, the traveller takes taxis, and so on.
 * Some subcategories (trains, streaming, gyms, ...) use standard MCC codes that the raw data does
 * not contain. They get one made-up merchant per MCC, named MRC-DEMO-<mcc>.
 *
 * Only the merchant and its MCC change. Amounts, dates, balances and category totals stay as they
 * are, so everything at category level (peer benchmarks, spender groups, safe-to-spend) is unchanged.
 * Purchases without a merchant are left alone.
 */
import { CATEGORIES, SUBCATEGORIES, type DemoCustomerId, type SubcategoryId } from '@coach/shared';

/**
 * Share of the customer's purchases in a category that goes to each subcategory. The shares of one
 * category must add up to 1. A category that is not mentioned keeps its original mix.
 */
const DEMO_MIXES: Partial<Record<DemoCustomerId, Partial<Record<SubcategoryId, number>>>> = {
  // Young diner, 23: no car, nights out, quick food, games and streaming.
  CUST00164: {
    public_transport: 0.5,
    taxi: 0.2,
    micromobility: 0.2,
    train: 0.1,
    fast_food: 0.4,
    bar: 0.35,
    restaurant: 0.25,
    events: 0.35,
    streaming: 0.2,
    games: 0.2,
    recreation: 0.15,
    cinema: 0.1,
    grocery_store: 0.65,
    convenience_store: 0.2,
    alcohol_store: 0.15,
    electronics: 1,
  },
  // Housing-heavy, 41: a family with a car, a garden and a summer ferry trip.
  CUST03802: {
    fuel: 0.6,
    car_service: 0.15,
    public_transport: 0.1,
    parking: 0.08,
    car_wash: 0.07,
    grocery_store: 0.85,
    bakery: 0.1,
    specialty_food: 0.05,
    fast_food: 0.6,
    restaurant: 0.4,
    attractions: 0.4,
    cinema: 0.25,
    streaming: 0.2,
    recreation: 0.15,
    home_supplies: 0.5,
    garden: 0.3,
    appliances: 0.2,
    ferries: 0.6,
    camping: 0.4,
  },
  // Tight budget, 26: no car, cheap eats, games, a bit of betting.
  CUST04092: {
    public_transport: 0.7,
    micromobility: 0.2,
    bus: 0.1,
    fast_food: 0.75,
    bar: 0.25,
    grocery_store: 0.6,
    convenience_store: 0.3,
    alcohol_store: 0.1,
    games: 0.35,
    streaming: 0.25,
    betting: 0.2,
    cinema: 0.2,
    gym: 0.5,
    clothing: 0.5,
    electronics: 1,
  },
  // On the move, 45: drives everywhere, eats out rarely but properly.
  CUST03593: {
    fuel: 0.55,
    car_service: 0.19,
    taxi: 0.08,
    car_wash: 0.04,
    parking: 0.07,
    train: 0.07,
    restaurant: 1,
    grocery_store: 0.9,
    bakery: 0.1,
  },
  // Wardrobe builder, 30: clothes, shoes and beauty first.
  CUST03342: {
    clothing: 0.45,
    shoes: 0.2,
    beauty: 0.2,
    cosmetics: 0.15,
    public_transport: 0.45,
    fuel: 0.3,
    taxi: 0.1,
    train: 0.1,
    parking: 0.05,
    fast_food: 0.55,
    restaurant: 0.35,
    bar: 0.1,
    grocery_store: 0.91,
    bakery: 0.04,
    specialty_food: 0.05,
    streaming: 0.4,
    cinema: 0.3,
    events: 0.3,
    pharmacy: 0.6,
    doctor: 0.2,
    optician: 0.2,
  },
  // Frequent traveller, 46: hotels and flights, taxis and trains, dinners out.
  CUST04247: {
    hotels: 0.45,
    flights: 0.35,
    ferries: 0.1,
    car_rental: 0.1,
    taxi: 0.35,
    fuel: 0.3,
    train: 0.2,
    parking: 0.1,
    car_service: 0.05,
    restaurant: 0.65,
    bar: 0.25,
    fast_food: 0.1,
    events: 0.5,
    attractions: 0.25,
    streaming: 0.25,
    grocery_store: 0.8,
    alcohol_store: 0.2,
    clothing: 0.5,
    gym: 0.5,
  },
  // Café regular, 70: a coffee most days, no car, lottery, a pet and a garden.
  CUST03347: {
    fast_food: 0.85,
    restaurant: 0.15,
    public_transport: 0.6,
    taxi: 0.2,
    train: 0.2,
    betting: 0.4,
    cinema: 0.3,
    events: 0.3,
    books_hobbies: 0.4,
    flowers_gifts: 0.3,
    pets: 0.3,
    pharmacy: 0.6,
    doctor: 0.2,
    optician: 0.2,
    grocery_store: 0.75,
    bakery: 0.15,
    specialty_food: 0.1,
    garden: 1,
    ferries: 0.6,
    hotels: 0.4,
  },
};

/** One row per customer and subcategory: the slice [fromShare, toShare) of that category's purchases. */
function mixRows(): string[] {
  const rows: string[] = [];
  for (const [customerId, mix] of Object.entries(DEMO_MIXES)) {
    const usedByCategory = new Map<string, number>();
    for (const [subcategoryId, share] of Object.entries(mix)) {
      const subcategory = SUBCATEGORIES[subcategoryId as SubcategoryId];
      const category = subcategory.category;
      const basket = 'basket' in subcategory ? subcategory.basket : CATEGORIES[category].basket;
      const from = usedByCategory.get(category) ?? 0;
      usedByCategory.set(category, from + share);
      rows.push(
        `('${customerId}', '${category}', '${subcategoryId}', '${basket}', ${from}, ${from + share})`,
      );
    }
    for (const [category, total] of usedByCategory) {
      if (Math.abs(total - 1) > 1e-6) {
        throw new Error(`Demo mix of ${customerId} for ${category} adds up to ${total}, not 1.`);
      }
    }
  }
  return rows;
}

/**
 * SQL that rewrites the demo customers' purchases in the `transactions` table. Run it right after
 * the table is built and before anything is aggregated from it. It reads the subcategory_map temp
 * table that prepare.ts creates.
 *
 * Each purchase gets a position between 0 and 1 inside its customer and category (in a fixed
 * pseudo-random order), the position picks the subcategory, and a hash picks one of that
 * subcategory's merchants.
 */
export function demoProfilesSql(): string {
  return `
  CREATE TEMP TABLE demo_mix(customer_id VARCHAR, category_id VARCHAR, subcategory_id VARCHAR,
                             basket VARCHAR, from_share DOUBLE, to_share DOUBLE);
  INSERT INTO demo_mix VALUES ${mixRows().join(',\n')};

  CREATE TEMP TABLE demo_merchants AS
  SELECT subcategory_id, merchant_id, mcc_code,
         row_number() OVER (PARTITION BY subcategory_id ORDER BY merchant_id) - 1 AS idx,
         count(*) OVER (PARTITION BY subcategory_id) AS merchant_count
  FROM (SELECT DISTINCT subcategory_id, merchant_id, mcc_code FROM transactions
        WHERE subcategory_id IS NOT NULL
        UNION ALL
        -- MCC codes that are in the taxonomy but not in the raw data: one made-up merchant each.
        SELECT subcategory_id, 'MRC-DEMO-' || mcc_code, mcc_code FROM subcategory_map
        WHERE mcc_code NOT IN (SELECT mcc_code FROM transactions WHERE mcc_code IS NOT NULL));

  CREATE TEMP TABLE demo_picks AS
  SELECT t.rowid AS row_id, t.customer_id, t.category_id,
         (row_number() OVER (PARTITION BY t.customer_id, t.category_id
                             ORDER BY hash(t.tx_timestamp, t.amount_eur), t.rowid) - 0.5)
           / count(*) OVER (PARTITION BY t.customer_id, t.category_id) AS position,
         hash(t.customer_id, t.tx_timestamp, t.amount_eur) AS merchant_hash
  FROM transactions t
  WHERE t.subcategory_id IS NOT NULL
    AND (t.customer_id, t.category_id) IN (SELECT customer_id, category_id FROM demo_mix);

  UPDATE transactions t
  SET merchant_id = m.merchant_id, mcc_code = m.mcc_code,
      subcategory_id = m.subcategory_id, basket = d.basket
  FROM demo_picks p
  JOIN demo_mix d ON d.customer_id = p.customer_id AND d.category_id = p.category_id
                 AND p.position >= d.from_share AND p.position < d.to_share
  JOIN demo_merchants m ON m.subcategory_id = d.subcategory_id
                       AND m.idx = p.merchant_hash % CAST(m.merchant_count AS UBIGINT)
  WHERE t.rowid = p.row_id;
`;
}
