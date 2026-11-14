import { CATEGORIES, type SpenderGroup } from '@coach/shared';
import { formatEur, formatPct } from '../../lib/format.ts';

type SpenderGroupTextProps = { group: SpenderGroup };

/** "You are a Front-row regular spender", what that means for them, and how common it is. */
export function SpenderGroupText(props: SpenderGroupTextProps) {
  const { group } = props;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-body">
        You are a <strong>{group.label}</strong> spender.
      </p>
      <p className="text-small">{group.meaning}</p>
      {group.categoryId &&
        group.youMonthlyAvgEur !== null &&
        group.peerMedianMonthlyEur !== null && (
          <p className="text-small">
            On {CATEGORIES[group.categoryId].label.toLowerCase()} you spend{' '}
            {formatEur(group.youMonthlyAvgEur)} a month on average, while people your age typically
            spend {formatEur(group.peerMedianMonthlyEur)}.
          </p>
        )}
      <p className="text-small text-muted">
        {formatPct(group.sharePct)} of people fall into this group.
      </p>
    </div>
  );
}
