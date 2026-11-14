import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { formatEur, formatPct } from '../../lib/format.ts';

type SimpleDonutProps = { slices: { label: string; valueEur: number; sharePct: number }[] };

/** The first slice in the brand colour, the rest in fading greys. */
const REST_OPACITY = [1, 0.7, 0.45, 0.25];

function sliceStyle(index: number): { fill: string; opacity: number } {
  if (index === 0) return { fill: 'var(--color-brand)', opacity: 1 };
  return { fill: 'var(--color-chart-rest)', opacity: REST_OPACITY[index - 1] ?? 0.2 };
}

/** A donut with the biggest share in the middle and each slice's euros a month under it. */
export function SimpleDonut(props: SimpleDonutProps) {
  const top = props.slices[0];
  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={props.slices}
              dataKey="valueEur"
              nameKey="label"
              innerRadius="62%"
              outerRadius="95%"
              startAngle={90}
              endAngle={-270}
              stroke="var(--color-card)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {props.slices.map((slice, index) => {
                const style = sliceStyle(index);
                return <Cell key={slice.label} fill={style.fill} fillOpacity={style.opacity} />;
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {top && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold">{formatPct(top.sharePct)}</span>
            <span className="text-xs text-muted">{top.label}</span>
          </div>
        )}
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted">
        {props.slices.map((slice, index) => {
          const style = sliceStyle(index);
          return (
            <li key={slice.label} className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: style.fill, opacity: style.opacity }}
              />
              <span className="truncate">{slice.label}</span>
              <span className="ml-auto">{formatEur(slice.valueEur)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
