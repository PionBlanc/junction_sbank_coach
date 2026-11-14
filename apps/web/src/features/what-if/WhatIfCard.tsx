import { CATEGORIES, type CategoryId } from '@coach/shared';
import { useState } from 'react';
import { useWhatIf } from '../../api/useWhatIf.ts';
import { Card } from '../../components/Card.tsx';
import { formatEur, formatNumber, formatPct } from '../../lib/format.ts';
import { useUser } from '../../lib/user-context.ts';
import { GrowthChart } from '../charts/GrowthChart.tsx';

const CUT_OPTIONS = [0.1, 0.2, 0.3];

type WhatIfCardProps = {
  /** A category to spend less on. Without it, `monthlyEur` is a plain amount set aside. */
  categoryId?: CategoryId;
  cutPct?: number;
  monthlyEur?: number;
};

/** The one what-if card: used in chat, on the action list, and on categories. */
export function WhatIfCard(props: WhatIfCardProps) {
  const { userId } = useUser();
  const [cutPct, setCutPct] = useState(props.cutPct ?? 0.2);
  const whatIf = useWhatIf(
    userId,
    props.categoryId ? { categoryId: props.categoryId, cutPct } : { monthlyEur: props.monthlyEur },
  );

  if (whatIf.isPending) {
    return (
      <Card title="What if">
        <p className="text-muted">Loading…</p>
      </Card>
    );
  }
  if (whatIf.isError) {
    return (
      <Card title="What if">
        <p className="text-negative">Could not load: {whatIf.error.message}</p>
      </Card>
    );
  }

  const data = whatIf.data;
  const tenYears = data.series.at(-1);
  const title = props.categoryId
    ? `What if: ${formatPct(cutPct)} less on ${CATEGORIES[props.categoryId].label.toLowerCase()}`
    : `What if: ${formatEur(data.monthlyEur)} a month set aside`;

  return (
    <Card title={title}>
      {props.categoryId && (
        <div className="flex gap-2">
          {CUT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`h-11 flex-1 rounded-lg text-sm ${
                option === cutPct ? 'bg-brand text-card' : 'bg-surface'
              }`}
              onClick={() => setCutPct(option)}
            >
              −{formatPct(option)}
            </button>
          ))}
        </div>
      )}
      <p>
        Frees up <span className="text-2xl font-semibold">{formatEur(data.monthlyEur)}</span> a
        month
        {data.baseMonthlyEur !== null && (
          <span className="text-sm text-muted">
            {' '}
            (you spend {formatEur(data.baseMonthlyEur)} a month, 12-month average)
          </span>
        )}
      </p>
      <GrowthChart series={data.series} />
      <p className="text-xs text-muted">
        <span className="text-brand">■</span> invested · ■ saved
      </p>
      <p className="text-sm">
        In 5 years: <span className="font-semibold">{formatEur(data.fiveYearSavedEur)}</span> saved
        {data.fiveYearHousingMonths !== null && (
          <>. That is {formatNumber(data.fiveYearHousingMonths)} months of your housing cost</>
        )}
        .
      </p>
      {tenYears && (
        <p className="text-xs text-muted">
          Invested for 10 years it could be about {formatEur(tenYears.investedEur)} (between{' '}
          {formatEur(tenYears.investedLowEur)} and {formatEur(tenYears.investedHighEur)}). This
          assumes a return of {formatPct(data.returnPct)} a year (range{' '}
          {formatPct(data.returnLowPct)} to {formatPct(data.returnHighPct)}). An example, not a
          promise.
        </p>
      )}
    </Card>
  );
}
