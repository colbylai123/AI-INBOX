import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { ApiError } from '@/lib/api-client'
import { RouteError } from './route-error'

// A tiny router whose /inbox loader fails with the given error.
function renderFailingRoute(error: Error) {
  const rootRoute = createRootRoute()
  const inbox = createRoute({
    getParentRoute: () => rootRoute,
    path: '/inbox',
    loader: () => {
      throw error
    },
  })
  const signIn = createRoute({
    getParentRoute: () => rootRoute,
    path: '/sign-in',
    component: () => <h1>Sign in</h1>,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([inbox, signIn]),
    history: createMemoryHistory({ initialEntries: ['/inbox?priority=high'] }),
    defaultErrorComponent: RouteError,
  })
  const queryClient = new QueryClient()
  queryClient.setQueryData(['session'], { id: 'u1', name: 'Demo', email: 'd@example.com' })
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { router, queryClient }
}

describe('RouteError', () => {
  it('sends an expired session to sign-in and back to the same page', async () => {
    const { router, queryClient } = renderFailingRoute(new ApiError(401, 'Session expired'))
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(router.state.location.search).toEqual({ redirect: '/inbox?priority=high' })
    expect(queryClient.getQueryData(['session'])).toBeNull()
  })

  it('shows a retry for other errors', async () => {
    renderFailingRoute(new ApiError(500, 'Server error'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong')
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
