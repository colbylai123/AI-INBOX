import type { QueryClient } from '@tanstack/react-query'
import { createRouter, type RouterHistory } from '@tanstack/react-router'
import { NotFound } from '@/components/feedback/not-found'
import { RouteError } from '@/components/feedback/route-error'
import { RoutePending } from '@/components/feedback/route-pending'
import { routeTree } from '@/routeTree.gen'

export function createAppRouter({
  queryClient,
  history,
}: {
  queryClient: QueryClient
  history?: RouterHistory
}) {
  return createRouter({
    routeTree,
    history,
    context: { queryClient },
    defaultPreload: 'intent',
    // Let TanStack Query own caching; the router just triggers loaders.
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: RouteError,
    defaultPendingComponent: RoutePending,
    defaultNotFoundComponent: NotFound,
    scrollRestoration: true,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
