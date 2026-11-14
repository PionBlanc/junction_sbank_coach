import type { DemoCustomerId } from '@coach/shared';
import { useQuery } from '@tanstack/react-query';
import { api } from './client.ts';

export function useActions(userId: DemoCustomerId) {
  return useQuery({
    queryKey: ['actions', userId],
    queryFn: async () => {
      const res = await api.users[':id'].actions.$get({ param: { id: userId } });
      if (!res.ok) {
        throw new Error(`Actions failed with status ${res.status}`);
      }
      return res.json();
    },
  });
}
