import {
  createFileRoute,
  type ErrorComponentProps,
  Outlet,
  redirect,
  useRouterState,
} from '@tanstack/react-router'
import { RouteError } from '@/components/feedback/route-error'
import { AppShell } from '@/components/layout/app-shell'
import { sessionQuery } from '@/features/auth'
import { SendQueue } from '@/features/inbox'
import { SiteHeader } from '@/features/marketing/components/site-header'

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
  errorComponent: AppError,
  component: AppLayout,
})

// The app couldn't start, as when the server can't be reached. The shell needs the
// signed-in user, so the page has the site's header instead, with the way home and to the demo.
function AppError(props: ErrorComponentProps) {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-page flex-1 px-gutter">
        <RouteError {...props} />
      </main>
    </div>
  )
}

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
