import type { DemoCustomerId } from '@coach/shared';
import { useQuery } from '@tanstack/react-query';
import { api } from './client.ts';

export function useSpenderGroup(userId: DemoCustomerId) {
  return useQuery({
    queryKey: ['spender-group', userId],
    queryFn: async () => {
      const res = await api.users[':id']['spender-group'].$get({ param: { id: userId } });
      if (!res.ok) {
        throw new Error(`Spender group failed with status ${res.status}`);
      }
      return res.json();
    },
  });
}
