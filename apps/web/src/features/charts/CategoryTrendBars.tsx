import type { CategoryTrend } from '@coach/shared';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { categorySliceColour } from '../../lib/chart-colours.ts';
import { formatEurShort, formatShortMonth } from '../../lib/format.ts';

type CategoryTrendBarsProps = { series: CategoryTrend['series']; months: CategoryTrend['months'] };

/** One stacked bar per month, one colour per category, with a small key instead of values. */
export function CategoryTrendBars(props: CategoryTrendBarsProps) {
  const colours = props.series.map((s, index) => categorySliceColour(index, s.categoryId).fill);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-caption text-muted">
        {props.series.map((s, index) => (
          <span key={s.label} className="flex items-center gap-2">
            <span className="size-2 rounded-sm" style={{ background: colours[index] }} />
            {s.label}
          </span>
        ))}
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={props.months}
            margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
            barCategoryGap="20%"
          >
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
              dataKey="month"
              axisLine={{ stroke: 'var(--color-line)' }}
              tickLine={false}
              interval={0}
              fontSize={12}
              tick={{ fill: 'var(--color-muted)' }}
              tickFormatter={(month: string) => formatShortMonth(month)}
            />
            {props.series.map((s, index) => (
              <Bar
                key={s.label}
                dataKey={(m: CategoryTrend['months'][number]) => m.valuesEur[index] ?? 0}
                stackId="categories"
                fill={colours[index]}
                stroke="var(--color-card)"
                strokeWidth={1}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
