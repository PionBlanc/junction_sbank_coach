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
| habit-restaurant      | Cook one in four restaurant meals at home (359 €/mo, 52 purchases) | 89.66      |
| habit-fast_food       | Make every third coffee or quick lunch at home (247 €/mo)          | 82.46      |
| habit-recreation      | Swap every fourth paid activity for a free one                     | 51.42      |
| above-peers-lifestyle | Shopping: spend a fifth less (162 € vs 76 € median for their age)  | 32.43      |
| habit-grocery_store   | Trim 5% off groceries                                              | 23.62      |
| taxis                 | Swap half your taxi rides for public transport                     | 13.19      |

Suppose they swipe like this, which is a made-up set of swipes:

- **Right:** fast_food, grocery_store, taxis
- **Left:** restaurant, recreation

The browser shows:

- **Down to try:** 3 ideas, 82.46 + 23.62 + 13.19 = **119.27 €/mo**.

The chat request then carries this:

```json
{ "messages": [...], "acceptedIds": ["habit-fast_food","habit-grocery_store","taxis"],
  "rejectedIds": ["habit-restaurant","habit-recreation"] }
```

And the server adds this to the coach's system prompt:

```
The customer's swipes:
The app showed the customer saving ideas as cards. ... The numbers below come from the app, so you may state them.
Down to try:
- Make every third coffee or quick lunch at home (frees up about 82 € a month)
- Trim 5% off groceries with a weekly meal plan (frees up about 24 € a month)
- Swap half your taxi rides for public transport (frees up about 13 € a month)
Together these free up about 119 € a month.
Worth it to them:
- Cook one in four restaurant meals at home
- Swap every fourth paid activity for a free one
- Build your suggestions on the ideas they are down to try. Make them concrete and small.
- Never suggest changing the spending that is worth it to them, and say it is a fine choice if it comes up.
```

If they now tap "Plan my first week", the coach should plan around coffee, groceries and taxis, and leave their restaurant meals and activities alone.

**A caveat from [docs/data.md](docs/data.md):** subcategories are random in this dataset. So the habit and taxi cards, which are most of this deck, are correct sums but say nothing about this person. The "above peers" shopping card is the only one built on real signal, because it works at the category level.
