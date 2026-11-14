# Dataset

Facts about the S-Pankki Junction 2026 dataset, established by profiling the full data. Read this before writing any query. Source: [hackjunction/Junction-2026-S-pankki](https://github.com/hackjunction/Junction-2026-S-pankki).

## Getting it

```
npm run data          # = data:fetch + data:prepare
```

- `data:fetch` downloads the four CSVs into `data/raw/` (about 365 MB). The transactions file is stored with Git LFS. The script fetches it from GitHub's media host directly, so you do not need `git lfs`. Files already present are skipped.
- `data:prepare` builds `data/processed/coach.duckdb` (about 105 MB) in about 15 seconds. It is safe to rerun.

Both folders are git-ignored. Every developer runs this once locally.

## Raw files

| File                                           | Rows      | Contents                                                               |
| ---------------------------------------------- | --------- | ---------------------------------------------------------------------- |
| `tx_junction_transactions.csv`                 | 3,626,755 | All transactions                                                       |
| `tx_customers_junction.csv`                    | 5,100     | `customer_id`, `customer_postal_code`, `customer_age`                  |
| `mtg_tx_customer_link_and_final_mtg_infio.csv` | 201       | Mortgage applications and their final outcome, linked to `customer_id` |
| `mtg_negotiation_history.csv`                  | 3,453     | Event history of the mortgage applications                             |

The CSVs start with a UTF-8 BOM. DuckDB handles it.

## What the transactions look like

- **Period:** 2024-10-01 to 2026-09-30, 24 full months, about 150,000 rows a month.
- **Customers:** 5,100, ages 18–90 (mean 43). About half have a Helsinki postcode (`00xxx`). **One account per customer.**
- **Amount sign:** negative = money out, positive = money in. Reliable, no exceptions.
- **Timestamp:** SAS format, `03OCT24:09:04:04`. Parse with `strptime(ts, '%d%b%y:%H:%M:%S')`. Sorting the raw string is wrong. Once parsed, `balance_after_eur` is consistent with the previous balance plus the amount on all but 3 of 3.6M rows.
- **Typical customer month:** about 30 transactions. Median income 3,210 €, median spending 2,670 €.
- **Overdrafts:** 3,526 customers (69%) have a negative balance at some point.

### Categories (given by the bank)

| `category`      | `transaction_type`    | Rows    | Avg €  | Notes                                                                                                 |
| --------------- | --------------------- | ------- | ------ | ----------------------------------------------------------------------------------------------------- |
| Groceries       | purchase              | 868,519 | −70    |                                                                                                       |
| Restaurants     | purchase              | 759,280 | −40    | Includes coffees and fast food (MCC 5814)                                                             |
| Transportation  | purchase              | 626,930 | −45    | Fuel, public transport, parking, taxis by MCC. **The MCC split is noise**, see below                  |
| Utilities       | utilities_payment     | 342,728 | −57    | About 3 per month. **No merchant or MCC**, so electricity, phone, and internet cannot be separated    |
| Entertainment   | purchase              | 302,691 | −60    |                                                                                                       |
| Health          | purchase              | 151,912 | −90    |                                                                                                       |
| Salary          | salary                | 121,725 | +3,362 | Every customer has salary, never more than one a month                                                |
| Home & Tech     | purchase              | 115,086 | −218   |                                                                                                       |
| Housing         | housing_payment       | 112,903 | −1,088 | At most one a month. 4,882 customers have it, and 3.6% of their months are skipped                    |
| Lifestyle       | purchase              | 110,916 | −202   | Clothing, sports, hobbies                                                                             |
| Travel          | purchase              | 65,377  | −243   |                                                                                                       |
| Invest Deposit  | investment_deposit    | 35,668  | −358   | 1,500 customers invest                                                                                |
| Other Income    | other_income          | 6,299   | +2,657 |                                                                                                       |
| Salary Sweep    | salary_sweep          | 6,189   | −3,825 | Salary moved to another own account the day after payday. 264 customers. **A transfer, not spending** |
| Invest Withdraw | investment_withdrawal | 532     | +1,568 |                                                                                                       |

### Merchants and MCC codes

- `merchant_id` is an opaque id such as `MRC-GRO-0035`. The middle part matches the category. There are **no merchant names**, so we cannot tell S-market from Lidl or Netflix from Spotify.
- 515 merchants, 36 MCC codes. Each merchant has exactly one MCC. About 5% of purchases have neither merchant nor MCC (always both missing together): 14% of Travel, 12% of Transportation and Health, 6% of Home & Tech and Lifestyle, 4% of Entertainment, 2.5% of Restaurants, 1.5% of Groceries.
- **There are no subscriptions in the data.** No purchase repeats with the same merchant and amount across 6 or more months.

## What is real signal and what is noise

Established by profiling the full processed database in November 2026. The dataset is synthetic, and the generator clearly works like this: each customer has their own income, their own purchase frequency per category, and their own typical purchase size per category. The merchant, and with it the MCC code, is then drawn at random from one global popularity list for the category. Everything below follows from that.

"Persistence" in this section means the correlation across customers between the first 12 months and the last 12 months of the same measure. Near 1 means a stable personal trait. Near 0 means the measure is random for the individual.

### Where taxi rides and parking costs come from in the code

1. The raw `mcc_code` column is the only source. Nothing else in the data says "taxi" or "parking".
2. [taxonomy.ts](../packages/shared/src/taxonomy.ts) maps MCC 4121 to subcategory `taxi` (with the basket overridden to `everyday`) and MCC 7523 to `parking`.
3. [prepare.ts](../scripts/data/prepare.ts) joins that map onto each transaction and writes `transactions.subcategory_id`.
4. The taxi card ([taxis.ts](../apps/server/src/insights/actions/taxis.ts)) gets the customer's last-12-month total and row count for `subcategory_id = 'taxi'` and calls the row count "rides". The parking card ([habits.ts](../apps/server/src/insights/actions/habits.ts)) does the same for `parking` through `getSubcategoryTotals`.

So a "taxi ride" is one Transportation purchase whose merchant happens to carry MCC 4121.

### Subcategories (MCC) carry no information about the customer

| Transportation subcategory | MCC        | Rows    | Share of rows | Merchants | Median € | Mean € | Total   |
| -------------------------- | ---------- | ------- | ------------- | --------- | -------- | ------ | ------- |
| Fuel                       | 5541, 5542 | 246,009 | 39.2%         | 29        | 41.24    | 45.12  | 11.1 M€ |
| Parking                    | 7523       | 133,629 | 21.3%         | 12        | 41.21    | 45.61  | 6.1 M€  |
| Public transport           | 4111       | 112,751 | 18.0%         | 18        | 41.32    | 45.21  | 5.1 M€  |
| No MCC                     |            | 75,340  | 12.0%         | 0         | 41.32    | 45.21  | 3.4 M€  |
| Taxi                       | 4121       | 59,201  | 9.4%          | 6         | 41.27    | 45.64  | 2.7 M€  |

- **The amounts are the same distribution.** Every percentile matches across the five rows (5th percentile 19 €, 25th 30.5 €, 75th 55 €, 95th 82 €). A "parking" payment is over 20 € in 94% of cases, exactly like a "taxi ride" or a fuel stop. The same holds inside every other category: a bar tab, a fast-food meal, and a restaurant dinner all have a median of 23.5 €; a flight and a car rental both about 130 €.
- **The timing is the same.** Hour-of-day and weekday profiles are identical across subcategories of a category. Taxis are not more common on Friday and Saturday nights (0.6% of rows, same as fuel). Bars are not later than restaurants.
- **A customer's mix is pure chance.** For every subcategory in every category, the spread of per-customer shares equals what random draws with the global share would give (observed variance divided by binomial variance is 0.91 to 1.07), and the persistence of the share is zero (−0.06 to +0.06). A customer who took "many taxis" last year is no more likely than anyone else to take many this year.
- **Everyone does everything.** In the last 12 months 94% of customers have taxi rows, 99% parking rows, 98% public transport rows, and 99.5% fuel rows, and 92% have all four. There are no car owners and no car-free people in this data.
- **The count just follows total Transportation volume.** Taxi rides in the last 12 months: median 5 per customer, 90th percentile 12, maximum 34. Parking: median 11, 90th percentile 26, maximum 75. The customer with the most taxi rides, `CUST03593` (34), has them because they have 314 Transportation purchases a year, and 9.4% of 314 is about 30.

What this means for the app:

- The total for a subcategory is a correct sum of real rows, so "How much did I spend on taxis last month?" has a truthful answer in the data's own terms.
- The numbers are not believable as taxi or parking behaviour (45 € parking tickets, parking costing as much in total as fuel), and they say nothing personal. The taxi card passes its 10 €/month threshold for 3,603 customers (71%) and the parking card passes for 4,379 (86%), with savings that are simply about 4.7% and 5.3% of each person's Transportation spending.
- Any advice or persona built on a subcategory ("you are a taxi person", "café regular", "wardrobe builder") describes a random draw. Advice built on the **category** is sound.

### Merchants carry no information either

- Every customer draws from the same popularity list. In Groceries the most popular merchant, `MRC-GRO-0032`, has 10.6% of all rows, and the average customer gives 10.6% of their grocery purchases to their own top merchant. It is the top merchant for 4,708 of 5,100 customers.
- No loyalty, no local shops: the merchant mix is the same in every postcode area.
- Purchase size does not depend on the merchant. Merchant medians within a category differ by a few percent only.
- So "your favourite shop" or "you could switch to a cheaper store" cannot be derived.

### What is a real personal trait

| Measure (per customer)                       | Persistence  | Notes                                                                                                |
| -------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------- |
| Salary per year                              | 0.99         |                                                                                                      |
| Housing per year                             | 0.96         |                                                                                                      |
| Utilities per year                           | 0.93         |                                                                                                      |
| Investment deposits per year                 | 0.99         |                                                                                                      |
| Spending per year in a purchase category     | 0.48 to 0.71 | Restaurants and travel 0.71, groceries and home & tech 0.66, transportation 0.54, entertainment 0.48 |
| Purchase count per year in a category        | 0.53 to 0.89 | More stable than euros, because single large purchases move the euro total                           |
| Typical purchase size in a category (median) | 0.55 to 0.77 | Customers differ a lot: median restaurant bill is 8.5 € at the 10th percentile, 64 € at the 90th     |
| Share of spending that is everyday spending  | 0.66         | Median 24% of spending, 15% to 33% between the 10th and 90th percentile                              |
| Share of purchases on weekends               | 0.12         | Comes only from category mix. Inside Restaurants alone it is 0.00                                    |
| Share of purchases in the evening            | 0.22         | Also category mix                                                                                    |
| Share of purchases in the week after payday  | 0.02         | Not a personal trait. Everyone has the same bump                                                     |
| Share of a subcategory inside its category   | 0.00         | See above                                                                                            |

In short: **how much, how often, and how big per category is personal. Which kind, where, and when is not.**

Spending follows income closely. Across customers, the correlation of salary with category spending is 0.97 for utilities, 0.80 for travel and home & tech, 0.78 for restaurants, 0.69 for transportation, 0.63 for groceries, 0.60 for entertainment, 0.53 for lifestyle, and 0.40 for health. Housing is a median 32.5% of salary (22.8% to 45.5% between the 10th and 90th percentile). Peer comparisons by age band alone therefore mostly rediscover who earns more.

### Single months are noisy

Median month-to-month variation of one customer's spending in a category (standard deviation divided by mean, first 1,000 customers): housing 0.03, utilities 0.32, groceries 0.81, restaurants 1.16, transportation 1.18, home & tech 1.29, lifestyle 1.31, entertainment 1.41, health 1.70, travel 1.80. A category is completely empty in a third of months for restaurants and transportation and in about 60% for health and travel. Anything said about one month ("last month you spent more on…") is mostly chance. Use the 12-month window.

Purchase amounts have a heavy tail. Purchases above 10 times the category median are 1% to 2% of rows but 11% of euros in restaurants, entertainment, and health, and 17% to 19% in lifestyle, travel, and home & tech (groceries and transportation: about 1%). One such purchase can dominate a customer's yearly total in a category. About 3,200 purchases are under 1 €.

### Time patterns (real, at category level)

| Category       | 06–09 | 10–15 | 16–19 | 20–23 | Weekend share of rows |
| -------------- | ----- | ----- | ----- | ----- | --------------------- |
| Transportation | 30%   | 39%   | 28%   | 2%    | 16%                   |
| Health         | 15%   | 78%   | 7%    | 0%    | 7%                    |
| Groceries      | 1%    | 36%   | 47%   | 16%   | 29%                   |
| Restaurants    | 0%    | 18%   | 53%   | 29%   | 41%                   |
| Entertainment  | 0%    | 8%    | 50%   | 42%   | 42%                   |
| Home & Tech    | 4%    | 52%   | 36%   | 8%    | 38%                   |
| Lifestyle      | 4%    | 52%   | 36%   | 8%    | 38%                   |
| Travel         | 18%   | 56%   | 21%   | 4%    | 36%                   |

- Nothing happens between midnight and 06:00 except 0.9% of Transportation rows.
- Restaurants and Entertainment peak on Friday and Saturday (about 47% of rows on those two days). Transportation and Health are weekday categories.
- **Payday bump:** purchases on the 15th to 19th of the month are about 16% higher (rows and euros) than on other days. Measured from each customer's actual salary date, the first three days after it have about 27% more purchases per day than days 14 to 20. The bump is in the number of purchases, not their size, and is the same for everyone (persistence 0.02).
- **Seasonality is mild:** travel is 40% higher in July (and raised in June and August), home & tech 28% higher in November, utilities 8% higher from November to March, restaurants and entertainment slightly higher from May to August and lowest in November.
- **No trend:** every category's total changes by less than 2.5% between the first and second year. No inflation, no raises (median salary ratio last six months to first six months: 1.00).

### Income

- **Salary:** exactly one a month. 79% arrive on the 15th. 20% arrive late, on the 26th to 31st, and 1% on a random other day. The typical customer is paid late in 5 of 24 months; only 16 customers are always paid on the 15th. Before a late salary the balance is negative in 28% of cases, against 13% for one on time. "Days since payday" must come from the actual salary row, not from the calendar.
- The amount varies month to month by about 8% (standard deviation over mean) for everyone, with no trend and no holiday bonus month.
- **Other income:** 2,301 normal customers receive it 1 to 4 times in the 24 months, each time about 0.77 of a monthly salary, spread evenly over the year. Nothing says what it is.
- **Investments:** exactly 1,500 customers, and 1,456 of them deposit in all 24 months. One deposit a month a few days after payday (16th to 20th, or the 31st after a late salary), about 10% of salary, varying by 8%. The share of investors rises with age from 25% (18–24) to 38% (55–64). Withdrawals are rare (532 rows, 435 customers, median 1,341 €) and not triggered by a negative balance.

### Housing and utilities

- **Housing:** paid on a random day from the 1st to the 8th. The amount wobbles by about 3% around a fixed level (highest payment about 1.10 times the lowest) and never steps up or down, so no one moves or gets a rent rise.
- **Skipped housing payments are a distress signal.** Of the 4,882 customers with housing, only 2,996 pay in all 24 months. 4,265 customer-months are skipped and never made up with a double payment later. In skipped months the lowest balance during days 1 to 8 has a median of 229 € (3,100 € in paid months) and is negative in 31% of cases (5%). Skips rise from about 140 a month in 2025 to about 200 a month from April 2026. October 2024 has 460 skips and looks like a start-up artefact.
- **Utilities:** 4,922 customers, three payments in 93% of customer-months. The three have random days and amounts that vary by a third, so they cannot be matched to separate bills (electricity, phone, internet). The yearly total is effectively a fixed share of salary (about 5%).

### Balances and overdrafts

- **Hard floor at −500 €.** No normal customer ever goes below −499.77 €. Of all 5,100 customers, 1,574 are never negative and 3,501 bottom out between 0 and −500 €.
- Being overdrawn is persistent for some: 1,066 customers are negative in 1 or 2 months, 1,309 in 3 to 6, 882 in 7 to 12, and 269 in 13 or more of the 24 months.
- Balances grow. The median balance is 2,864 € before the first transaction and 6,161 € after the last, and 74% of customers end higher than they started.
- Spending is a median 92% of income for customers without salary sweeps (75% to 102% between the 10th and 90th percentile). 871 of them spend more than they earn over the two years.

### Customers and segments

- **Age is a real driver** (mean monthly €, all 24 months):

  | Age band | Customers | Salary | Housing | Groceries | Restaurants | Transport | Entertainment | Health | Travel |
  | -------- | --------- | ------ | ------- | --------- | ----------- | --------- | ------------- | ------ | ------ |
  | 18–24    | 419       | 2,008  | 728     | 293       | 216         | 144       | 156           | 38     | 37     |
  | 25–34    | 658       | 2,424  | 830     | 396       | 196         | 182       | 135           | 80     | 60     |
  | 35–44    | 1,616     | 3,347  | 1,004   | 523       | 231         | 244       | 138           | 114    | 117    |
  | 45–54    | 1,756     | 3,898  | 1,110   | 540       | 297         | 266       | 162           | 113    | 174    |
  | 55–64    | 376       | 4,369  | 1,199   | 544       | 338         | 269       | 172           | 132    | 225    |
  | 65+      | 275       | 2,616  | 890     | 504       | 119         | 144       | 93            | 255    | 102    |

- **Postcode is not a driver.** 290 postcodes, all starting with `00` (2,557 customers), `01` (1,116), or `02` (1,427), so everyone lives in the capital region. Salary, housing, transportation, and merchant choice do not differ meaningfully between the three areas.
- **Salary-sweep customers (264):** the sweep is a median 90% of the salary, and their visible spending is a median 474 € a month. All 218 customers without housing payments are sweep customers, and 178 sweep customers have no utilities either.
- **`CUST05001` to `CUST05100` are a planted anomaly block.** All 100 miss salary in some months (they have 11 to 23 salary months, everyone else has 24) and all receive other income often (13 to 56 times, everyone else at most 4). 56 have had a balance over 50,000 €, 25 go below the −500 € floor (down to −1,985 €), 31 have a single purchase over 3,000 € (the largest is 30,935 €, and one "taxi ride" costs 21,361 €), and 31 make fewer than 10 purchases a month. Leave them out of demo picks and examples. Their effect on peer medians is negligible, but they distort peer means. `CUST05039` (high event-ticket spending) is in this block, so it is not a good demo persona.

### Mortgage tables

- 200 applications from 200 different customers, created between January and August 2026, decided by September 2026. 150 approved, 50 rejected (34 insufficient collateral, 8 insufficient income, 6 insufficient equity, 2 existing debt).
- 3,453 events of 12 types (`customer_contact`, `expense_recorded`, `property_added`, `collateral_valuation`, `loan_calculation`, `loan_decision`, and so on), each with a free-text `note`.
- **The mortgage data is not reflected in the transactions.** The housing payment does not change after an approval. `required_monthly_income_eur` is higher than the customer's average salary in the transactions for 81% of approved applications, so it is not comparable with the salary rows (the basis is unknown, possibly gross or household income). The only link is the `customer_id`.

### Data hygiene

- No exact duplicate rows. 59 pairs of rows share a customer and a second.
- `tx_date` always equals the date part of `tx_timestamp`.
- 5,095 customers have transactions in all 24 months, the other 5 in 23.

### What can and cannot be derived

| Solid ground                                                                            | Not in the data                                                                             |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Spending, purchase count, and purchase size per category, against peers of the same age | Anything personal at subcategory level: taxis versus public transport, bars, cafés, flights |
| Basket split and the everyday share of spending                                         | Favourite or cheaper merchants, local shops                                                 |
| Income level, late salaries, salary variation                                           | Subscriptions and separate utility bills                                                    |
| Housing burden, skipped housing payments                                                | Car ownership, commuting mode                                                               |
| Overdraft frequency, distance to the −500 € floor, balance trend                        | Personal weekend or payday habits (the pattern exists, but is the same for everyone)        |
| Investing: whether, how much, share of salary                                           | Rent rises, moves, pay rises, price inflation                                               |
| Population-level patterns: payday bump, Friday and Saturday eating out, July travel     | What "other income" is, what a mortgage does to spending                                    |

## Processed database (`data/processed/coach.duckdb`)

Built by [scripts/data/prepare.ts](../scripts/data/prepare.ts). Categories, subcategories, and baskets come from [packages/shared/src/taxonomy.ts](../packages/shared/src/taxonomy.ts). To change the mapping, edit that file and rerun `npm run data:prepare`.

| Table                   | Contents                                                                                                                                                                                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transactions`          | Cleaned rows: `customer_id`, `account_id`, `tx_date`, `tx_timestamp` (parsed), `month` (`YYYY-MM`), `amount_eur` (signed), `abs_amount_eur`, `direction` (`in`/`out`), `balance_after_eur`, `transaction_type`, `source_category`, `category_id`, `subcategory_id` (from MCC, may be null), `basket`, `merchant_id`, `mcc_code` |
| `customers`             | `customer_id`, `postal_code`, `age`, `age_band`                                                                                                                                                                                                                                                                                 |
| `monthly_category`      | `customer_id`, `month`, `category_id`, `basket`, `total_eur` (positive), `tx_count`                                                                                                                                                                                                                                             |
| `peer_benchmarks`       | Per `age_band` (and `'all'`) and spending category: `median_monthly_eur`, `mean_monthly_eur`, `p75_monthly_eur`, `customers`                                                                                                                                                                                                    |
| `mortgage_applications` | Final outcome per application, linked by `customer_id`                                                                                                                                                                                                                                                                          |
| `mortgage_events`       | Application event history, `timestamp` parsed                                                                                                                                                                                                                                                                                   |

Basket totals over the whole dataset: mandatory regular 229 M€, everyday 90 M€, mandatory irregular 39 M€, savings and investments 14 M€.

Median monthly spending of all customers (peer benchmark, `age_band = 'all'`): housing 981 €, groceries 478 €, transportation 211 €, restaurants 205 €, lifestyle 170 €, home & tech 166 €, utilities 154 €, entertainment 130 €, health 96 €, travel 78 €.

## Conventions

- **"Today" is `DATA_END_DATE` (2026-09-30)** from `@coach/shared`. Never use the real clock for "this week" or "last month". "Last month" in the demo is 2026-09.
- Spending queries filter on `basket IN ('mandatory_regular', 'mandatory_irregular', 'everyday')`. This excludes income, investments, and salary sweeps.
- **Salary-sweep customers look like they barely spend.** Their salary moves to another own account the day after payday, so most of their spending is invisible here and many have no housing payment. Leave them out of examples and demo picks.
- **Leave `CUST05001` to `CUST05100` out of examples and demo picks too.** They are an anomaly block with missing salaries and extreme purchases (see "Customers and segments").
- **The demo customers' subcategories are hand-made.** For seven of the `DEMO_CUSTOMERS`, `data:prepare` moves their purchases to other merchants inside the same category, following the shares in [scripts/data/demo-profiles.ts](../scripts/data/demo-profiles.ts), so their swipe decks differ. Some of those purchases get standard MCC codes that the raw data does not contain (for example 4112 trains, 4899 streaming, 7997 gyms, 4411 ferries), with a made-up merchant `MRC-DEMO-<mcc>`. The subcategories for them are marked "demo only" in `taxonomy.ts`, and no other customer has them. Amounts, dates, balances, category totals, and peer benchmarks are untouched. Everything in "What is real signal and what is noise" describes the raw data and still holds for all other customers.
- **Treat subcategory numbers as sums, not as behaviour.** A subcategory total is correct arithmetic, but which subcategory a purchase lands in is random (see "What is real signal and what is noise"). Build personal claims on categories.
- **Use the 12-month window for anything personal.** One month of one category is mostly chance.
- **Transportation has two rows per month** in `monthly_category`: taxis are overridden to the `everyday` basket, the rest stays `mandatory_regular`. Per-category totals must sum across baskets (`GROUP BY category_id`), or taxis go missing.
- **`peer_benchmarks` are averages over all 24 months.** Comparing one user month against them flags lumpy categories (travel, home & tech) unfairly. Compare the user's own monthly average over a longer period (for example the last 12 months), or say clearly what is compared.
- Two kinds of benchmark exist, and the UI must name the one it shows:
  - **Peers**: other customers in the dataset, same age band (`peer_benchmarks`). Synthetic but consistent with our categories.
  - **Average Finn**: Statistics Finland open data (to be added, see PLAN.md).
