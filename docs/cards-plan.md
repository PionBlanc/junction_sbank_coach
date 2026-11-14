# Feature plan: swipeable insight cards

New direction for the UI. This replaces the current scrolling home screen (`SafeToSpendHero`, `BasketBar`, `ActionList` in `apps/web/src/App.tsx`), the layout in [README.md](../README.md), and the home screen sketch in [brainstorming.md](brainstorming.md). The insights, routes, and chat already on `main` stay: the cards are built on top of them. Once the team agrees, the tasks below move into [PLAN.md](../PLAN.md).

## The idea in one paragraph

The app is a deck of cards. Each card makes one point about the user's money, with one simple chart and one sentence under it. The user swipes left for the next card and right to go back. Each card has one or two ready-made questions the user can tap to start a conversation with the coach. The chat itself stays as it is: the text field docked at the bottom of the screen. Simple beats complete: a card that needs a legend, a second axis, or a paragraph has too much on it.

## Card anatomy

```
┌──────────────────────────────────┐
│ Coach              Aino, 23   ▾  │  person switcher (unchanged)
│                                  │
│  ┌────────────────────────────┐  │
│  │ FOOD                       │  │  small label: the topic
│  │                            │  │
│  │      ███                   │  │  one chart, 2–6 marks,
│  │      ███     ███           │  │  no gridlines, no legend,
│  │      ███     ███           │  │  values printed on the marks
│  │     612 €   510 €          │  │
│  │      You   Average Finn    │  │
│  │                            │  │
│  │ You spend 20% more on food │  │  one sentence, from the server
│  │ than the average Finn.     │  │
│  │ Last 12 months · Stat. Fin.│  │  period and source, small grey
│  │                            │  │
│  │ (Why is it higher?)        │  │  1–2 tappable questions,
│  │ (What if I cut it by 20%?) │  │  sent to the existing chat
│  └────────────────────────────┘  │
│           ● ○ ○ ○ ○ ○            │  position dots
└──────────────────────────────────┘
```

Rules for every card:

- **One chart, one message.** At most 6 bars, slices, or points. Highlight the user's mark, grey for the rest.
- **Numbers printed on the chart.** No axes or tooltips needed to read it.
- **One sentence**, at most about 90 characters. It names the comparison and the direction. Numbers in it come from the server.
- **Source line** under the sentence: period ("last 12 months") and benchmark ("people your age" or "average Finn"), as AGENTS.md requires.
- **One or two questions** under the source line, as tappable chips. Short, specific to the card, and answerable by the coach's existing tools.
- **Only true and relevant cards are shown.** A card rule returns nothing when its story does not hold for this user (no "your taxis" card for someone with no taxi rides).

## Card catalogue

First version: 6–8 cards. Each is one deterministic rule on the server. Ordered by how sure we are the data supports it.

| #   | Card                       | Chart                             | Example sentence                                                  | Data                                                                                  |
| --- | -------------------------- | --------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1   | Spending trend             | 6 monthly bars, last one coloured | "Your spending has been trending up over the past 6 months."      | `monthly_category`, spending baskets. Ready                                           |
| 2   | You vs. people your age    | 2 bars: you, peers                | "You spend 10% less than people your age."                        | `peer_benchmarks` for the user's age band. Ready                                      |
| 3   | Where it goes              | Donut, top 4 categories + "other" | "Housing takes the biggest share: 38% of your spending."          | `monthly_category`, 12-month average. Ready                                           |
| 4   | Biggest category vs. peers | 2 bars: you, peers                | "You spend 638 € a month on restaurants. People your age: 205 €." | `peer_benchmarks`. Ready. Pick the category with the largest gap                      |
| 5   | The three baskets          | One stacked bar or 3 bars         | "Everyday spending is 27% of what you spend."                     | Basket totals. Ready. The teaching card: the sentence explains the basket idea        |
| 6   | Biggest change             | 2 bars: last 3 months vs. before  | "Restaurants are down 15% compared with spring."                  | `monthly_category`. Ready. Gives a positive card to users who improved                |
| 7   | Safe to spend this week    | One big number, no chart          | "You can spend 84 € this week, 12 € a day until payday."          | Ready: `insights/safe-to-spend.ts`. `SafeToSpendCard` already exists                  |
| 8   | You vs. the average Finn   | 2 bars: you, average Finn         | "You spend 20% more on food than the average Finn."               | **Blocked:** needs the Statistics Finland benchmark JSON (PLAN.md Phase 2, not built) |
| 9   | Mortgage / housing         | 2 bars or one number              | "Your housing costs are 44% of your income."                      | Housing share: ready. **Mortgage-specific cards: see open questions**                 |

Added after the first build: an **income and spending** card (income and spending bars for each of the last 12 months, "You spent more than you earned in 9 of the last 12 months."). Income and spending and where the money goes (now with euros per category) are the key cards and always sit in the first three. All cards have the same fixed height; the action list scrolls inside its card.

Deck order: start with something calm and useful (safe to spend, or the trend), put comparisons in the middle, end with a card that leads to action ("Ways to free up money", which can be the existing action list in card form). Max about 8 cards per user.

## How it works

### Server

- `apps/server/src/insights/cards/`: one file per card rule, same pattern as `insights/actions/`. Each exports a function that takes the user context and returns `Card | null`. Rules reuse the existing insight functions (`overview.ts`, `peers.ts`, `spending-summary.ts`, `safe-to-spend.ts`) instead of new SQL where they can.
- `insights/cards/index.ts` runs the rules in deck order and drops the nulls.
- **The sentence is a deterministic template** in the rule (`You spend ${pct} more on ${label} than people your age.`). No AI call to show the deck: fast, free, and every number is guaranteed right. AI rewording can come later if we have time.
- Tests next to each rule, with a small in-memory DuckDB fixture (as `apps/server/AGENTS.md` requires).
- Route: `GET /api/users/:id/cards` returns the deck.

