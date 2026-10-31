import {
  createFileRoute,
  type ErrorComponentProps,
  Link,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import { RouteError } from '@/components/feedback/route-error'
import { buttonVariants } from '@/components/ui/button'
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
// signed-in user, so the page has the site's header instead, and says so plainly, with
// a retry and the demo, which works without the server.
function AppError(props: ErrorComponentProps) {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-page flex-1 px-gutter">
        <RouteError
          {...props}
          title="Your inbox can't be reached right now"
          description="Try again in a moment. Meanwhile, the demo shows how it works with sample emails."
          actions={
            <Link to="/demo" preload={false} className={buttonVariants({ variant: 'ghost' })}>
              Try the demo
            </Link>
          }
        />
      </main>
    </div>
  )
}

function AppLayout() {
  const { user } = Route.useRouteContext()
  return (
    <AppShell user={user}>
      <Outlet />
      {/* Here, not on the draft page, so an approved reply keeps its undo window on any page. */}
      <SendQueue />
    </AppShell>
  )
}
