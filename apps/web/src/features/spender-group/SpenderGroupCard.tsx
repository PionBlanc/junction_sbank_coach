import type { SpenderGroup } from '@coach/shared';
import { Card } from '../../components/Card.tsx';
import { SpenderGroupIcon } from './SpenderGroupIcon.tsx';
import { SpenderGroupText } from './SpenderGroupText.tsx';

type SpenderGroupCardProps = { group: SpenderGroup };

/** The customer's spender group as a chat card. */
export function SpenderGroupCard(props: SpenderGroupCardProps) {
  return (
    <Card title="What kind of spender you are">
      <div className="flex items-start gap-4">
        <SpenderGroupIcon groupId={props.group.groupId} size="lg" />
        <SpenderGroupText group={props.group} />
      </div>
    </Card>
  );
}
