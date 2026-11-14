The swipe profile is built entirely from the user's swipes. The cards, the amounts and the spender group all come from fixed rules, and the AI is not involved until the coach chat.

## 1. The cards (the input)

`GET /api/users/:id/actions` runs three rules over the customer's last 12 months of transactions (2025-10 to 2026-09), in [apps/server/src/insights/actions/index.ts](apps/server/src/insights/actions/index.ts):

- **Habits:** a subcategory bought at least 4 times and costing at least 10 € a month. The amount freed up is the monthly average times a hand-picked share, such as 1/4 for restaurants.
- **Taxis:** half of the monthly taxi average.
- **Above peers:** an everyday category where the customer spends more than the top quarter of their age band. The amount freed up is a fifth of their monthly average.

The cards are sorted by € per month freed up, and the deck keeps the first 12.

## 2. The profile (made in the browser)

The profile is just a list of card ids, each marked right or left. It lives only in browser memory, in [SwipeProvider.tsx](apps/web/src/features/swipe/SwipeProvider.tsx). From that list the app shows:

- **Down to try:** the cards swiped right.
- **Worth it:** the cards swiped left.
- **Monthly total:** the sum of the "down to try" amounts.
- **Spender group:** not from the swipes but from the last 12 months of spending, so it can be counted over all customers. See "Spender group" in [swipe.md](swipe.md).

## 3. How it reaches the coach LLM

1. Each chat request sends only `acceptedIds` and `rejectedIds`, with no amounts.
2. In [chat.ts:32-37](apps/server/src/coach/chat.ts#L32-L37), the server runs `getActions` again and looks the ids up with `buildSwipeProfile` ([swipe-profile.ts](apps/server/src/insights/actions/swipe-profile.ts)). The browser therefore can't change the numbers, and unknown ids are dropped.
3. [prompts/swipe-profile.ts](apps/server/src/coach/prompts/swipe-profile.ts) adds a block of text to the system prompt. It lists the "down to try" ideas with their rounded €/month, the monthly total and the "worth it" titles. It tells the coach to build its suggestions on "down to try" and never to suggest cutting "worth it" spending.
4. The coach still has its tools (spending summary, safe-to-spend, peer comparison, what-if) for anything else.

## Concrete example: CUST00164, the "young diner" (23)

These are real figures from the running server. Some of this customer's cards:

| id                    | card                                                               | €/mo freed |
| --------------------- | ------------------------------------------------------------------ | ---------- |
| habit-electronics     | Skip every fourth gadget or software buy                           | 101.54     |
| habit-fast_food       | Make every third coffee or quick lunch at home (248 €/mo)          | 82.63      |
| habit-bar             | Skip every fourth bar tab                                          | 60.33      |
| habit-games           | Wait for a sale on every third game                                | 52.81      |
| habit-events          | Skip every fourth event ticket                                     | 50.60      |
| taxis                 | Swap half your taxi rides for public transport                     | 37.68      |
| habit-restaurant      | Cook one in four restaurant meals at home (148 €/mo, 26 purchases) | 36.91      |
| above-peers-lifestyle | Shopping: spend a fifth less (162 € vs 76 € median for their age)  | 32.43      |

Suppose they swipe like this, which is a made-up set of swipes:

- **Right:** fast_food, games, taxis
- **Left:** restaurant, events

The browser shows:

- **Down to try:** 3 ideas, 82.63 + 52.81 + 37.68 = **173.12 €/mo**.

The chat request then carries this:

```json
{ "messages": [...], "acceptedIds": ["habit-fast_food","habit-games","taxis"],
  "rejectedIds": ["habit-restaurant","habit-events"] }
```

And the server adds this to the coach's system prompt:

```
The customer's swipes:
The app showed the customer saving ideas as cards. ... The numbers below come from the app, so you may state them.
Down to try:
- Make every third coffee or quick lunch at home (frees up about 83 € a month)
- Wait for a sale on every third game (frees up about 53 € a month)
- Swap half your taxi rides for public transport (frees up about 38 € a month)
Together these free up about 173 € a month.
Worth it to them:
- Cook one in four restaurant meals at home
- Skip every fourth event ticket
- Build your suggestions on the ideas they are down to try. Make them concrete and small.
- Never suggest changing the spending that is worth it to them, and say it is a fine choice if it comes up.
```

If they now tap "Plan my first week", the coach should plan around coffee, games and taxis, and leave their restaurant meals and event tickets alone.

**A caveat from [docs/data.md](docs/data.md):** subcategories are random in the raw dataset, so habit and taxi cards say nothing personal for an ordinary customer. This demo customer's subcategory mix is hand-made in [scripts/data/demo-profiles.ts](scripts/data/demo-profiles.ts) (no car, nights out, quick food, games), which is why the deck fits the persona. The "above peers" shopping card is the only one built on signal from the original data, because it works at the category level.
