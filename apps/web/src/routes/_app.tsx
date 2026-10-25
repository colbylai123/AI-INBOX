import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/app-shell'
import { sessionQuery } from '@/features/auth'

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
  return (
    <AppShell user={user}>
      <Outlet />
    </AppShell>
  )
}
