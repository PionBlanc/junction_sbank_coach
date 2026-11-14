import type { GoalPlan } from '@coach/shared';
import { Line, LineChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { formatEurShort, formatShortMonth } from '../../lib/format.ts';

type GoalChartProps = {
  goalEur: number;
  path: GoalPlan['path'];
  showPace: boolean;
  showIdeas: boolean;
};

/** With the ideas in dark (the point of the chart), the customer's own pace in grey. */
const WITH_IDEAS = 'var(--color-chart-focus)';
const AT_PACE = 'var(--color-chart-rest-1)';

/** Saved so far, month by month, climbing to a dashed goal line. Only the goal is labelled. */
export function GoalChart(props: GoalChartProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-4 text-caption text-muted">
        {props.showIdeas && (
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-3 rounded-sm" style={{ background: WITH_IDEAS }} />
            With saving ideas
          </span>
        )}
        {props.showPace && (
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-3 rounded-sm" style={{ background: AT_PACE }} />
            At your pace
          </span>
        )}
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={props.path} margin={{ top: 16, right: 8, bottom: 0, left: 8 }}>
            <XAxis
              dataKey="month"
              axisLine={{ stroke: 'var(--color-line)' }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={24}
              fontSize={12}
              tick={{ fill: 'var(--color-muted)' }}
              tickFormatter={(month: string) => formatShortMonth(month)}
            />
            <YAxis hide domain={[0, props.goalEur]} />
            <ReferenceLine
              y={props.goalEur}
              stroke="var(--color-muted)"
              strokeDasharray="4 4"
              label={{
                value: formatEurShort(props.goalEur),
                position: 'insideTopLeft',
                fill: 'var(--color-muted)',
                fontSize: 12,
                dy: -16,
              }}
            />
            {props.showPace && (
              <Line
                dataKey="atPaceEur"
                stroke={AT_PACE}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}
            {props.showIdeas && (
              <Line
                dataKey="withIdeasEur"
                stroke={WITH_IDEAS}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
