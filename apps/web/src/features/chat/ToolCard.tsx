import {
  CATEGORIES,
  categorySplitSchema,
  incomeVsSpendingSchema,
  overviewSchema,
  peerComparisonSchema,
  safeToSpendSchema,
  spenderGroupSchema,
  spendingSummarySchema,
  whatIfQuerySchema,
  yearOverYearSchema,
} from '@coach/shared';
import { Card } from '../../components/Card.tsx';
import { categorySliceColour } from '../../lib/chart-colours.ts';
import { formatEur, formatMonth, formatPct } from '../../lib/format.ts';
import { IncomeSpendingBars } from '../charts/IncomeSpendingBars.tsx';
import { BasketBreakdown } from '../baskets/BasketBreakdown.tsx';
import { PeerCompare } from '../benchmark/PeerCompare.tsx';
import { MonthlyBars } from '../charts/MonthlyBars.tsx';
import { SimplePie } from '../charts/SimplePie.tsx';
import { YearOverYearBars } from '../charts/YearOverYearBars.tsx';
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

  if (props.toolName === 'getIncomeVsSpending') {
    const parsed = incomeVsSpendingSchema.safeParse(props.output);
    if (!parsed.success) return unreadable;
    const { fromMonth, toMonth, months, totalLeftEur, monthsOverspent } = parsed.data;
    return (
      <Card title={`Income and spending · ${formatMonth(fromMonth)} to ${formatMonth(toMonth)}`}>
        <IncomeSpendingBars months={months} />
        <p className="text-small">
          {totalLeftEur >= 0
            ? `Left over in total: ${formatEur(totalLeftEur)}.`
            : `In total ${formatEur(-totalLeftEur)} more went out than came in.`}{' '}
          Spending was larger than income in {monthsOverspent} of {months.length} months.
        </p>
      </Card>
    );
  }

  if (props.toolName === 'getYearOverYear') {
    const parsed = yearOverYearSchema.safeParse(props.output);
    if (!parsed.success) return unreadable;
    const { label, months, thisYearTotalEur, lastYearTotalEur, changeEur, changePct } = parsed.data;
    const first = months[0];
    const last = months.at(-1);
    const period =
      first && last ? ` · ${formatMonth(first.month)} to ${formatMonth(last.month)}` : '';
    return (
      <Card title={`${label}: this year against last year${period}`}>
        <YearOverYearBars months={months} />
        <p className="text-small">
          This year {formatEur(thisYearTotalEur)}, last year {formatEur(lastYearTotalEur)}:{' '}
          <span className="font-semibold">
            {changeEur >= 0 ? `${formatEur(changeEur)} more` : `${formatEur(-changeEur)} less`}
            {changePct !== null && ` (${formatPct(Math.abs(changePct))})`}
          </span>
          .
        </p>
      </Card>
    );
  }

  if (props.toolName === 'getCategorySplit') {
    const parsed = categorySplitSchema.safeParse(props.output);
    if (!parsed.success) return unreadable;
    const { fromMonth, toMonth, totalEur, slices } = parsed.data;
    const period =
      fromMonth === toMonth
        ? formatMonth(fromMonth)
        : `${formatMonth(fromMonth)} to ${formatMonth(toMonth)}`;
    return (
      <Card title={`Where your money went · ${period}`}>
        {slices.length === 0 ? (
          <p className="text-small text-muted">No spending in this period.</p>
        ) : (
          <>
            <SimplePie
              slices={slices.map((s, index) => ({
                label: s.label,
                valueEur: s.totalEur,
                sharePct: s.sharePct,
                ...categorySliceColour(index, s.categoryId),
              }))}
            />
            <p className="text-small">
              All spending: <span className="font-semibold">{formatEur(totalEur)}</span>.
            </p>
          </>
        )}
      </Card>
    );
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
