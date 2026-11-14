import type { DemoCustomerId } from '@coach/shared';
import { useQuery } from '@tanstack/react-query';
import { api } from './client.ts';

export function useSafeToSpend(userId: DemoCustomerId) {
  return useQuery({
    queryKey: ['safe-to-spend', userId],
    queryFn: async () => {
      const res = await api.users[':id']['safe-to-spend'].$get({ param: { id: userId } });
      if (!res.ok) {
        throw new Error(`Safe to spend failed with status ${res.status}`);
      }
      return res.json();
    },
  });
}
