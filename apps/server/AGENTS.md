# apps/server/AGENTS.md

Server rules. Read the root [AGENTS.md](../../AGENTS.md) and [docs/data.md](../../docs/data.md) first. This file adds to them.

Stack: Hono on Node.js, Zod, DuckDB (`@duckdb/node-api`), Vercel AI SDK with `@ai-sdk/google` (Gemini).

## Folder structure

```
src/
  index.ts       Starts the server and serves the built web app in production
  app.ts         Builds the Hono app from a DB connection. Exports `AppType` for the web client
  config.ts      Settings from env variables (PORT, COACH_DB_PATH). The only place reading process.env
  routes/        Thin HTTP handlers, one file per resource. index.ts only registers them
  db/            DuckDB connection and query functions. The only place SQL lives
  insights/      Deterministic logic: aggregates, benchmarks, safe-to-spend, what-if
    actions/     Action-point rules, one file per rule
  coach/         Gemini chat: model config, tools, prompts/, summary
```

Dependencies point one way: `routes` → `coach` → `insights` → `db`. Lower layers never import from higher ones. `coach` tools call `insights` functions and never write SQL themselves.

## Routes

- Chain route definitions (`app.get(...).post(...)`) so Hono RPC can infer types for the client.
- Validate every input with `zValidator` and a schema from `@coach/shared`.
- Handlers parse input, call one function, and return the result. No business logic in routes.

## Data access

- Open the database read-only, once, at startup (`openDatabase` in `db/connection.ts`), and pass the connection down to route factories. Path from `COACH_DB_PATH`, default `data/processed/coach.duckdb`. Never read the raw CSVs from the server.
- SQL lives in `db/` only. Always use prepared statements with parameters. Never build SQL by string concatenation with user or model input.
- Every query takes a `customerId` and an explicit date range or month. No hidden defaults deep in the code. Use `DATA_END_DATE` for "now".
- Map `snake_case` columns to `camelCase` fields in the query function, and return types that match the shared schemas.
- DuckDB returns `BIGINT` as `bigint`. Convert counts with `Number()` in the query layer.
- If the data needs a new derived column or table, add it to [scripts/data/prepare.ts](../../scripts/data/prepare.ts) instead of computing it at request time.

## Action-point rules

- One rule per file in `insights/actions/`. Each exports a function that takes the user context and returns `Action[]` (possibly empty).
- Every action carries a stable id, title, explanation, `savingPerMonthEur`, the category id it concerns, and the inputs used for the estimate, so the UI can show how the number was calculated.
- Estimates are conservative and reproducible from the data. No random or AI-generated amounts.
- The engine drops actions for "worth it" categories, then ranks by saving.

## AI coach

- The model never calculates. Every number in an answer must come from a tool result.
- The model id comes from one constant in `coach/model.ts`. Do not repeat model ids elsewhere.
- Tools are defined with the AI SDK `tool()` helper and a Zod input schema, one tool per file in `coach/tools/`. Tool results are compact JSON with units in the field names (`Eur`, `Pct`).
- The customer id comes from the route, never from the model's tool arguments. Tool inputs are untrusted: validate them, cap row counts and date ranges.
- Prompts live as files in `coach/prompts/`, not as inline strings spread around the code.
- Web search results are suggestions: the coach names the source and never presents a found price as guaranteed.
- The API key comes from `GOOGLE_GENERATIVE_AI_API_KEY`. Never log it or send it to the client.
- Cache the page summary per customer and month.

## Tests

- Vitest. Test files sit next to the code: `safe-to-spend.test.ts`.
- Required for every insight function and every action rule, because they produce the numbers the whole app shows.
- Use a small in-memory DuckDB fixture built in the test, not the real database.
- Tests never call the Gemini API.
