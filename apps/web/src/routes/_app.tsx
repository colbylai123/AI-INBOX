import { createFileRoute, Outlet, redirect, useRouterState } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/app-shell'
import { sessionQuery } from '@/features/auth'
import { SendQueue } from '@/features/inbox'

// Pathless layout: every route under routes/_app/ requires a signed-in user
// and renders inside the app shell.
export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.ensureQueryData(sessionQuery())
    if (!user) {
      throw redirect({ to: '/sign-in', search: { redirect: location.href } })
    }
    // Available to child routes via Route.useRouteContext() / beforeLoad context.
    return { user }
  },
  component: AppLayout,
})

function AppLayout() {
  const { user } = Route.useRouteContext()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  // Opening an email stays inside the inbox, so the list is not faded and remounted.
  const view = pathname.startsWith('/inbox') ? '/inbox' : pathname
  return (
    <AppShell user={user}>
      {/* A new page eases in. The send queue stays put, so an undo is not restarted. */}
      <div key={view} className="app-view">
        <Outlet />
      </div>
      <SendQueue />
    </AppShell>
  )
}
