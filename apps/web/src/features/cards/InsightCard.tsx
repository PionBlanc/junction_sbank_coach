import type { DeckCard } from '@coach/shared';
import { Card } from '../../components/Card.tsx';
import { categorySliceColour } from '../../lib/chart-colours.ts';
import { useCoachChat } from '../../lib/chat-context.ts';
import { formatEur, formatNumber } from '../../lib/format.ts';
import { BigNumber } from '../charts/BigNumber.tsx';
import { IncomeSpendingBars } from '../charts/IncomeSpendingBars.tsx';
import { SimpleBars } from '../charts/SimpleBars.tsx';
import { SimplePie } from '../charts/SimplePie.tsx';

type InsightCardProps = { card: DeckCard };

/** One point about the user's money: a chart, one sentence, and questions to ask the coach. */
export function InsightCard(props: InsightCardProps) {
  const { card } = props;
  const { ask, busy } = useCoachChat();
  return (
    <Card title={card.topic}>
      {card.chart.type === 'bars' && <SimpleBars bars={card.chart.bars} />}
      {card.chart.type === 'donut' && (
        <SimplePie
          slices={card.chart.slices.map((s, index) => ({
            ...s,
            ...categorySliceColour(index, s.categoryId),
          }))}
        />
      )}
      {card.chart.type === 'stat' && (
        <BigNumber text={formatEur(card.chart.valueEur)} caption={card.chart.caption} />
      )}
      {card.chart.type === 'years' && (
        <BigNumber text={formatNumber(card.chart.years)} caption={card.chart.caption} />
      )}
      {card.chart.type === 'incomeVsSpending' && <IncomeSpendingBars months={card.chart.months} />}
      <p className="text-title font-semibold">{card.sentence}</p>
      <div className="mt-auto flex flex-col divide-y divide-line border-t border-line">
        {card.questions.map((question) => (
          <button
            key={question}
            type="button"
            className="flex min-h-11 items-center justify-between gap-4 py-2 text-left text-small disabled:opacity-40"
            disabled={busy}
            onClick={() => ask(question)}
          >
            {question}
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-4 shrink-0 text-subtle"
              aria-hidden
            >
              <path d="M7.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L11.6 10 7.3 5.7a1 1 0 0 1 0-1.4Z" />
            </svg>
          </button>
        ))}
      </div>
    </Card>
  );
}
