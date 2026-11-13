# Handoff: skeleton review

A review of the repo skeleton against the S-Pankki challenge brief, written before Phase 0 starts. Read this together with [PLAN.md](../PLAN.md). The recommendations here are proposals: agree on them as a team, then move the accepted ones into PLAN.md as tasks.

## Where we are

| Area           | State                                                                                                                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Data pipeline  | Working. `npm run data` downloads the four CSVs (about 365 MB) and builds `data/processed/coach.duckdb` (about 105 MB) with `transactions`, `customers`, `monthly_category`, `peer_benchmarks`, `mortgage_applications`, `mortgage_events` |
| Shared package | `@coach/shared`: [taxonomy.ts](../packages/shared/src/taxonomy.ts) (categories, MCC subcategories, three baskets) and [dataset.ts](../packages/shared/src/dataset.ts) (`DATA_END_DATE`, age bands)                                         |
| Docs           | [README.md](../README.md) (idea), [PLAN.md](../PLAN.md) (phases), [data.md](data.md) (dataset facts), `AGENTS.md` files (conventions)                                                                                                      |
| Tooling        | npm workspaces, strict TypeScript, Prettier. `typecheck` and `format:check` pass                                                                                                                                                           |
| Not yet        | `apps/web`, `apps/server`, ESLint, tests, deployment                                                                                                                                                                                       |

## Fit with the brief

The plan covers everything the brief asks for: the three baskets, chat over your own data (all four example questions), what-if scenarios, safe-to-spend and safe-to-save, MyData-style free exploration through charts drawn in chat, Statistics Finland benchmarks, mobile-first, and the optional PSD2 angle.

Keep these as the core of the pitch:

- **The AI never does the maths.** Deterministic numbers, AI only explains. This is the trust story a bank wants to hear.
- **Honest about the data.** [data.md](data.md) already records the limits (no merchant names, no subscriptions, utilities cannot be split). Build on what the data supports.

## Recommendations

### 1. Deploy in Phase 0, not Phase 4

Deployment is a hard requirement (peer review and commenting), and the plan currently leaves it to the end. Instead:

- [ ] As soon as the two scaffolds are merged, deploy a walking skeleton: server with `/health`, built web app served by the same server
- [ ] Redeploy automatically on every merge to `main`
- [ ] Everyone tests on their own phone from day one

### 2. Change the hosting approach

PLAN.md proposes running `npm run data` in the hosting build step. That will likely fail or be painfully slow:

- Every deploy downloads 362 MB from GitHub's LFS media host, which is slow and counts against LFS bandwidth limits.
- Building DuckDB over 3.6M rows on a small free instance risks running out of memory.

Proposal:

- [ ] Add a `data:demo` step to the pipeline that writes a small `data/processed/demo.duckdb` with only the demo users' transactions plus the precomputed `peer_benchmarks` (and any other aggregate tables). Expected size: a few MB
- [ ] Ship that file with the deploy (baked into the Docker image, or downloaded from a GitHub release asset at build time). It stays out of git, in line with the data rules
- [ ] The server reads the database path from an env variable, so local dev uses the full database and production the demo one

Platform notes for the peer-review period:

- Render's free tier sleeps when idle. Reviewers would wait 30–60 s on first load. Use a small paid instance, or Fly.io with one machine always running.
- The chat endpoint is public and unauthenticated, so anyone can spend our Gemini quota:
  - [ ] Per-IP rate limit on `POST /api/users/:id/chat`
  - [ ] Spending cap on the API key, or the paid tier with a budget alert
  - [ ] A friendly "the coach is busy, try again in a minute" fallback when Gemini returns a rate-limit error

### 3. Draw an explicit MVP line

Phases 2 and 3 hold about 30 tasks, which is too many for three people in one hackathon. Proposed cut:

**Must have (demo breaks without it)**

- Overview with income and the three baskets
- Category pie chart
- You vs. others (peers)
- Action list with checkboxes and a running total
- Chat with 4–5 tools: `getSpendingSummary`, `queryTransactions`, `compareToPeers`, `simulateWhatIf`, `getSafeToSpend`
- Safe to spend this week
- Deployed and working on a phone

**Stretch (in this order)**

1. `renderChart` in chat
2. Statistics Finland "average Finn" benchmark
3. Irregular-cost buffer
4. Deal finder (web search)
5. Spender persona
6. Home-buying readiness
7. PSD2 multi-bank mock

**Owners.** Give each track one fixed owner instead of "pick tasks":

| Track               | Scope                                                 |
| ------------------- | ----------------------------------------------------- |
| Server and insights | `db/`, `insights/`, action rules, tests, deployment   |
| AI coach            | Gemini spike, tools, prompts, summary, evaluation set |
| Frontend            | Mobile frame, all sections, chat UI                   |

### 4. Technical points to fix early

- [ ] **Run the Gemini spike first.** Whether function tools and Google Search work in one request decides the coach design. Do it in the first hour.
- [ ] **TypeScript 7 and ESLint.** `package.json` uses `typescript ^7.0.2`. Check that `typescript-eslint` supports TS 7 before the ESLint setup task. If not, pin TypeScript 5.x or use lint rules that do not need type information. Not verified yet.
- [ ] **Compare like with like.** `peer_benchmarks` is each customer's average month over 24 months. Comparing one user month against it creates false "you overspend" flags for lumpy categories like travel and home & tech. Compare the user's trailing 12-month average against peers, or label clearly what is compared.
- [ ] **Transportation has two rows per month.** In `monthly_category`, taxis are overridden to the `everyday` basket, so transportation appears once under `mandatory_regular` and once under `everyday`. That is intended, but per-category charts must sum across baskets. Add a line to [data.md](data.md).
- [ ] **Age bands are defined twice.** The SQL `CASE` in [prepare.ts](../scripts/data/prepare.ts) repeats `ageBandOf` from `dataset.ts`. Generate it from `AGE_BANDS` so there is one source. Low priority.

### 5. Pitch and demo

- Make sure one demo user is 18–24. The brief stresses financial literacy for young adults.
- Let the coach explain the concept behind an action in one or two plain sentences (for example why to keep a buffer for irregular costs). That is the "pedagogical angle" S-Pankki asked for.

## Next steps

1. Team agrees on sections 1–3 (15 minutes).
2. Move accepted items into PLAN.md as tasks with owners.
3. Start Phase 0: Gemini spike, scaffolds, walking-skeleton deploy.
