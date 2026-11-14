import type { SpenderGroup } from '@coach/shared';
import type { ReactNode } from 'react';
import { Card } from '../../components/Card.tsx';
import { formatNumber, formatPct } from '../../lib/format.ts';
import { SpenderGroupIcon } from './SpenderGroupIcon.tsx';

type SpenderGroupCardProps = { group: SpenderGroup; children?: ReactNode };

/** The customer's spender group, what it means, and how many customers share it. */
export function SpenderGroupCard(props: SpenderGroupCardProps) {
  const { group } = props;
  return (
    <Card title="What kind of spender you are">
      <div className="flex items-center gap-4">
        <SpenderGroupIcon groupId={group.groupId} size="lg" />
        <div className="flex flex-col gap-1">
          <p className="text-title font-semibold">{group.label}</p>
          <p className="text-small text-muted">{group.meaning}</p>
        </div>
      </div>
      <p className="text-small">
        {formatNumber(group.customersInGroup)} of {formatNumber(group.totalCustomers)} customers are
        in this group ({formatPct(group.sharePct)}).
      </p>
      {props.children}
    </Card>
  );
}
