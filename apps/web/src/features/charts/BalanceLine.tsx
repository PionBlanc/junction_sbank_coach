import type { BalanceHistory } from '@coach/shared';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatDay, formatEur, formatEurShort, formatShortMonth } from '../../lib/format.ts';

type BalanceLineProps = { days: BalanceHistory['days'] };

/** More month ticks than this do not fit a phone; then every third month is labelled. */
const MAX_MONTH_TICKS = 6;

/** The balance at the end of every day, with a faint line at zero. Mobile first, like GrowthChart. */
export function BalanceLine(props: BalanceLineProps) {
  const monthStarts = props.days.map((d) => d.date).filter((date) => date.endsWith('-01'));
  const ticks =
    monthStarts.length > MAX_MONTH_TICKS
      ? monthStarts.filter((_, index) => index % 3 === 0)
      : monthStarts;

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={props.days} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
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
            dataKey="date"
            ticks={ticks}
            tickFormatter={(date: string) => formatShortMonth(date.slice(0, 7))}
            axisLine={{ stroke: 'var(--color-line)' }}
            tickLine={false}
            fontSize={12}
            tick={{ fill: 'var(--color-muted)' }}
          />
          <ReferenceLine y={0} stroke="var(--color-subtle)" strokeDasharray="4 4" />
          <Tooltip
            cursor={{ stroke: 'var(--color-line)' }}
            labelFormatter={(date) => formatDay(String(date))}
            formatter={(value) => [formatEur(Number(value)), 'Balance']}
            contentStyle={{
              borderRadius: 8,
              borderColor: 'var(--color-line)',
              fontSize: 12,
              color: 'var(--color-ink)',
            }}
          />
          <Line
            dataKey="balanceEur"
            stroke="var(--color-chart-focus)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
