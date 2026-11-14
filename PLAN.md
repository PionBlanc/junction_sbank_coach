# Plan

Actionable steps, in order. Tick boxes as you go. Items marked **Decide** need a team decision. Each has a recommendation, so if nobody objects, take the recommendation and move on.

Done so far: dataset download and preprocessing pipeline (`npm run data`), shared taxonomy, repo conventions, server and web scaffolds (`npm run dev` runs both end to end), ESLint, Vitest. See [docs/data.md](docs/data.md) for what the data contains.

This is a 48-hour demo: build what the demo shows, nothing "for later". See the mindset section in [AGENTS.md](AGENTS.md).

## Phase 0: Decisions and setup (first 1–2 hours, together)

### Stack (TypeScript everywhere, Gemini for AI)

| Area            | Recommendation                                                                                                                                                                                   | Why                                                                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Repo            | npm workspaces: `apps/web`, `apps/server`, `packages/shared`                                                                                                                                     | One install, one lockfile, shared types without publishing anything                                                                             |
| App type        | Mobile-first web app                                                                                                                                                                             | S-Pankki accepts a web app embeddable in a mobile app. Fastest to build and demo by link                                                        |
| Frontend        | React + TypeScript + Vite                                                                                                                                                                        | Everyone and every AI agent knows it                                                                                                            |
| Styling         | Tailwind CSS                                                                                                                                                                                     | No arguments over CSS structure                                                                                                                 |
| Charts          | Recharts                                                                                                                                                                                         | Covers bars, pie, and comparison charts with little code                                                                                        |
| Server state    | TanStack Query                                                                                                                                                                                   | Caching and loading states for free                                                                                                             |
| Server          | Hono on Node.js                                                                                                                                                                                  | Small and fast. **Hono RPC** gives the frontend a typed client generated from the route definitions, so request and response types cannot drift |
| Validation      | Zod, schemas in `packages/shared`                                                                                                                                                                | One schema validates on the server and types the client                                                                                         |
| Data engine     | DuckDB (`@duckdb/node-api`) over `data/processed/coach.duckdb`                                                                                                                                   | Already built and tested: 3.6M rows, per-user queries in about 30 ms                                                                            |
| AI              | Gemini through the Vercel AI SDK (`ai`, `@ai-sdk/google`, `@ai-sdk/react`)                                                                                                                       | Streaming chat, typed tool calling, and the `useChat` hook for the frontend. Gemini has built-in Google Search grounding for the deal finder    |
| Lint and format | ESLint (typescript-eslint) + Prettier. TypeScript pinned to 6.0: typescript-eslint cannot run on TypeScript 7                                                                                    | Prettier is already configured                                                                                                                  |
| Tests           | Vitest                                                                                                                                                                                           | Same config style as Vite                                                                                                                       |
| Hosting         | Railway: one service in the team's existing project, linked to this repo, redeploys on every push to `main`. Serves the API and the built frontend. The database sits on a volume, uploaded once | One deploy, and the 105 MB database file stays next to the server                                                                               |

Gemini notes (spike done 2026-11-14, results below):

- **Model:** `gemini-3.8-flash`, the newest Flash model on our key. About 3–5 s per call. Keep the id in one constant (`coach/model.ts`). Older ids such as `gemini-2.5-flash` return 404 for new users. Free-tier rate limits are not visible through the API: check them in Google AI Studio.
- **Search plus tools: works.** One request can carry our function tools and Google Search together. The raw API needs `toolConfig.includeServerSideToolInvocations: true`. `@ai-sdk/google` (4.0.121) sets it automatically for Gemini 3+ models when both kinds of tool are present, so no separate `searchDeals` call is needed. Tested: the model called our function, then searched (in Finnish and English) and answered with the function's number plus 6 web sources.
- **Free-tier terms:** Google may use free-tier prompts to improve its products. That is acceptable because the data is synthetic, but never send real personal data.
- **Rate limits:** cache the page summary per user and month so the demo does not burn requests.

Tasks:

- [ ] Confirm the stack. Update this file and [AGENTS.md](AGENTS.md) if anything changes
- [x] Spike (30 min, one person): one Gemini call with one function tool and Google Search in the same request. Write the result in this file

### Decide: other open questions

