# Railway deployment

How the app is deployed on Railway, and how to update the database or redo the setup. Status: **deployed** (2026-11-14) at https://tx-to-actions.up.railway.app. It runs for the hackathon weekend only.

## Current setup

The service `money-coach` lives in the existing Railway project **Personal Finance** (a teammate's workspace, Hobby plan), next to the `personal_finance` and `Postgres` services. Do not change those two or any project-wide shared variables.

| Setting                        | Value                                                                                    |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| Source                         | GitHub repo `PionBlanc/junction_sbank_coach`, `main`. Every push to `main` redeploys     |
| Root directory                 | Repo root (npm workspaces need it)                                                       |
| Build                          | Railpack default: `npm install`, then `npm run build`. Dev dependencies are installed    |
| Start command                  | `npm start`                                                                              |
| Health check path              | `/api/health`. A deploy that fails it never replaces the running one                     |
| Replicas                       | 1                                                                                        |
| Volume                         | `money-coach-volume`, mounted at `/data`, holds `coach.duckdb`                           |
| `COACH_DB_PATH`                | `/data/coach.duckdb`                                                                     |
| `GOOGLE_GENERATIVE_AI_API_KEY` | The team's Gemini key. Service variable, never committed. Visible to all project members |
| `PORT`                         | Not set. Railway provides it                                                             |
| Public domain                  | https://tx-to-actions.up.railway.app                                                     |

Verified on the first deploy: Node 22.23 is used, the Vite build finds its dev dependencies, the Linux DuckDB binary loads, and `GET /api/health` returns `{"status":"ok","customers":5100}`. The app uses about 220 MB of memory, so it costs a few dollars a month on usage pricing.

## Railway CLI setup (once per machine)

```
npm i -g @railway/cli
railway login
railway link --project "Personal Finance" --environment production
railway service link money-coach
railway ssh keys add --key ~/.ssh/id_rsa.pub   # volume uploads go over SSH
```

You need to be a member of the Personal Finance project. Ask its owner for an invite.

## Update the database

Do this whenever someone changes the taxonomy and reruns `npm run data:prepare`. The volume survives redeploys, so otherwise the file stays put.

```
railway volume files --volume money-coach-volume upload data/processed/coach.duckdb /coach.duckdb --overwrite
railway restart --service money-coach
```

The upload needs a running container. If the service is crashed, use the keep-alive trick from the next section first.

## Redo the setup from scratch

What was done for the first deploy, in order:

1. In the project: **+ New → GitHub Repo →** this repo. Rename the service to `money-coach`. Click **Deploy / Apply changes** on the canvas: until then the service only exists as a staged change and the CLI cannot see it.
2. `railway volume add --mount-path /data` and `railway variables --set "COACH_DB_PATH=/data/coach.duckdb"`.
3. The first deploy crashes with `Database not found at /data/coach.duckdb`, and the upload cannot reach a crashed container. So set the start command to `sleep infinity` temporarily (dashboard: Settings → Deploy → Custom Start Command) and trigger a **new** deployment. `railway redeploy` reuses the old deployment's settings and still runs `npm start`. A fresh deploy from the dashboard, or `serviceInstanceDeployV2` through `railway api`, picks up the new command.
4. Check the mount with `railway ssh --service money-coach -- ls -la /data`, then upload the file as in the section above (without `--overwrite`).
5. Set the start command back to `npm start`, set the health check path to `/api/health`, and deploy again.
6. `railway domain --service money-coach` generates the public URL.
7. Add `GOOGLE_GENERATIVE_AI_API_KEY` in the dashboard.

The start command and health check were set through the GraphQL API (`railway api`, mutation `serviceInstanceUpdate`), but the dashboard settings do the same.

## Things to know

- A broken `main` means a broken public demo. The health check protects against a server that cannot start, not against a broken UI.
- Usage (memory and CPU, around the clock) is billed to the project owner's plan. Delete the service, or ask the owner to, after the weekend.
- The dataset is challenge material: never put `coach.duckdb` at a public URL.
