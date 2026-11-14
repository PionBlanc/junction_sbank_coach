import {
  CATEGORIES,
  overviewSchema,
  peerComparisonSchema,
  safeToSpendSchema,
  spenderGroupSchema,
  spendingSummarySchema,
  whatIfQuerySchema,
} from '@coach/shared';
import { Card } from '../../components/Card.tsx';
import { formatEur, formatMonth } from '../../lib/format.ts';
import { BasketBreakdown } from '../baskets/BasketBreakdown.tsx';
import { PeerCompare } from '../benchmark/PeerCompare.tsx';
import { MonthlyBars } from '../charts/MonthlyBars.tsx';
import { SafeToSpendCard } from '../safe-to-spend/SafeToSpendCard.tsx';
import { SpenderGroupCard } from '../spender-group/SpenderGroupCard.tsx';
import { WhatIfCard } from '../what-if/WhatIfCard.tsx';

type ToolCardProps = { toolName: string; input: unknown; output: unknown };

/** Draws a coach tool result as a card. The numbers are the server's, shown as they came. */
export function ToolCard(props: ToolCardProps) {
  const unreadable = <p className="text-small text-muted">This result could not be shown.</p>;

  if (props.toolName === 'getMonthlyBreakdown') {
    const parsed = overviewSchema.safeParse(props.output);
    return parsed.success ? <BasketBreakdown data={parsed.data} /> : unreadable;
  }

  if (props.toolName === 'getSpenderGroup') {
    const parsed = spenderGroupSchema.safeParse(props.output);
    return parsed.success ? <SpenderGroupCard group={parsed.data} /> : unreadable;
  }

  if (props.toolName === 'getSafeToSpend') {
    const parsed = safeToSpendSchema.safeParse(props.output);
    return parsed.success ? <SafeToSpendCard data={parsed.data} /> : unreadable;
  }

  if (props.toolName === 'simulateWhatIf') {
    const parsed = whatIfQuerySchema.safeParse(props.input);
    return parsed.success ? <WhatIfCard {...parsed.data} /> : unreadable;
  }

  if (props.toolName === 'getSpendingSummary') {
    const parsed = spendingSummarySchema.safeParse(props.output);
    if (!parsed.success) return unreadable;
    const { label, fromMonth, toMonth, totalEur, txCount, monthly } = parsed.data;
    const period =
      fromMonth === toMonth
        ? formatMonth(fromMonth)
        : `${formatMonth(fromMonth)} to ${formatMonth(toMonth)}`;
    return (
      <Card title={`${label} · ${period}`}>
        <p className="text-amount font-semibold">{formatEur(totalEur)}</p>
        <p className="text-caption text-muted">
          {txCount} {txCount === 1 ? 'purchase' : 'purchases'}
        </p>
        {monthly.length > 1 && <MonthlyBars monthly={monthly} />}
      </Card>
    );
  }

  if (props.toolName === 'compareToPeers') {
    const parsed = peerComparisonSchema.safeParse(props.output);
    if (!parsed.success) return unreadable;
    return (
      <Card title={`You and people your age (${parsed.data.ageBand})`}>
        {parsed.data.categories.map((category) => (
          <div key={category.categoryId} className="flex flex-col gap-1">
            <span className="text-small font-semibold">
              {CATEGORIES[category.categoryId].label}
            </span>
            <PeerCompare
              youMonthlyAvgEur={category.youMonthlyAvgEur}
              peerMedianMonthlyEur={category.peerMedianMonthlyEur}
            />
          </div>
        ))}
      </Card>
    );
  }

  return null;
}