- [x] **Language.** Decided: English everywhere: UI, code, docs, and the coach's answers (the system prompt says so)
- [x] **Demo users.** Decided: three customers, in `DEMO_CUSTOMERS` in [dataset.ts](packages/shared/src/dataset.ts). User switcher, no login. Monthly averages over the last 12 months:

  | Customer    | Persona       | Age | Income | Spending | Story for the demo                                                                     |
  | ----------- | ------------- | --- | ------ | -------- | -------------------------------------------------------------------------------------- |
  | `CUST00164` | Young diner   | 23  | 2 501  | 3 395    | Restaurants 638 €/month (a quarter of income), 8 taxi rides a year, spends over income |
  | `CUST03802` | Housing-heavy | 41  | 3 198  | 3 683    | Housing 1 419 €/month (44% of income), groceries 845 €, never overdrawn                |
  | `CUST04092` | Tight budget  | 26  | 1 821  | 1 869    | Overdrawn on 62 days in the last year, lowest balance −416 €: safe-to-spend and buffer |

- [x] **Hosting platform.** Decided: Railway, as a new service next to the existing one in the team's project. Auto-deploy on every push to `main` is fine. Steps in [docs/railway-deploy.md](docs/railway-deploy.md)
- [ ] **Subscriptions.** The dataset has none, so the "three streaming services" example cannot come from real data. Recommendation: skip the recurring-payment detector (it would find nothing in the demo) and do not fake subscriptions. Mention it as a next step in the pitch
- [ ] **Groceries basket.** Currently `mandatory_regular` (needs, recurring). Alternative: `everyday`. One-line change in [taxonomy.ts](packages/shared/src/taxonomy.ts), then rerun `npm run data:prepare`
- [ ] **App name.** Replace the working title in the README

### Setup

- [ ] Create the GitHub repo, push this skeleton, add everyone as collaborators, protect `main` against force pushes
- [ ] Each person: `npm install`, `npm run data`, copy `.env.example` to `.env` and add a key
- [x] Scaffold `apps/web` (Vite React TS, Tailwind, TanStack Query, Recharts)
- [x] Scaffold `apps/server` (Hono, `@hono/node-server`, DuckDB connection, `/api/health` route, serves the built web app)
- [x] Add ESLint at the root and the `lint`, `dev`, and `test` scripts. Update the README commands table
- [x] Deploy the skeleton to Railway following [docs/railway-deploy.md](docs/railway-deploy.md). Open the URL on a phone
- [ ] Optional: GitHub Action that runs `format:check`, `lint`, `typecheck`, and `test` on every push to `main`

Deploy early. After that, every push to `main` redeploys, which is one more reason to keep `main` working.

## Phase 1: API contract

- [ ] Agree on the endpoints and write their Zod schemas in `packages/shared/src/api/`
- [ ] Server returns hard-coded sample data from every endpoint first, so frontend work is never blocked

Proposed endpoints:

| Endpoint                               | Returns                                                           |
| -------------------------------------- | ----------------------------------------------------------------- |
| `GET /api/users`                       | Demo users for the switcher                                       |
| `GET /api/users/:id/overview?month=`   | Income, basket totals, savings, key numbers                       |
| `GET /api/users/:id/categories?month=` | Spending per category and subcategory, with basket                |
| `GET /api/users/:id/benchmark?month=`  | User vs. peers (and average Finn when available) per category     |
| `GET /api/users/:id/actions`           | Ranked action points with estimated monthly saving                |
| `GET /api/users/:id/summary`           | AI-written summary text (cached)                                  |
| `PUT /api/users/:id/preferences`       | Categories marked "worth it to me"                                |
| `POST /api/users/:id/chat`             | Streamed chat (AI SDK UI message stream), may include chart specs |

## Phase 2: Build features

Pick tasks from the lists below.

**MVP line.** The demo breaks without these, so build them first:

- Overview with income and the three baskets
- Category pie chart
- You vs. others (peers)
- Action list with checkboxes and a running total
- Chat with `getSpendingSummary`, `queryTransactions`, `compareToPeers`, `simulateWhatIf`, `getSafeToSpend`
- Safe to spend this week
- Deployed and working on a phone

Everything else in Phases 2 and 3 is stretch.

### Insights (server, deterministic)

- [ ] Overview and category aggregates from `monthly_category`
- [ ] Peer benchmark from `peer_benchmarks`, matched on the user's age band
- [ ] Average-Finn benchmark: Statistics Finland Household Budget Survey (Kotitalouksien kulutus) through the StatFin PxWeb API. Check the latest year, convert to monthly per-person euros, map to our categories where they match cleanly, and save as a small JSON file in `packages/shared` with source and year
- [ ] Safe to spend this week: balance now + expected income before next payday − upcoming regular payments (housing, utilities) − irregular buffer, divided by days to payday. Payday and regular payments are detectable from the data
- [ ] Action-point engine: one function per rule, each returns zero or more actions with id, title, explanation, `savingPerMonthEur`, category, and the inputs behind the estimate. Drop "worth it" categories, rank by saving

