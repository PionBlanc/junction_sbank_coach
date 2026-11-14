import { useQuery } from '@tanstack/react-query';
import { api } from './client.ts';

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await api.health.$get();
      if (!res.ok) {
        throw new Error(`Health check failed with status ${res.status}`);
      }
      return res.json();
    },
  });
}
