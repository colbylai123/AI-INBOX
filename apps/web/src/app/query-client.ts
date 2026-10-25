import { QueryClient } from '@tanstack/react-query'
import { isApiError } from '@/lib/api-client'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Don't retry 4xx responses; they won't fix themselves.
        retry: (count, error) => !(isApiError(error) && error.status < 500) && count < 2,
      },
    },
  })
}