### Shared schema (`packages/shared/src/api/cards.ts`)

One Zod schema with a discriminated union on the chart type, so the frontend has one small component per chart type and nothing else:

```ts
// sketch, not final
Card = {
  id: string,               // stable, e.g. 'peer-compare'
  topic: string,            // small label, "Food"
  sentence: string,
  sourceNote: string,       // "Last 12 months · people your age"
  chart:
    | { type: 'bars'; bars: { label: string; valueEur: number; highlight: boolean }[] }
    | { type: 'donut'; slices: { categoryId: CategoryId | 'other'; valueEur: number; sharePct: number }[] }
    | { type: 'stat'; valueEur: number; caption: string },
  questions: string[],      // 1–2 tappable starter questions, "Why is my food spending higher?"
}
```

Three chart types cover every card in the catalogue. Monthly trend is `bars` with month labels.

### Frontend (`apps/web/src/features/cards/`)

- `CardDeck.tsx`: holds the current index, renders the current card, handles swipe.
- `InsightCard.tsx`: topic, chart, sentence, source line, question chips.
- Chart components in `features/charts/`: `SimpleBars.tsx`, `SimpleDonut.tsx`, `BigNumber.tsx`. Recharts with axes, grid, and tooltips turned off, labels on the marks. Start from the existing `MonthlyBars.tsx` and `components/Card.tsx`.
- `useCards.ts` in `src/api/`: TanStack Query hook.
- `App.tsx` registers the deck instead of `SafeToSpendHero`, `BasketBar`, and `ActionList`. Those components are reused inside cards where they fit, not deleted straight away.

**Swipe, without a new dependency.** Pointer events plus a CSS `transform: translateX()` on the card: follow the finger, and on release past about 30% of the width (or a fast flick) animate to the next or previous card, otherwise snap back. About 60–80 lines. Left = next, right = previous; at the ends the card springs back. Also: arrow buttons and keyboard arrows for the laptop demo, and position dots. Unlike Tinder, swiping does not like or dislike anything, it only moves.

If the hand-made swipe feels bad on a real phone, the fallback is CSS `scroll-snap` on a horizontal row of cards, which gives native swiping for free (but less of the card-flick feel). Adding `framer-motion` is the third option and is a new dependency, so team decision.

### Questions on a card

- No "Ask about this" button. The existing chat (`features/chat/Chat.tsx`: docked text field, opens full screen) is good and stays as it is.
- Each card carries one or two questions in `questions`, written by the card rule next to its sentence, so they always match what the card shows (for example "Why is my restaurant spending higher?" and "What if I ate out 20% less?").
- Tapping a question sends it to the existing chat exactly as if the user had typed it: the chat opens and the coach answers with its usual tools. To make that possible, `Chat.tsx` exposes its `ask` function through a small context (for example `useAsk()`), and `InsightCard` calls it. No server change is needed.
- Questions are written in full, with the category and period, so the coach needs no extra context about the card.
- The static `SUGGESTED_QUESTIONS` chips in `Chat.tsx` can stay for the open chat, or be replaced with the current card's questions. Team choice, small either way.

## What changes in PLAN.md

- Frontend tasks "Summary card", "Money flow chart", "Category pie chart with drill-down", "You vs. others chart" are replaced by the card deck and the three chart components.
- `GET /api/users/:id/cards` is added. The existing `overview`, `safe-to-spend`, `what-if`, and `actions` routes stay: the chat and the what-if card still use them.
- The AI page summary is no longer needed for the first screen (templates instead). That saves Gemini quota.
- The action list becomes the last card, or a button on it. Decide below.

## Tasks

Split so three people can work in parallel after step 1.

1. [x] **Together, 30 min:** agree on the `Card` schema in `packages/shared/src/api/cards.ts`. Server returns two hard-coded cards so the frontend is unblocked
2. [x] **Frontend A:** `CardDeck` with swipe, buttons, dots. Test on a real phone early
3. [x] **Frontend A:** `InsightCard` and the three chart components
4. [x] **Server B:** card rules 1–3 (trend, peers, where it goes) with tests
5. [x] **Server B:** card rules 4–6 (biggest gap, baskets, biggest change) with tests
6. [ ] **Coach C:** expose the chat's `ask` through a small context so card question chips can start a conversation: done. Still open: check every card's questions get a good answer from the existing tools
7. [ ] **C or whoever is free:** safe-to-spend card (7, wraps the existing insight): done. Still open: the average-Finn benchmark and card (8)
8. [x] Check all three demo users get a deck that tells a different story, and that no card is false or awkward for any of them

## Open questions

- **"Average Finn" cards need data we do not have yet.** The Statistics Finland benchmark is an open PLAN.md task, and the brainstorming put it in tier 4. Until it exists, use "people your age" (which we have). "Food" would be groceries + restaurants; the mapping to Statistics Finland categories has to be checked.
- **Mortgage data is thin.** The dataset has one `housing_payment` a month but does not say whether it is rent or a mortgage. Mortgage applications exist for only 201 customers; we have not checked whether any demo customer is one of them. Housing share of income is safe to show. Anything mortgage-specific needs a data check first.
- **Tone.** The examples "You spend 20% more…" state the comparison directly. The tone section in brainstorming.md preferred showing two numbers and letting the user conclude ("You spend 638 €. People your age: 205 €"). Both work as one sentence. Pick one style for all cards.
- **Where do the action points go?** Recommendation: a final "Ways to free up money" card that lists the top 3 actions with checkboxes and the running total.
- **Is swipe the only navigation?** Recommendation: swipe plus arrow buttons and dots, so it works on the laptop during the pitch.
