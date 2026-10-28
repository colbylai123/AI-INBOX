import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { useEffect } from 'react'
import { expireSession } from '@/features/auth'
import { isApiError } from '@/lib/api-client'
import type { createAppRouter } from './router'

// Providers shared by main.tsx and integration tests.
export function App({
  queryClient,
  router,
}: {
  queryClient: QueryClient
  router: ReturnType<typeof createAppRouter>
}) {
  // A 401 from any action (e.g. Approve & send) means the session expired. Route
  // loaders and pages get the same treatment from the router's error component.
  useEffect(
    () =>
      queryClient.getMutationCache().subscribe((event) => {
        if (
          event.type === 'updated' &&
          event.action.type === 'error' &&
          isApiError(event.action.error, 401)
        ) {
          void expireSession(queryClient, router)
        }
      }),
    [queryClient, router],
  )

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
