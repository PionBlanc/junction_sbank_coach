# AGENTS.md

Rules for everyone working in this repo: the three developers and any AI coding agent they use. Three people commit here at the same time, so the goal is that code looks the same no matter who (or what) wrote it, and that parallel work merges cleanly.

More specific rules live next to the code and add to this file:

- [apps/web/AGENTS.md](apps/web/AGENTS.md): frontend
- [apps/server/AGENTS.md](apps/server/AGENTS.md): API, data access, AI coach

Project context: [README.md](README.md). Tasks and decisions: [PLAN.md](PLAN.md). Dataset facts: [docs/data.md](docs/data.md).

## Mindset: a 48-hour demo

This is a hackathon demo built in 48 hours, not a product. **Simplicity is king.** A grug-brained developer mindset is welcome here.

- Write the simplest code that makes the demo work. Plain functions, plain data, obvious names. A bit of duplication beats a clever abstraction.
- Do not build for an imagined future: no generic frameworks, extra config options, plugin systems, or layers that nothing uses today.
- The skeleton (folder structure, shared taxonomy, API types, data pipeline) is the one part that plans ahead, so features slot in without a fight. Feature code does not.
- Before adding something, ask: would the demo be worse without it? If not, skip it.
- If a rule in these files slows the demo down for no real gain, say so in team chat rather than silently working around it.

## Golden rules

1. **The tools decide style.** Prettier formats, ESLint lints, TypeScript strict mode types. Run them before every commit. Never hand-format around them, and never change their config without the whole team agreeing.
2. **Only touch what your task needs.** Do not reformat, rename, reorganise, or "clean up" code outside your change. Unrelated diffs cause merge conflicts for the other two people.
3. **Follow existing patterns.** Before adding a file, open a neighbouring one and copy its structure, naming, and error handling. Do not introduce a second way of doing something the codebase already does.
4. **No new dependencies without saying so.** A new package changes the shared lockfile. Mention it in the commit message and in team chat. Prefer what is already installed.
5. **`main` always runs.** If your change breaks the app, fix or revert before anything else.

## Commands

Run from the repo root.

```
npm install           # install everything (all workspaces)
npm run data          # download and preprocess the dataset
npm run dev           # server (port 8787) and web app (port 5173) with reload
npm run build         # build the web app into apps/web/dist
npm start             # production: the server also serves apps/web/dist
npm run format        # Prettier, write
npm run lint          # ESLint, whole repo
npm run typecheck     # TypeScript, whole repo
npm test              # Vitest, whole repo
```

Before every commit: `npm run format && npm run lint && npm run typecheck && npm test`.

TypeScript is pinned to 6.0 because `typescript-eslint` cannot run on TypeScript 7 (it has no JavaScript API). Do not upgrade it.

## Repository structure

```
apps/web/           React app
apps/server/        Hono API, DuckDB queries, insights, AI coach
packages/shared/    Taxonomy, dataset constants, Zod API schemas. Imported as @coach/shared
scripts/data/       Dataset fetch and preprocessing
docs/               Reference docs
```

Dependencies point one way: `apps/*` import from `packages/shared`. `packages/shared` imports nothing from `apps/`. `apps/web` never imports from `apps/server` source, only its exported `AppType` type for the Hono RPC client.

## Shared hotspots

Several people will want to edit these files. Keep changes small and merge them quickly.

