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
| Transportation  | purchase              | 626,930 | −45    | Fuel, public transport, parking, taxis by MCC                                                         |
| Utilities       | utilities_payment     | 342,728 | −57    | About 3 per month. **No merchant or MCC**, so electricity, phone, and internet cannot be separated    |
| Entertainment   | purchase              | 302,691 | −60    |                                                                                                       |
| Health          | purchase              | 151,912 | −90    |                                                                                                       |
| Salary          | salary                | 121,725 | +3,362 | Every customer has salary                                                                             |
| Home & Tech     | purchase              | 115,086 | −218   |                                                                                                       |
| Housing         | housing_payment       | 112,903 | −1,088 | Exactly one a month per customer                                                                      |
| Lifestyle       | purchase              | 110,916 | −202   | Clothing, sports, hobbies                                                                             |
| Travel          | purchase              | 65,377  | −243   |                                                                                                       |
| Invest Deposit  | investment_deposit    | 35,668  | −358   | 1,500 customers invest                                                                                |
| Other Income    | other_income          | 6,299   | +2,657 |                                                                                                       |
| Salary Sweep    | salary_sweep          | 6,189   | −3,825 | Salary moved to another own account the day after payday. 264 customers. **A transfer, not spending** |
| Invest Withdraw | investment_withdrawal | 532     | +1,568 |                                                                                                       |

### Merchants and MCC codes

- `merchant_id` is an opaque id such as `MRC-GRO-0035`. The middle part matches the category. There are **no merchant names**, so we cannot tell S-market from Lidl or Netflix from Spotify.
- 515 merchants, 36 MCC codes. About 5% of purchases have neither (mostly Transportation).
- **There are no subscriptions in the data.** No purchase repeats with the same merchant and amount across 6 or more months.

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
- Two kinds of benchmark exist, and the UI must name the one it shows:
  - **Peers**: other customers in the dataset, same age band (`peer_benchmarks`). Synthetic but consistent with our categories.
  - **Average Finn**: Statistics Finland open data (to be added, see PLAN.md).
