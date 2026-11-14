# Brainstorming: features and demo UX

Ideas only, nothing here is decided. Written after reading [challenge.md](challenge.md), [PLAN.md](../PLAN.md), [README.md](../README.md), and [data.md](data.md). Anything we adopt moves to PLAN.md.

## Where the current plan stands against the brief

The judging criteria are five equal 20% slices. How the plan scores today:

| Criterion                    | Today                                                         | Gap                                                                                  |
| ---------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Financial literacy, pedagogy | Three baskets are in the taxonomy and the overview            | The baskets are shown, not taught. The category pie competes with them for attention |
| Originality of AI            | Chat with tools, deterministic maths, chart rendering         | Chat is the last section of a long page. It can read as "dashboard plus a chatbot"   |
| Clarity of mobile UX         | One scrolling page, six sections                              | Six sections is a lot of scrolling on a phone. No single answer on the first screen  |
| Feasibility                  | Strong: data pipeline done, numbers only from tools, deployed | Keep it. This is our safest 20%                                                      |
| Fit with S-mobiili           | Web app that embeds as a web view                             | Nothing in the UI shows how it would sit inside S-mobiili                            |

Three observations that shape the list below:

1. **The brief is chat-first, the plan is dashboard-first.** The challenge sentence is "let people chat with their own money". Our strongest move is to make the coach the frame of the app and the charts things the coach shows, not the other way round.
2. **Safe to spend is named twice in the brief** and is the only number a person needs every day. It deserves the top of the first screen, not a place in a list.
3. **The baskets are the lesson.** Lead with them. Categories are the drill-down inside a basket.

## Ranked features

Ranked by demo value against build effort. "Data" says whether the dataset supports it.

### Tier 1: the core loop (mostly already in the MVP line)

| #   | Feature                                  | Why it ranks here                                                                                                                                                     | Effort | Data                               |
| --- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------- |
| 1   | **Safe to spend this week, as the hero** | Named in the brief. One number, days to payday, one sentence on how it was calculated                                                                                 | M      | Yes: balance, payday, housing date |
| 2   | **Chat that answers with cards**         | The answer to "taxis last month?" is a number card plus a small chart, not a paragraph. This is where "originality of AI" is won                                      | M      | Yes                                |
| 3   | **Three-basket bar**                     | One stacked bar: income split into regular, irregular, everyday, and what is left. Tap a basket to see its categories. Replaces both the money flow chart and the pie | S      | Yes                                |
| 4   | **What-if simulator**                    | Named in the brief. In chat first. The slider is stretch                                                                                                              | S      | Yes                                |
| 5   | **Action list with running total**       | Already planned. Add one thing: the selected total shows as "that is +X € a week on your safe to spend", which ties actions back to the hero number                   | S      | Yes                                |
| 6   | **You vs. people your age**              | Already planned. Use the 12-month average, as data.md warns                                                                                                           | S      | Yes                                |

### Tier 2: cheap additions with a large effect

| #   | Feature                         | What it is                                                                                                                                                                                                        | Effort | Data                             |
| --- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------- |
| 7   | **The coach speaks first**      | The app opens with one or two sentences from the coach: the single most important thing this month, with an honest verdict. This is the cached page summary, moved to the top and given an opinion                | S      | Yes                              |
| 8   | **"Ask about this" everywhere** | Every card and action has a button that opens chat with a prepared question about that exact thing. Makes the dashboard and the chat one product. Almost free                                                     | S      | n/a                              |
| 9   | **Show the working**            | Every number in a chat answer can be expanded: which tool ran, which period, how many transactions, the top rows. Turns "trusted" from a pitch claim into something the judges can tap                            | S      | Yes                              |
| 10  | **Chat changes the app**        | "I love travelling, stop nagging about it" calls a tool that sets the "worth it" preference, and the action list updates. Same for ticking an action from chat. Shows the AI is part of the app, not a side panel | S      | n/a                              |
| 11  | **Overdraft forecast**          | "At this pace you reach zero on the 24th, six days before payday." Part of safe to spend, shown only when true                                                                                                    | S      | Yes                              |
| 12  | **Payday effect**               | Spending in the week after payday against the week before it. A real behavioural insight that needs one query                                                                                                     | S      | Likely. Check the pattern exists |
| 13  | **Irregular-cost buffer**       | "Surprise costs averaged X €/month over the past year. Set that aside." The only feature that teaches the second basket                                                                                           | S      | Yes                              |
| 14  | **You vs. you**                 | Each category against the user's own last 12 months. Fairer than peers, and gives the coach something positive to say ("restaurants down 15% since spring")                                                       | S      | Yes: 24 months                   |
| 15  | **Plain-language explainers**   | Tappable terms (buffer, safe to spend, the three baskets) with a two-sentence explanation written for a 20-year-old. Static text is enough. Direct hit on the literacy criterion                                  | S      | n/a                              |

