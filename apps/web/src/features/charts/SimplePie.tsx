import { Cell, Pie, PieChart, ResponsiveContainer, type PieLabelRenderProps } from 'recharts';
import { formatEur, formatPct } from '../../lib/format.ts';
import type { SliceColour } from '../../lib/chart-colours.ts';

type SimplePieSlice = SliceColour & { label: string; valueEur: number; sharePct: number };

type SimplePieProps = {
  slices: SimplePieSlice[];
  /** Makes the slices and key rows tappable, for example to open what is inside a slice. */
  onSelect?: (index: number) => void;
  selectedIndex?: number | null;
};

/** Slices narrower than this have no room for their percentage. */
const PCT_MIN_PCT = 0.04;

/** A full pie with each slice's share written on it, and a key with names and euros below. */
export function SimplePie(props: SimplePieProps) {
  function renderLabel(label: PieLabelRenderProps) {
    const slice = props.slices[label.index];
    if (!slice || slice.sharePct < PCT_MIN_PCT) return null;
    // Place the text at 60% of the radius, in the middle of the slice's angle.
    const angle = (-(label.midAngle ?? 0) * Math.PI) / 180;
    const radius = label.outerRadius * 0.6;
    const x = label.cx + radius * Math.cos(angle);
    const y = label.cy + radius * Math.sin(angle);
    return (
      <text
        x={x}
        y={y}
        fill={slice.textFill}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {formatPct(slice.sharePct)}
      </text>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="mx-auto aspect-square w-full max-w-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={props.slices}
              dataKey="valueEur"
              nameKey="label"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              stroke="var(--color-card)"
              strokeWidth={2}
              label={renderLabel}
              labelLine={false}
              isAnimationActive={false}
              className={props.onSelect ? 'cursor-pointer' : undefined}
              onClick={(_, index) => props.onSelect?.(index)}
            >
              {props.slices.map((slice) => (
                <Cell key={slice.label} fill={slice.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex flex-col divide-y divide-line text-small">
        {props.slices.map((slice, index) => {
          const row = (
            <>
              <span className="size-3 shrink-0 rounded-sm" style={{ background: slice.fill }} />
              <span className="truncate text-muted">{slice.label}</span>
              <span className="ml-auto font-semibold">{formatEur(slice.valueEur)}</span>
            </>
          );
          return (
            <li key={slice.label}>
              {props.onSelect ? (
                <button
                  type="button"
                  className={`flex min-h-11 w-full items-center gap-2 rounded-md px-2 text-left ${
                    index === props.selectedIndex ? 'bg-fill' : ''
                  }`}
                  onClick={() => props.onSelect?.(index)}
                >
                  {row}
                </button>
              ) : (
                <div className="flex items-center gap-2 py-1">{row}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
