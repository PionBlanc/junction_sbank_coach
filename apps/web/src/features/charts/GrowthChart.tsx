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
            fontSize={12}
          />
          <YAxis width={64} tickFormatter={(value: number) => formatEur(value)} fontSize={12} />
          <Line
            dataKey="savedEur"
            stroke="var(--color-muted)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            dataKey="investedEur"
            stroke="var(--color-brand)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