| File                                                      | Rule                                                                                                                                                                               |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/api/*` (API schemas)                 | Adding a field is fine. Renaming or removing one breaks the other side: announce it in team chat first and fix both sides in the same commit                                       |
| `packages/shared/src/taxonomy.ts`                         | The only place categories, subcategories, and baskets are defined. Never retype these ids elsewhere. After a change, rerun `npm run data:prepare` and tell the team to do the same |
| `apps/server/src/routes/index.ts`, `apps/web/src/App.tsx` | Registration only: one line per route or section. Put logic in its own file                                                                                                        |
| `package-lock.json`                                       | Never edit by hand. On a merge conflict, take `main`'s version and rerun `npm install`                                                                                             |
| Prettier, ESLint, and TypeScript configs                  | Team decision only                                                                                                                                                                 |
| `README.md`, `PLAN.md`, `AGENTS.md` files                 | Small edits welcome. Tick PLAN boxes when you finish a task                                                                                                                        |

## Git workflow

- Work directly on `main`. No feature branches, no pull requests.
- Before every commit and push: `git pull --rebase origin main`, then run format, lint, and typecheck, and start the app. This applies to AI agents too.
- Commit small pieces and push often, so everyone rebases on small changes.
- On a rebase conflict, resolve it keeping both sides' intent. If unsure, ask the person who wrote the other change.
- Never force-push `main`.

### Commit messages

Conventional Commits, English, imperative mood, under about 70 characters:

```
feat(web): add category pie chart
fix(server): exclude salary sweeps from spending
chore: add eslint config
docs: record gemini spike result
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`. Scopes: `web`, `server`, `shared`, `data`, or none.

## TypeScript conventions (all packages)

- `strict` mode on, plus `noUncheckedIndexedAccess`. No `any`, no `@ts-ignore`, no non-null `!` assertions. Use `unknown` and narrow it.
- Prefer `type` over `interface`. No `enum`: use `as const` arrays or objects and derive the union type, as in `taxonomy.ts`.
- Named exports only. Default exports only where a tool requires one (for example `vite.config.ts`).
- ES modules. Relative imports include the `.ts` / `.tsx` extension.
- Naming: `camelCase` for variables and functions, `PascalCase` for types and React components, `UPPER_SNAKE_CASE` for module-level constants. Files: `kebab-case.ts`, except React components (`CategoryPie.tsx`).
- Types for data crossing the API come from Zod schemas (`z.infer`). Never hand-write a second type for the same shape.
- `async`/`await`, not `.then()` chains.
- Small files with one purpose. Split a file when it passes about 300 lines.

## Domain rules

These keep numbers consistent everywhere.

- **All money maths happens on the server in deterministic code.** The frontend displays numbers. The AI only explains numbers that a tool returned. Neither adds, averages, or estimates on its own. One exception: the frontend may sum the selected action points.
- **"Today" is `DATA_END_DATE` from `@coach/shared` (2026-09-30).** Never use `new Date()` for anything that touches the data.
- **Money over the API:** euros as a number rounded to 2 decimals. Field names end in `Eur` (`totalEur`, `savingPerMonthEur`). Spending and income are both positive numbers. The field name says which one.
- **Percentages over the API:** fractions (`0.25`), field names end in `Pct`.
- **Dates over the API:** ISO strings (`2026-09-30`). Months as `YYYY-MM`.
- **Categories, subcategories, baskets:** always their ids from `taxonomy.ts`. Labels come from the same file.
- **Personal claims are built on categories, not subcategories.** Which subcategory (MCC) or merchant a purchase gets is random in this dataset, so "you take a lot of taxis" or "you are a café regular" says nothing about the user. Subcategory totals are fine to show as sums when asked. Payday and weekend patterns are the same for everyone. See "What is real signal and what is noise" in [docs/data.md](docs/data.md).
- **Spending** means baskets `mandatory_regular`, `mandatory_irregular`, `everyday`. Salary sweeps (`transfer`) and investments are never spending.
- **Benchmarks** are labelled with their source: "people your age" (peer data) or "average Finn" (Statistics Finland).
- JSON field names over the API are `camelCase`. Database column names stay `snake_case`. Convert in the query layer.

## Secrets and data

- Never commit API keys, `.env`, or anything under `data/`. They are git-ignored. Keep it that way.
- `.env.example` lists every variable with an empty value. Update it when you add one.
- The dataset is synthetic but is challenge material: do not paste large parts of it into external tools or public places.

## Extra rules for AI agents

- Read this file, [docs/data.md](docs/data.md), and the `AGENTS.md` in the app you are working in before writing code.
- Do what was asked and nothing more. No drive-by refactors, extra features, or new documentation files unless requested.
- Do not change configs, the lockfile, API schemas, or `taxonomy.ts` as a side effect. If the task seems to need it, say so and ask your user first.
- Run format, lint, and typecheck on your changes before reporting done. Say honestly if something fails or was not run.
- Do not commit or push unless your user asks. When you do, run `git pull --rebase origin main` first.
- Do not invent dataset columns, API fields, model ids, or benchmark figures. Check the code, `docs/data.md`, or the source. If you cannot verify something, say so.