### Tier 3: stand-out features, pick one or two

| #   | Feature                     | What it is                                                                                                                                                                                | Effort | Data                                        |
| --- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------- |
| 16  | **Savings goal**            | "I want 2 000 € for a trip by June." The coach turns it into a weekly amount, shows which actions cover it, and safe to spend drops by that amount. This is "safe to save" from the brief | M      | Yes                                         |
| 17  | **Month in review**         | Four or five swipeable story cards: biggest basket, biggest change, one win, one suggestion. Aimed at young adults, and very demoable                                                     | M      | Yes                                         |
| 18  | **Spender persona**         | One friendly line and three traits, from deterministic rules (basket shares, payday effect, weekend share). The AI only words it. Answers "what kind of spender am I?" from the brief     | S–M    | Yes                                         |
| 19  | **When do I spend?**        | Weekday against weekend, time of day. "A third of your restaurant spending happens on Friday and Saturday nights"                                                                         | S      | Timestamps exist. Check they are realistic  |
| 20  | **What-if slider**          | A slider on a category that updates monthly, yearly, and 5-year effect live                                                                                                               | M      | Yes                                         |
| 21  | **Neighbourhood benchmark** | Housing against the same postcode area instead of the same age. Fairer for housing than an age comparison                                                                                 | M      | Postcode exists. Sample sizes need checking |
| 22  | **Check-in card**           | A notification-style card on open: "Thursday: 84 € left until Sunday." Shows how the coach would live in S-mobiili as a push message                                                      | S      | Yes                                         |

### Tier 4: weak fit, keep for the pitch slide

| Feature                     | Why it ranks low                                                                                                                                                                              |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deal finder                 | Utilities have no merchant or MCC, so we cannot say what the user pays for electricity. The coach would compare web prices with a number it does not have. Risky live, and off the core story |
| Average-Finn benchmark      | Category mapping to Statistics Finland takes hours and the brief calls it optional. Peers cover it. Do it only if someone is free                                                             |
| Home-buying readiness       | 201 mortgage applications. Hard to make a fair comparison for a demo user in the time we have                                                                                                 |
| Multi-bank (PSD2)           | A mocked second account proves nothing. One sentence in the pitch is enough                                                                                                                   |
| Subscriptions               | Not in the data. Already decided: skip                                                                                                                                                        |
| Voice input                 | Cheap with the browser speech API, but unreliable in a loud hall                                                                                                                              |
| Money flow (Sankey) and pie | The basket bar says the same thing in less space                                                                                                                                              |

### Suggested cut

If we build only this, the demo is complete: 1, 2, 3, 4, 5, 6 plus 7, 8, 9, 10, 11. Then one of 16 or 17 as the memorable moment.

## Small UX principles

- **One answer per screen.** The first screen answers "am I okay this week?" Everything else is below or behind a tap.
- **Honest verdicts.** The coach's opening line states how things are. For some users that is "you are doing fine, nothing needs fixing this month", and the action list may be short or empty. An app that always finds a problem is not trusted.
- **Every number has a source.** Period and comparison group are always named ("last 12 months", "people your age").
- **No guilt.** "Worth it to me" stays. Wording describes, it does not judge.
- **The AI never shows a number the server did not compute.** Already a rule. Say it out loud in the demo.

## Rough UI for the demo

