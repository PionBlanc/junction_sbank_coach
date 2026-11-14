import type { WhatIf } from '@coach/shared';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { formatEur } from '../../lib/format.ts';

type GrowthChartProps = { series: WhatIf['series'] };

/** Money put aside (straight line) next to the same money invested (curve). */
export function GrowthChart(props: GrowthChartProps) {
  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={props.series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="years"
            ticks={[1, 5, 10]}
            tickFormatter={(years: number) => `${years} yr`}
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
          <Line
            dataKey="savedEur"
            stroke="var(--color-chart-rest-2)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            dataKey="investedEur"
            stroke="var(--color-chart-focus)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
