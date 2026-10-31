import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { LandingHandoff } from '@/features/marketing/components/landing-handoff'
import { PageNotFound } from '@/features/marketing/components/page-not-found'

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
  // An unknown address gets a page of its own. Unknown emails and app pages show
  // NotFound inside the app instead (the router's default).
  notFoundComponent: PageNotFound,
  component: () => (
    <>
      <Outlet />
      <LandingHandoff />
      {import.meta.env.MODE !== 'test' && (
        <Suspense>
          <Devtools />
        </Suspense>
      )}
    </>
  ),
})
