/**
 * The single definition of categories, subcategories and baskets.
 * The data pipeline, the server and the web app all import from here.
 */

export const BASKETS = [
  'mandatory_regular',
  'mandatory_irregular',
  'everyday',
  'income',
  'savings_investments',
  'transfer',
] as const;
export type BasketId = (typeof BASKETS)[number];

export const BASKET_LABELS: Record<BasketId, string> = {
  mandatory_regular: 'Mandatory, regular',
  mandatory_irregular: 'Mandatory, irregular',
  everyday: 'Everyday spending',
  income: 'Income',
  savings_investments: 'Savings and investments',
  transfer: 'Transfers between own accounts',
};

type CategoryDef = {
  /** Value of the `category` column in the raw dataset. */
  source: string;
  label: string;
  basket: BasketId;
};

export const CATEGORIES = {
  housing: { source: 'Housing', label: 'Housing', basket: 'mandatory_regular' },
  utilities: { source: 'Utilities', label: 'Utilities', basket: 'mandatory_regular' },
  groceries: { source: 'Groceries', label: 'Groceries', basket: 'mandatory_regular' },
  transportation: {
    source: 'Transportation',
    label: 'Transportation',
    basket: 'mandatory_regular',
  },
  health: { source: 'Health', label: 'Health', basket: 'mandatory_irregular' },
  home_tech: { source: 'Home & Tech', label: 'Home & tech', basket: 'mandatory_irregular' },
  restaurants: { source: 'Restaurants', label: 'Restaurants & cafés', basket: 'everyday' },
  entertainment: { source: 'Entertainment', label: 'Entertainment', basket: 'everyday' },
  lifestyle: { source: 'Lifestyle', label: 'Shopping & lifestyle', basket: 'everyday' },
  travel: { source: 'Travel', label: 'Travel', basket: 'everyday' },
  salary: { source: 'Salary', label: 'Salary', basket: 'income' },
  other_income: { source: 'Other Income', label: 'Other income', basket: 'income' },
  investment_deposit: {
    source: 'Invest Deposit',
    label: 'Investments',
    basket: 'savings_investments',
  },
  investment_withdrawal: {
    source: 'Invest Withdraw',
    label: 'Investment withdrawals',
    basket: 'savings_investments',
  },
  salary_sweep: {
    source: 'Salary Sweep',
    label: 'Salary moved to own account',
    basket: 'transfer',
  },
} as const satisfies Record<string, CategoryDef>;
export type CategoryId = keyof typeof CATEGORIES;

type SubcategoryDef = {
  category: CategoryId;
  label: string;
  mcc: readonly number[];
  /** Overrides the category's basket when set. */
  basket?: BasketId;
};

/**
 * Finer split of purchases by MCC code. Purchases without an MCC have no subcategory.
 * The entries marked "demo only" use standard MCC codes that the raw dataset does not contain:
 * only the hand-made demo customers have them, see scripts/data/demo-profiles.ts.
 */
