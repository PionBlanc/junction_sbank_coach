import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { formatEur } from '../../lib/format.ts';

type RowBarsProps = {
  rows: { label: string; valueEur: number }[];
  /** Values can be negative: a + sign on rises and a line at zero. */
  signed?: boolean;
};

const ROW_HEIGHT = 36;
const LABEL_WIDTH = 176;

/** One horizontal bar per row, with its name and amount on the left. No other text. */
export function RowBars(props: RowBarsProps) {
  function valueText(valueEur: number): string {
    return props.signed && valueEur > 0 ? `+${formatEur(valueEur)}` : formatEur(valueEur);
  }

  function renderTick(tick: { x?: number | string; y?: number | string; index?: number }) {
    const row = props.rows[tick.index ?? -1];
    if (!row) return <g />;
    return (
      <text
        x={Number(tick.x ?? 0)}
        y={Number(tick.y ?? 0)}
        textAnchor="end"
        dominantBaseline="central"
        fontSize={12}
      >
        <tspan fill="var(--color-muted)">{row.label} </tspan>
        <tspan fill="var(--color-ink)" fontWeight={600}>
          {valueText(row.valueEur)}
        </tspan>
      </text>
    );
  }

  return (
    <div style={{ height: props.rows.length * ROW_HEIGHT }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={props.rows}
          layout="vertical"
          margin={{ top: 0, right: 4, bottom: 0, left: 0 }}
          barCategoryGap={8}
        >
          <XAxis
            type="number"
            hide
            domain={[(min: number) => Math.min(0, min), (max: number) => Math.max(0, max)]}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={LABEL_WIDTH}
            axisLine={false}
            tickLine={false}
            interval={0}
            tick={renderTick}
          />
          {props.signed && <ReferenceLine x={0} stroke="var(--color-line)" />}
          <Bar dataKey="valueEur" radius={2} maxBarSize={18} isAnimationActive={false}>
            {props.rows.map((row, index) => (
              <Cell
                key={index}
                fill={
                  props.signed && row.valueEur < 0
                    ? 'var(--color-chart-rest-1)'
                    : 'var(--color-chart-focus)'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
