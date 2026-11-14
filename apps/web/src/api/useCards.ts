import type { DemoCustomerId } from '@coach/shared';
import { useQuery } from '@tanstack/react-query';
import { api } from './client.ts';

export function useCards(userId: DemoCustomerId) {
  return useQuery({
    queryKey: ['cards', userId],
    queryFn: async () => {
      const res = await api.users[':id'].cards.$get({ param: { id: userId } });
      if (!res.ok) {
        throw new Error(`Cards failed with status ${res.status}`);
      }
      return res.json();
    },
  });
}
