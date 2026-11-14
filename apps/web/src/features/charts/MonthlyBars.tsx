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
          <XAxis dataKey="month" tickFormatter={formatShortMonth} fontSize={12} />
          <YAxis width={64} tickFormatter={(value: number) => formatEur(value)} fontSize={12} />
          <Bar dataKey="totalEur" fill="var(--color-brand)" isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
