import { BASKET_LABELS, type Overview, type SpendingBasketId } from '@coach/shared';
import { useState } from 'react';
import { Card } from '../../components/Card.tsx';
import { BASKET_SLICE_COLOURS, categorySliceColour } from '../../lib/chart-colours.ts';
import { formatMonth } from '../../lib/format.ts';
import { SimpleBars } from '../charts/SimpleBars.tsx';
import { SimplePie } from '../charts/SimplePie.tsx';
import { BasketDetail } from './BasketDetail.tsx';

type BasketBreakdownProps = { data: Overview };

/** A month at a glance: income against spending, spending by category, and the three baskets. */
export function BasketBreakdown(props: BasketBreakdownProps) {
  const { data } = props;
  const [selected, setSelected] = useState<SpendingBasketId | null>(null);
  const title = formatMonth(data.month);

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
      <h3 className="text-small font-medium text-muted">Spending by category</h3>
      <SimplePie
        slices={data.categorySplit.map((s, index) => ({
          label: s.label,
          valueEur: s.totalEur,
          sharePct: s.sharePct,
          ...categorySliceColour(index, s.categoryId),
        }))}
      />
      <h3 className="text-small font-medium text-muted">Spending type breakdown</h3>
      <SimplePie
        slices={data.baskets.map((b) => ({
          label: BASKET_LABELS[b.basket],
          valueEur: b.totalEur,
          sharePct: b.sharePct,
          ...BASKET_SLICE_COLOURS[b.basket],
        }))}
        selectedIndex={data.baskets.findIndex((b) => b.basket === selected)}
        onSelect={(index) => {
          const basket = data.baskets[index]?.basket ?? null;
          setSelected(basket === selected ? null : basket);
        }}
      />
      {selectedBasket && <BasketDetail basket={selectedBasket} />}
    </Card>
  );
}
