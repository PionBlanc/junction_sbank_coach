import type { WhatIf } from '@coach/shared';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatEur, formatEurShort } from '../../lib/format.ts';

type GrowthChartProps = { series: WhatIf['series'] };

/** Point of the chart (invested) in dark, the comparison (saved) in grey. */
const INVESTED = 'var(--color-chart-focus)';
const SAVED = 'var(--color-chart-rest-1)';

function yearLabel(years: number): string {
  if (years === 0) return 'Now';
  return years === 1 ? '1 year' : `${years} years`;
}

/**
 * Money put aside (straight line) next to the same money invested (curve), with the
 * likely range of the invested line as a pale band. The end values sit above the
 * chart as a legend. Mobile first: a narrow y-axis with short ticks ("15k €").
 */
export function GrowthChart(props: GrowthChartProps) {
  const last = props.series.at(-1);
  if (!last) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-caption text-muted">After {yearLabel(last.years).toLowerCase()}</p>
      <div className="flex gap-6">
        <p className="flex flex-col">
          <span className="flex items-center gap-2 text-caption text-muted">
            <span className="h-0.5 w-3 rounded-sm" style={{ background: INVESTED }} />
            Invested
          </span>
          <span className="text-title font-semibold text-ink">~{formatEur(last.investedEur)}</span>
        </p>
        <p className="flex flex-col">
          <span className="flex items-center gap-2 text-caption text-muted">
            <span className="h-0.5 w-3 rounded-sm" style={{ background: SAVED }} />
            Saved
          </span>
          <span className="text-title font-semibold text-ink">{formatEur(last.savedEur)}</span>
        </p>
      </div>

      <div
        className="h-48"
        role="img"
        aria-label={`After ${last.years} years: about ${formatEur(last.investedEur)} invested, ${formatEur(last.savedEur)} saved.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={props.series} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-line)" />
            <YAxis
              width={44}
              tickCount={4}
              tickFormatter={formatEurShort}
              axisLine={false}
              tickLine={false}
              fontSize={12}
              tick={{ fill: 'var(--color-muted)' }}
            />
            <XAxis
              dataKey="years"
              type="number"
              domain={[0, last.years]}
              ticks={[0, 5, last.years]}
              tickFormatter={yearLabel}
              axisLine={{ stroke: 'var(--color-line)' }}
              tickLine={false}
              fontSize={12}
              tick={{ fill: 'var(--color-muted)' }}
            />
            <Tooltip
              cursor={{ stroke: 'var(--color-line)' }}
              labelFormatter={(years) => yearLabel(Number(years))}
              formatter={(value, name) => [formatEur(Number(value)), name]}
              contentStyle={{
                borderRadius: 8,
                borderColor: 'var(--color-line)',
                fontSize: 12,
                color: 'var(--color-ink)',
              }}
            />
            <Area
              dataKey={(point: GrowthChartProps['series'][number]) => [
                point.investedLowEur,
                point.investedHighEur,
              ]}
              fill={INVESTED}
              fillOpacity={0.15}
              stroke="none"
              tooltipType="none"
              activeDot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="savedEur"
              name="Saved"
              stroke={SAVED}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <Line
              dataKey="investedEur"
              name="Invested"
              stroke={INVESTED}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="flex items-center gap-2 text-caption text-muted">
        <span className="size-3 rounded-sm" style={{ background: INVESTED, opacity: 0.15 }} />
        Shaded: where invested money could likely end up
      </p>
    </div>
  );
}
