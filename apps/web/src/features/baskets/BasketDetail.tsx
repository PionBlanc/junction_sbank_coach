import type { CategoryId, Overview, SpendingBasketId } from '@coach/shared';
import { useState } from 'react';
import { formatEur } from '../../lib/format.ts';
import { PeerCompare } from '../benchmark/PeerCompare.tsx';
import { WhatIfCard } from '../what-if/WhatIfCard.tsx';

/** The teaching moment: one plain sentence per basket. */
const BASKET_EXPLAINERS: Record<SpendingBasketId, string> = {
  mandatory_regular:
    'Costs you cannot skip and that come every month: housing, bills, groceries, getting around.',
  mandatory_irregular:
    'Costs you cannot skip but that come by surprise: health, and things at home that break.',
  everyday:
    'Everything you choose yourself: eating out, fun, shopping, taxis. This is where you have room to move.',
};

type BasketDetailProps = { basket: Overview['baskets'][number] };

/** The categories inside one basket, each next to people the same age. */
export function BasketDetail(props: BasketDetailProps) {
  const { basket } = props;
  const [whatIfCategory, setWhatIfCategory] = useState<CategoryId | null>(null);

  return (
    <div className="flex flex-col gap-3 border-t border-surface pt-3">
      <p className="text-sm">{BASKET_EXPLAINERS[basket.basket]}</p>
      {basket.categories.length === 0 && <p className="text-sm text-muted">Nothing this month.</p>}
      {basket.categories.map((category) => (
        <div key={category.label} className="flex flex-col gap-1">
          <div className="flex justify-between text-sm font-semibold">
            <span>{category.label}</span>
            <span>{formatEur(category.totalEur)}</span>
          </div>
          {category.youMonthlyAvgEur !== null && category.peerMedianMonthlyEur !== null && (
            <PeerCompare
              youMonthlyAvgEur={category.youMonthlyAvgEur}
              peerMedianMonthlyEur={category.peerMedianMonthlyEur}
            />
          )}
          {basket.basket === 'everyday' && category.youMonthlyAvgEur !== null && (
            <button
              type="button"
              className="flex min-h-11 items-center text-sm text-brand"
              onClick={() => setWhatIfCategory(category.categoryId)}
            >
              What if I spent a bit less here? ›
            </button>
          )}
        </div>
      ))}
      {whatIfCategory && <WhatIfCard key={whatIfCategory} categoryId={whatIfCategory} />}
    </div>
  );
}
