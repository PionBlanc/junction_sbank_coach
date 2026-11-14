import type { SpendingSummary } from '@coach/shared';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { formatEur, formatShortMonth } from '../../lib/format.ts';

type MonthlyBarsProps = { monthly: SpendingSummary['monthly'] };

/** Spending per month as small bars. */
export function MonthlyBars(props: MonthlyBarsProps) {
  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={props.monthly} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="month"
            tickFormatter={formatShortMonth}
            axisLine={{ stroke: 'var(--color-line)' }}
            tickLine={false}
            fontSize={12}
            tick={{ fill: 'var(--color-muted)' }}
          />
          <YAxis
            width={64}
            tickFormatter={(value: number) => formatEur(value)}
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tick={{ fill: 'var(--color-muted)' }}
          />
          <Bar
            dataKey="totalEur"
            fill="var(--color-chart-focus)"
            radius={[2, 2, 0, 0]}
            maxBarSize={40}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
