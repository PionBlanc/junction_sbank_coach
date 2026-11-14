# Swipe your savings

How the swipe deck on the `swipe-opportunities` branch works: where the cards come from, how they are chosen, what the swipe profile is, and how the coach uses it.

## The flow

1. The home screen shows an intro, then a deck of saving ideas for the selected demo customer.
2. The user swipes right ("down to try") or left ("worth it to me") on each card.
3. After the last card, a profile view shows their money type, their matches, and what they keep.
4. From then on the coach chat knows the swipes and answers accordingly.

Switching demo customer starts over from the intro with a fresh deck.

## Where the cards come from

A card is an `Action` from `GET /api/users/:id/actions`. The server builds the list in [apps/server/src/insights/actions/index.ts](../apps/server/src/insights/actions/index.ts) from three rules. Every number is calculated from that customer's own transactions over the last 12 months of the data (2025-10 to 2026-09). Nothing is random and the AI is not involved.

| Rule                                                                               | What it suggests                                                    | When it appears                                                                                              | Amount freed up                                   |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| Habits ([habits.ts](../apps/server/src/insights/actions/habits.ts))                | A concrete habit for one kind of purchase, such as restaurant meals | The customer bought it at least 4 times in the 12 months and spends at least 10 € a month on it              | A fixed share of their monthly average, see below |
| Taxis ([taxis.ts](../apps/server/src/insights/actions/taxis.ts))                   | Swap half the taxi rides for public transport                       | Taxi spending is at least 10 € a month                                                                       | Half of their monthly taxi average                |
| Above peers ([above-peers.ts](../apps/server/src/insights/actions/above-peers.ts)) | Spend a fifth less on an everyday category                          | Their monthly average is above the top quarter of their age band, and no habit card covers the same category | A fifth of their monthly average in that category |

### The habits

Each habit belongs to one subcategory from `taxonomy.ts`. The share is a fixed number chosen by hand to be small and realistic. It is not derived from data.

**Caveat:** in this dataset the subcategory (MCC) of a purchase is random: every customer has the same mix, and parking, taxis, fuel, and public transport have identical amounts. So the habit and taxi cards are correct sums but say nothing personal, and the taxi card shows for 71% of customers. The team decided to move personal rules to the category level. See "What is real signal and what is noise" in [data.md](data.md).

| Subcategory        | Habit                                                 | Share |
| ------------------ | ----------------------------------------------------- | ----- |
| Restaurants        | Cook one in four restaurant meals at home             | 1/4   |
| Fast food & cafés  | Make every third coffee or quick lunch at home        | 1/3   |
| Bars               | Skip every fourth bar tab                             | 1/4   |
| Grocery stores     | Trim 5% off groceries with a weekly meal plan         | 5%    |
| Convenience stores | Skip every fourth convenience-store run               | 1/4   |
| Fuel               | Walk, cycle or share one car trip in ten              | 1/10  |
| Parking            | Skip paid parking one time in four                    | 1/4   |
| Clothing           | Skip every fourth clothing buy                        | 1/4   |
| Sports goods       | Skip every fourth sports gear buy                     | 1/4   |
| Other shopping     | Sleep on one in four impulse buys                     | 1/4   |
| Books, hobbies     | Borrow every third book or game from the library      | 1/3   |
| Electronics        | Skip every fourth gadget or software buy              | 1/4   |
| Cinema             | Swap every third cinema trip for a film night at home | 1/3   |
| Events & tickets   | Skip every fourth event ticket                        | 1/4   |
| Attractions        | Skip every fourth attraction or park visit            | 1/4   |
| Recreation         | Swap every fourth paid activity for a free one        | 1/4   |
| Hotels             | Skip one hotel night in four                          | 1/4   |

The calculation for one habit:

```
monthly average = spending in the subcategory over 12 months / 12
freed up a month = monthly average × share
freed up a week  = freed up a month × 12 / 52
```

To add a habit, add one entry to the `HABITS` list.

### How the deck is chosen

1. Run all three rules for the customer.
2. Drop an "above peers" card when a habit card already covers that category, so the two do not count the same money twice.
3. Sort by the amount freed up a month, largest first.
4. Keep the first 12.

So "most relevant" means "frees up the most for this customer". A customer with spending in few areas gets fewer cards. The deck does not yet look at trends, such as spending that rose against the year before.

Groceries, fuel, and parking are in the mandatory basket but are in the deck anyway, to give most customers 8 to 12 cards.

## The swipe profile

### What it is made of

The profile is only the list of swipes: for each card, its id and whether it was swiped right. It lives in browser memory ([SwipeProvider.tsx](../apps/web/src/features/swipe/SwipeProvider.tsx)). It is not saved anywhere, so a reload or a customer switch clears it.

From that list the app derives:

| Part          | Meaning                                                  |
| ------------- | -------------------------------------------------------- |
| Down to try   | Cards swiped right                                       |
| Worth it      | Cards swiped left                                        |
| Monthly total | Sum of the amounts freed up by the "down to try" cards   |
| Spender group | The customer's group from their spending data, see below |

### Spender group

Chosen on the server from the last 12 months of spending, not from the swipes, so it can be counted over all customers ([spender-group.ts](../apps/server/src/insights/spender-group.ts)). The groups are defined in [spender-groups.ts](../packages/shared/src/spender-groups.ts):

- Among restaurants, transportation, shopping, entertainment and travel, take the categories where the customer's monthly average is above the top quarter of their age band. The one furthest above the age-band median names the group: "Foodie at heart", "Door-to-door traveller", "Treat collector", "Front-row regular" or "Window-seat dreamer".
- No category above the top quarter: "Picky in a good way".
- The count is over all customers except salary-sweep customers (see [data.md](data.md)). The coach tells it with `getSpenderGroup`, and the profile view shows the same group.

### How the coach uses it

1. With every chat message the web app sends two lists of card ids: accepted and rejected. It sends no amounts.
2. The server runs the action rules again for that customer and looks the ids up, so the numbers the coach sees cannot be changed by the browser ([swipe-profile.ts](../apps/server/src/insights/actions/swipe-profile.ts)). Unknown ids are ignored.
3. The profile is added to the system prompt ([prompts/swipe-profile.ts](../apps/server/src/coach/prompts/swipe-profile.ts)): the ideas the customer is down to try with their amounts, the monthly total, and the spending that is worth it to them.
4. The prompt tells the coach to build on the "down to try" ideas and never to suggest changing the "worth it" spending.

"Plan my first week" on the profile view is a normal chat question sent with this profile.

## Demo customers

Demo customers are real rows from the dataset, listed in `DEMO_CUSTOMERS` in [packages/shared/src/dataset.ts](../packages/shared/src/dataset.ts). To add one, add a line with the customer id and a short persona. Pick customers without salary sweeps and with a housing payment every month, see [data.md](data.md).

## What changed outside the swipe feature

- `Action` has a new field `emoji`.
- The action list is capped at 12 and contains the new habit cards. The millionaire card sums all actions, so its figure changed.
- The chat request accepts two optional fields, `acceptedIds` and `rejectedIds`.
- The old insight deck (`CardDeck`) is still in the repo but is not shown.
