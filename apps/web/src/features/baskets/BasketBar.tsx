import { DATA_END_DATE } from '@coach/shared';
import { useOverview } from '../../api/useOverview.ts';
import { Card } from '../../components/Card.tsx';
import { formatMonth } from '../../lib/format.ts';
import { useUser } from '../../lib/user-context.ts';
import { BasketBreakdown } from './BasketBreakdown.tsx';

const LAST_MONTH = DATA_END_DATE.slice(0, 7);

/** Last month's breakdown, loaded for the current user. */
export function BasketBar() {
  const { userId } = useUser();
  const overview = useOverview(userId, LAST_MONTH);
  const title = `Where your money went · ${formatMonth(LAST_MONTH)}`;

  if (overview.isPending) {
    return (
      <Card title={title}>
        <p className="text-muted">Loading…</p>
      </Card>
    );
  }
  if (overview.isError) {
    return (
      <Card title={title}>
        <p className="text-negative">Could not load: {overview.error.message}</p>
      </Card>
    );
  }
  return <BasketBreakdown data={overview.data} />;
}
