import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { formatEur, formatPct } from '../../lib/format.ts';

type SimpleDonutProps = { slices: { label: string; valueEur: number; sharePct: number }[] };

/** The first slice in the dark focus colour, the rest in lighter and lighter greys. */
const SLICE_FILLS = [
  'var(--color-chart-focus)',
  'var(--color-chart-rest-1)',
  'var(--color-chart-rest-2)',
  'var(--color-chart-rest-3)',
  'var(--color-chart-rest-4)',
];

function sliceFill(index: number): string {
  return SLICE_FILLS[index] ?? 'var(--color-chart-rest-4)';
}

/** A donut with the biggest share in the middle and each slice's euros a month next to it. */
export function SimpleDonut(props: SimpleDonutProps) {
  const top = props.slices[0];
  return (
    <div className="flex items-center gap-4">
      <div className="relative size-24 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={props.slices}
              dataKey="valueEur"
              nameKey="label"
              innerRadius="68%"
              outerRadius="95%"
              startAngle={90}
              endAngle={-270}
              stroke="var(--color-card)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {props.slices.map((slice, index) => (
                <Cell key={slice.label} fill={sliceFill(index)} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {top && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="text-title font-semibold">{formatPct(top.sharePct)}</span>
          </div>
        )}
      </div>
      <ul className="flex min-w-0 flex-1 flex-col divide-y divide-line text-small">
        {props.slices.map((slice, index) => (
          <li key={slice.label} className="flex items-center gap-2 py-1">
            <span className="size-2 shrink-0 rounded-sm" style={{ background: sliceFill(index) }} />
            <span className="truncate text-muted">{slice.label}</span>
            <span className="ml-auto">{formatEur(slice.valueEur)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
