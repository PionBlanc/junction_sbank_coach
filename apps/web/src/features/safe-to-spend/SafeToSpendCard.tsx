import type { SafeToSpend } from '@coach/shared';
import { Card } from '../../components/Card.tsx';
import { formatDay, formatEur } from '../../lib/format.ts';

type SafeToSpendCardProps = { data: SafeToSpend };

/** The hero number with its working. Used on the home screen and as a chat card. */
export function SafeToSpendCard(props: SafeToSpendCardProps) {
  const { data } = props;
  return (
    <Card title="Safe to spend this week">
      <p className="text-5xl font-semibold text-brand">{formatEur(data.safeThisWeekEur)}</p>
      <p className="text-sm text-muted">
        {formatEur(data.perDayEur)} a day · payday in {data.daysToPayday} days (
        {formatDay(data.nextPaydayDate)})
      </p>
      {data.availableEur < 0 && (
        <p className="text-sm">
          The bills due before payday are {formatEur(-data.availableEur)} more than your balance.
          Keeping spending close to zero until payday keeps the gap small.
        </p>
      )}
      <details className="text-sm">
        <summary className="flex min-h-11 cursor-pointer items-center text-brand">
          How is this calculated?
        </summary>
        <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
          <dt>Balance now</dt>
          <dd className="text-right">{formatEur(data.balanceEur)}</dd>
          <dt>Housing payment before payday</dt>
          <dd className="text-right">−{formatEur(data.upcomingHousingEur)}</dd>
          <dt>Utility bills before payday (3-month average)</dt>
          <dd className="text-right">−{formatEur(data.upcomingUtilitiesEur)}</dd>
          <dt className="font-semibold">Left until payday</dt>
          <dd className="text-right font-semibold">{formatEur(data.availableEur)}</dd>
        </dl>
        <p className="mt-2 text-muted">
          Spread evenly over the {data.daysToPayday} days to payday. Food and everything else comes
          out of this.
        </p>
      </details>
    </Card>
  );
}
