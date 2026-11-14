import type { Investments } from '@coach/shared';
import { Bar, BarChart, ResponsiveContainer, XAxis } from 'recharts';
import { formatShortMonth } from '../../lib/format.ts';

type InvestmentBarsProps = { months: Investments['months']; showWithdrawals: boolean };

/** Money put into investments each month, and taken out when there was any, with a small key. */
export function InvestmentBars(props: InvestmentBarsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-4 text-caption text-muted">
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-sm bg-chart-focus" />
          Put in
        </span>
        {props.showWithdrawals && (
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-sm bg-chart-rest-2" />
            Taken out
          </span>
        )}
      </div>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={props.months}
            margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
            barGap={2}
            barCategoryGap="20%"
          >
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
              dataKey="depositedEur"
              fill="var(--color-chart-focus)"
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            />
            {props.showWithdrawals && (
              <Bar
                dataKey="withdrawnEur"
                fill="var(--color-chart-rest-2)"
                radius={[2, 2, 0, 0]}
                isAnimationActive={false}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
