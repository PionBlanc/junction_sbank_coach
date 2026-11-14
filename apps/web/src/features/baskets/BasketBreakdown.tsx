import { BASKET_LABELS, type Overview, type SpendingBasketId } from '@coach/shared';
import { useState } from 'react';
import { Card } from '../../components/Card.tsx';
import { formatEur, formatMonth } from '../../lib/format.ts';
import { BasketDetail } from './BasketDetail.tsx';

const BASKET_COLOURS: Record<SpendingBasketId, string> = {
  mandatory_regular: 'bg-basket-regular',
  mandatory_irregular: 'bg-basket-irregular',
  everyday: 'bg-basket-everyday',
};

type BasketBreakdownProps = { data: Overview };

/** One stacked bar: a month's income split into the three baskets and what is left. */
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
      <p className="text-sm text-muted">
        Income {formatEur(data.incomeEur)}.{' '}
        {data.leftEur >= 0
          ? `Left over ${formatEur(data.leftEur)}.`
          : `${formatEur(-data.leftEur)} more went out than came in.`}{' '}
        Tap a basket to see what is in it.
      </p>
      {selectedBasket && <BasketDetail basket={selectedBasket} />}
    </Card>
  );
}
