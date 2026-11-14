import type { DownPayment } from '@coach/shared';
import { Card } from '../../components/Card.tsx';
import { formatEur } from '../../lib/format.ts';
import { RowBars } from '../charts/RowBars.tsx';

type DownPaymentCardProps = { data: DownPayment };

/** The typical down payment for the home next to the customer's balance today. */
export function DownPaymentCard(props: DownPaymentCardProps) {
  return (
    <Card title={`Down payment · ${formatEur(props.data.propertyPriceEur)} home`}>
      <RowBars
        rows={[
          { label: 'Typical down payment', valueEur: props.data.equityNeededEur },
          { label: 'Your balance', valueEur: props.data.balanceEur },
        ]}
      />
    </Card>
  );
}
