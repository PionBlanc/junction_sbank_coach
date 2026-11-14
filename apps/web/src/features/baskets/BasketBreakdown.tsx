import { BASKET_LABELS, type Overview, type SpendingBasketId } from '@coach/shared';
import { useState } from 'react';
import { Card } from '../../components/Card.tsx';
import { formatEur, formatMonth } from '../../lib/format.ts';
import { SimpleBars } from '../charts/SimpleBars.tsx';
import { SimpleDonut } from '../charts/SimpleDonut.tsx';
import { BasketDetail } from './BasketDetail.tsx';

const BASKET_COLOURS: Record<SpendingBasketId, string> = {
  mandatory_regular: 'bg-basket-regular',
  mandatory_irregular: 'bg-basket-irregular',
  everyday: 'bg-basket-everyday',
};

type BasketBreakdownProps = { data: Overview };

/** A month at a glance: income against spending, the three baskets, and spending by category. */
export function BasketBreakdown(props: BasketBreakdownProps) {
  const { data } = props;
  const [selected, setSelected] = useState<SpendingBasketId | null>(null);
  const title = `Where your money went · ${formatMonth(data.month)}`;

  if (data.spendingEur === 0) {
    return (
      <Card title={title}>
        <p className="text-muted">No spending in this month.</p>
      </Card>
    );
  }
  const selectedBasket = data.baskets.find((b) => b.basket === selected);

  return (
    <Card title={title}>
      <SimpleBars
        bars={[
          { label: 'Income', valueEur: data.incomeEur, highlight: false },
          { label: 'Spending', valueEur: data.spendingEur, highlight: true },
        ]}
      />
      <div className="flex h-6 overflow-hidden rounded-full bg-surface">
        {data.baskets.map((b) => (
          <div
            key={b.basket}
            className={BASKET_COLOURS[b.basket]}
            style={{ flexGrow: b.totalEur }}
          />
        ))}
        {data.leftEur > 0 && <div style={{ flexGrow: data.leftEur }} />}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {data.baskets.map((b) => (
          <button
            key={b.basket}
            type="button"
            className={`flex min-h-11 flex-col gap-1 rounded-lg p-2 text-left text-xs ${
              b.basket === selected ? 'bg-surface' : ''
            }`}
            onClick={() => setSelected(b.basket === selected ? null : b.basket)}
          >
            <span className={`h-1.5 w-6 rounded-full ${BASKET_COLOURS[b.basket]}`} />
            <span className="text-muted">{BASKET_LABELS[b.basket]}</span>
            <span className="text-base font-semibold">{formatEur(b.totalEur)}</span>
          </button>
        ))}
      </div>
      {selectedBasket && <BasketDetail basket={selectedBasket} />}
      <h3 className="text-small font-medium text-muted">By category</h3>
      <SimpleDonut
        slices={data.categorySplit.map((s) => ({
          label: s.label,
          valueEur: s.totalEur,
          sharePct: s.sharePct,
        }))}
      />
    </Card>
  );
}
