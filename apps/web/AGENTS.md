# apps/web/AGENTS.md

Frontend rules. Read the root [AGENTS.md](../../AGENTS.md) first. This file adds to it.

Stack: React, TypeScript, Vite, Tailwind CSS, Recharts, TanStack Query, AI SDK (`@ai-sdk/react`) for chat.

## Folder structure

```
src/
  api/          Hono RPC client and TanStack Query hooks (useOverview, useActions, ...)
  components/   Reusable UI pieces (Card, Button, EuroAmount, ...)
  features/     One folder per page section: summary/, charts/, benchmark/, actions/, chat/
  lib/          Pure helpers: formatting, category colours
  App.tsx       Composes the sections. Registration only
```

A feature folder owns its components. Move something to `components/` only when a second feature needs it.

## React

- Function components only: `export function CategoryPie(props: CategoryPieProps) { ... }`.
- One component per file, named like the component: `CategoryPie.tsx`. Hooks: `useSomething.ts`.
- The props type is named `<Component>Props` and sits right above the component.
- Server data goes through the TanStack Query hooks in `src/api/`, which use the typed Hono client. No `fetch` in components. No `useEffect` for data fetching.
- Local state with `useState`. No global state library. Shared selection state (current user, month, "worth it" categories) lives in one small React context.
- Every section handles loading, error, and empty states.

## Styling

- Tailwind utility classes only. No CSS files except the Tailwind entry file. Inline `style` only for dynamic values such as chart sizes.
- Colours, spacing, and fonts come from the Tailwind theme. No raw hex colours in components. Add a theme token if one is missing.
- Mobile first: design for 390 px width. On desktop, centre the app in a phone-width column. No separate desktop layouts.
- Touch targets at least 44 px high.

## Charts

- Recharts for every chart. Each chart is its own component in `features/charts/`.
- Category colours come from one map in `src/lib/`, keyed by category id, so a category has the same colour in every chart.
- Charts requested in chat (`renderChart` tool results) reuse the same chart components.

## Numbers and text

- Never calculate financial figures. Show what the API returns. Summing the selected action points is the one exception.
- Format money, percentages, and dates with the helpers in `src/lib/format.ts`, built on `Intl.NumberFormat('fi-FI', ...)`. No ad hoc `toFixed` in components.
- Category and basket labels come from `@coach/shared`. Never hard-code the category list.
- AI output is rendered as Markdown through one shared component. Never use `dangerouslySetInnerHTML`.
