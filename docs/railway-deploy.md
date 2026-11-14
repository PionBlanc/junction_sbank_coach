# Railway deployment

Handoff for deploying the app to Railway. Written so a new session (person or AI agent) can do it without earlier context. Status: **not deployed yet.**

## Decisions already made

- **Platform:** Railway, as a **new service** inside the team's existing Railway project. That project already has a service from another repository. Do not change that service or project-wide shared variables.
- **Source:** the service is linked to this GitHub repo (`PionBlanc/junction_sbank_coach`, branch `main`). Railway redeploys on every push to `main`. That is fine.
- **One service** runs everything: the Hono server serves the API and the built web app.
- **Database:** `coach.duckdb` (about 100 MB) is never built on Railway and never committed. It is built locally with `npm run data` and put on a Railway volume once.

## What the repo already supports

- `npm run build` builds the web app into `apps/web/dist`.
- `npm start` runs the server with `tsx` (a runtime dependency of `apps/server`). If `apps/web/dist` exists, the server serves it, with `index.html` for unknown paths.
- The server reads `PORT` (Railway sets it) and `COACH_DB_PATH` from the environment ([apps/server/src/config.ts](../apps/server/src/config.ts)).
- `GET /api/health` returns `{"status":"ok","customers":5100}` when the database is loaded. Use it as the health check.

## Target setup

| Setting                        | Value                                                     |
| ------------------------------ | --------------------------------------------------------- |
| Service name                   | `money-coach` (or similar)                                |
| Source                         | GitHub repo `PionBlanc/junction_sbank_coach`, `main`      |
| Root directory                 | Repo root (npm workspaces need it)                        |
| Build command                  | `npm run build` (after Railway's own `npm ci`)            |
| Start command                  | `npm start`                                               |
| Health check path              | `/api/health`                                             |
| Replicas                       | 1                                                         |
| Volume                         | Mounted at `/data`, holds `coach.duckdb`                  |
| `COACH_DB_PATH`                | `/data/coach.duckdb`                                      |
| `GOOGLE_GENERATIVE_AI_API_KEY` | The team's Gemini key (service variable, never committed) |
| `PORT`                         | Do not set. Railway provides it                           |
| Public domain                  | Generate a Railway domain. This is the peer-review link   |

## Steps

1. In the existing project: **New → GitHub Repo →** this repo. Rename the service.
2. Set the build and start commands, the health check path, and the variables from the table.
3. Add a **volume** to the service, mounted at `/data`.
4. Put `coach.duckdb` on the volume (see the next section).
5. Redeploy. Check the build logs, then open `https://<domain>/api/health` and the app root on a phone.
6. Tick the deploy task in [PLAN.md](../PLAN.md) and add the public URL to the README.

Until the database is on the volume, the server exits at startup with `Database not found at /data/coach.duckdb`. That is expected and stops once the file is there.

## Open question: getting the database onto the volume

Not verified yet. Check Railway's current docs on volumes and the CLI first. Options, simplest first:

1. **Railway CLI file copy or shell.** If the CLI can copy a local file into a running service or volume (for example piping the file through `railway ssh`), use it once: `data/processed/coach.duckdb` → `/data/coach.duckdb`. Compressing it first (gzip) speeds up the transfer.
2. **One-time download inside the service.** Host the file somewhere private and temporary, open a shell in the service, and download it into `/data`. Delete the temporary copy afterwards. The dataset is challenge material, so never leave it at a public URL.
3. **Download on startup.** Only if 1 and 2 fail: a few lines in the server that fetch the file into `/data` when it is missing, from a URL plus token in env variables. This adds code, so it is the last resort.

Re-upload the file whenever someone changes the taxonomy and reruns `npm run data:prepare`.

## Things to check during the first deploy

- **Node version.** The repo needs Node 22.12 or newer (`engines` in `package.json`). Check which version the build log shows.
- **Dev dependencies at build time.** `vite` and Tailwind are dev dependencies of `apps/web`, and the build needs them. If the build cannot find `vite`, make the build install dev dependencies.
- **DuckDB native binary.** `@duckdb/node-api` installs a Linux binary as an optional dependency. The lockfile was created on Windows. If the server fails to load DuckDB, check that the Linux binding was installed.
- **"Application failed to respond".** The server must listen on Railway's `PORT` on all interfaces. `@hono/node-server` should do that by default. If not, pass a `hostname` in [apps/server/src/index.ts](../apps/server/src/index.ts).
- **Costs and access.** Usage is billed to the existing project, and everyone in it can see this service's variables, including the Gemini key. Confirm with the project owner that this is fine.

## After the first deploy

- Every push to `main` redeploys. A broken `main` means a broken public demo.
- The volume survives redeploys, so the database upload is one-time.
- The Gemini key is not used until the AI coach exists, but setting it now saves a step later.
