import type { DeckCard } from '@coach/shared';
import { Card } from '../../components/Card.tsx';
import { useCoachChat } from '../../lib/chat-context.ts';
import { BigNumber } from '../charts/BigNumber.tsx';
import { IncomeSpendingBars } from '../charts/IncomeSpendingBars.tsx';
import { SimpleBars } from '../charts/SimpleBars.tsx';
import { SimpleDonut } from '../charts/SimpleDonut.tsx';

type InsightCardProps = { card: DeckCard };

/** One point about the user's money: a chart, one sentence, and questions to ask the coach. */
export function InsightCard(props: InsightCardProps) {
  const { card } = props;
  const { ask, busy } = useCoachChat();
  return (
    <Card title={card.topic}>
      {card.chart.type === 'bars' && <SimpleBars bars={card.chart.bars} />}
      {card.chart.type === 'donut' && <SimpleDonut slices={card.chart.slices} />}
      {card.chart.type === 'stat' && (
        <BigNumber valueEur={card.chart.valueEur} caption={card.chart.caption} />
      )}
      {card.chart.type === 'incomeVsSpending' && <IncomeSpendingBars months={card.chart.months} />}
      <p className="text-lg leading-snug font-semibold">{card.sentence}</p>
      <p className="text-xs text-muted">{card.sourceNote}</p>
      <div className="mt-auto flex flex-col gap-2 pt-2">
        {card.questions.map((question) => (
          <button
            key={question}
            type="button"
            className="min-h-11 rounded-full border border-line px-4 py-2 text-left text-sm text-brand disabled:opacity-40"
            disabled={busy}
            onClick={() => ask(question)}
          >
            {question}
          </button>
        ))}
      </div>
    </Card>
  );
}
