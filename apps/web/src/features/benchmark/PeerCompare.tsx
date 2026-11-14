import { formatEur } from '../../lib/format.ts';

type PeerCompareProps = { youMonthlyAvgEur: number; peerMedianMonthlyEur: number };

/** Two numbers side by side. The user draws the conclusion: no red, no badges. */
export function PeerCompare(props: PeerCompareProps) {
  const max = Math.max(props.youMonthlyAvgEur, props.peerMedianMonthlyEur, 1);
  const rows = [
    { label: 'You, 12-month average', valueEur: props.youMonthlyAvgEur, bar: 'bg-chart-focus' },
    { label: 'People your age', valueEur: props.peerMedianMonthlyEur, bar: 'bg-chart-rest-2' },
  ];
  return (
    <div className="flex flex-col gap-1 text-caption text-muted">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[9rem_1fr_auto] items-center gap-2">
          <span>{row.label}</span>
          <span className="h-2 rounded-sm bg-fill">
            <span
              className={`block h-2 rounded-sm ${row.bar}`}
              style={{ width: `${(row.valueEur / max) * 100}%` }}
            />
          </span>
          <span>{formatEur(row.valueEur)}/month</span>
        </div>
      ))}
    </div>
  );
}
