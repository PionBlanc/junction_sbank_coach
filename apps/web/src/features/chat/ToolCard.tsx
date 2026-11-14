import {
  CATEGORIES,
  categoryChangesSchema,
  largestPurchasesSchema,
  excelExportSchema,
  balanceHistorySchema,
  basketTrendSchema,
  categorySplitSchema,
  categoryTrendSchema,
  incomeVsSpendingSchema,
  overviewSchema,
  peerComparisonSchema,
  purchaseSizesSchema,
  safeToSpendSchema,
  savingIdeasSchema,
  spenderGroupSchema,
  spendingSummarySchema,
  whatIfQuerySchema,
  yearOverYearSchema,
} from '@coach/shared';
import { Card } from '../../components/Card.tsx';
import { categorySliceColour } from '../../lib/chart-colours.ts';
import { formatEur, formatMonth, formatShortDay } from '../../lib/format.ts';
import { SavingIdeasList } from '../actions/SavingIdeasList.tsx';
import { BalanceLine } from '../charts/BalanceLine.tsx';
import { BasketTrendBars } from '../charts/BasketTrendBars.tsx';
import { CategoryTrendBars } from '../charts/CategoryTrendBars.tsx';
import { IncomeSpendingBars } from '../charts/IncomeSpendingBars.tsx';
import { BasketBreakdown } from '../baskets/BasketBreakdown.tsx';
import { PeerCompare } from '../benchmark/PeerCompare.tsx';
import { MonthlyBars } from '../charts/MonthlyBars.tsx';
import { RowBars } from '../charts/RowBars.tsx';
import { SimplePie } from '../charts/SimplePie.tsx';
import { YearOverYearBars } from '../charts/YearOverYearBars.tsx';
import { ExcelExportCard } from '../export/ExcelExportCard.tsx';
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
    const { fromMonth, toMonth, months } = parsed.data;
    return (
      <Card title={`Income and spending · ${formatMonth(fromMonth)} to ${formatMonth(toMonth)}`}>
        <IncomeSpendingBars months={months} />
      </Card>
    );
  }

  if (props.toolName === 'getYearOverYear') {
    const parsed = yearOverYearSchema.safeParse(props.output);
    if (!parsed.success) return unreadable;
    return (
      <Card title={`${parsed.data.label} · this year and last year`}>
        <YearOverYearBars months={parsed.data.months} />
      </Card>
    );
  }

  if (props.toolName === 'getCategorySplit') {
    const parsed = categorySplitSchema.safeParse(props.output);
    if (!parsed.success) return unreadable;
    const { fromMonth, toMonth, slices } = parsed.data;
    const period =
      fromMonth === toMonth
        ? formatMonth(fromMonth)
        : `${formatMonth(fromMonth)} to ${formatMonth(toMonth)}`;
    return (
      <Card title={`Where your money went · ${period}`}>
        {slices.length === 0 ? (
          <p className="text-small text-muted">No spending in this period.</p>
        ) : (
          <SimplePie
            slices={slices.map((s, index) => ({
              label: s.label,
              valueEur: s.totalEur,
              sharePct: s.sharePct,
              ...categorySliceColour(index, s.categoryId),
            }))}
          />
        )}
      </Card>
    );
  }

  if (props.toolName === 'getBalanceHistory') {
    const parsed = balanceHistorySchema.safeParse(props.output);
    if (!parsed.success) return unreadable;
    const fromMonth = parsed.data.fromDate.slice(0, 7);
    const toMonth = parsed.data.toDate.slice(0, 7);
    const period =
      fromMonth === toMonth
        ? formatMonth(fromMonth)
        : `${formatMonth(fromMonth)} to ${formatMonth(toMonth)}`;
    return (
      <Card title={`Your balance · ${period}`}>
        <BalanceLine days={parsed.data.days} />
      </Card>
    );
  }

  if (props.toolName === 'getCategoryChanges') {
    const parsed = categoryChangesSchema.safeParse(props.output);
    if (!parsed.success) return unreadable;
    // The five biggest changes. The server sorts them, the card only picks the top.
    const rows = parsed.data.categories
      .slice(0, 5)
      .map((c) => ({ label: c.label, valueEur: c.changeEur }));
    return (
      <Card title={`${formatMonth(parsed.data.month)} against your usual month`}>
        <RowBars rows={rows} signed />
      </Card>
    );
  }

  if (props.toolName === 'getLargestPurchases') {
    const parsed = largestPurchasesSchema.safeParse(props.output);
    if (!parsed.success) return unreadable;
    const { fromMonth, toMonth, label, purchases } = parsed.data;
    const period =
      fromMonth === toMonth
        ? formatMonth(fromMonth)
        : `${formatMonth(fromMonth)} to ${formatMonth(toMonth)}`;
    const rows = purchases.map((p) => ({
      label: `${p.label}, ${formatShortDay(p.date)}`,
      valueEur: p.amountEur,
    }));
    return (
      <Card
        title={`Largest purchases · ${label === 'All spending' ? period : `${label}, ${period}`}`}
      >
        {rows.length > 0 ? (
          <RowBars rows={rows} />
        ) : (
          <p className="text-small text-muted">No purchases in this period.</p>
        )}
      </Card>
    );
  }

  if (props.toolName === 'getCategoryTrend') {
    const parsed = categoryTrendSchema.safeParse(props.output);
    if (!parsed.success) return unreadable;
    const { fromMonth, toMonth, series, months } = parsed.data;
    return (
      <Card title={`Spending by category · ${formatMonth(fromMonth)} to ${formatMonth(toMonth)}`}>
        {series.length > 0 ? (
          <CategoryTrendBars series={series} months={months} />
        ) : (
          <p className="text-small text-muted">No spending in this period.</p>
        )}
      </Card>
    );
  }

  if (props.toolName === 'getBasketTrend') {
    const parsed = basketTrendSchema.safeParse(props.output);
    if (!parsed.success) return unreadable;
    const { fromMonth, toMonth, months } = parsed.data;
    return (
      <Card title={`Spending by type · ${formatMonth(fromMonth)} to ${formatMonth(toMonth)}`}>
        <BasketTrendBars months={months} />
      </Card>
    );
  }

  if (props.toolName === 'getPurchaseSizes') {
    const parsed = purchaseSizesSchema.safeParse(props.output);
    if (!parsed.success) return unreadable;
    const rows = parsed.data.categories.map((c) => ({
      label: c.label,
      valueEur: c.typicalPurchaseEur,
    }));
    return (
      <Card title="Typical purchase · last 12 months">
        {rows.length > 0 ? (
          <RowBars rows={rows} />
        ) : (
          <p className="text-small text-muted">No purchases in this period.</p>
        )}
      </Card>
    );
  }

  if (props.toolName === 'getSavingIdeas') {
    const parsed = savingIdeasSchema.safeParse(props.output);
    if (!parsed.success) return unreadable;
    return (
      <Card title="Ways to free up money">
        {parsed.data.ideas.length > 0 ? (
          <SavingIdeasList ideas={parsed.data.ideas} />
        ) : (
          <p className="text-small text-muted">Nothing stands out to change.</p>
        )}
      </Card>
    );
  }

  if (props.toolName === 'exportToExcel') {
    const parsed = excelExportSchema.safeParse(props.output);
    return parsed.success ? <ExcelExportCard data={parsed.data} /> : unreadable;
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
    return parsed.success ? <WhatIfCard {...parsed.data} chartOnly /> : unreadable;
  }

  if (props.toolName === 'getSpendingSummary') {
    const parsed = spendingSummarySchema.safeParse(props.output);
    if (!parsed.success) return unreadable;
    const { label, fromMonth, toMonth, totalEur, monthly } = parsed.data;
    const period =
      fromMonth === toMonth
        ? formatMonth(fromMonth)
        : `${formatMonth(fromMonth)} to ${formatMonth(toMonth)}`;
    return (
      <Card title={`${label} · ${period}`}>
        <p className="text-amount font-semibold">{formatEur(totalEur)}</p>
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
