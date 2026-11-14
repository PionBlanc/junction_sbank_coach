import type { SpenderGroupId } from '@coach/shared';

/** Line and solid shapes on a 24 × 24 grid, drawn in white on the brand colour. */
const ICONS: Record<SpenderGroupId, { stroke: string[]; fill: string[] }> = {
  foodie: {
    stroke: ['M7.5 4v5.5a2 2 0 0 0 4 0V4', 'M9.5 4v16', 'M16.5 20V4c-1.8 1.2-2.5 3.8-2.5 7.5h2.5'],
    fill: [],
  },
  door_to_door: {
    stroke: [
      'M5.5 16.5H3.5v-3.7l2.3-.9 2.4-4.4h7.6l2.4 4.4 2.3.9v3.7h-2',
      'M9.5 16.5h5',
      'M5.5 11.9h13',
      'M5.5 16.5a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
      'M14.5 16.5a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
    ],
    fill: [],
  },
  treat_collector: { stroke: ['M5.5 8.5h13l-1 11h-11Z', 'M9 8.5V7a3 3 0 0 1 6 0v1.5'], fill: [] },
  front_row: {
    stroke: [],
    fill: ['M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8Z'],
  },
  window_seat: {
    stroke: [],
    fill: [
      'M12 2.8c.9 0 1.6.7 1.6 1.6v5.4l7.2 4.3v2.2l-7.2-2.3v4l2 1.6V21L12 20l-3.6 1v-1.4l2-1.6v-4l-7.2 2.3v-2.2l7.2-4.3V4.4c0-.9.7-1.6 1.6-1.6Z',
    ],
  },
  balanced: {
    stroke: [
      'M12 4.5v15',
      'M8.5 19.5h7',
      'M5.5 7.5h13',
      'M5.5 7.5 3 13',
      'M5.5 7.5 8 13',
      'M18.5 7.5 16 13',
      'M18.5 7.5 21 13',
    ],
    fill: ['M2.8 13h5.4a2.7 2.7 0 0 1-5.4 0Z', 'M15.8 13h5.4a2.7 2.7 0 0 1-5.4 0Z'],
  },
};

type SpenderGroupIconProps = { groupId: SpenderGroupId; size?: 'sm' | 'md' | 'lg' };

/** The badge of a spender group. */
export function SpenderGroupIcon(props: SpenderGroupIconProps) {
  const icon = ICONS[props.groupId];
  const size = props.size === 'lg' ? 'size-16' : props.size === 'sm' ? 'size-9' : 'size-11';
  return (
    <span aria-hidden className={`flex shrink-0 rounded-lg bg-brand ${size}`}>
      <svg viewBox="0 0 24 24" className="size-full">
        {icon.stroke.map((d) => (
          <path
            key={d}
            d={d}
            className="fill-none stroke-card"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {icon.fill.map((d) => (
          <path key={d} d={d} className="fill-card" />
        ))}
      </svg>
    </span>
  );
}
