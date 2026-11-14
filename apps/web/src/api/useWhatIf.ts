import type { CategoryId, DemoCustomerId } from '@coach/shared';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from './client.ts';

export type WhatIfParams = { categoryId?: CategoryId; cutPct?: number; monthlyEur?: number };

export function useWhatIf(userId: DemoCustomerId, params: WhatIfParams) {
  return useQuery({
    queryKey: ['what-if', userId, params],
    // Keep the old chart on screen while a new cut loads.
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const res = await api.users[':id']['what-if'].$get({
        param: { id: userId },
        query: {
          categoryId: params.categoryId,
          cutPct: params.cutPct?.toString(),
          monthlyEur: params.monthlyEur?.toString(),
        },
      });
      if (!res.ok) {
        throw new Error(`What-if failed with status ${res.status}`);
      }
      return res.json();
    },
  });
}
