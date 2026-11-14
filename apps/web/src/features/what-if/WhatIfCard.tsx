import { CATEGORIES, type CategoryId } from '@coach/shared';
import { useState } from 'react';
import { useWhatIf } from '../../api/useWhatIf.ts';
import { Card } from '../../components/Card.tsx';
import { LoadError } from '../../components/LoadError.tsx';
import { formatEur, formatNumber, formatPct } from '../../lib/format.ts';
import { useUser } from '../../lib/user-context.ts';
import { GrowthChart } from '../charts/GrowthChart.tsx';

const CUT_OPTIONS = [0.1, 0.2, 0.3];

type WhatIfCardProps = {
  /** A category to spend less on. Without it, `monthlyEur` is a plain amount set aside. */
  categoryId?: CategoryId;
  cutPct?: number;
  monthlyEur?: number;
  /** Chart only, no explaining text: in chat the coach does the explaining. */
  chartOnly?: boolean;
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
        <div className="h-40 animate-pulse rounded-sm bg-fill" aria-busy aria-label="Loading" />
      </Card>
    );
  }
  if (whatIf.isError) {
    return (
      <Card title="What if">
        <LoadError message={whatIf.error.message} onRetry={() => void whatIf.refetch()} />
      </Card>
    );
  }

  const data = whatIf.data;
  const title = props.categoryId
    ? `What if: ${formatPct(cutPct)} less on ${CATEGORIES[props.categoryId].label.toLowerCase()}`
    : `${formatEur(data.monthlyEur)} a month: saved vs. invested`;

  return (
    <Card title={title}>
      {props.categoryId && (
        <div className="flex gap-2">
          {CUT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`h-11 flex-1 rounded-md border text-small ${
                option === cutPct ? 'border-ink bg-fill font-semibold' : 'border-line'
              }`}
              onClick={() => setCutPct(option)}
            >
              −{formatPct(option)}
            </button>
          ))}
        </div>
      )}
      {/* Without a category, the title already names the amount. */}
      {props.categoryId && !props.chartOnly && (
        <p>
          Frees up <span className="text-title font-semibold">{formatEur(data.monthlyEur)}</span> a
          month
          {data.baseMonthlyEur !== null && (
            <span className="text-small text-muted">
              {' '}
              (you spend {formatEur(data.baseMonthlyEur)} a month, 12-month average)
            </span>
          )}
        </p>
      )}
      {!props.chartOnly && (
        <p className="text-small">
          Money you save grows only by what you add. Invested money also earns returns, and those
          returns earn more over time.
        </p>
      )}
      <GrowthChart series={data.series} chartOnly={props.chartOnly} />
      {!props.chartOnly && (
        <p className="text-small">
          In 5 years: <span className="font-semibold">{formatEur(data.fiveYearSavedEur)}</span>{' '}
          saved
          {data.fiveYearHousingMonths !== null && (
            <>. That is {formatNumber(data.fiveYearHousingMonths)} months of your housing cost</>
          )}
          .
        </p>
      )}
      {!props.chartOnly && (
        <p className="text-caption text-muted">
          Invested assumes a return of {formatPct(data.returnPct)} a year. The shaded band is{' '}
          {formatPct(data.returnLowPct)} to {formatPct(data.returnHighPct)}. An example, not a
          promise.
        </p>
      )}
    </Card>
  );
}
