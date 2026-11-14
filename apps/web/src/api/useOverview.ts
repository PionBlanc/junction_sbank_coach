import type { DemoCustomerId } from '@coach/shared';
import { useQuery } from '@tanstack/react-query';
import { api } from './client.ts';

export function useOverview(userId: DemoCustomerId, month: string) {
  return useQuery({
    queryKey: ['overview', userId, month],
    queryFn: async () => {
      const res = await api.users[':id'].overview.$get({ param: { id: userId }, query: { month } });
      if (!res.ok) {
        throw new Error(`Overview failed with status ${res.status}`);
      }
      return res.json();
    },
  });
}
