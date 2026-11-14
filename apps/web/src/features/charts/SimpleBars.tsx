import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis } from 'recharts';
import { formatEur } from '../../lib/format.ts';

type SimpleBarsProps = { bars: { label: string; valueEur: number; highlight: boolean }[] };

/** A few bars with their values printed on top. The highlighted bar is the point of the card. */
export function SimpleBars(props: SimpleBarsProps) {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={props.bars} margin={{ top: 24, right: 4, bottom: 0, left: 4 }}>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval={0}
            fontSize={12}
            tick={{ fill: 'var(--color-muted)' }}
          />
          <Bar dataKey="valueEur" radius={[6, 6, 0, 0]} maxBarSize={72} isAnimationActive={false}>
            {props.bars.map((bar) => (
              <Cell
                key={bar.label}
                fill={bar.highlight ? 'var(--color-brand)' : 'var(--color-chart-rest)'}
              />
            ))}
            <LabelList
              dataKey="valueEur"
              position="top"
              fontSize={12}
              fill="var(--color-ink)"
              formatter={(value) => formatEur(Number(value))}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