export const SUBCATEGORIES = {
  grocery_store: { category: 'groceries', label: 'Grocery stores', mcc: [5411] },
  convenience_store: { category: 'groceries', label: 'Convenience stores', mcc: [5499] },
  specialty_food: { category: 'groceries', label: 'Butchers & dairy', mcc: [5422, 5451] },
  bakery: { category: 'groceries', label: 'Bakeries', mcc: [5462] }, // demo only
  alcohol_store: { category: 'groceries', label: 'Wine & spirits shops', mcc: [5921] }, // demo only
  restaurant: { category: 'restaurants', label: 'Restaurants', mcc: [5812] },
  fast_food: { category: 'restaurants', label: 'Fast food & cafés', mcc: [5814] },
  bar: { category: 'restaurants', label: 'Bars', mcc: [5813] },
  fuel: { category: 'transportation', label: 'Fuel', mcc: [5541, 5542] },
  public_transport: { category: 'transportation', label: 'Public transport', mcc: [4111] },
  parking: { category: 'transportation', label: 'Parking', mcc: [7523] },
  taxi: { category: 'transportation', label: 'Taxis', mcc: [4121], basket: 'everyday' },
  train: { category: 'transportation', label: 'Trains', mcc: [4112] }, // demo only
  bus: { category: 'transportation', label: 'Long-distance buses', mcc: [4131] }, // demo only
  micromobility: { category: 'transportation', label: 'City bikes & e-scooters', mcc: [4789] }, // demo only
  car_service: { category: 'transportation', label: 'Car repairs & service', mcc: [7538] }, // demo only
  car_wash: { category: 'transportation', label: 'Car washes', mcc: [7542] }, // demo only
  pharmacy: { category: 'health', label: 'Pharmacy', mcc: [5912] },
  doctor: { category: 'health', label: 'Doctors', mcc: [8011] },
  dentist: { category: 'health', label: 'Dentist', mcc: [8021] },
  health_services: { category: 'health', label: 'Other health services', mcc: [8099] },
  optician: { category: 'health', label: 'Opticians & eyewear', mcc: [8043] }, // demo only
  events: { category: 'entertainment', label: 'Events & tickets', mcc: [7922] },
  cinema: { category: 'entertainment', label: 'Cinema', mcc: [7832] },
  attractions: { category: 'entertainment', label: 'Attractions & parks', mcc: [7991, 7996] },
  recreation: { category: 'entertainment', label: 'Recreation', mcc: [7999] },
  streaming: { category: 'entertainment', label: 'Streaming & digital media', mcc: [4899, 5815] }, // demo only
  games: { category: 'entertainment', label: 'Video games', mcc: [5816] }, // demo only
  betting: { category: 'entertainment', label: 'Betting & lottery', mcc: [7995] }, // demo only
  home_supplies: { category: 'home_tech', label: 'Home & hardware', mcc: [5200, 5251] },
  furniture: { category: 'home_tech', label: 'Furniture', mcc: [5712] },
  electronics: { category: 'home_tech', label: 'Electronics & software', mcc: [5732, 5734] },
  garden: { category: 'home_tech', label: 'Garden centres', mcc: [5261] }, // demo only
  appliances: { category: 'home_tech', label: 'Household appliances', mcc: [5722] }, // demo only
  clothing: { category: 'lifestyle', label: 'Clothing', mcc: [5651, 5691] },
  sports: { category: 'lifestyle', label: 'Sports goods', mcc: [5941] },
  books_hobbies: { category: 'lifestyle', label: 'Books, hobbies & toys', mcc: [5942, 5945] },
  other_retail: { category: 'lifestyle', label: 'Other shopping', mcc: [5999] },
  shoes: { category: 'lifestyle', label: 'Shoes', mcc: [5661] }, // demo only
  cosmetics: { category: 'lifestyle', label: 'Cosmetics', mcc: [5977] }, // demo only
  beauty: { category: 'lifestyle', label: 'Hairdressers & beauty', mcc: [7230, 7298] }, // demo only
  gym: { category: 'lifestyle', label: 'Gyms & sports clubs', mcc: [7997] }, // demo only
  pets: { category: 'lifestyle', label: 'Pets & vets', mcc: [5995, 742] }, // demo only
  flowers_gifts: { category: 'lifestyle', label: 'Flowers & gifts', mcc: [5992, 5947] }, // demo only
  flights: { category: 'travel', label: 'Flights', mcc: [4511] },
  hotels: { category: 'travel', label: 'Hotels', mcc: [7011] },
  travel_agencies: { category: 'travel', label: 'Travel agencies', mcc: [4722] },
  car_rental: { category: 'travel', label: 'Car rental', mcc: [7512] },
  ferries: { category: 'travel', label: 'Ferries & cruises', mcc: [4411] }, // demo only
  camping: { category: 'travel', label: 'Campsites & cabins', mcc: [7033] }, // demo only
} as const satisfies Record<string, SubcategoryDef>;
export type SubcategoryId = keyof typeof SUBCATEGORIES;
