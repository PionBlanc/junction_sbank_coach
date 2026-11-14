import { BASKET_LABELS, type BasketTrend } from '@coach/shared';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { BASKET_SLICE_COLOURS } from '../../lib/chart-colours.ts';
import { formatEurShort, formatShortMonth } from '../../lib/format.ts';

type BasketTrendBarsProps = { months: BasketTrend['months'] };

const STACK = [
  { dataKey: 'mandatoryRegularEur', basketId: 'mandatory_regular' },
  { dataKey: 'mandatoryIrregularEur', basketId: 'mandatory_irregular' },
  { dataKey: 'everydayEur', basketId: 'everyday' },
] as const;

/** The three baskets stacked for each month, with a small key instead of values. */
export function BasketTrendBars(props: BasketTrendBarsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-caption text-muted">
        {STACK.map((s) => (
          <span key={s.basketId} className="flex items-center gap-2">
            <span
              className="size-2 rounded-sm"
              style={{ background: BASKET_SLICE_COLOURS[s.basketId].fill }}
            />
            {BASKET_LABELS[s.basketId]}
          </span>
        ))}
      </div>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={props.months}
            margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
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
            {STACK.map((s, index) => (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                stackId="baskets"
                fill={BASKET_SLICE_COLOURS[s.basketId].fill}
                radius={index === STACK.length - 1 ? [2, 2, 0, 0] : 0}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