Action rules in priority order (all supported by the data):

1. Category clearly above peers (above p75 for the age band)
2. Taxis (subcategory `taxi`) compared with public transport
3. Frequent small purchases in restaurants and cafés, annualised
4. Utility bills above peers → deal finder in chat
5. Overdraft risk → safe-to-spend and buffer advice
6. Idle balance → move to savings

### AI coach (server)

- [ ] Chat route with the AI SDK `streamText`, Gemini model, streaming to the client
- [ ] Tools, all calling the deterministic insight functions:
  - `queryTransactions` (date range, category, subcategory, amount range; capped number of rows)
  - `getSpendingSummary` (by category, basket, or month)
  - `compareToPeers`
  - `simulateWhatIf` (for example restaurants −20% → monthly, yearly, and 5-year effect)
  - `getSafeToSpend`
  - `renderChart` (returns a chart spec the frontend draws: MyData-style free exploration)
  - web search for deals (see the Gemini notes in Phase 0)
- [ ] System prompt in its own file: plain language, no jargon, every number comes from a tool, respect "worth it" categories, explain the three baskets when relevant, say it is guidance and not regulated investment advice
- [ ] Page summary generation, cached per user and month
- [ ] Evaluation set: 10–15 questions (start with the four from the challenge brief) with expected numbers. Rerun after every prompt or tool change

### Frontend

- [ ] Mobile frame (design at 390 px wide), user switcher, month switcher
- [ ] Summary card
- [ ] Money flow chart (income, three baskets, savings)
- [ ] Category pie chart with drill-down to subcategories
- [ ] You vs. others chart
- [ ] Action list with checkboxes and running total
- [ ] "Worth it to me" toggle on categories
- [ ] Chat: `useChat` streaming, suggested starter questions, charts rendered from `renderChart` tool results
- [ ] Loading, empty, and error states for every section

## Phase 3: Features that make it stand out

Build in this order. Stop when time runs out.

1. **Safe to spend this week** (named in the challenge brief) with an overdraft early warning
2. **What-if simulator** (named in the brief) in chat and as a slider on a category
3. **Deal finder**: an action point opens chat with a prepared question. The coach searches the web and compares with what the user pays
4. **Irregular-cost buffer**: "Surprise costs have averaged 140 €/month over the past year. Set that aside." This teaches the second basket
5. **Spender persona** card
6. **Home-buying readiness** using the mortgage outcome data
7. **Multi-bank (PSD2) view**: mock a second account to show the concept

## Phase 4: Demo and pitch (reserve the last 4–5 hours)

- [ ] Feature freeze. Only bug fixes after this point
- [ ] Deploy and test on real phones
- [ ] 2–3 minute demo script around one demo user: summary → baskets → you vs. others → tick two actions → ask a what-if question → deal search
- [ ] Pre-warm caches so the summary and first chat answer appear fast
- [ ] Record a backup video of the demo
- [ ] Pitch points: first Finnish bank chat over your own data, three-basket pedagogy, trustworthy numbers (deterministic maths, AI only explains), MyData-style free exploration, ready to embed in S-mobiili as a web view
- [ ] Teaching angle: the coach explains the idea behind each action in one or two plain sentences (for example why to keep a buffer for irregular costs). Lead the demo with the young diner (`CUST00164`): the brief stresses young adults

## Risks

| Risk                                                   | Mitigation                                                                                                                             |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| AI states wrong numbers                                | Numbers only from tools. Evaluation set rerun after changes                                                                            |
| Gemini free-tier rate limits during the demo           | Cache the summary, keep chat answers short, have a second API key ready                                                                |
| Search and function tools cannot be combined           | Separate search call wrapped as a tool (see Phase 0 spike)                                                                             |
| No merchant names or subscriptions in the data         | Advice is built on categories, MCC subcategories, balances, and timing, which the data supports well. Be upfront about it in the pitch |
| Benchmark categories do not match Statistics Finland's | Compare only categories that map cleanly. Peer benchmark covers the rest                                                               |
| Merge conflicts                                        | Scaffold first, small commits, pull --rebase before every push, shared-file rules in AGENTS.md                                         |
| Savings estimates look invented                        | Every action shows the inputs behind its estimate                                                                                      |
