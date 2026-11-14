import type { DeckCard, SafeToSpend } from '@coach/shared';
import { eurText } from './text.ts';

/** The one number a person needs every day. Always shown, first in the deck. */
export function safeToSpendCard(data: SafeToSpend): DeckCard {
  const short = data.availableEur < 0;
  return {
    id: 'safe-to-spend',
    topic: 'Safe to spend',
    chart: { type: 'stat', valueEur: data.safeThisWeekEur, caption: 'this week' },
    sentence: short
      ? `The bills due before payday are ${eurText(-data.availableEur)} more than your balance.`
      : `You can spend ${eurText(data.safeThisWeekEur)} this week, ` +
        `${eurText(data.perDayEur)} a day until payday.`,
    questions: short
      ? ['How can I make my money last until payday?', 'Where did my money go this month?']
      : ['What is safe for me to spend this week?', 'How is my safe-to-spend calculated?'],
  };
}
