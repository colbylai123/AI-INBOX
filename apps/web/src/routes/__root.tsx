import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

export interface RouterContext {
  queryClient: QueryClient
}

// Devtools load only in development and never ship in the production bundle.
const Devtools = import.meta.env.DEV
  ? lazy(async () => {
      const [{ TanStackRouterDevtools }, { ReactQueryDevtools }] = await Promise.all([
        import('@tanstack/react-router-devtools'),
        import('@tanstack/react-query-devtools'),
      ])
      return {
        default: () => (
          <>
            <TanStackRouterDevtools
              position="bottom-right"
              containerElement="div"
              toggleButtonProps={{ style: { position: 'relative', inset: 'auto' } }}
            />
            <ReactQueryDevtools buttonPosition="relative" />
          </>
        ),
      }
    })
  : () => null

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Outlet />
      {import.meta.env.MODE !== 'test' && (
        <Suspense>
          <Devtools />
        </Suspense>
      )}
    </>
  ),
})