Designed at 390 px. Two screens and one sheet.

### Screen 0: pick a person

The first thing the app shows. Three cards, one per demo customer, with age and a one-line persona. Tap to enter. A small switcher in the header changes person later. No login.

Frame it as "S-mobiili → Coach": a thin header that looks like a section inside a banking app, so the judges see the integration without us explaining it.

### Screen 1: one person's home

```
┌──────────────────────────────────┐
│ Coach              Aino, 23   ▾  │  person switcher
├──────────────────────────────────┤
│ ● "September went over budget:   │  7. coach speaks first
│   restaurants took a quarter of  │     (cached summary, 2 sentences)
│   your income. Here is the plan."│
│                                  │
│   SAFE TO SPEND THIS WEEK        │  1. hero number
│        84 €                      │
│   12 € a day · payday in 7 days  │
│   How is this calculated?  ›     │  9. show the working
├──────────────────────────────────┤
│ WHERE YOUR MONEY GOES   Sep ▾    │
│ ████████████▓▓▓▒▒▒▒▒▒░░          │  3. basket bar
│ Regular  Irregular  Everyday     │
│ 1 450 €    210 €     980 €       │     tap → categories in basket,
│                                  │     with "people your age" marker
├──────────────────────────────────┤
│ WHAT YOU CAN DO                  │  5. actions
│ ☐ Cook at home twice more  ~90 € │
│ ☐ Swap half your taxis     ~40 € │     each row: "Ask about this" (8)
│ ☐ Set aside a buffer      ~140 € │
│ Selected: 0 €/month              │
├──────────────────────────────────┤
│ [Taxis last month?] [What if…]   │  suggested questions
│ ┌──────────────────────────────┐ │
│ │ Ask about your money…      ➤ │ │  chat bar, always docked
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

Numbers in the sketch are placeholders.

Differences from the current README layout:

- Chat is a bar docked at the bottom of the screen, always visible, instead of the last section of the page.
- Summary and safe to spend are one block at the top.
- One basket bar replaces the money flow chart and the pie. Categories and the peer comparison live one tap inside a basket.
- Three or four sections instead of six.

### Sheet: basket detail

Tap a basket. A bottom sheet opens with:

- One sentence explaining the basket in plain language (this is the teaching moment).
- Its categories as horizontal bars, each with a marker for "people your age" and a "worth it to me" toggle.
- Tap a category for subcategories and "Ask about this".

### Screen 2: chat

Opens full screen from the chat bar, a suggested question, or any "Ask about this" button.

- Coach answers are short text plus a card: a number card, a chart, a what-if result, or an action with a checkbox.
- Each card has "How I got this" (period, filters, transaction count).
- Suggested follow-up questions under each answer, so the demo never needs typing.
- Actions ticked in chat appear ticked on the home screen.

### Demo script (2–3 minutes)

1. Pick the young diner. The coach's opening line and the safe-to-spend number are on screen in the first five seconds.
2. Tap the Everyday basket: restaurants stand out against people her age. Read the one-sentence basket explanation.
3. Tap "Ask about this" on restaurants. The coach answers with a chart. Open "How I got this".
4. Ask the what-if from the brief: "How much could I save if I reduced dining out by 20%?"
5. Tick the action from chat. Go back: the running total and the safe-to-spend line have changed.
6. Say "I love travelling, do not nag me about it." The travel action disappears.
7. Switch to the tight-budget person: the overdraft forecast appears. Same app, different coach.

## Open questions before adopting any of this

- **Do the demo customers' numbers hold up?** PLAN.md lists two of them spending more than their income on average over 12 months. The coach will be asked how that is possible. Check whether other income, investment withdrawals, or a falling balance explains it, and have the answer ready.
- **Do we want a demo person who is doing fine?** All three current personas have a problem. A fourth would show the honest-verdict behaviour and the range of the coach. Optional.
- **Are the timing patterns real?** Payday effect (12) and time-of-day (19) depend on the synthetic data having realistic timing. One query each before committing.
- **Basket bar instead of pie and money flow:** this changes the MVP line in PLAN.md, so it needs a team yes.
