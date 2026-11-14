import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis } from 'recharts';
import { formatEur } from '../../lib/format.ts';

type SimpleBarsProps = { bars: { label: string; valueEur: number; highlight: boolean }[] };

/** A few bars with their values printed on top. The highlighted bar is the point of the card. */
export function SimpleBars(props: SimpleBarsProps) {
  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={props.bars} margin={{ top: 24, right: 4, bottom: 0, left: 4 }}>
          <XAxis
            dataKey="label"
            axisLine={{ stroke: 'var(--color-line)' }}
            tickLine={false}
            interval={0}
            fontSize={12}
            tick={{ fill: 'var(--color-muted)' }}
          />
          <Bar dataKey="valueEur" radius={[2, 2, 0, 0]} maxBarSize={40} isAnimationActive={false}>
            {props.bars.map((bar) => (
              <Cell
                key={bar.label}
                fill={bar.highlight ? 'var(--color-chart-focus)' : 'var(--color-chart-rest-2)'}
              />
            ))}
            <LabelList
              dataKey="valueEur"
              position="top"
              fontSize={14}
              fontWeight={600}
              fill="var(--color-ink)"
              formatter={(value) => formatEur(Number(value))}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
