import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { formatEurShort, formatShortMonth } from '../../lib/format.ts';

type YearOverYearBarsProps = {
  months: { month: string; thisYearEur: number; lastYearEur: number }[];
};

/** Each month of this year next to the same month last year, with a small key instead of values. */
export function YearOverYearBars(props: YearOverYearBarsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-4 text-caption text-muted">
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-sm bg-chart-rest-2" />
          Last year
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-sm bg-chart-focus" />
          This year
        </span>
      </div>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={props.months}
            margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
            barGap={2}
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
            <Bar
              dataKey="lastYearEur"
              fill="var(--color-chart-rest-2)"
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            />
            <Bar
              dataKey="thisYearEur"
              fill="var(--color-chart-focus)"
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
