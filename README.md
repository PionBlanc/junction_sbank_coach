# S-Bank Money Coach (working title)

Junction 2026 hackathon project for the S-Pankki challenge: **turn personal banking data into a trusted financial coach for everyday life.**

A mobile-first prototype that reads a user's transaction history, shows where the money really goes, compares it with other Finns, proposes concrete saving actions with euro amounts, and lets the user chat with their own data.

> Status: skeleton. Data pipeline, server, and web app are scaffolded and run end to end. No features yet. Start with [PLAN.md](PLAN.md). Coding rules for humans and AI agents are in [AGENTS.md](AGENTS.md). Dataset facts are in [docs/data.md](docs/data.md).

## The idea

Banking apps stop at statements and transaction lists. Ours answers three questions in plain language:

1. **Where does my money go?** Every transaction lands in one of three baskets, the pedagogical model S-Pankki asked for:
   - **Mandatory and regular**: rent, utilities, groceries, commuting
   - **Mandatory and irregular**: health costs, a broken washing machine
   - **Everyday spending**: coffees, restaurants, taxis, shopping, the money that slips through your fingers
2. **Is that normal?** Spending per category next to people like you (same age, from the dataset) and the average Finn (Statistics Finland open data).
3. **What should I do about it?** A short list of concrete actions, each with an approximate monthly saving.

Spending is not treated as bad in itself. The user can mark a category as "worth it to me" (for example travelling), and the coach stops nagging about it and looks for savings elsewhere.

## What the app shows

One scrolling mobile page, top to bottom:

| Section                | Content                                                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Summary**            | Key numbers for the month plus a short AI-written summary of spending trends and how the user compares with other Finns                        |
| **Money flow chart**   | Income, the three baskets, and savings/investments                                                                                             |
| **Category pie chart** | Spending by category: groceries, restaurants, housing, utilities, travel, and so on                                                            |
| **You vs. others**     | Per-category comparison that makes overspending obvious                                                                                        |
| **Action points**      | Top saving actions as a selectable list. Tick several and the total approximate saving updates at the bottom                                   |
| **Chat**               | Ask anything about your own money. The coach queries the data, runs what-if scenarios, draws new charts, and searches the web for better deals |

Example action points:

- "You spend 340 €/month on restaurants, 70% more than others your age. Cooking at home twice more a week would save about 90 €/month."
- "You took 9 taxi rides last month (310 €). Swapping half of them for public transport saves about 120 €/month."
- "Your utility bills are in the top quarter for your age group. Here are cheaper electricity contracts." → chat with web search
- "You spend 25% of your income on travelling. Do you get personal value from it? Two fewer trips a year would save about 300 €/month."

Example chat questions (from the challenge brief):

- "How much did I spend on taxis last month?"
- "What kind of spender am I?"
- "What is safe for me to spend this week?"
- "How much could I save if I reduced dining out by 20%?"

## Principles

- **A 48-hour demo.** Simplicity over generality. We build what the demo shows and nothing "for later". See [AGENTS.md](AGENTS.md).
- **The AI never does the maths.** All numbers come from deterministic code over the transaction data. The model picks which tool to call and explains the result. This is what makes the advice trustworthy.
- **MyData spirit.** The user explores their own data freely. The chat can draw charts on request instead of only showing charts we picked.
- **Concrete over generic.** Every piece of advice names an amount, a category, and a next step.
- **Mobile first.** Designed for a phone screen, built as a web app that can be embedded in S-mobiili.

## Ideas beyond the basics

Candidates for the action-point engine and the chat, chosen to fit what the dataset actually contains. Prioritised in [PLAN.md](PLAN.md).

- **Safe to spend / safe to save**: income minus upcoming mandatory payments minus a buffer, per week. 69% of the customers in the data dip below zero at some point, so this matters
- **Overdraft early warning**: "At your current pace you will hit zero on the 24th, six days before payday"
- **Irregular-cost buffer**: use the user's own history of irregular costs to suggest a monthly amount to set aside
- **Small-purchase annualiser**: "Your 3 € café visits add up to 640 € a year"
- **Idle money**: a balance that has sat unused on the current account for months could earn interest in savings
- **What-if simulator**: "20% less dining out" over 1, 5, and 10 years, with and without investing the difference
- **Payday effect**: spending in the first week after salary compared with the last week before it
- **Deal finder**: web search for cheaper electricity, phone, and insurance offers
- **Spender persona**: a friendly one-line profile based on spending patterns
- **Home-buying readiness**: the dataset includes real mortgage application outcomes. Show how far the user's saving pace is from a typical approved application
- **Multi-bank view (bonus)**: with PSD2, the same analysis over accounts from other banks

## Repository layout

```
apps/web/           Mobile-first React app (UI, charts, chat)
apps/server/        API and AI coach (Hono, DuckDB, Gemini)
packages/shared/    Types, schemas, and the category/basket taxonomy used by both
scripts/data/       Dataset download and preprocessing
data/               Raw and processed data. Never committed
docs/data.md        What is in the dataset and how it is processed
```

## Getting started

Requires Node.js 22.12 or newer.

```
npm install
npm run data        # downloads the dataset (~365 MB) and builds data/processed/coach.duckdb
npm run dev         # open http://localhost:5173
```

Copy `.env.example` to `.env` and add your Gemini API key. Never commit `.env`.

| Command             | What it does                                                         |
| ------------------- | -------------------------------------------------------------------- |
| `npm run data`      | Fetch and preprocess the dataset                                     |
| `npm run dev`       | Server on port 8787 and web app on port 5173, both reload on changes |
| `npm run build`     | Build the web app into `apps/web/dist`                               |
| `npm start`         | Run the server, which also serves the built web app (production)     |
| `npm run format`    | Format everything with Prettier                                      |
| `npm run lint`      | Lint the whole repo                                                  |
| `npm run typecheck` | Type-check the whole repo                                            |
| `npm test`          | Run all tests                                                        |

Troubleshooting:

- **Server hangs at startup or cannot open the database:** another process (for example a second server you forgot) may hold `coach.duckdb` open. Stop it and restart. Always stop the server before `npm run data:prepare`.
- **Vitest says "failed to find the current suite" on Windows:** the terminal is in `c:\...` with a lowercase drive letter. Open it in `C:\...` (for example `cd C:\Users\...`) and rerun.
