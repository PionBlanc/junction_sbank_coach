import { useSafeToSpend } from '../../api/useSafeToSpend.ts';
import { Card } from '../../components/Card.tsx';
import { useUser } from '../../lib/user-context.ts';
import { SafeToSpendCard } from './SafeToSpendCard.tsx';

export function SafeToSpendHero() {
  const { userId } = useUser();
  const safeToSpend = useSafeToSpend(userId);

  if (safeToSpend.isPending) {
    return (
      <Card title="Safe to spend this week">
        <p className="text-muted">Loading…</p>
      </Card>
    );
  }
  if (safeToSpend.isError) {
    return (
      <Card title="Safe to spend this week">
        <p className="text-negative">Could not load: {safeToSpend.error.message}</p>
      </Card>
    );
  }
  return <SafeToSpendCard data={safeToSpend.data} />;
}
