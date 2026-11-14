import { Bar, BarChart, ResponsiveContainer, XAxis } from 'recharts';
import { formatShortMonth } from '../../lib/format.ts';

type IncomeSpendingBarsProps = {
  months: { month: string; incomeEur: number; spendingEur: number }[];
};

/** Income and spending side by side for each month. Too many bars for values, so a small key. */
export function IncomeSpendingBars(props: IncomeSpendingBarsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-chart-rest" />
          Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-brand" />
          Spending
        </span>
      </div>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={props.months}
            margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
            barGap={1}
            barCategoryGap="20%"
          >
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              interval={0}
              fontSize={10}
              tick={{ fill: 'var(--color-muted)' }}
              tickFormatter={(month: string) => formatShortMonth(month).slice(0, 1)}
            />
            <Bar
              dataKey="incomeEur"
              fill="var(--color-chart-rest)"
              radius={[3, 3, 0, 0]}
              isAnimationActive={false}
            />
            <Bar
              dataKey="spendingEur"
              fill="var(--color-brand)"
              radius={[3, 3, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
